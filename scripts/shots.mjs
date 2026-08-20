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

const VIEWPORTS = {
  /** 정지 컷은 2x로 찍어 레티나에서도 또렷하게. */
  still: { width: 1440, height: 900, deviceScaleFactor: 2 },
  /** 메뉴가 넘치도록 일부러 낮은 뷰포트. GIF는 용량 때문에 1x. */
  short: { width: 1440, height: 600, deviceScaleFactor: 1 },
};

/**
 * ── 캡처할 화면 목록 ──────────────────────────────────────────────
 *
 * 새 화면을 추가할 때는 **이 배열에 항목만 추가**하면 되고 아래 러너는 건드리지 않는다.
 *
 *   name       출력 파일 이름 (확장자 제외)
 *   path       캡처할 경로 (기본 "/")
 *   viewport   VIEWPORTS의 키
 *   clip       이 셀렉터 영역만 잘라 찍는다 (생략하면 페이지 전체)
 *   hover      { role, name } — 찍기 전에 이 요소에 hover
 *   scrollGif  { target } — target을 끝까지 스크롤하며 GIF로 만든다
 *
 * 소비자가 여럿이 되면 이 배열을 `widgets/<슬라이스>/*.shots.mjs`로 쪼개고
 * glob으로 모으는 방식이 다음 단계다. 지금은 소비자가 하나뿐이라 여기 둔다.
 */
const SCENARIOS = [
  { name: "sidebar-default", viewport: "still", clip: "aside" },
  {
    name: "sidebar-hover",
    viewport: "still",
    clip: "aside",
    hover: { role: "link", name: "Products" },
  },
  {
    name: "sidebar-scroll",
    viewport: "short",
    clip: "aside",
    scrollGif: { target: "aside nav" },
  },
];

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

async function openPage(browser, viewportKey, path) {
  const viewport = VIEWPORTS[viewportKey];
  if (!viewport) throw new Error(`알 수 없는 viewport: ${viewportKey}`);

  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: viewport.deviceScaleFactor,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  // networkidle은 쓰지 않는다 — 프로덕션 빌드에서 Next가 뷰포트 안의 <Link>를 자동 prefetch해서
  // 네트워크가 조용해지지 않는다. 대신 아래에서 폰트와 실제 요소를 명시적으로 기다린다.
  await page.goto(new URL(path, BASE_URL).href, { waitUntil: "load" });
  await page.addStyleTag({ content: FREEZE_CSS });
  // 웹폰트가 늦게 붙으면 글자 폭이 바뀌어 레이아웃이 흔들린다.
  await page.evaluate(() => document.fonts.ready);
  return { context, page };
}

/** 셀렉터가 조용히 빗나가면 빈 화면을 첨부하게 되므로, 나타날 때까지 기다리고 없으면 실패시킨다. */
async function require1(locator, what) {
  const first = locator.first();
  try {
    await first.waitFor({ state: "visible", timeout: 15_000 });
  } catch {
    throw new Error(`${what}을(를) 찾지 못했습니다`);
  }
  return first;
}

async function encodeGif(frames) {
  const gif = GIFEncoder();
  for (const buf of frames) {
    const { data, width, height } = PNG.sync.read(buf);
    const palette = quantize(data, 256);
    gif.writeFrame(applyPalette(data, palette), width, height, {
      palette,
      delay: GIF_DELAY_MS,
    });
  }
  gif.finish();
  return Buffer.from(gif.bytes());
}

async function captureScrollGif(page, subject, { target }, label) {
  const scroller = await require1(page.locator(target), `${label}의 스크롤 영역(${target})`);

  const scrollable = await scroller.evaluate((el) => el.scrollHeight - el.clientHeight);
  if (scrollable <= 0) {
    throw new Error(
      `${label}: 스크롤할 여지가 없습니다 (scrollHeight - clientHeight = ${scrollable}). ` +
        `뷰포트가 충분히 낮지 않으면 이 GIF는 의미가 없습니다.`
    );
  }

  const frames = [];
  for (let i = 0; i < GIF_FRAMES; i++) {
    const progress = i / (GIF_FRAMES - 1);
    // ease-in-out — 등속으로 움직이면 기계적으로 보인다.
    const eased = progress < 0.5 ? 2 * progress ** 2 : 1 - (-2 * progress + 2) ** 2 / 2;
    await scroller.evaluate((el, top) => {
      el.scrollTop = top;
    }, Math.round(scrollable * eased));
    frames.push(await subject.screenshot());
  }

  return [
    ...Array(GIF_HOLD_FRAMES).fill(frames[0]),
    ...frames,
    ...Array(GIF_HOLD_FRAMES).fill(frames.at(-1)),
  ];
}

/** 시나리오 하나를 실행하고 만들어진 파일 이름을 돌려준다. */
async function runScenario(browser, scenario) {
  const { name, path = "/", viewport, clip, hover, scrollGif } = scenario;
  const { context, page } = await openPage(browser, viewport, path);

  try {
    const subject = clip
      ? await require1(page.locator(clip), `${name}의 캡처 대상(${clip})`)
      : page;

    if (hover) {
      const target = await require1(
        page.getByRole(hover.role, { name: hover.name, exact: true }),
        `${name}의 hover 대상(${hover.name})`
      );
      await target.hover();
      // hover는 즉시 반영되지만, 렌더 프레임이 한 번 지나간 뒤 찍어야 안전하다.
      await page.waitForTimeout(120);
    }

    if (scrollGif) {
      const frames = await captureScrollGif(page, subject, scrollGif, name);
      const file = `${name}.gif`;
      await writeFile(join(OUT_DIR, file), await encodeGif(frames));
      return file;
    }

    const file = `${name}.png`;
    await subject.screenshot({ path: join(OUT_DIR, file) });
    return file;
  } finally {
    await context.close();
  }
}

async function main() {
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const written = [];
  try {
    for (const scenario of SCENARIOS) {
      written.push(await runScenario(browser, scenario));
    }
  } finally {
    await browser.close();
  }

  console.log(`${OUT_DIR}/ 에 ${written.length}개 생성:`);
  for (const name of written) console.log(`  - ${name}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
