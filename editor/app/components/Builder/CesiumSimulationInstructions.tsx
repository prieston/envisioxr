import React from "react";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

const Container = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: "rgba(0, 0, 0, 0.05)",
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
}));

const Title = styled(Typography)(({ theme }) => ({
  fontSize: "0.9rem",
  fontWeight: 600,
  marginBottom: theme.spacing(1),
  color: theme.palette.primary.main,
}));

const InstructionText = styled(Typography)(({ theme }) => ({
  fontSize: "0.8rem",
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(0.5),
}));

const KeyHighlight = styled("span")(({ theme }) => ({
  backgroundColor: theme.palette.grey[200],
  padding: "2px 6px",
  borderRadius: "4px",
  fontFamily: "monospace",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

interface CesiumSimulationInstructionsProps {
  viewMode?: string;
}

const CesiumSimulationInstructions: React.FC<
  CesiumSimulationInstructionsProps
> = ({ viewMode }) => {
  const getInstructions = () => {
    switch (viewMode) {
      case "firstPerson":
        return {
          title: "First Person Controls",
          instructions: [
            "Movement: WASD keys",
            "Look around: Arrow keys",
            "Jump: Space",
            "Crouch: Shift",
            "Speed: Walking pace",
          ],
        };
      case "car":
        return {
          title: "Car Mode Controls",
          instructions: [
            "Forward/Backward: W/S keys",
            "Turn left/right: A/D keys",
            "Look around: Arrow keys",
            "Speed: Driving pace",
            "Ground level only",
          ],
        };
      case "flight":
        return {
          title: "Flight Mode Controls",
          instructions: [
            "Forward/Backward: W/S keys",
            "Strafe left/right: A/D keys",
            "Climb/Descend: Space/Shift",
            "Pitch/Yaw: Arrow keys",
            "Speed: Flying pace",
          ],
        };
      default:
        return {
          title: "Simulation Controls",
          instructions: [
            "Select a simulation mode to see controls",
            "First Person: Walking simulation",
            "Car Mode: Ground vehicle simulation",
            "Flight Mode: Aerial navigation",
          ],
        };
    }
  };

  const { title, instructions } = getInstructions();

  return (
    <Container>
      <Title>{title}</Title>
      {instructions.map((instruction, index) => (
        <InstructionText key={index}>
          {instruction.split(":").map((part, partIndex) => {
            if (partIndex === 0) {
              return <KeyHighlight key={partIndex}>{part}</KeyHighlight>;
            }
            return `: ${part}`;
          })}
        </InstructionText>
      ))}
    </Container>
  );
};

export default CesiumSimulationInstructions;
