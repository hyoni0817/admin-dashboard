"use client";

import { Fragment } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/shared/ui/logo";
import { navSections } from "../model/nav-items";
import { SidebarItem } from "./SidebarItem";
import * as S from "./Sidebar.styles";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <S.Aside>
      <S.LogoArea>
        <Logo />
      </S.LogoArea>

      <S.Nav aria-label="주 메뉴">
        {navSections.map((section, index) => (
          <Fragment key={section.id}>
            {index > 0 && <S.Divider />}
            {section.title && <S.SectionTitle>{section.title}</S.SectionTitle>}
            <S.SectionList>
              {section.items.map((item) => (
                <li key={item.href}>
                  <SidebarItem {...item} isActive={pathname === item.href} />
                </li>
              ))}
            </S.SectionList>
          </Fragment>
        ))}
      </S.Nav>
    </S.Aside>
  );
}
