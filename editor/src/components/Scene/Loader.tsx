"use client";

import React from "react";
import { Html, useProgress } from "@react-three/drei";
import { styled } from "@mui/material/styles";

const LoaderText = styled("div")(({ theme }) => ({
  color: "white",
}));

const Loader = () => {
  const { progress } = useProgress();
  return (
    <Html center>
      <LoaderText>Loading... {Math.round(progress)}%</LoaderText>
    </Html>
  );
};

export default Loader;
