import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Typography } from "@mui/material";
import { ArrowBack as ArrowBackIcon, ArrowForward as ArrowForwardIcon, VisibilityOff as VisibilityOffIcon, } from "@mui/icons-material";
export default function NavigationButtons({ prev, next, exit, canPrev, canNext, }) {
    return (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: prev, disabled: !canPrev, style: {
                    background: "transparent",
                    border: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    cursor: canPrev ? "pointer" : "default",
                    padding: 4,
                }, children: [_jsx(ArrowBackIcon, { fontSize: "small" }), _jsx(Typography, { variant: "caption", children: "Back" })] }), _jsxs("button", { onClick: next, disabled: !canNext, style: {
                    background: "transparent",
                    border: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    cursor: canNext ? "pointer" : "default",
                    padding: 4,
                }, children: [_jsx(Typography, { variant: "caption", children: "Next" }), _jsx(ArrowForwardIcon, { fontSize: "small" })] }), _jsxs("button", { onClick: exit, style: {
                    background: "transparent",
                    border: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: 4,
                    cursor: "pointer",
                }, children: [_jsx(VisibilityOffIcon, { fontSize: "small" }), _jsx(Typography, { variant: "caption", children: "Exit" })] })] }));
}
//# sourceMappingURL=NavigationButtons.js.map