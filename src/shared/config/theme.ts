import { createGlobalStyle, createTheme, css } from "styled-components";

/**
 * Figma "Color" variable collection의 Light 모드 값을 기본값으로 사용한다.
 * 토큰이 Figma에서 추가/변경되면 이 파일도 함께 갱신한다.
 * createTheme은 각 leaf를 var(--sc-..., fallback) 문자열로 바꿔주므로,
 * 이 값을 참조하는 styled-components는 Server Component에서도 동작한다.
 */
export const theme = createTheme({
  colors: {
    primary: {
      blue: "#4880FF",
    },
    text: {
      primary: "#202224",
    },
    /**
     * 값 이름 기반 토큰이라 Figma에서도 Light/Dark 모드 값이 동일하다.
     * (다크모드에서 배경/테두리를 바꿔야 하면 역할 기반 토큰을 따로 만든다)
     */
    neutral: {
      white: "#ffffff",
      gray50: "#f5f5f5",
      gray100: "#e8e8e8",
      gray200: "#e0e0e0",
      gray300: "#d5d5d5",
      gray600: "#646464",
      gray700: "#565656",
      gray800: "#404040",
      /** 검색창 배경. gray 스케일과 밝기는 비슷하지만 푸른기가 있어 별도 토큰이다. */
      grayBlue50: "#f5f6fa",
    },
    /**
     * 알림 뱃지 전용. "에러/경고"라는 넓은 역할을 아직 소유하지 않으므로
     * Alert/Error 같은 이름을 미리 붙이지 않는다 — 폼 검증 색이 이 값과 다르면
     * 그때 별도 토큰을 만들고, 같으면 그 시점에 더 넓은 이름으로 승격한다.
     */
    notification: {
      badge: "#f93c65",
    },
  },
});

/**
 * Dark 모드에서 값이 달라지는 토큰만 재정의한다 (Text/Primary만 해당,
 * Primary/Blue는 Figma에서도 Light/Dark 동일값이라 재정의하지 않음).
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
