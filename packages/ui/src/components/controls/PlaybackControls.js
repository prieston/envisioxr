import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Tooltip } from "@mui/material";
import { ControlSection, StyledIconButton } from "./PlaybackControls.styles";
import { PlayArrow, Stop, NavigateBefore, NavigateNext, } from "@mui/icons-material";
const PlaybackControls = ({ isPlaying, togglePlayback, next, prev, canNext, canPrev, }) => {
    return (_jsxs(ControlSection, { children: [_jsx(Tooltip, { title: "Previous", children: _jsx("span", { children: _jsx(StyledIconButton, { onClick: prev, disabled: !canPrev, children: _jsx(NavigateBefore, {}) }) }) }), _jsx(Tooltip, { title: isPlaying ? "Stop" : "Play", children: _jsx(StyledIconButton, { onClick: togglePlayback, children: isPlaying ? _jsx(Stop, {}) : _jsx(PlayArrow, {}) }) }), _jsx(Tooltip, { title: "Next", children: _jsx("span", { children: _jsx(StyledIconButton, { onClick: next, disabled: !canNext, children: _jsx(NavigateNext, {}) }) }) })] }));
};
export default PlaybackControls;
//# sourceMappingURL=PlaybackControls.js.map