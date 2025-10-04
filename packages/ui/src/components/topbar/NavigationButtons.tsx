import React from "react";
import { Typography } from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";

export interface NavigationButtonsProps {
  prev: () => void;
  next: () => void;
  exit: () => void;
  canPrev: boolean;
  canNext: boolean;
}

export default function NavigationButtons({
  prev,
  next,
  exit,
  canPrev,
  canNext,
}: NavigationButtonsProps) {
  return (
    <>
      <button
        onClick={prev}
        disabled={!canPrev}
        style={{
          background: "transparent",
          border: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          cursor: canPrev ? "pointer" : "default",
          padding: 4,
        }}
      >
        <ArrowBackIcon fontSize="small" />
        <Typography variant="caption">Back</Typography>
      </button>
      <button
        onClick={next}
        disabled={!canNext}
        style={{
          background: "transparent",
          border: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          cursor: canNext ? "pointer" : "default",
          padding: 4,
        }}
      >
        <Typography variant="caption">Next</Typography>
        <ArrowForwardIcon fontSize="small" />
      </button>
      <button
        onClick={exit}
        style={{
          background: "transparent",
          border: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: 4,
          cursor: "pointer",
        }}
      >
        <VisibilityOffIcon fontSize="small" />
        <Typography variant="caption">Exit</Typography>
      </button>
    </>
  );
}
