import type { NavItem } from "../model/nav-items";
import * as S from "./SidebarItem.styles";

interface SidebarItemProps extends NavItem {
  isActive?: boolean;
}

export function SidebarItem({
  label,
  href,
  icon,
  isActive = false,
}: SidebarItemProps) {
  return (
    <S.Item
      href={href}
      $active={isActive}
      aria-current={isActive ? "page" : undefined}
    >
      <S.Icon aria-hidden>{icon}</S.Icon>
      <S.Label>{label}</S.Label>
    </S.Item>
  );
}
