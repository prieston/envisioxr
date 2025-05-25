import React from "react";
import { Typography } from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import { NavigationButton, MinimalButton } from "./StyledComponents";

interface NavigationButtonsProps {
  prevObservation: () => void;
  nextObservation: () => void;
  onExitPreview: () => void;
  hasPrevObservation: boolean;
  hasNextObservation: boolean;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  prevObservation,
  nextObservation,
  onExitPreview,
  hasPrevObservation,
  hasNextObservation,
}) => {
  return (
    <>
      <NavigationButton
        startIcon={<ArrowBackIcon />}
        onClick={prevObservation}
        disabled={!hasPrevObservation}
      >
        <Typography variant="caption">Back</Typography>
      </NavigationButton>
      <NavigationButton
        endIcon={<ArrowForwardIcon />}
        onClick={nextObservation}
        disabled={!hasNextObservation}
      >
        <Typography variant="caption">Next</Typography>
      </NavigationButton>
      <MinimalButton onClick={onExitPreview}>
        <VisibilityOffIcon />
        <Typography variant="caption">Exit</Typography>
      </MinimalButton>
    </>
  );
};

export default NavigationButtons;
