import styled from "styled-components";
import { theme } from "@/shared/config/theme";

/**
 * Figma "Navigation / Sidebar Menu / Light" — 240x1070.
 * 세로 리듬: padding-top 24 → 로고(27) → 30 → 메뉴 블록들, 구분선/섹션 라벨 주위는 모두 16.
 */
export const Aside = styled.aside`
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  width: 240px;
  min-height: 100vh;
  padding: 24px 0 41px;
  background: ${theme.colors.neutral.white};
  border-right: 1px solid ${theme.colors.neutral.gray100};
`;

export const LogoArea = styled.div`
  padding-left: 66px;
`;

export const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  margin-top: 30px;
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
