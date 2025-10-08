import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Tabs, Tab, IconButton, Chip, Dialog, } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import QuestionAnswerOutlinedIcon from "@mui/icons-material/QuestionAnswerOutlined";
import VideoLibraryOutlinedIcon from "@mui/icons-material/VideoLibraryOutlined";
export default function HelpPopup({ open, onClose }) {
    const [tabValue, setTabValue] = React.useState(0);
    const handleTabChange = (_event, newValue) => {
        setTabValue(newValue);
    };
    const features = [
        {
            title: "3D Scene Building",
            description: "Create immersive 3D environments with drag-and-drop simplicity",
            icon: _jsx(BuildOutlinedIcon, {}),
        },
        {
            title: "Model Import",
            description: "Upload and integrate 3D models from various formats",
            icon: _jsx(BuildOutlinedIcon, {}),
        },
        {
            title: "Real-time Preview",
            description: "See your changes instantly with live 3D preview",
            icon: _jsx(BuildOutlinedIcon, {}),
        },
        {
            title: "Publishing",
            description: "Share your creations with the world",
            icon: _jsx(BuildOutlinedIcon, {}),
        },
    ];
    const tutorials = [
        {
            title: "Getting Started with EnvisioXR",
            duration: "5:30",
            description: "Learn the basics of creating your first 3D scene",
            url: "#",
        },
        {
            title: "Importing 3D Models",
            duration: "8:15",
            description: "Step-by-step guide to adding 3D models to your project",
            url: "#",
        },
        {
            title: "Advanced Scene Building",
            duration: "12:45",
            description: "Master advanced techniques for complex scenes",
            url: "#",
        },
        {
            title: "Publishing Your Project",
            duration: "6:20",
            description: "How to share and publish your 3D creations",
            url: "#",
        },
    ];
    const faqs = [
        {
            question: "What file formats are supported for 3D models?",
            answer: "We support GLTF, GLB, OBJ, FBX, and STL formats. GLTF/GLB are recommended for best performance.",
        },
        {
            question: "How do I share my project with others?",
            answer: "Use the publish feature to generate a shareable link. You can also export your project for offline viewing.",
        },
        {
            question: "Can I collaborate with others on a project?",
            answer: "Currently, projects are single-user. Team collaboration features are coming soon!",
        },
        {
            question: "What are the system requirements?",
            answer: "EnvisioXR works in modern browsers with WebGL support. Chrome, Firefox, and Safari are recommended.",
        },
        {
            question: "How do I optimize my 3D models?",
            answer: "Keep polygon counts reasonable, use compressed textures, and optimize your models before importing for best performance.",
        },
    ];
    return (_jsxs(Dialog, { open: open, onClose: onClose, maxWidth: "md", fullWidth: true, children: [_jsxs(Box, { sx: {
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: "32px 32px 24px 32px",
                    borderBottom: "1px solid rgba(37, 99, 235, 0.08)",
                }, children: [_jsx(Box, { sx: {
                            width: 40,
                            height: 40,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            border: "1px solid rgba(37, 99, 235, 0.2)",
                            borderRadius: 1,
                            backgroundColor: "rgba(37, 99, 235, 0.02)",
                        }, children: _jsx(HelpOutlineIcon, { sx: { color: "var(--glass-text-secondary, #646464)", fontSize: 24 } }) }), _jsxs(Box, { sx: { flex: 1 }, children: [_jsx(DialogTitle, { sx: {
                                    color: "var(--glass-text-primary, #2563eb)",
                                    fontWeight: 600,
                                    fontSize: "1.5rem",
                                    p: 0,
                                }, children: "Help Center" }), _jsx(Typography, { variant: "body2", sx: { color: "var(--glass-text-secondary, #646464)", mt: 0.5 }, children: "Everything you need to know about EnvisioXR" })] }), _jsx(IconButton, { onClick: onClose, sx: { color: "var(--glass-text-secondary, #646464)" }, children: _jsx(CloseIcon, {}) })] }), _jsxs(DialogContent, { sx: { px: 4, pb: 4 }, children: [_jsx(Box, { sx: {
                            borderBottom: 1,
                            borderColor: "rgba(37, 99, 235, 0.08)",
                            mb: 3,
                        }, children: _jsxs(Tabs, { value: tabValue, onChange: handleTabChange, "aria-label": "help tabs", children: [_jsx(Tab, { icon: _jsx(BuildOutlinedIcon, {}), iconPosition: "start", label: "Features", id: "help-tab-0", "aria-controls": "help-tabpanel-0" }), _jsx(Tab, { icon: _jsx(VideoLibraryOutlinedIcon, {}), iconPosition: "start", label: "Tutorials", id: "help-tab-1", "aria-controls": "help-tabpanel-1" }), _jsx(Tab, { icon: _jsx(QuestionAnswerOutlinedIcon, {}), iconPosition: "start", label: "FAQ", id: "help-tab-2", "aria-controls": "help-tabpanel-2" })] }) }), tabValue === 0 && (_jsxs(Box, { sx: { py: 3, minHeight: 400 }, children: [_jsx(Typography, { variant: "h6", sx: { color: "var(--glass-text-primary, #2563eb)", mb: 2 }, children: "What you can do with EnvisioXR" }), features.map((feature, index) => (_jsx(Box, { sx: {
                                    border: "1px solid rgba(37, 99, 235, 0.1)",
                                    borderRadius: 1,
                                    p: 2.5,
                                    mb: 1.5,
                                    cursor: "pointer",
                                    "&:hover": {
                                        backgroundColor: "rgba(37, 99, 235, 0.02)",
                                        borderColor: "rgba(37, 99, 235, 0.2)",
                                    },
                                }, children: _jsxs(Box, { sx: { display: "flex", alignItems: "flex-start", gap: 2 }, children: [_jsx(Box, { sx: {
                                                color: "var(--glass-text-primary, #2563eb)",
                                                mt: 0.5,
                                            }, children: feature.icon }), _jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle1", sx: {
                                                        color: "var(--glass-text-primary, #2563eb)",
                                                        fontWeight: 600,
                                                        mb: 0.5,
                                                    }, children: feature.title }), _jsx(Typography, { variant: "body2", sx: { color: "var(--glass-text-secondary, #646464)" }, children: feature.description })] })] }) }, index)))] })), tabValue === 1 && (_jsxs(Box, { sx: { py: 3, minHeight: 400 }, children: [_jsx(Typography, { variant: "h6", sx: { color: "var(--glass-text-primary, #2563eb)", mb: 2 }, children: "Video Tutorials" }), tutorials.map((tutorial, index) => (_jsx(Box, { sx: {
                                    border: "1px solid rgba(37, 99, 235, 0.1)",
                                    borderRadius: 1,
                                    p: 2.5,
                                    mb: 1.5,
                                    cursor: "pointer",
                                    "&:hover": {
                                        backgroundColor: "rgba(37, 99, 235, 0.02)",
                                        borderColor: "rgba(37, 99, 235, 0.2)",
                                    },
                                }, children: _jsxs(Box, { sx: { display: "flex", alignItems: "flex-start", gap: 2 }, children: [_jsx(Box, { sx: {
                                                color: "var(--glass-text-primary, #2563eb)",
                                                mt: 0.5,
                                            }, children: _jsx(PlayCircleOutlineIcon, {}) }), _jsxs(Box, { sx: { flex: 1 }, children: [_jsxs(Box, { sx: {
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 1,
                                                        mb: 0.5,
                                                    }, children: [_jsx(Typography, { variant: "subtitle1", sx: {
                                                                color: "var(--glass-text-primary, #2563eb)",
                                                                fontWeight: 600,
                                                            }, children: tutorial.title }), _jsx(Chip, { label: tutorial.duration, size: "small", sx: {
                                                                backgroundColor: "rgba(37, 99, 235, 0.1)",
                                                                color: "var(--glass-text-primary, #2563eb)",
                                                                fontSize: "0.75rem",
                                                            } })] }), _jsx(Typography, { variant: "body2", sx: { color: "var(--glass-text-secondary, #646464)" }, children: tutorial.description })] })] }) }, index)))] })), tabValue === 2 && (_jsxs(Box, { sx: { py: 3, minHeight: 400 }, children: [_jsx(Typography, { variant: "h6", sx: { color: "var(--glass-text-primary, #2563eb)", mb: 2 }, children: "Frequently Asked Questions" }), faqs.map((faq, index) => (_jsxs(Box, { sx: {
                                    borderBottom: "1px solid rgba(37, 99, 235, 0.08)",
                                    py: 2,
                                }, children: [_jsx(Typography, { variant: "subtitle1", sx: {
                                            color: "var(--glass-text-primary, #2563eb)",
                                            fontWeight: 600,
                                            mb: 1,
                                        }, children: faq.question }), _jsx(Typography, { variant: "body2", sx: {
                                            color: "var(--glass-text-secondary, #646464)",
                                            lineHeight: 1.6,
                                        }, children: faq.answer })] }, index)))] }))] }), _jsx(DialogActions, { sx: {
                    p: "24px 32px 32px 32px",
                    borderTop: "1px solid rgba(37, 99, 235, 0.08)",
                }, children: _jsx(Button, { onClick: onClose, variant: "outlined", sx: {
                        borderColor: "rgba(37, 99, 235, 0.2)",
                        color: "var(--glass-text-primary, #2563eb)",
                        fontWeight: 500,
                        p: "12px 24px",
                        borderRadius: "12px",
                        textTransform: "none",
                        fontSize: "0.95rem",
                    }, children: "Close" }) })] }));
}
//# sourceMappingURL=HelpPopup.js.map