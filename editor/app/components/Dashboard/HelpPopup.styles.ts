import { styled } from "@mui/material/styles";
import { Dialog, Box } from "@mui/material";

export const StyledDialog = styled(Dialog)(() => ({
  "& .MuiDialog-paper": {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(24px) saturate(180%)",
    WebkitBackdropFilter: "blur(24px) saturate(180%)",
    border: "1px solid rgba(37, 99, 235, 0.15)",
    borderRadius: "24px",
    boxShadow: `
      0 20px 25px -5px rgba(37, 99, 235, 0.1),
      0 10px 10px -5px rgba(37, 99, 235, 0.04),
      0 0 0 1px rgba(255, 255, 255, 0.05)
    `,
    maxWidth: "800px",
    width: "95vw",
    maxHeight: "85vh",
    overflow: "hidden",
  },
}));

export const DialogHeader = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  gap: "16px",
  padding: "32px 32px 24px 32px",
  borderBottom: "1px solid rgba(37, 99, 235, 0.08)",
}));

export const TabPanel = styled(Box)(() => ({
  padding: "24px 0",
  minHeight: "400px",
}));

export const FeatureCard = styled(Box)(() => ({
  backgroundColor: "transparent",
  border: "1px solid rgba(37, 99, 235, 0.1)",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "12px",
  transition: "all 0.2s ease",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "rgba(37, 99, 235, 0.02)",
    borderColor: "rgba(37, 99, 235, 0.2)",
  },
}));

export const TutorialCard = styled(Box)(() => ({
  backgroundColor: "transparent",
  border: "1px solid rgba(37, 99, 235, 0.1)",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "12px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "rgba(37, 99, 235, 0.02)",
    borderColor: "rgba(37, 99, 235, 0.2)",
  },
}));

export const FAQItem = styled(Box)(() => ({
  borderBottom: "1px solid rgba(37, 99, 235, 0.08)",
  padding: "16px 0",
  transition: "all 0.2s ease",
  cursor: "pointer",
  "&:last-child": {
    borderBottom: "none",
  },
  "&:hover": {
    backgroundColor: "rgba(37, 99, 235, 0.02)",
  },
}));


