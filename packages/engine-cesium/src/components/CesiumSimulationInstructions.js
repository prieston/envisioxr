import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// MUI imports not needed here; styled elements come from the styles file
import { Container, Title, InstructionText, KeyHighlight, } from "./CesiumSimulationInstructions.styles";
const CesiumSimulationInstructions = ({ viewMode }) => {
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
    return (_jsxs(Container, { children: [_jsx(Title, { children: title }), instructions.map((instruction, index) => (_jsx(InstructionText, { children: instruction.split(":").map((part, partIndex) => {
                    if (partIndex === 0) {
                        return _jsx(KeyHighlight, { children: part }, partIndex);
                    }
                    return `: ${part}`;
                }) }, index)))] }));
};
export default CesiumSimulationInstructions;
