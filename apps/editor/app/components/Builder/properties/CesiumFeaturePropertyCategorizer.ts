/**
 * Categorization logic for Cesium feature properties
 */

import { isEmpty } from "./CesiumFeaturePropertyFormatter";

export interface PropertyCategory {
  categoryName: string;
  properties: [string, unknown][];
  filledCount: number;
  totalCount: number;
}

/**
 * Categorize properties intelligently by prefix
 */
export function categorizeProperties(
  props: Record<string, unknown>,
  showEmptyFields: boolean = false
): PropertyCategory[] {
  const groups: Record<string, [string, unknown][]> = {};
  const allGroups: Record<string, [string, unknown][]> = {}; // Track all properties for counts

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
  const generalProps: [string, unknown][] = [];
  const allGeneralProps: [string, unknown][] = [];
  const categorizedGroups: Record<string, [string, unknown][]> = {};
  const allCategorizedGroups: Record<string, [string, unknown][]> = {};

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
  const result: PropertyCategory[] = [];

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
}

