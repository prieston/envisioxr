import { Box, Button, Typography } from "@mui/material";

interface ClickPositionButtonProps {
  clickModeEnabled: boolean;
  disabled: boolean;
  onToggle: () => void;
}

export function ClickPositionButton({
  clickModeEnabled,
  disabled,
  onToggle,
}: ClickPositionButtonProps) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Button
        variant={clickModeEnabled ? "contained" : "outlined"}
        disabled={disabled}
        onClick={onToggle}
        sx={{
          textTransform: "none",
          fontSize: "0.813rem",
          fontWeight: 500,
        }}
      >
        {clickModeEnabled ? "Cancel Click" : "Click Position"}
      </Button>
      {clickModeEnabled && (
        <Typography
          sx={{
            fontSize: "0.75rem",
            color: "primary.main",
            fontStyle: "italic",
          }}
        >
          Click on the map to set position
        </Typography>
      )}
    </Box>
  );
}

