
"use client";
// src/components/BottomPanel.js
import React from 'react';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import  useSceneStore  from '../hooks/useSceneStore';

const BottomPanel = () => {
  const observationPoints = useSceneStore(state => state.observationPoints);

  return (
    <Box sx={{ position: 'absolute', bottom: 0, width: '100%', padding: 2, backgroundColor: '#f0f0f0' }}>
      <Typography variant="h6">Observation Points</Typography>
      {observationPoints.map((point, index) => (
        <Card key={index} sx={{ marginBottom: 1 }}>
          <CardContent>
            <Typography variant="subtitle1">{point.name}</Typography>
            <Button size="small" onClick={() => showToast('Navigation not yet implemented.')}>Go to</Button>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default BottomPanel;