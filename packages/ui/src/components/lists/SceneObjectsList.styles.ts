import { styled } from "@mui/material/styles";
import { List, ListItem, ListItemText, IconButton } from "@mui/material";
import type { ListProps } from "@mui/material/List";
import type { ListItemProps } from "@mui/material/ListItem";
import type { IconButtonProps } from "@mui/material/IconButton";

export const StyledList: React.FC<ListProps> = styled(List)(
  ({ theme: _theme }) => ({ padding: 0 })
);

export const ObjectListItem: React.FC<ListItemProps & { selected: boolean }> =
  styled(ListItem)<{ selected: boolean }>(({ theme, selected }) => ({
    cursor: "pointer",
    borderRadius: "8px",
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1.5, 2),
    backgroundColor: selected
      ? "rgba(37, 99, 235, 0.12)"
      : "rgba(248, 250, 252, 0.6)",
    color: selected ? "#2563eb" : "rgba(51, 65, 85, 0.95)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
    border: "1px solid",
    borderColor: selected
      ? "rgba(37, 99, 235, 0.2)"
      : "rgba(226, 232, 240, 0.8)",
    transition:
      "background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease",
    "&:hover": {
      backgroundColor: selected
        ? "rgba(37, 99, 235, 0.16)"
        : "rgba(248, 250, 252, 0.9)",
      borderColor: "rgba(37, 99, 235, 0.2)",
      color: "#2563eb",
    },
  }));

export const StyledListItemText: React.FC<any> = styled(ListItemText)(
  ({ theme }) => ({
    "& .MuiListItemText-primary": {
      fontSize: "0.875rem",
      fontWeight: 600,
      letterSpacing: "0.01em",
    },
    "& .MuiListItemText-secondary": {
      fontSize: "0.75rem",
      color: "rgba(100, 116, 139, 0.85)",
      marginTop: "4px",
    },
  })
);

export const StyledIconButton: React.FC<IconButtonProps> = styled(IconButton)(
  ({ theme }) => ({
    color: "rgba(100, 116, 139, 0.85)",
    borderRadius: "8px",
    transition: "color 0.15s ease, background-color 0.15s ease",
    "&:hover": {
      backgroundColor: "rgba(37, 99, 235, 0.08)",
      color: "#2563eb",
    },
  })
);
