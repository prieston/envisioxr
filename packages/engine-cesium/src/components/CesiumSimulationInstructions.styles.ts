import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import type { BoxProps } from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { TypographyProps } from "@mui/material/Typography";
import type { ComponentType, HTMLAttributes } from "react";

export type ContainerProps = BoxProps;
const ContainerRoot = styled(Box)<ContainerProps>(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: "rgba(0, 0, 0, 0.05)",
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
}));
export const Container: ComponentType<ContainerProps> = ContainerRoot;

export type TitleProps = TypographyProps;
const TitleRoot = styled(Typography)<TitleProps>(({ theme }) => ({
  fontSize: "0.9rem",
  fontWeight: 600,
  marginBottom: theme.spacing(1),
  color: theme.palette.primary.main,
}));
export const Title: ComponentType<TitleProps> = TitleRoot;

export type InstructionTextProps = TypographyProps;
const InstructionTextRoot = styled(Typography)<InstructionTextProps>(
  ({ theme }) => ({
    fontSize: "0.8rem",
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(0.5),
  })
);
export const InstructionText: ComponentType<InstructionTextProps> =
  InstructionTextRoot;

export type KeyHighlightProps = HTMLAttributes<HTMLSpanElement>;
const KeyHighlightRoot = styled("span")(({ theme }) => ({
  backgroundColor: theme.palette.grey[200],
  padding: "2px 6px",
  borderRadius: "4px",
  fontFamily: "monospace",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: theme.palette.text.primary,
}));
export const KeyHighlight =
  KeyHighlightRoot as ComponentType<KeyHighlightProps>;
