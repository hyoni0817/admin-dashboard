import Link from "next/link";
import styled, { css } from "styled-components";
import { theme } from "@/shared/config/theme";

/** active 바와 hover 배경이 공유하는 형태 — 좌우 24px(=10%) 안쪽으로 들어온 라운드 6px 바. */
const barShape = css`
  content: "";
  position: absolute;
  inset: 0 24px;
  border-radius: 6px;
`;

/**
 * Figma "Navigation / Sidebar Item (Light)" — 240x50.
 * 아이콘은 x=46(22px), 라벨은 x=78에서 시작하므로 padding-left 46px + gap 10px으로 맞춘다.
 */
export const Item = styled(Link)<{ $active: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 50px;
  padding-left: 46px;
  /* active 상태의 왼쪽 탭이 컨테이너 밖으로 삐져나온 만큼 잘라낸다 (Figma의 Hide Bg 마스크) */
  overflow: hidden;
  font-family: var(--font-nunito-sans);
  font-weight: 600;
  font-size: 14px;
  line-height: normal;
  letter-spacing: 0.3px;
  color: ${theme.colors.text.primary};

  /* hover 배경. active일 때는 파란 바가 이미 자리를 차지하므로 적용하지 않는다 */
  &:hover::before {
    ${barShape}
    background: ${theme.colors.gray[50]};
  }

  ${({ $active }) =>
    $active &&
    css`
      color: ${theme.colors.white};

      /* 본체 */
      &::before,
      &:hover::before {
        ${barShape}
        background: ${theme.colors.primary.blue};
      }

      /* 왼쪽 끝 탭: 실제 폭 9px이지만 5px이 왼쪽 밖으로 나가 4px만 보인다 */
      &::after {
        content: "";
        position: absolute;
        top: 0;
        bottom: 0;
        left: -5px;
        width: 9px;
        border-radius: 4px;
        background: ${theme.colors.primary.blue};
      }
    `}
`;

/**
 * 아이콘 자리. 현재 Figma에서 벡터를 가져올 수 없어 비어 있지만,
 * 라벨 위치(x=78)를 디자인대로 유지하려면 아이콘 유무와 무관하게 항상 자리를 차지해야 한다.
 */
export const Icon = styled.span`
  position: relative;
  z-index: 1;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  font-size: 22px;

  & > * {
    width: 100%;
    height: 100%;
  }
`;

export const Label = styled.span`
  position: relative;
  z-index: 1;
  white-space: nowrap;
`;
