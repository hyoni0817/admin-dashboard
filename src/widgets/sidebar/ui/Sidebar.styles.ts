import styled from "styled-components";
import { theme } from "@/shared/config/theme";

/**
 * Figma "Navigation / Sidebar Menu / Light" — 240x1070.
 * 세로 리듬: padding-top 24 → 로고(27) → 30 → 메뉴 블록들, 구분선/섹션 라벨 주위는 모두 16.
 *
 * 뷰포트에 고정한다. 메뉴가 넘쳐도 사이드바가 늘어나지 않고 Nav 안에서만 스크롤된다.
 */
export const Aside = styled.aside`
  position: sticky;
  top: 0;
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  width: 240px;
  height: 100dvh;
  /* 하단 41px은 Nav 안쪽 padding으로 옮겼다 — 스크롤바가 사이드바 끝까지 닿게 하기 위함 */
  padding-top: 24px;
  background: ${theme.colors.neutral.white};
  border-right: 1px solid ${theme.colors.neutral.gray100};
`;

export const LogoArea = styled.div`
  flex-shrink: 0;
  padding-left: 66px;
`;

/** min-height: 0 이 있어야 flex 자식이 내용 높이 아래로 줄어들며 스크롤이 생긴다. */
export const Nav = styled.nav`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  margin-top: 30px;
  padding-bottom: 41px;
  overflow-y: auto;

  /*
   * 스크롤바 자리는 항상 확보하고 thumb만 hover 시 드러낸다.
   * - scrollbar-width: thin — macOS의 overlay 스크롤바 대신 자리를 차지하는 고정폭 스크롤바가 된다 (Chrome 기준 11px)
   * - scrollbar-gutter: stable — 내용이 넘치지 않을 때도 같은 폭을 남겨 메뉴가 좌우로 흔들리지 않게 한다
   * - scrollbar-color의 thumb만 transparent → hover 시 색을 주는 방식이라, 나타나고 사라져도 폭은 그대로다
   * ::-webkit-scrollbar 쪽은 표준 속성을 모르는 구버전 Safari용 fallback이다
   * (Chrome/Firefox는 위 표준 속성이 우선하므로 이 규칙들을 무시한다).
   */
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;

  &:hover {
    scrollbar-color: ${theme.colors.neutral.gray200} transparent;
  }

  &::-webkit-scrollbar {
    width: 11px;
  }

  &::-webkit-scrollbar-thumb {
    border: 3px solid transparent;
    border-radius: 6px;
    background: transparent;
    background-clip: content-box;
  }

  &:hover::-webkit-scrollbar-thumb {
    background: ${theme.colors.neutral.gray200};
    background-clip: content-box;
  }
`;

export const Divider = styled.hr`
  height: 1px;
  margin: 16px 0;
  border: 0;
  background: ${theme.colors.neutral.gray200};
`;

export const SectionTitle = styled.p`
  margin-bottom: 16px;
  padding-left: 40px;
  font-family: var(--font-nunito-sans);
  font-weight: 700;
  font-size: 12px;
  line-height: normal;
  letter-spacing: 0.2571px;
  color: ${theme.colors.text.primary};
  opacity: 0.6;
`;

export const SectionList = styled.ul`
  display: flex;
  flex-direction: column;
  list-style: none;
`;
