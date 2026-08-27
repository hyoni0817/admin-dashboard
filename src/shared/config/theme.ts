import { createGlobalStyle, createTheme, css } from "styled-components";

/**
 * Figma "Color" variable collection의 Light 모드 값을 기본값으로 사용한다.
 * 토큰이 Figma에서 추가/변경되면 이 파일도 함께 갱신한다.
 * createTheme은 각 leaf를 var(--sc-..., fallback) 문자열로 바꿔주므로,
 * 이 값을 참조하는 styled-components는 Server Component에서도 동작한다.
 *
 * ── 두 종류의 토큰 ────────────────────────────────────────────────
 *
 * **값 토큰**은 `<색상 계열>[명도 단계]` 한 가지 형태로 짓는다 (gray, rose …).
 * 계열 이름이 곧 색이므로 키에는 명도 단계만 쓴다. 새 색이 생기면 단계 숫자
 * 사이에 끼워넣을 수 있어 이름을 바꿀 일이 없다.
 *
 * **역할 토큰**(primary, text …)은 모드에 따라 값이 달라져야 할 때만 만든다.
 * 그 근거가 없는 채로 Alert·Accent 같은 넓은 역할을 미리 선언하면 이름이
 * 나중에 거짓이 된다. 자세한 규칙은 CLAUDE.md 참고.
 */
export const theme = createTheme({
  colors: {
    /** 브랜드 주색. "primary"라는 역할을 실제로 소유하고 있다. */
    primary: {
      blue: "#4880FF",
    },
    /** Light/Dark에서 값이 달라지므로 역할 토큰이다. */
    text: {
      primary: "#202224",
    },

    white: "#ffffff",
    /**
     * 회색 위계: 50(메뉴 hover 배경) → 100(테두리) → 200(구분선·스크롤바)
     * → 300(입력 테두리) → 600·700·800(보조 텍스트, 진해지는 순).
     */
    gray: {
      50: "#f5f5f5",
      100: "#e8e8e8",
      200: "#e0e0e0",
      300: "#d5d5d5",
      600: "#646464",
      700: "#565656",
      800: "#404040",
    },
    /** 밝기는 gray50과 비슷하지만 푸른기가 있어 별도 계열이다. 검색창 배경. */
    grayBlue: {
      50: "#f5f6fa",
    },
    /**
     * 색상환 347도로 순수 빨강보다 분홍 쪽에 있다 (Tailwind rose-500과 거의 같은 자리).
     * 나중에 분홍 계열 색이 추가됐을 때 같은 계열로 판단되면 한 스케일로 합친다.
     */
    rose: {
      500: "#f93c65",
    },
  },
});

/**
 * Dark 모드에서 값이 달라지는 토큰만 재정의한다 (Text/Primary만 해당,
 * Primary/Blue는 Figma에서도 Light/Dark 동일값이라 재정의하지 않음).
 * 값 토큰(gray, rose …)은 이름이 곧 값이라 모드에 따라 바뀌지 않는다 —
 * 다크에서 배경/텍스트를 바꿔야 하면 이 값들을 참조하는 역할 토큰을 만든다.
 */
const darkVars = css`
  ${theme.vars.colors.text.primary}: #ffffff;
`;

export const DarkOverrides = createGlobalStyle`
  @media (prefers-color-scheme: dark) {
    :root:not(.light) {
      ${darkVars}
    }
  }

  .dark {
    ${darkVars}
  }
`;
