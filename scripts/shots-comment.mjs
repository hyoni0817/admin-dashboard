/**
 * `.shots/manifest.json`을 읽어 PR sticky 코멘트 마크다운을 만든다.
 *
 * 코멘트 본문이 워크플로에 하드코딩돼 있던 것을 데이터 기반으로 바꾼 것이다.
 * 예전 구조에서는 `SCENARIOS`에 시나리오를 추가해도 이미지만 업로드되고
 * 코멘트에는 나타나지 않아, 새 위젯을 만들 때마다 조용히 누락됐다.
 *
 *   node scripts/shots-comment.mjs <RAW_BASE_URL> <SHORT_SHA>
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const OUT_DIR = process.env.SHOTS_OUT ?? ".shots";
const [rawBase, shortSha] = process.argv.slice(2);

if (!rawBase || !shortSha) {
  console.error("사용법: node scripts/shots-comment.mjs <RAW_BASE_URL> <SHORT_SHA>");
  process.exit(1);
}

const manifest = JSON.parse(
  await readFile(join(OUT_DIR, "manifest.json"), "utf8"),
);

/** 선언 순서를 유지하면서 group으로 묶는다. */
const groups = new Map();
for (const item of manifest) {
  if (!groups.has(item.group)) groups.set(item.group, []);
  groups.get(item.group).push(item);
}

const img = (item) =>
  `<img src="${rawBase}/${item.file}" width="${item.width}">`;

const lines = [
  "<!-- shots-bot -->",
  "## 📸 스크린샷",
  "",
  `<sub>\`${shortSha}\` 기준 · 자동 생성 · 푸시할 때마다 이 코멘트가 갱신됩니다</sub>`,
];

for (const [group, items] of groups) {
  lines.push("", `### ${group}`, "");

  // caption이 붙은 항목은 표에 넣지 않고 따로 세운다 — 설명이 표 안에서 눌린다.
  const inTable = items.filter((i) => !i.caption);
  const standalone = items.filter((i) => i.caption);

  if (inTable.length > 0) {
    lines.push(
      `| ${inTable.map((i) => i.label).join(" | ")} |`,
      `| ${inTable.map(() => "---").join(" | ")} |`,
      `| ${inTable.map(img).join(" | ")} |`,
    );
  }

  for (const item of standalone) {
    lines.push("", `**${item.label}** — ${item.caption}`, "", img(item));
  }
}

console.log(lines.join("\n"));
