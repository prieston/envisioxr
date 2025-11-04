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
} from "@mui/material";
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
  const handleChange = (_event: React.SyntheticEvent, isExpanded: boolean) => {
    onToggle(isExpanded ? category.categoryName : "");
  };

  return (
    <Accordion
      expanded={expanded}
      onChange={handleChange}
      sx={{
        mb: 1,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        "&:before": {
          display: "none",
        },
        "&.Mui-expanded": {
          margin: "0 0 8px 0",
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          backgroundColor: "rgba(248, 250, 252, 0.6)",
          borderLeft: "3px solid rgba(95, 136, 199, 0.6)",
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
              color: "rgba(51, 65, 85, 0.95)",
            }}
          >
            {category.categoryName}
          </Typography>
          <Typography
            sx={{
              fontSize: "0.7rem",
              color: "rgba(100, 116, 139, 0.8)",
              backgroundColor: "rgba(95, 136, 199, 0.1)",
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
          backgroundColor: "rgba(255, 255, 255, 0.4)",
        }}
      >
        <Table size="small">
          <TableBody>
            {category.properties.map(([key, value]) => (
              <TableRow
                key={key}
                sx={{
                  "&:hover": {
                    backgroundColor: "rgba(248, 250, 252, 0.8)",
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
                    color: "rgba(100, 116, 139, 0.9)",
                    borderBottom: "1px solid rgba(226, 232, 240, 0.3)",
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
                    color: "rgba(51, 65, 85, 0.9)",
                    borderBottom: "1px solid rgba(226, 232, 240, 0.3)",
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

