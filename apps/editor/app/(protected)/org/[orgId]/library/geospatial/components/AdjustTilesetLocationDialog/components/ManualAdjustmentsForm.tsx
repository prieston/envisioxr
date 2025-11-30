import { Box, Button, Grid, TextField, Typography } from "@mui/material";

interface ManualAdjustmentsFormProps {
  longitude: string;
  latitude: string;
  height: string;
  heading: string;
  pitch: string;
  roll: string;
  onLongitudeChange: (value: string) => void;
  onLatitudeChange: (value: string) => void;
  onHeightChange: (value: string) => void;
  onHeadingChange: (value: string) => void;
  onPitchChange: (value: string) => void;
  onRollChange: (value: string) => void;
  onApply: () => void;
  disabled: boolean;
}

export function ManualAdjustmentsForm({
  longitude,
  latitude,
  height,
  heading,
  pitch,
  roll,
  onLongitudeChange,
  onLatitudeChange,
  onHeightChange,
  onHeadingChange,
  onPitchChange,
  onRollChange,
  onApply,
  disabled,
}: ManualAdjustmentsFormProps) {
  return (
    <Box
      sx={{
        p: 2,
        backgroundColor: "rgba(255, 255, 255, 0.03)",
        borderRadius: "4px",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      <Typography
        sx={{
          fontSize: "0.813rem",
          fontWeight: 600,
          mb: 1.5,
        }}
      >
        Manual Adjustments
      </Typography>

      {/* Position Controls */}
      <Typography
        sx={{
          fontSize: "0.75rem",
          fontWeight: 500,
          mb: 1,
          color: "text.secondary",
        }}
      >
        Position
      </Typography>
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Longitude"
            type="number"
            value={longitude}
            onChange={(e) => onLongitudeChange(e.target.value)}
            size="small"
            inputProps={{ step: "0.000001" }}
            disabled={disabled}
            sx={{
              "& .MuiInputBase-input": {
                fontSize: "0.813rem",
              },
              "& .MuiInputLabel-root": {
                fontSize: "0.75rem",
              },
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Latitude"
            type="number"
            value={latitude}
            onChange={(e) => onLatitudeChange(e.target.value)}
            size="small"
            inputProps={{ step: "0.000001" }}
            disabled={disabled}
            sx={{
              "& .MuiInputBase-input": {
                fontSize: "0.813rem",
              },
              "& .MuiInputLabel-root": {
                fontSize: "0.75rem",
              },
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Height (m)"
            type="number"
            value={height}
            onChange={(e) => onHeightChange(e.target.value)}
            size="small"
            inputProps={{ step: "0.01" }}
            disabled={disabled}
            sx={{
              "& .MuiInputBase-input": {
                fontSize: "0.813rem",
              },
              "& .MuiInputLabel-root": {
                fontSize: "0.75rem",
              },
            }}
          />
        </Grid>
      </Grid>

      {/* Rotation Controls */}
      <Typography
        sx={{
          fontSize: "0.75rem",
          fontWeight: 500,
          mb: 1,
          color: "text.secondary",
        }}
      >
        Rotation (degrees)
      </Typography>
      <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Heading"
            type="number"
            value={heading}
            onChange={(e) => onHeadingChange(e.target.value)}
            size="small"
            inputProps={{ step: "1" }}
            disabled={disabled}
            sx={{
              "& .MuiInputBase-input": {
                fontSize: "0.813rem",
              },
              "& .MuiInputLabel-root": {
                fontSize: "0.75rem",
              },
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Pitch"
            type="number"
            value={pitch}
            onChange={(e) => onPitchChange(e.target.value)}
            size="small"
            inputProps={{ step: "1" }}
            disabled={disabled}
            sx={{
              "& .MuiInputBase-input": {
                fontSize: "0.813rem",
              },
              "& .MuiInputLabel-root": {
                fontSize: "0.75rem",
              },
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Roll"
            type="number"
            value={roll}
            onChange={(e) => onRollChange(e.target.value)}
            size="small"
            inputProps={{ step: "1" }}
            disabled={disabled}
            sx={{
              "& .MuiInputBase-input": {
                fontSize: "0.813rem",
              },
              "& .MuiInputLabel-root": {
                fontSize: "0.75rem",
              },
            }}
          />
        </Grid>
      </Grid>

      <Button
        variant="outlined"
        size="small"
        fullWidth
        onClick={onApply}
        sx={{
          textTransform: "none",
          fontSize: "0.75rem",
          fontWeight: 500,
        }}
      >
        Apply Changes
      </Button>
    </Box>
  );
}

