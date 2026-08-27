# CLAUDE.md

이 파일은 이 저장소에서 작업할 때 Claude Code(claude.ai/code)에게 제공되는 가이드입니다.

여러 프로젝트에 공통인 규칙(Obsidian 기록, 커밋 컨벤션 기본형, 비밀값 취급)은 `~/.claude/CLAUDE.md`에 있습니다. 이 파일은 **이 저장소에만 해당하는 것**만 담습니다.

## 기술 스택

- **Next.js** + **React** + **TypeScript**
- 스타일링: **styled-components**
- 서버 상태 관리: **TanStack Query** (쿼리 팩토리 패턴 사용, 아래 참고)

## 아키텍처: FSD (Feature-Sliced Design)

폴더 구조는 상위 레이어부터 하위 레이어 순으로 다음 FSD 레이어를 따라야 합니다:

```
app/       — 앱 전역 설정 (provider, 전역 스타일, 라우팅 진입점)
processes/ — 페이지를 가로지르는 비즈니스 프로세스 (필요한 경우에만 사용)
pages/     — 라우트 단위 화면 조합 (Next.js 라우트 세그먼트는 app/ 아래에 위치하지만, 페이지 단위 UI 조합은 FSD의 pages 컨벤션을 따름)
widgets/   — 여러 features/entities를 조합한 복합 UI 블록
features/  — 사용자 액션/인터랙션 단위 (예: `add-comment`, `like-post`)
entities/  — 비즈니스 엔티티와 관련 데이터 (예: `user`, `product`)
shared/    — 비즈니스 로직과 무관한 재사용 코드 (UI 킷, 라이브러리, api 클라이언트, 설정)
```

강제해야 할 규칙:

- **import 방향**: 모듈은 자기 레이어 또는 그보다 하위 레이어만 import할 수 있습니다 (예: `features`는 `entities`/`shared`를 import할 수 있지만 `widgets`/`pages`는 import할 수 없음). 같은 레이어 내 슬라이스 간의 "옆으로" import도 금지합니다 (예: 한 `feature`가 다른 `feature`의 내부 파일을 import하는 것).
- **Public API만 사용**: 슬라이스 간 import는 반드시 해당 슬라이스의 `index.ts`(public API)를 통해서만 이루어져야 하며, 다른 슬라이스의 내부 파일에 직접 접근해서는 안 됩니다.
- 이 프로젝트는 Next.js를 사용하므로, Next.js App Router가 사용하는 `app/` 디렉토리(라우팅)와 FSD의 `app` 레이어(전역 설정/provider)는 서로 다른 개념입니다 — Next의 라우팅 파일은 최대한 얇게 유지하고, 실제 페이지 조합은 라우트 파일에서 import하는 FSD `pages`(또는 `views`) 슬라이스에 위임하세요.
- **`shared`로의 섣부른 승격 금지**: 특정 위젯/페이지에서만 쓰이는 컴포넌트(예: 사이드바 전용 `NavLink`, `MenuItem`)는 재사용 가능성이 있어 보여도 처음에는 해당 슬라이스 내부(`widgets/sidebar/ui/`)에 둡니다. 실제로 두 번째 소비자가 생겼을 때 그 시점에 `shared/ui`로 끌어올리세요. `shared`는 "실제로 여러 슬라이스에서 재사용 중인" 코드를 위한 곳이지, "나중에 재사용될 수도 있는" 코드를 미리 두는 곳이 아닙니다.

### 이름 짓기

| 대상 | 방식 | 예 |
| --- | --- | --- |
| 슬라이스·레이어 폴더 | kebab-case | `widgets/header`, `features/add-comment` |
| 비컴포넌트 파일 | kebab-case | `nav-items.ts`, `query-client.ts`, `styled-components-registry.tsx` |
| 컴포넌트 파일 | PascalCase | `Sidebar.tsx`, `SidebarItem.tsx` |
| 스타일 파일 | `<컴포넌트>.styles.ts` | `Sidebar.styles.ts` |
| public API | 항상 `index.ts` | `widgets/sidebar/index.ts` |

