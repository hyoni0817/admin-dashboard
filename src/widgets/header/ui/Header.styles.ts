import styled from "styled-components";
import { theme } from "@/shared/config/theme";

/**
 * Figma "Navigation / Top Bar / Light" (0:40369) — 1201x70.
 * 좌우 padding 30/31, 하단 1px 구분선. 폭은 사이드바를 뺀 나머지를 채운다.
 *
 * Figma는 전부 절대 좌표라 그대로 옮기지 않고, 측정한 간격을 flex gap으로 바꿨다.
 */
export const Bar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  height: 70px;
  padding: 0 31px 0 30px;
  background: ${theme.colors.neutral.white};
  border-bottom: 1px solid ${theme.colors.neutral.gray100};
`;

export const LeftGroup = styled.div`
  display: flex;
  align-items: center;
  /* 메뉴 아이콘(30~54px)과 검색창(78px) 사이 */
  gap: 24px;
  min-width: 0;
`;

/**
 * 사이드바 토글 자리.
 * Figma 아이콘이 파일에 없는 폰트(Gilroy)의 글리프라 벡터를 가져올 수 없어
 * 크기만 잡아두고 비워둔다 — 토글 기능을 붙일 때 아이콘 소스와 함께 정한다.
 */
export const MenuSlot = styled.div`
  flex-shrink: 0;
  width: 24px;
  height: 24px;
`;

export const Search = styled.div`
  display: flex;
  align-items: center;
  gap: 13px;
  width: 388px;
  max-width: 100%;
  height: 38px;
  padding: 0 16px;
  background: ${theme.colors.neutral.grayBlue50};
  /* Figma는 0.6px이지만 1px 미만은 브라우저마다 렌더링이 달라 1px로 둔다 */
  border: 1px solid ${theme.colors.neutral.gray300};
  border-radius: 19px;
  color: ${theme.colors.text.primary};
`;

export const SearchIconSlot = styled.span`
  display: flex;
  flex-shrink: 0;
  opacity: 0.5;
`;

/** 아직 동작 없는 정적 입력란 — 검색 기능은 후속 PR에서 붙인다. */
export const SearchInput = styled.input`
  min-width: 0;
  flex: 1;
  border: 0;
  background: transparent;
  font-family: var(--font-nunito-sans);
  font-size: 14px;
  color: ${theme.colors.text.primary};

  &::placeholder {
    color: ${theme.colors.text.primary};
    opacity: 0.5;
  }

  &:focus {
    outline: none;
  }
`;

export const RightGroup = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  /* 알림(~825px) → 언어(851px) 26px, 언어(~973px) → 프로필(1001px) 28px */
  gap: 26px;
`;

/** 종 + 뱃지. 뱃지가 아이콘 밖으로 나가므로 겹침 기준점이 된다. */
export const NotificationSlot = styled.div`
  position: relative;
  display: flex;
  flex-shrink: 0;
`;

/**
 * Figma에서 뱃지는 원(16) 뒤에 옅은 원(18)이 한 겹 더 깔려 헤일로를 만든다.
 * box-shadow로 대신해 노드 하나를 줄였다.
 */
export const Badge = styled.span`
  position: absolute;
  top: -5px;
  left: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${theme.colors.notification.badge};
  box-shadow: 0 0 0 1px ${theme.colors.notification.badge}1a;
  font-family: var(--font-nunito-sans);
  font-weight: 700;
  font-size: 12px;
  line-height: 1;
  color: ${theme.colors.neutral.white};
`;

export const Language = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  color: ${theme.colors.neutral.gray600};
`;

/**
 * 국기 자리.
 * 언어 전환은 i18n 인프라가 필요한 별도 작업이라, 여기서는 크기(40x27)만 잡는다.
 */
export const FlagSlot = styled.div`
  flex-shrink: 0;
  width: 40px;
  height: 27px;
  border-radius: 5px;
  background: ${theme.colors.neutral.gray200};
`;

export const LanguageLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-nunito-sans);
  font-weight: 600;
  font-size: 14px;
  color: ${theme.colors.neutral.gray600};
`;

export const Profile = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

/** 아바타 자리 — 실제 이미지는 사용자 데이터를 붙이는 후속 PR에서 넣는다. */
export const AvatarSlot = styled.div`
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${theme.colors.neutral.gray200};
`;

export const ProfileText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

export const ProfileName = styled.span`
  font-family: var(--font-nunito-sans);
  font-weight: 700;
  font-size: 14px;
  line-height: normal;
  color: ${theme.colors.neutral.gray800};
`;

export const ProfileRole = styled.span`
  font-family: var(--font-nunito-sans);
  font-weight: 600;
  font-size: 12px;
  line-height: normal;
  color: ${theme.colors.neutral.gray700};
`;

export const ProfileChevron = styled.span`
  display: flex;
  flex-shrink: 0;
  /* 이름 블록 끝(~1132px)과 화살표(1152px) 사이 */
  margin-left: 20px;
`;
