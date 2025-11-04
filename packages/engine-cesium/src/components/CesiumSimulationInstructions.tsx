import React, { useMemo } from "react";
// MUI imports not needed here; styled elements come from the styles file
import {
  Container,
  Title,
  InstructionText,
  KeyHighlight,
} from "./CesiumSimulationInstructions.styles";

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

  // Memoize instructions list to prevent unnecessary re-renders
  const memoizedInstructions = useMemo(() => {
    return instructions.map((instruction, index) => (
      <InstructionText key={index}>
        {instruction.split(":").map((part, partIndex) => {
          if (partIndex === 0) {
            return <KeyHighlight key={partIndex}>{part}</KeyHighlight>;
          }
          return `: ${part}`;
        })}
      </InstructionText>
    ));
  }, [instructions]);

  return (
    <Container>
      <Title>{title}</Title>
      {memoizedInstructions}
    </Container>
  );
};

export default CesiumSimulationInstructions;