**슬라이스 이름은 한 단어로 자연스러우면 한 단어를 씁니다.** `sidebar`가 하이픈 없이 붙어 있는 것은 컨벤션이 달라서가 아니라 영어에서 원래 한 낱말이기 때문입니다. 상단 바를 `top-bar`가 아니라 `header`로 부르는 것도 같은 이유입니다 — `sidebar`와 짝이 맞고, 구분자를 넣을지 고민할 일이 없습니다. 두 단어 이상이 불가피하면 하이픈으로 잇습니다.

## styled-components: 스타일 파일 분리 컨벤션

일반 컴포넌트와 styled-components를 한 파일에서 섞어 쓰지 않습니다. 컴포넌트별로 스타일 정의 파일을 분리하고 `S.` 네임스페이스로 import해서 사용합니다:

```
shared/ui/logo/
  Logo.tsx          — 로직/마크업만
  Logo.styles.ts    — styled-components 정의만
  index.ts
```

```ts
// Logo.styles.ts
import styled from "styled-components";

export const LogoText = styled.p`...`;
export const Dash = styled.span`...`;
```

```tsx
// Logo.tsx
import * as S from "./Logo.styles";

export function Logo() {
  return (
    <S.LogoText>
      <S.Dash>Dash</S.Dash>
    </S.LogoText>
  );
}
```

이렇게 하면 마크업만 봐도 어떤 요소가 스타일드 컴포넌트인지(`S.`) 바로 구분되고, 스타일 변경 시 해당 컴포넌트의 로직 파일을 건드릴 필요가 없습니다.

## UI 개발 워크플로우: Figma 기반

모든 UI 컴포넌트는 Figma 디자인(DashStack 어드민 대시보드 UI 킷)을 기준으로 구현합니다. 마크업/스타일/색상/타이포그래피를 임의로 추측해서 만들지 않습니다.

- 새 UI 컴포넌트를 만들기 전, 해당 요소의 Figma 노드 URL을 사용자에게 확인합니다.
- `figma-design-to-code` 스킬 규칙에 따라 `get_design_context`로 디자인 컨텍스트를 가져온 뒤 프로젝트 스택(FSD, styled-components)에 맞게 변환합니다.
- 예외: provider/쿼리 클라이언트 설정처럼 디자인 대응물이 없는 비-시각적 스캐폴딩 작업.

**아이콘은 Figma에서 가져올 수 없습니다.** DashStack 킷의 아이콘은 벡터가 아니라 파일에 없는 아이콘 폰트의 글리프라, export해도 빈 사각형만 나옵니다. 임의로 SVG를 그리지 말고 컴포넌트에 슬롯(`icon?: ReactNode`)만 열어두세요 — `SidebarItem`이 그렇게 되어 있습니다. 아이콘 소스가 정해지면 슬롯을 채우는 쪽(`nav-items.ts` 등)만 고치면 됩니다.

## 디자인 토큰: Figma Variables가 원본

색상 등의 디자인 토큰은 Figma Variables가 네이밍 원본입니다. 전체 팔레트를 미리 만들지 않고, 컴포넌트 작업 때 필요한 토큰만 그때그때 추가합니다 (FSD `shared` 승격 원칙과 같은 철학).

### 토큰 이름은 값 기반으로 짓습니다

```
Figma:  <색상 계열>/<명도 단계>       예) Gray/50, Rose/500
코드:   theme.colors.<계열>[<단계>]   예) theme.colors.gray[50], theme.colors.rose[500]
CSS:    var(--sc-colors-<계열>-<단계>)
```

계열 이름이 곧 색이므로 **키에는 명도 단계만 씁니다** — `rose.rose500`처럼 색 이름을 두 번 쓰지 않습니다. 명도 단계가 하나뿐인 색(`White`)은 그룹 없이 둡니다.

**`Alert`·`Accent`·`Secondary` 같은 역할 이름은 그 역할을 실제로 소유할 때만 붙입니다.** 미리 넓은 역할을 선언하면 그 이름이 나중에 거짓이 됩니다 — 예를 들어 알림 뱃지 색을 `Alert/Red`라고 지어두면, 폼 검증 에러가 다른 빨강일 때 정작 alert에는 쓰이지 않는 토큰이 `Alert`라는 이름을 점유하게 됩니다.

서수(`Secondary`·`Tertiary`·…)는 특히 피합니다. 중간에 색이 하나 끼어들 때마다 뒤가 전부 밀려 재명명을 강제하기 때문입니다. 명도 단계 숫자는 사이에 값을 끼울 수 있어 그 문제가 없습니다.

