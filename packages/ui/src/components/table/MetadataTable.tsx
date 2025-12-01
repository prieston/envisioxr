"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import { Delete, Add } from "@mui/icons-material";
import { textFieldStyles } from "../../styles/inputStyles";

export interface MetadataRow {
  label: string;
  value: string;
}

interface MetadataTableProps {
  data: MetadataRow[];
  editable?: boolean;
  onChange?: (data: MetadataRow[]) => void;
}

const MetadataTable: React.FC<MetadataTableProps> = ({
  data,
  editable = false,
  onChange,
}) => {
  const [localData, setLocalData] = useState<MetadataRow[]>(data);

  const handleChange = (
    index: number,
    field: "label" | "value",
    value: string
  ) => {
    const newData = [...localData];
    newData[index][field] = value;
    setLocalData(newData);
    onChange?.(newData);
  };

  const handleDelete = (index: number) => {
    const newData = localData.filter((_, i) => i !== index);
    setLocalData(newData);
    onChange?.(newData);
  };

  const handleAdd = () => {
    const newData = [...localData, { label: "", value: "" }];
    setLocalData(newData);
    onChange?.(newData);
  };

  // Update local data when prop changes
  React.useEffect(() => {
    // Guard: only update if data actually changed (by reference or content)
    if (data !== localData && (
      data.length !== localData.length ||
      data.some((item, index) =>
        item.label !== localData[index]?.label ||
        item.value !== localData[index]?.value
      )
    )) {
      setLocalData(data);
    }
  }, [data, localData]);

  if (localData.length === 0 && !editable) {
    return (
      <Box
        sx={{
          padding: 3,
          textAlign: "center",
          color: "text.secondary",
        }}
      >
        <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
          No metadata available
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer
      component={Box}
      sx={{
        backgroundColor: "transparent",
        boxShadow: "none",
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "text.primary",
              }}
            >
              Property
            </TableCell>
            <TableCell
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "text.primary",
              }}
            >
              Value
            </TableCell>
            {editable && (
              <TableCell
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "text.primary",
                  width: "60px",
                }}
              >
                Actions
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {localData.map((row, index) => (
            <TableRow
              key={index}
              sx={{
                backgroundColor: "transparent",
                "&:hover": {
                  backgroundColor: "transparent",
                },
                "& .MuiTableCell-root": {
                  borderBottom: "none",
                },
              }}
            >
              <TableCell
                sx={{
                  fontSize: "0.75rem",
                  color: "text.secondary",
                }}
              >
                {editable ? (
                  <TextField
                    id={`metadata-table-label-${index}`}
                    name={`metadata-table-label-${index}`}
                    value={row.label}
                    onChange={(e) =>
                      handleChange(index, "label", e.target.value)
                    }
                    size="small"
                    fullWidth
                    placeholder="Property name"
                    sx={textFieldStyles}
                  />
                ) : (
                  <Typography sx={{ fontSize: "0.75rem" }}>
                    {row.label}
                  </Typography>
                )}
              </TableCell>
              <TableCell
                sx={{
                  fontSize: "0.75rem",
                  color: "text.primary",
                }}
              >
                {editable ? (
                  <TextField
                    id={`metadata-table-value-${index}`}
                    name={`metadata-table-value-${index}`}
                    value={
                      typeof row.value === "object" && row.value !== null
                        ? JSON.stringify(row.value, null, 2)
                        : String(row.value ?? "")
                    }
                    onChange={(e) =>
                      handleChange(index, "value", e.target.value)
                    }
                    size="small"
                    fullWidth
                    placeholder="Value"
                    sx={textFieldStyles}
                  />
                ) : (
                  <Typography sx={{ fontSize: "0.75rem" }}>
                    {typeof row.value === "object" && row.value !== null
                      ? JSON.stringify(row.value, null, 2)
                      : String(row.value ?? "")}
                  </Typography>
                )}
              </TableCell>
              {editable && (
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(index)}
                    sx={{
                      color: "rgba(239, 68, 68, 0.8)",
                      "&:hover": {
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                      },
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {editable && (
        <Box
          sx={(theme) => ({
            padding: "12px 16px",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(248, 250, 252, 0.03)"
                : "rgba(248, 250, 252, 0.5)",
          })}
        >
          <IconButton
            size="small"
            onClick={handleAdd}
            sx={(theme) => ({
              color: theme.palette.primary.main,
              fontSize: "0.813rem",
              gap: 0.5,
              "&:hover": {
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(95, 136, 199, 0.12)"
                    : "rgba(95, 136, 199, 0.1)",
              },
            })}
          >
            <Add fontSize="small" />
            <Typography
              sx={{
                fontSize: "0.813rem",
                fontWeight: 500,
              }}
            >
              Add Property
            </Typography>
          </IconButton>
        </Box>
      )}
    </TableContainer>
  );
};

export default MetadataTable;
