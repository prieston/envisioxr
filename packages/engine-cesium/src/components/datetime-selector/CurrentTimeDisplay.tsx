import React from "react";
import { Box, IconButton } from "@mui/material";
import { PlayArrow, Pause } from "@mui/icons-material";
import {
  CurrentTimeBox,
  CurrentTimeTitle,
  LiveBadge,
  CurrentTimeText,
  playButtonStyles,
} from "../CesiumDateTimeSelector.styles";

interface CurrentTimeDisplayProps {
  displayTime: string;
  isPlaying: boolean;
  locked: boolean;
  useLocalTime: boolean;
  disabled: boolean;
  onPlayPause: () => void;
}

export const CurrentTimeDisplay: React.FC<CurrentTimeDisplayProps> = ({
  displayTime,
  isPlaying,
  locked,
  useLocalTime,
  disabled,
  onPlayPause,
}) => {
  return (
    <CurrentTimeBox locked={locked}>
      <CurrentTimeTitle>
        Current Time {useLocalTime ? "(Local)" : "(UTC)"}
        {locked && <LiveBadge>• LIVE</LiveBadge>}
      </CurrentTimeTitle>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton
          onClick={onPlayPause}
          disabled={disabled || locked}
          size="small"
          sx={playButtonStyles(locked)}
        >
          {isPlaying ? <Pause fontSize="small" /> : <PlayArrow fontSize="small" />}
        </IconButton>
        <CurrentTimeText locked={locked} component="div">
          {displayTime || "Loading..."}
        </CurrentTimeText>
      </Box>
    </CurrentTimeBox>
  );
};

