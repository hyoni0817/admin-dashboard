import type { ReactNode } from "react";

export interface NavItem {
  label: string;
  href: string;
  /**
   * Figma의 사이드바 아이콘은 벡터가 아니라 파일에 없는 아이콘 폰트의 글리프(PUA 코드포인트)라
   * 디자인에서 내보낼 수 있는 에셋이 없다. 아이콘 소스가 정해지면 여기에 주입한다.
   */
  icon?: ReactNode;
}

export interface NavSection {
  id: string;
  /** 섹션 위에 노출되는 라벨. 없으면 구분선만 그린다. */
  title?: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    id: "main",
    items: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Products", href: "/products" },
      { label: "Favourites", href: "/favourites" },
      { label: "Messenger", href: "/messenger" },
      { label: "Order Lists", href: "/order-lists" },
      { label: "E-commerce", href: "/e-commerce" },
    ],
  },
  {
    id: "pages",
    title: "PAGES",
    items: [
      { label: "File Manager", href: "/file-manager" },
      { label: "Calendar", href: "/calendar" },
      { label: "Feed", href: "/feed" },
      { label: "To-Do", href: "/to-do" },
      { label: "Contact", href: "/contact" },
      { label: "Invoice", href: "/invoice" },
      { label: "UI Elements", href: "/ui-elements" },
      { label: "Profile", href: "/profile" },
      { label: "Table", href: "/table" },
    ],
  },
  {
    id: "account",
    items: [
      { label: "Settings", href: "/settings" },
      { label: "Logout", href: "/logout" },
    ],
  },
];
