"use client";

import React from "react";
import { Html, useProgress } from "@react-three/drei";
import CircularProgress from "@mui/material/CircularProgress";
import { styled } from "@mui/material/styles";

const LoaderContainer = styled("div")(({ theme }) => ({
  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.8)),
    url('https://prieston-prod.fra1.cdn.digitaloceanspaces.com/general/prieston__A_modern_office_space_with_a_person_interacting_with__89c4984e-8e1a-4b78-bfd8-7f15fcda497b.png')`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  width: "100vw",
  height: "100vh",
  position: "absolute",
  top: "-120px",
  transform: "translate(-50%, -50%)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
}));

const LoaderText = styled("div")(({ theme }) => ({
  color: "white",
  marginTop: theme.spacing(2),
  fontSize: "1.2rem",
}));

const Loader = () => {
  const { progress } = useProgress();
  const displayText =
    progress == 0 ? "Loading..." : `Loading... ${Math.round(progress)}%`;

  return (
    <Html>
      <LoaderContainer>
        <CircularProgress color="inherit" />
        <LoaderText>{displayText}</LoaderText>
      </LoaderContainer>
    </Html>
  );
};

export default Loader;
