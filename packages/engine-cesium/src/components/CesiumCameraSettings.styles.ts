import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import type { BoxProps } from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { TypographyProps } from "@mui/material/Typography";
import type { ComponentType } from "react";

export type ContainerProps = BoxProps;
const ContainerRoot = styled(Box)<ContainerProps>(({ theme }) => ({
  "& > *:not(:last-child)": {
    marginBottom: theme.spacing(2),
  },
}));
export const Container: ComponentType<ContainerProps> = ContainerRoot;

export type SectionTitleProps = TypographyProps;
const SectionTitleRoot = styled(Typography)<SectionTitleProps>(({ theme }) => ({
  fontSize: "1rem",
  fontWeight: 500,
  marginBottom: theme.spacing(1),
}));
export const SectionTitle: ComponentType<SectionTitleProps> = SectionTitleRoot;

export type SettingRowProps = BoxProps;
const SettingRowRoot = styled(Box)<SettingRowProps>(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
}));
export const SettingRow: ComponentType<SettingRowProps> = SettingRowRoot;
