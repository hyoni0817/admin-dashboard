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
