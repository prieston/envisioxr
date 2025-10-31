import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface CesiumFeaturePropertiesProps {
  properties: Record<string, any>;
  showEmptyFields?: boolean;
}

const CesiumFeatureProperties: React.FC<CesiumFeaturePropertiesProps> = ({
  properties,
  showEmptyFields = false,
}) => {
  const [expanded, setExpanded] = useState<string | false>("General");

  if (!properties || Object.keys(properties).length === 0) {
    return null;
  }

  // Helper to check if a value is empty
  const isEmpty = (value: any): boolean => {
    return value === undefined || value === null || value === "";
  };

  const handleAccordionChange =
    (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  // Format property key for display (human-readable)
  const formatKey = (key: string): string => {
    return key
      .replace(/([A-Z])/g, " $1") // Add space before capital letters
      .replace(/_/g, " ") // Replace underscores with spaces
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Format property value for display
  const formatValue = (value: any): string => {
    if (value === undefined || value === null) {
      return "—";
    }
    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    if (typeof value === "number") {
      return value.toLocaleString(undefined, { maximumFractionDigits: 3 });
    }
    return String(value);
  };

  // Helper function to categorize properties intelligently
  const categorizeProperties = (
    props: Record<string, any>
  ): {
    categoryName: string;
    properties: [string, any][];
    filledCount: number;
    totalCount: number;
  }[] => {
    const groups: Record<string, [string, any][]> = {};
    const allGroups: Record<string, [string, any][]> = {}; // Track all properties for counts

    // First pass: group ALL properties by prefix to get total counts
    Object.entries(props).forEach(([key, value]) => {
      const match = key.match(/^([a-z]+)/i);
      const prefix = match ? match[1] : "";
      const categoryName = prefix
        ? prefix.charAt(0).toUpperCase() + prefix.slice(1)
        : "Other";

      if (!allGroups[categoryName]) {
        allGroups[categoryName] = [];
      }
      allGroups[categoryName].push([key, value]);

      // Also add to filtered groups if not empty or if showEmptyFields is true
      if (showEmptyFields || !isEmpty(value)) {
        if (!groups[categoryName]) {
          groups[categoryName] = [];
        }
        groups[categoryName].push([key, value]);
      }
    });

    // Second pass: move single-property categories to "General"
    const generalProps: [string, any][] = [];
    const allGeneralProps: [string, any][] = [];
    const categorizedGroups: Record<string, [string, any][]> = {};
    const allCategorizedGroups: Record<string, [string, any][]> = {};

    Object.entries(groups).forEach(([category, items]) => {
      const allItems = allGroups[category] || [];
      if (allItems.length === 1) {
        generalProps.push(...items);
        allGeneralProps.push(...allItems);
      } else {
        categorizedGroups[category] = items;
        allCategorizedGroups[category] = allItems;
      }
    });

    // Build final result with General first, then others sorted by name
    const result: {
      categoryName: string;
      properties: [string, any][];
      filledCount: number;
      totalCount: number;
    }[] = [];

    if (generalProps.length > 0) {
      const filledCount = allGeneralProps.filter(
        ([, value]) => !isEmpty(value)
      ).length;
      result.push({
        categoryName: "General",
        properties: generalProps,
        filledCount,
        totalCount: allGeneralProps.length,
      });
    }

    Object.entries(categorizedGroups)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([categoryName, properties]) => {
        const allProperties = allCategorizedGroups[categoryName] || [];
        const filledCount = allProperties.filter(
          ([, value]) => !isEmpty(value)
        ).length;
        result.push({
          categoryName,
          properties,
          filledCount,
          totalCount: allProperties.length,
        });
      });

    return result;
  };

  const categorizedProperties = useMemo(
    () => categorizeProperties(properties),
    [properties, showEmptyFields]
  );

  return (
    <Box
      sx={{
        overflow: "auto",
        flex: 1,
        padding: "8px",
      }}
    >
      {categorizedProperties.map(
        ({ categoryName, properties: props, filledCount, totalCount }) => (
          <Accordion
            key={categoryName}
            expanded={expanded === categoryName}
            onChange={handleAccordionChange(categoryName)}
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
                borderLeft: "3px solid rgba(37, 99, 235, 0.6)",
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
                  {categoryName}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.7rem",
                    color: "rgba(100, 116, 139, 0.8)",
                    backgroundColor: "rgba(37, 99, 235, 0.1)",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontWeight: 500,
                  }}
                >
                  {filledCount}/{totalCount}
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
                  {props.map(([key, value]) => (
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
        )
      )}
    </Box>
  );
};

export default CesiumFeatureProperties;
