import { Alert, Typography } from "@mui/material";

export function GeoreferencingInfoAlert() {
  return (
    <Alert severity="info" sx={{ mb: 2 }}>
      <Typography variant="body2">
        This model is already geolocated, you can change its position from
        cesium ion.
      </Typography>
    </Alert>
  );
}

