import React, { useMemo, useState } from "react";
import { Box } from "@mui/material";
import { categorizeProperties } from "./CesiumFeaturePropertyCategorizer";
import { CesiumFeaturePropertyCategory } from "./CesiumFeaturePropertyCategory";

interface CesiumFeaturePropertiesProps {
  properties: Record<string, unknown>;
  showEmptyFields?: boolean;
}

const CesiumFeatureProperties: React.FC<CesiumFeaturePropertiesProps> = ({
  properties,
  showEmptyFields = false,
}) => {
  const [expanded, setExpanded] = useState<string | false>("General");

  const categorizedProperties = useMemo(
    () => categorizeProperties(properties, showEmptyFields),
    [properties, showEmptyFields]
  );

  const handleAccordionChange = (categoryName: string) => {
    setExpanded((prev) => (prev === categoryName ? false : categoryName));
  };

  // Early return after all hooks are called
  if (!properties || Object.keys(properties).length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        overflow: "auto",
        flex: 1,
        padding: "8px",
      }}
    >
      {categorizedProperties.map((category) => (
        <CesiumFeaturePropertyCategory
          key={category.categoryName}
          category={category}
          expanded={expanded === category.categoryName}
          onToggle={handleAccordionChange}
        />
      ))}
    </Box>
  );
};

export default CesiumFeatureProperties;
