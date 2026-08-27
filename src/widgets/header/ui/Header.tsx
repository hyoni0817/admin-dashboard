import {
  BellIcon,
  ChevronDownIcon,
  ProfileChevronIcon,
  SearchIcon,
} from "./icons";
import * as S from "./Header.styles";

/**
 * Figma "Navigation / Top Bar / Light" (0:40369)의 정적 구현.
 *
 * 이 단계는 레이아웃 껍데기다 — 검색·알림·프로필·언어 전환의 동작은
 * 각각 후속 PR에서 붙이고, 여기서는 자리와 간격만 확정한다.
 * 표시되는 값(6, English, Jone Aly)은 Figma 디자인의 더미 값 그대로다.
 */
export function Header() {
  return (
    <S.Bar>
      <S.LeftGroup>
        <S.MenuSlot />

        <S.Search>
          <S.SearchIconSlot>
            <SearchIcon />
          </S.SearchIconSlot>
          <S.SearchInput placeholder="Search" aria-label="검색" readOnly />
        </S.Search>
      </S.LeftGroup>

      <S.RightGroup>
        <S.NotificationSlot>
          <BellIcon />
          <S.Badge>6</S.Badge>
        </S.NotificationSlot>

        <S.Language>
          <S.FlagSlot />
          <S.LanguageLabel>
            English
            <ChevronDownIcon />
          </S.LanguageLabel>
        </S.Language>

        <S.Profile>
          <S.AvatarSlot />
          <S.ProfileText>
            <S.ProfileName>Jone Aly</S.ProfileName>
            <S.ProfileRole>Admin</S.ProfileRole>
          </S.ProfileText>
          <S.ProfileChevron>
            <ProfileChevronIcon />
          </S.ProfileChevron>
        </S.Profile>
      </S.RightGroup>
    </S.Bar>
  );
}
