import { theme } from "@/shared/config/theme";
import styled from "styled-components";

export const LogoText = styled.p`
  font-family: var(--font-nunito-sans);
  font-weight: 800;
  font-size: 20px;
  line-height: normal;
`;

export const Dash = styled.span`
  color: ${theme.colors.primary.blue};
`;

export const Stack = styled.span`
  color: ${theme.colors.text.primary};
`;
