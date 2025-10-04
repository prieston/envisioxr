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
    borderRadius: 0,
    marginBottom: theme.spacing(0.5),
    marginLeft: `-${theme.spacing(2)}`,
    marginRight: `-${theme.spacing(2)}`,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
    backgroundColor: selected ? "rgba(37, 99, 235, 0.12)" : "transparent",
    color: selected ? "#2563eb" : "inherit",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
    border: "none",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    "&::before": {
      content: '""',
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor: "transparent",
      transition: "background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      zIndex: -1,
    },
    "&:hover": {
      "&::before": {
        backgroundColor: selected
          ? "rgba(37, 99, 235, 0.16)"
          : "rgba(37, 99, 235, 0.08)",
      },
      color: selected ? "#2563eb" : "#2563eb",
      transform: "translateX(4px)",
    },
    "&:active": { transform: "translateX(2px)" },
  }));

export const StyledListItemText: React.FC<any> = styled(ListItemText)(
  ({ theme }) => ({
    "& .MuiListItemText-primary": { fontSize: "0.9rem", fontWeight: 500 },
    "& .MuiListItemText-secondary": {
      fontSize: "0.8rem",
      color: theme.palette.text.secondary,
    },
  })
);

export const StyledIconButton: React.FC<IconButtonProps> = styled(IconButton)(
  ({ theme }) => ({
    color: theme.palette.text.secondary,
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      color: theme.palette.text.primary,
    },
  })
);
