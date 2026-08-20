/**
 * PR 첨부용 스크린샷/GIF 캡처.
 *
 *   node scripts/shots.mjs
 *   SHOTS_BASE_URL=http://localhost:3000 SHOTS_OUT=.shots node scripts/shots.mjs
 *
 * 캡처 결과가 매번 달라지면 리뷰에서 diff를 볼 수 없으므로, 결정론적으로 찍는 것이 이 스크립트의 핵심이다.
 * 뷰포트를 고정하고, 폰트 로딩을 기다리고, 애니메이션을 끈다.
 *
 * TypeScript가 아니라 .mjs인 이유: 빌드 파이프라인(tsx/ts-node) 없이 `node`로 바로 실행하기 위함.
 */
import { mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";
import pngjs from "pngjs";
import gifenc from "gifenc";

// pngjs·gifenc 모두 CommonJS라 named import가 되지 않는다.
const { PNG } = pngjs;
const { GIFEncoder, quantize, applyPalette } = gifenc;

const BASE_URL = process.env.SHOTS_BASE_URL ?? "http://localhost:3000";
const OUT_DIR = process.env.SHOTS_OUT ?? ".shots";

/** 정지 컷은 2x로 찍어 레티나에서도 또렷하게. GIF는 용량 때문에 1x. */
const STILL = { width: 1440, height: 900, deviceScaleFactor: 2 };
/** 메뉴가 넘치도록 일부러 낮은 뷰포트 — 내부 스크롤 동작을 보여주는 것이 목적이다. */
const SCROLL = { width: 1440, height: 600, deviceScaleFactor: 1 };

const GIF_FRAMES = 22;
const GIF_DELAY_MS = 90;
/** 시작/끝에서 잠깐 멈춰야 반복 재생될 때 눈이 따라간다. */
const GIF_HOLD_FRAMES = 6;

/**
 * transition/animation이 남아 있으면 같은 상태를 찍어도 픽셀이 흔들린다.
 * nextjs-portal은 dev 서버의 개발 인디케이터 배지 — CI(next start)에는 없지만 로컬 실행 때 같이 찍힌다.
 */
const FREEZE_CSS = `
  *, *::before, *::after {
    transition: none !important;
    animation: none !important;
    caret-color: transparent !important;
  }
  nextjs-portal { display: none !important; }
`;

async function openPage(browser, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: viewport.deviceScaleFactor,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: FREEZE_CSS });
  // 웹폰트가 늦게 붙으면 글자 폭이 바뀌어 레이아웃이 흔들린다.
  await page.evaluate(() => document.fonts.ready);
  return { context, page };
}

/** 셀렉터가 조용히 빗나가면 빈 화면을 첨부하게 되므로, 없으면 실패시킨다. */
async function require1(page, selector, what) {
  const locator = page.locator(selector);
  const count = await locator.count();
  if (count === 0) throw new Error(`${what}을(를) 찾지 못했습니다: ${selector}`);
  return locator.first();
}

async function captureStills(browser) {
  const { context, page } = await openPage(browser, STILL);
  try {
    const sidebar = await require1(page, "aside", "사이드바");

    await sidebar.screenshot({ path: join(OUT_DIR, "sidebar-default.png") });

    const target = page.getByRole("link", { name: "Products", exact: true });
    if ((await target.count()) === 0) throw new Error("hover 대상 메뉴(Products)를 찾지 못했습니다");
    await target.hover();
    // hover는 즉시 반영되지만, 렌더 프레임이 한 번 지나간 뒤 찍어야 안전하다.
    await page.waitForTimeout(120);
    await sidebar.screenshot({ path: join(OUT_DIR, "sidebar-hover.png") });

    return ["sidebar-default.png", "sidebar-hover.png"];
  } finally {
    await context.close();
  }
}

async function captureScrollGif(browser) {
  const { context, page } = await openPage(browser, SCROLL);
  try {
    const sidebar = await require1(page, "aside", "사이드바");
    const nav = await require1(page, "aside nav", "메뉴 영역");

    const scrollable = await nav.evaluate((el) => el.scrollHeight - el.clientHeight);
    if (scrollable <= 0) {
      throw new Error(
        `메뉴 영역에 스크롤이 없습니다 (scrollHeight - clientHeight = ${scrollable}). ` +
          `뷰포트 높이 ${SCROLL.height}px에서 메뉴가 넘치지 않으면 이 GIF는 의미가 없습니다.`
      );
    }

    const frames = [];
    for (let i = 0; i < GIF_FRAMES; i++) {
      const progress = i / (GIF_FRAMES - 1);
      // ease-in-out — 등속으로 움직이면 기계적으로 보인다.
      const eased = progress < 0.5 ? 2 * progress ** 2 : 1 - (-2 * progress + 2) ** 2 / 2;
      await nav.evaluate((el, top) => {
        el.scrollTop = top;
      }, Math.round(scrollable * eased));
      frames.push(await sidebar.screenshot());
    }

    const held = [
      ...Array(GIF_HOLD_FRAMES).fill(frames[0]),
      ...frames,
      ...Array(GIF_HOLD_FRAMES).fill(frames[frames.length - 1]),
    ];

    const gif = GIFEncoder();
    for (const buf of held) {
      const { data, width, height } = PNG.sync.read(buf);
      const palette = quantize(data, 256);
      gif.writeFrame(applyPalette(data, palette), width, height, {
        palette,
        delay: GIF_DELAY_MS,
      });
    }
    gif.finish();
    await writeFile(join(OUT_DIR, "sidebar-scroll.gif"), Buffer.from(gif.bytes()));

    return ["sidebar-scroll.gif"];
  } finally {
    await context.close();
  }
}

async function main() {
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  try {
    const written = [...(await captureStills(browser)), ...(await captureScrollGif(browser))];
    console.log(`${OUT_DIR}/ 에 ${written.length}개 생성:`);
    for (const name of written) console.log(`  - ${name}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
