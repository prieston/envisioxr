import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";

const GlassCard = styled(Card)(({ theme }) => ({
  width: 300,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
  background: "rgba(30, 41, 59, 0.7)",
  backdropFilter: "blur(10px)",
  border: "2px dashed rgba(99, 102, 241, 0.3)",
  boxShadow:
    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow:
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    border: "2px dashed rgba(99, 102, 241, 0.5)",
    backgroundColor: "rgba(99, 102, 241, 0.05)",
  },
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(1),
}));

const AddIconWrapper = styled(Box)(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(99, 102, 241, 0.1)",
  color: theme.palette.primary.main,
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    backgroundColor: "rgba(99, 102, 241, 0.2)",
    transform: "scale(1.1)",
  },
}));

const CreateProjectCard = ({ onClick }) => {
  return (
    <GlassCard onClick={onClick}>
      <StyledCardContent>
        <AddIconWrapper>
          <AddIcon sx={{ fontSize: 32 }} />
        </AddIconWrapper>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Create Project
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            textAlign: "center",
          }}
        >
          Start building your new XR experience
        </Typography>
      </StyledCardContent>
    </GlassCard>
  );
};

export default CreateProjectCard;
