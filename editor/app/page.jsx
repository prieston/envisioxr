// src/pages/index.js


import React from 'react';
import AdminAppBar from './components/AppBar';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import BottomPanel from './components/BottomPanel';
import SceneCanvas from './components/SceneCanvas';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminPage = () => {
  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      <AdminAppBar />
      <div style={{ display: 'flex', flexGrow: 1 }}>
        <LeftPanel />
        <div style={{ flexGrow: 1, position: 'relative' }}>
          <SceneCanvas />
        </div>
        <RightPanel />
      </div>
      <BottomPanel />
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default AdminPage;
