import { styled, alpha } from "@mui/material/styles";
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
    borderRadius: 0,
    marginBottom: 0,
    padding: theme.spacing(1.5, 2),
    backgroundColor: selected
      ? alpha(theme.palette.primary.main, 0.18)
      : theme.palette.mode === "dark"
        ? theme.palette.background.paper
        : "rgba(248, 250, 252, 0.6)",
    color: selected
      ? theme.palette.primary.main
      : theme.palette.mode === "dark"
        ? theme.palette.text.primary
        : "rgba(51, 65, 85, 0.95)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
    borderBottom: "1px solid",
    borderColor:
      theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(255, 255, 255, 0.08)",
    transition: "background-color 0.15s ease, color 0.15s ease",
    "&:hover": {
      backgroundColor: selected
        ? alpha(theme.palette.primary.main, 0.24)
        : theme.palette.mode === "dark"
          ? alpha(theme.palette.primary.main, 0.1)
          : "rgba(248, 250, 252, 0.9)",
      color: theme.palette.primary.main,
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
      color:
        theme.palette.mode === "dark"
          ? alpha(theme.palette.text.secondary, 0.9)
          : "rgba(100, 116, 139, 0.85)",
      marginTop: "4px",
    },
  })
);

export const StyledIconButton: React.FC<IconButtonProps> = styled(IconButton)(
  ({ theme }) => ({
    color:
      theme.palette.mode === "dark"
        ? theme.palette.text.secondary
        : "rgba(100, 116, 139, 0.85)",
    borderRadius: 4,
    transition: "color 0.15s ease, background-color 0.15s ease",
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.12),
      color: theme.palette.primary.main,
    },
  })
);
