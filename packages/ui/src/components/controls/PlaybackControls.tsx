import React from "react";
import { Tooltip } from "@mui/material";
import { ControlSection, StyledIconButton } from "./PlaybackControls.styles";
import {
  PlayArrow,
  Stop,
  NavigateBefore,
  NavigateNext,
} from "@mui/icons-material";

export interface PlaybackControlsProps {
  isPlaying?: boolean;
  togglePlayback?: () => void;
  next?: () => void;
  prev?: () => void;
  canNext?: boolean;
  canPrev?: boolean;
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  togglePlayback,
  next,
  prev,
  canNext,
  canPrev,
}) => {
  return (
    <ControlSection>
      <Tooltip title="Previous">
        <span>
          <StyledIconButton onClick={prev} disabled={!canPrev}>
            <NavigateBefore />
          </StyledIconButton>
        </span>
      </Tooltip>
      <Tooltip title={isPlaying ? "Stop" : "Play"}>
        <StyledIconButton onClick={togglePlayback}>
          {isPlaying ? <Stop /> : <PlayArrow />}
        </StyledIconButton>
      </Tooltip>
      <Tooltip title="Next">
        <span>
          <StyledIconButton onClick={next} disabled={!canNext}>
            <NavigateNext />
          </StyledIconButton>
        </span>
      </Tooltip>
    </ControlSection>
  );
};

export default PlaybackControls;
