"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import { Delete, Add } from "@mui/icons-material";

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
    setLocalData(data);
  }, [data]);

  if (localData.length === 0 && !editable) {
    return (
      <Box
        sx={{
          padding: 3,
          textAlign: "center",
          color: "rgba(100, 116, 139, 0.6)",
        }}
      >
        <Typography variant="body2">No metadata available</Typography>
      </Box>
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{
        boxShadow: "none",
        backgroundColor: "transparent",
        border: "1px solid rgba(226, 232, 240, 0.8)",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: "rgba(248, 250, 252, 0.8)",
            }}
          >
            <TableCell
              sx={{
                fontWeight: 600,
                fontSize: "0.75rem",
                color: "rgba(51, 65, 85, 0.95)",
                borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
                padding: "12px 16px",
              }}
            >
              Property
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 600,
                fontSize: "0.75rem",
                color: "rgba(51, 65, 85, 0.95)",
                borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
                padding: "12px 16px",
              }}
            >
              Value
            </TableCell>
            {editable && (
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  color: "rgba(51, 65, 85, 0.95)",
                  borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
                  padding: "12px 16px",
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
                "&:last-child td": { borderBottom: 0 },
                "&:hover": {
                  backgroundColor: "rgba(248, 250, 252, 0.5)",
                },
              }}
            >
              <TableCell
                sx={{
                  fontSize: "0.813rem",
                  color: "rgba(100, 116, 139, 0.9)",
                  borderBottom: "1px solid rgba(226, 232, 240, 0.5)",
                  padding: "10px 16px",
                }}
              >
                {editable ? (
                  <TextField
                    value={row.label}
                    onChange={(e) =>
                      handleChange(index, "label", e.target.value)
                    }
                    size="small"
                    fullWidth
                    placeholder="Property name"
                    sx={{
                      "& .MuiInputBase-input": {
                        fontSize: "0.813rem",
                        padding: "6px 8px",
                      },
                    }}
                  />
                ) : (
                  row.label
                )}
              </TableCell>
              <TableCell
                sx={{
                  fontSize: "0.813rem",
                  color: "rgba(51, 65, 85, 0.95)",
                  fontWeight: 500,
                  borderBottom: "1px solid rgba(226, 232, 240, 0.5)",
                  padding: "10px 16px",
                }}
              >
                {editable ? (
                  <TextField
                    value={row.value}
                    onChange={(e) =>
                      handleChange(index, "value", e.target.value)
                    }
                    size="small"
                    fullWidth
                    placeholder="Value"
                    sx={{
                      "& .MuiInputBase-input": {
                        fontSize: "0.813rem",
                        padding: "6px 8px",
                      },
                    }}
                  />
                ) : (
                  row.value
                )}
              </TableCell>
              {editable && (
                <TableCell
                  sx={{
                    borderBottom: "1px solid rgba(226, 232, 240, 0.5)",
                    padding: "10px 16px",
                  }}
                >
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
          sx={{
            padding: "12px 16px",
            borderTop: "1px solid rgba(226, 232, 240, 0.8)",
            backgroundColor: "rgba(248, 250, 252, 0.5)",
          }}
        >
          <IconButton
            size="small"
            onClick={handleAdd}
            sx={{
              color: "#2563eb",
              fontSize: "0.813rem",
              gap: 0.5,
              "&:hover": {
                backgroundColor: "rgba(37, 99, 235, 0.1)",
              },
            }}
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