역할 토큰이 정당한 경우는 **모드에 따라 값이 달라져야 할 때**입니다. `Text/Primary`가 Light `#202224` / Dark `#ffffff`인 것처럼요. 다크모드를 만들 때 역할 토큰이 값 기반 토큰을 참조하는 2단 구조로 얹습니다.

계열 이름은 일상적인 색 이름을 씁니다(`Neutral`·`Rose`·…). 나중에 인접한 계열이 추가됐을 때 같은 계열로 판단되면 한 스케일로 합칩니다.

**Figma에 변수로 등록되어 있지 않은 색상을 발견하면, 임의로 판단하지 말고 반드시 사용자에게 물어봅니다.** `get_variable_defs`가 돌려주지 않은 raw hex가 디자인에 있으면:

1. 어떤 색이 어디에 쓰이는지 정리해서 사용자에게 보고합니다.
2. 변수로 승격할지 / 해당 컴포넌트 안에 raw hex로 둘지를 **사용자가 정합니다**.
3. 승격하기로 했다면 토큰 이름도 함께 확인한 뒤, Figma `Color` 컬렉션에 변수를 만들고 해당 노드에 바인딩한 다음 `theme.ts`에 반영합니다.

Figma 변수 생성 시 기존 컨벤션을 따릅니다 — 이름은 `Group/Name`(예: `Primary/Blue`), `scopes`는 실제 쓰임에 맞게 명시(`ALL_SCOPES` 금지), `codeSyntax.WEB`은 `createTheme`이 만드는 CSS 변수명(`var(--sc-colors-<group>-<name>)`)과 일치시킵니다.

## TanStack Query: 쿼리 팩토리 패턴

원시 쿼리 키/옵션을 컴포넌트 곳곳에 흩어놓지 않습니다. 데이터를 조회하는 각 entity/feature는 해당 슬라이스의 `api/` 폴더에 위치한 **쿼리 팩토리**를 정의하여 다음을 중앙화합니다:

- 쿼리 키 (계층적이고 타입이 지정된 키 구조)
- 쿼리 옵션 (`queryOptions()`로 구성한 queryFn, staleTime 등)

따라야 할 예시 형태:

```ts
// entities/user/api/queries.ts
export const userQueries = {
  all: () => ["users"] as const,
  lists: () => [...userQueries.all(), "list"] as const,
  list: (filters: UserFilters) =>
    queryOptions({
      queryKey: [...userQueries.lists(), filters],
      queryFn: () => fetchUsers(filters),
    }),
  details: () => [...userQueries.all(), "detail"] as const,
  detail: (id: string) =>
    queryOptions({
      queryKey: [...userQueries.details(), id],
      queryFn: () => fetchUser(id),
    }),
};
```

컴포넌트/훅은 쿼리 키나 옵션을 직접 구성하지 않고 이 팩토리를 그대로 사용합니다 (`useQuery(userQueries.detail(id))`). 이렇게 하면 키 무효화(`queryClient.invalidateQueries({ queryKey: userQueries.all() })`)를 신뢰성 있게 중앙에서 관리할 수 있습니다.

## 커밋 type과 머지 커밋

기본 형식(Conventional Commits, 설명은 한국어)은 `~/.claude/CLAUDE.md`에 있습니다. 이 저장소에서 자주 쓰는 type: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`. 예시: `feat(user): 사용자 목록 필터링 기능 추가`

**커밋 본문은 `-합니다`가 아니라 `-함`(명사형 종결)으로 씁니다.** 제목과 본문의 어투를 맞추고 줄을 짧게 유지하기 위해서입니다.

```
fix(ci): 캡처 대기 조건을 networkidle에서 load로 변경

CI에서 `page.goto`가 30초 타임아웃으로 실패함. 프로덕션 빌드에서는 Next가
뷰포트 안의 `<Link>`를 자동 prefetch해서 네트워크가 조용해지지 않기 때문.

