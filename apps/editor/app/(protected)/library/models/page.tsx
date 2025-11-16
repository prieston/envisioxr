"use client";

import React from "react";
import { Button, Typography } from "@mui/material";
import {
  Page,
  PageHeader,
  PageDescription,
  PageActions,
  PageContent,
  PageCard,
} from "@envisio/ui";
import {
  AnimatedBackground,
  GlowingContainer,
  GlowingSpan,
} from "@/app/components/Builder/AdminLayout.styles";

const LibraryModelsPage = () => {
  return (
    <>
      {/* Animated background */}
      <AnimatedBackground>
        <GlowingContainer>
          <GlowingSpan index={1} />
          <GlowingSpan index={2} />
          <GlowingSpan index={3} />
        </GlowingContainer>
        <GlowingContainer>
          <GlowingSpan index={1} />
          <GlowingSpan index={2} />
          <GlowingSpan index={3} />
        </GlowingContainer>
        <GlowingContainer>
          <GlowingSpan index={1} />
          <GlowingSpan index={2} />
          <GlowingSpan index={3} />
        </GlowingContainer>
        <GlowingContainer>
          <GlowingSpan index={1} />
          <GlowingSpan index={2} />
          <GlowingSpan index={3} />
        </GlowingContainer>
      </AnimatedBackground>

      <Page>
        <PageHeader title="Models" />
        <PageDescription>Manage your 3D models (GLB/GLTF/FBX/OBJ/3DM)</PageDescription>

        <PageActions>
          <Button variant="contained">+ Upload Model</Button>
        </PageActions>

        <PageContent>
          <PageCard>
            <Typography variant="body1" color="text.secondary">
              Models management coming soon...
            </Typography>
          </PageCard>
        </PageContent>
      </Page>
    </>
  );
};

export default LibraryModelsPage;

