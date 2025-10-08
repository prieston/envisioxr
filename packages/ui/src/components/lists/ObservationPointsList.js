import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ListItemText, Typography } from "@mui/material";
import { ObservationSection, ObservationListItem, AddButton, } from "./ObservationPointsList.styles";
import { Add } from "@mui/icons-material";
const ObservationPointsList = ({ observationPoints, selectedObservation, addObservationPoint, selectObservation, previewMode, previewIndex, setPreviewIndex, setPreviewMode, }) => {
    console.log("[ObservationPointsList] Props received:", {
        observationPoints,
        selectedObservation,
        count: observationPoints === null || observationPoints === void 0 ? void 0 : observationPoints.length,
    });
    const handleClick = (point, index) => {
        selectObservation === null || selectObservation === void 0 ? void 0 : selectObservation(point.id);
        setPreviewIndex === null || setPreviewIndex === void 0 ? void 0 : setPreviewIndex(index);
        if (point.position && point.target) {
            setPreviewMode === null || setPreviewMode === void 0 ? void 0 : setPreviewMode(true);
            setTimeout(() => setPreviewMode === null || setPreviewMode === void 0 ? void 0 : setPreviewMode(false), 1500);
        }
    };
    return (_jsxs(ObservationSection, { previewMode: previewMode || false, children: [_jsxs(AddButton, { onClick: addObservationPoint, title: "Add Observation Point", children: [_jsx(Add, { sx: { fontSize: "1.2rem" } }), _jsx(Typography, { sx: {
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            marginLeft: 0.5,
                        }, children: "Add Point" })] }), observationPoints === null || observationPoints === void 0 ? void 0 : observationPoints.map((point, index) => (_jsx(ObservationListItem, { selected: (previewMode && index === previewIndex) ||
                    (!previewMode && (selectedObservation === null || selectedObservation === void 0 ? void 0 : selectedObservation.id) === point.id), onClick: () => handleClick(point, index), children: _jsx(ListItemText, { primary: point.title || `Point ${index + 1}`, primaryTypographyProps: {
                        noWrap: true,
                        sx: { color: "inherit" }, // Inherit color from parent
                    } }) }, point.id)))] }));
};
export default ObservationPointsList;
//# sourceMappingURL=ObservationPointsList.js.map