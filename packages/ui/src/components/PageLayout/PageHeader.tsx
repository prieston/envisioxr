import React, { useMemo } from "react";
import { Box, Typography, Breadcrumbs, Link } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
}

/**
 * Page header component with title and optional breadcrumbs.
 * Title is displayed at 22-24px (text-2xl equivalent) with font-semibold (600).
 * Breadcrumbs are only shown when provided (for nested navigation).
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  breadcrumbs,
  className,
}) => {
  // Memoize breadcrumb items to prevent unnecessary re-renders
  const breadcrumbItems = useMemo(() => {
    if (!breadcrumbs || breadcrumbs.length === 0) return null;
    return breadcrumbs.map((crumb, index) => {
      const isLast = index === breadcrumbs.length - 1;
      return isLast ? (
        <Typography key={index} color="text.primary">
          {crumb.label}
        </Typography>
      ) : (
        <Link
          key={index}
          href={crumb.href}
          color="text.secondary"
          underline="hover"
        >
          {crumb.label}
        </Link>
      );
    });
  }, [breadcrumbs]);

  return (
    <Box className={className}>
      {breadcrumbItems && (
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{
            mb: 2,
            "& .MuiBreadcrumbs-separator": {
              color: "rgba(255, 255, 255, 0.4)",
            },
            "& .MuiBreadcrumbs-li": {
              "& a": {
                color: "rgba(255, 255, 255, 0.6)",
                textDecoration: "none",
                fontSize: "0.875rem",
                "&:hover": {
                  color: "rgba(255, 255, 255, 0.9)",
                },
              },
              "& .MuiTypography-root": {
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: "0.875rem",
              },
            },
          }}
        >
          {breadcrumbItems}
        </Breadcrumbs>
      )}
      <Typography
        variant="h5"
        sx={{
          fontSize: "22px",
          fontWeight: 600,
          color: "text.primary",
          lineHeight: 1.2,
        }}
      >
        {title}
      </Typography>
    </Box>
  );
};

