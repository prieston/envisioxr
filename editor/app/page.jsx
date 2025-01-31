// app/page.jsx
"use client";

import React from "react";
import SceneCanvas from "@/components/SceneCanvas";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminPage = () => {
  return (
    <div style={{ flexGrow: 1, position: "relative",  }}>
      <SceneCanvas />
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default AdminPage;
