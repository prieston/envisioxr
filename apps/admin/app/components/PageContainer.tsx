"use client";

import React from "react";
import { Box, BoxProps } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledPageContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  padding: theme.spacing(3), // 24px
  boxSizing: "border-box",
}));

interface PageContainerProps extends BoxProps {
  children: React.ReactNode;
}

export function PageContainer({ children, ...props }: PageContainerProps) {
  return <StyledPageContainer {...props}>{children}</StyledPageContainer>;
}

