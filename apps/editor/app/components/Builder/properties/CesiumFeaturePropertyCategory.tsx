import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  Box,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { formatKey, formatValue } from "./CesiumFeaturePropertyFormatter";
import type { PropertyCategory } from "./CesiumFeaturePropertyCategorizer";

interface CesiumFeaturePropertyCategoryProps {
  category: PropertyCategory;
  expanded: boolean;
  onToggle: (categoryName: string) => void;
}

/**
 * CesiumFeaturePropertyCategory - Renders a single category accordion
 * Extracted from CesiumFeatureProperties for better maintainability
 */
export const CesiumFeaturePropertyCategory: React.FC<
  CesiumFeaturePropertyCategoryProps
> = ({ category, expanded, onToggle }) => {
  const theme = useTheme();
  const handleChange = (_event: React.SyntheticEvent, isExpanded: boolean) => {
    onToggle(isExpanded ? category.categoryName : "");
  };

  return (
    <Accordion
      expanded={expanded}
      onChange={handleChange}
      sx={{
        mb: 1,
        boxShadow:
          theme.palette.mode === "dark"
            ? "0 1px 3px rgba(0,0,0,0.35)"
            : "0 2px 6px rgba(15, 23, 42, 0.08)",
        "&:before": {
          display: "none",
        },
        "&.Mui-expanded": {
          margin: "0 0 8px 0",
        },
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          backgroundColor: alpha(theme.palette.background.paper, 0.6),
          borderLeft: `3px solid ${alpha(theme.palette.primary.main, 0.6)}`,
          minHeight: "48px",
          "&.Mui-expanded": {
            minHeight: "48px",
          },
          "& .MuiAccordionSummary-content": {
            margin: "12px 0",
            "&.Mui-expanded": {
              margin: "12px 0",
            },
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            pr: 1,
          }}
        >
          <Typography
            sx={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: theme.palette.text.primary,
            }}
          >
            {category.categoryName}
          </Typography>
          <Typography
            sx={{
              fontSize: "0.7rem",
              color: theme.palette.text.secondary,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              padding: "2px 8px",
              borderRadius: "12px",
              fontWeight: 500,
            }}
          >
            {category.filledCount}/{category.totalCount}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          padding: 0,
          backgroundColor:
            theme.palette.mode === "dark"
              ? alpha(theme.palette.background.paper, 0.4)
              : alpha(theme.palette.common.white, 0.4),
        }}
      >
        <Table size="small">
          <TableBody>
            {category.properties.map(([key, value]) => (
              <TableRow
                key={key}
                sx={{
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  },
                  "&:last-child td": {
                    borderBottom: 0,
                  },
                }}
              >
                <TableCell
                  sx={{
                    fontSize: "0.7rem",
                    fontWeight: 500,
                    color: theme.palette.text.secondary,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    padding: "10px 16px",
                    width: "45%",
                    verticalAlign: "top",
                  }}
                >
                  {formatKey(key)}
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: "0.7rem",
                    color: theme.palette.text.primary,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    padding: "10px 16px",
                    wordBreak: "break-word",
                    fontFamily:
                      typeof value === "number" ? "monospace" : "inherit",
                  }}
                >
                  {formatValue(value)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AccordionDetails>
    </Accordion>
  );
};