- `waitUntil`을 `load`로 바꾸고, 대신 폰트와 실제 요소를 명시적으로 기다림
- 프로덕션 빌드로 재현해 통과 확인함
```

### 머지 커밋

`develop` → `release` 릴리스 머지는 `chore(release): <한국어 설명>` 형식을 씁니다. 머지 커밋 자체는 새 기능을 넣지 않고(기능 정보는 안에 든 `feat(...)` 커밋들이 이미 가지고 있음) 묶음을 옮기는 작업이라 `chore`입니다.

```bash
git checkout release
git merge --no-ff develop -m "chore(release): 사이드바 위젯 릴리스"
```

`--no-ff`로 머지 커밋을 반드시 남깁니다 — 릴리스 지점이 히스토리에 표시되고(`git log --first-parent release`), 문제가 생기면 `git revert -m 1 <머지커밋>`으로 릴리스를 통째로 되돌릴 수 있기 때문입니다.

## 브랜치 및 PR 전략

- 장기 브랜치: `release`, `develop`
- 작업 브랜치: `feat/*` (신규 기능), `fix/*` (버그 수정), `docs/*` (문서·규칙 변경) — 예: `feat/pr-template`, `docs/git-merge-strategy`
- PR은 작업 브랜치를 `develop`으로 머지합니다 (`release`로 직접 머지하지 않음).

### `develop`·`release`에 직접 커밋하지 않습니다

**모든 커밋은 작업 브랜치에서 만들어 PR로 머지합니다.** 한 줄짜리 오타 수정이라도 예외가 아닙니다 — 브랜치를 여는 비용보다, 히스토리에서 "이 변경이 어느 PR에서 왔는지"가 끊기는 비용이 큽니다.

작업이 작아서 브랜치가 번거롭게 느껴지면, 브랜치를 만들지 않는 게 아니라 **이름을 넓게 잡아 관련 변경을 한 PR에 모읍니다.** `docs/split-shared-rules`처럼 좁게 잡으면 규칙 하나 고칠 때마다 브랜치가 생기지만, `docs/claude-md-cleanup`으로 잡으면 그 파일에 대한 정비를 한 PR에 담을 수 있습니다.

**유일한 예외는 hotfix입니다.** 이미 릴리스된 것이 망가져서 PR 라운드를 기다릴 수 없을 때만 `release`에 직접 커밋합니다. 단순히 "급하다"거나 "사소하다"는 예외 사유가 되지 않습니다.

hotfix 후에는 **반드시 `release`를 `develop`으로 되돌려 머지합니다.** 이걸 빠뜨리면 수정이 `develop`에 없는 채로 다음 릴리스가 나가면서 **고쳤던 버그가 되살아납니다.**

```bash
git checkout develop
git merge --no-ff release -m "chore: hotfix <설명>를 develop에 반영"
```

실수로 `develop`에 직접 커밋했다면, **푸시 전이라면** 되돌리기 쉽습니다 — `git reset --soft HEAD~1`로 커밋만 풀면 변경이 staged 상태로 남으므로, 브랜치를 판 뒤 그대로 다시 커밋하면 됩니다.

```bash
git reset --soft HEAD~1
git switch -c <type>/<이름>
git commit -F <메시지파일>
```

### `gh` CLI로 PR 생성하기

저장소 기본 브랜치가 `release`라서 `gh pr create`는 base를 `release`로 잡습니다. 컨벤션에 맞추려면 **base를 `-B develop`으로 반드시 명시**해야 합니다.

```bash
git push -u origin <현재-브랜치>
gh pr create -B develop --title "<제목>" --body-file <파일>
```

- 본문은 `.github/pull_request_template.md`를 채워서 `--body-file`로 전달합니다 (CLI 생성 시 템플릿이 자동 적용되지 않음).
- origin이 다중 계정용 SSH 별칭(`git@my-github.com:...`)을 쓰지만, `gh`가 `~/.ssh/config`의 Host 별칭을 해석하므로 `-R` 없이 그대로 동작합니다.

### PR 스크린샷은 자동으로 붙습니다

UI 변경 PR에는 이미지 첨부가 필수지만(`.github/pull_request_template.md`), **직접 첨부할 필요는 없습니다.** 브랜치를 푸시하면 `.github/workflows/pr-screenshots.yml`이 `scripts/shots.mjs`(Playwright)를 돌려 캡처하고, 이미지를 `pr-assets` orphan 브랜치에 올린 뒤 sticky 코멘트로 임베드합니다. PR이 닫히면 해당 디렉터리는 자동 정리됩니다.

- **새 화면을 캡처 대상에 넣으려면** `scripts/shots.mjs`의 `SCENARIOS` 배열에 항목을 추가합니다 (`name`·`path`·`viewport`·`clip`·`hover`·`scrollGif`). 캡처 로직은 건드리지 않습니다.
- **코멘트에 어떻게 실릴지도 같은 배열에서 정합니다** (`group`·`label`·`caption`·`width`). 본문은 `.shots/manifest.json`을 읽어 `scripts/shots-comment.mjs`가 생성하므로, 시나리오만 추가하면 코멘트에도 따라옵니다.
- 뷰포트는 `VIEWPORTS` 맵에 이름을 붙여두고 시나리오에서 키로 참조합니다.
- 인터랙션은 mp4가 아니라 **GIF**로 뽑습니다 — 마크다운 `![]()`는 이미지만 렌더링하기 때문입니다.
- 시나리오가 늘어 파일이 무거워지면 슬라이스별 `*.shots.mjs`로 쪼개되, 그건 **두 번째 소비자가 생겼을 때** 합니다 (`shared` 승격 원칙과 같은 판단).

### rebase와 merge 중 무엇을 쓸 것인가

원칙: **아직 공유하지 않은 커밋은 rebase, 이미 공유된 히스토리는 merge.** rebase는 커밋을 새로 만들어 갈아끼우므로(해시가 바뀜) "내 것"에만 씁니다.

| 상황 | 방식 |
| --- | --- |
| 작업 브랜치에 `develop` 최신 내용 가져오기 | **rebase** (`git rebase develop`) |
| PR 올리기 전 커밋 정리 | **rebase -i** |
| 작업 브랜치 → `develop` PR 머지 | **rebase merge** |
| `develop` → `release` | **merge** |

**두 방식을 섞지 않습니다.** 작업 브랜치에서 `git merge develop`으로 최신 내용을 가져오면, 나중에 rebase 머지를 할 때 GitHub이 그 머지 커밋을 버리면서 **머지가 해결해둔 충돌이 되살아납니다.** rebase로 머지할 계획이면 가져올 때도 rebase로 가져오세요. (실제 사례: [[이슈트래킹#rebase 머지 시 되살아난 CLAUDE.md 충돌]])

기타 규칙:

- `develop`·`release`는 여러 곳에서 공유되는 히스토리이므로 **절대 rebase하지 않습니다.**
- 혼자 쓰는 작업 브랜치는 자유롭게 rebase해도 안전합니다. rebase 후에는 `git push --force-with-lease`를 씁니다 (`--force`가 아니라 — 원격이 그사이 바뀌었으면 거부해 줍니다).
- 되돌릴 수 있도록 rebase 전에 백업 브랜치(`git branch backup/<이름>`)를 만들고, 끝난 뒤 `git diff --stat backup/<이름> HEAD`로 내용이 보존됐는지 확인합니다.
- `git pull`은 상황에 따라 원치 않는 머지 커밋을 만듭니다. 확인만 할 때는 `git fetch`를 쓰고, 합칠 때는 `git pull --ff-only`를 씁니다. 이 저장소에는 `pull.ff=only`가 **로컬 설정으로** 걸려 있어 `git pull`만 해도 동일하게 동작합니다 (전역 설정이 아니므로 다른 저장소에서는 `--ff-only`를 직접 붙여야 합니다).
- **`rerere`는 쓰지 않습니다.** 예전 충돌 해결을 기억했다가 자동 적용해 주는 기능이지만, 그 해결이 지금 맥락에도 맞는지는 git이 판단하지 못합니다. 특히 문서처럼 같은 위치가 반복해서 부딪히는 파일에서 위험합니다. 번거롭더라도 충돌은 매번 직접 확인하고 해결합니다.

## Obsidian 기록 — 이 저장소의 사정

기록 폴더는 `10_Projects/admin-dashboard/`입니다. 무엇을 언제 어떻게 기록하는지는 `~/.claude/CLAUDE.md`에 있습니다.

**quiz-bot과 같은 볼트를 씁니다.** 이 폴더의 기록, 특히 `이슈트래킹.md`의 항목들이 quiz-bot 퀴즈 문제 은행의 소스가 됩니다 — 여기를 어떻게 기록하느냐가 그쪽 문제 품질에 영향을 줍니다. 두 프로젝트에 걸친 결정은 각자의 폴더에 기록하고 `[[10_Projects/quiz-bot/개요]]`처럼 서로 링크합니다.
