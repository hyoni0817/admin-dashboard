# CLAUDE.md

이 파일은 이 저장소에서 작업할 때 Claude Code(claude.ai/code)에게 제공되는 가이드입니다.

## 프로젝트 현황

이 저장소는 아직 스캐폴딩되지 않았습니다 — 코드와 `package.json`이 없습니다. 아래 규칙들은 프로젝트가 생성된 이후 따라야 할 스택과 아키텍처를 미리 정의한 것으로, 스캐폴딩 시점부터 이후의 모든 작업이 이 결정들과 일관되게 유지되도록 하기 위함입니다.

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

## TanStack Query: 쿼리 팩토리 패턴

원시 쿼리 키/옵션을 컴포넌트 곳곳에 흩어놓지 않습니다. 데이터를 조회하는 각 entity/feature는 해당 슬라이스의 `api/` 폴더에 위치한 **쿼리 팩토리**를 정의하여 다음을 중앙화합니다:

- 쿼리 키 (계층적이고 타입이 지정된 키 구조)
- 쿼리 옵션 (`queryOptions()`로 구성한 queryFn, staleTime 등)

따라야 할 예시 형태:

```ts
// entities/user/api/queries.ts
export const userQueries = {
  all: () => ['users'] as const,
  lists: () => [...userQueries.all(), 'list'] as const,
  list: (filters: UserFilters) =>
    queryOptions({
      queryKey: [...userQueries.lists(), filters],
      queryFn: () => fetchUsers(filters),
    }),
  details: () => [...userQueries.all(), 'detail'] as const,
  detail: (id: string) =>
    queryOptions({
      queryKey: [...userQueries.details(), id],
      queryFn: () => fetchUser(id),
    }),
};
```

컴포넌트/훅은 쿼리 키나 옵션을 직접 구성하지 않고 이 팩토리를 그대로 사용합니다 (`useQuery(userQueries.detail(id))`). 이렇게 하면 키 무효화(`queryClient.invalidateQueries({ queryKey: userQueries.all() })`)를 신뢰성 있게 중앙에서 관리할 수 있습니다.

## Git 커밋 컨벤션

[Conventional Commits](https://www.conventionalcommits.org/ko/v1.0.0/)를 따르되, 커밋 설명은 **한국어**로 작성합니다:

```
<type>(<optional scope>): <한국어 설명>
```

자주 쓰는 type: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`. 예시: `feat(user): 사용자 목록 필터링 기능 추가`

## 브랜치 및 PR 전략

- 장기 브랜치: `release`, `develop`
- 작업 브랜치: `feat/*` (신규 기능), `fix/*` (버그 수정) — 예: `feat/pr-template`
- PR은 `feat/*` / `fix/*` 브랜치를 `develop`으로 머지합니다 (`release`로 직접 머지하지 않음).
