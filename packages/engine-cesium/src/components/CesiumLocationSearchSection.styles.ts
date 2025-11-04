import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import type { BoxProps } from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { TypographyProps } from "@mui/material/Typography";
import type { ComponentType } from "react";

export type ContainerProps = BoxProps;
const ContainerRoot = styled(Box)<ContainerProps>(({ theme }) => ({
  width: "100%",
  marginBottom: theme.spacing(1.5),
}));
export const Container: ComponentType<ContainerProps> = ContainerRoot;

export type SectionTitleProps = TypographyProps;
const SectionTitleRoot = styled(Typography)<SectionTitleProps>(({ theme }) => ({
  fontSize: "0.813rem",
  fontWeight: 600,
  marginBottom: theme.spacing(0.75),
  color: "rgba(51, 65, 85, 0.95)",
  letterSpacing: "0.01em",
}));
export const SectionTitle: ComponentType<SectionTitleProps> = SectionTitleRoot;

export type SearchContainerProps = BoxProps;
const SearchContainerRoot = styled(Box)<SearchContainerProps>(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  width: "100%",
}));
export const SearchContainer: ComponentType<SearchContainerProps> = SearchContainerRoot;
