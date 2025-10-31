"use client";

import React from "react";
import { signIn } from "next-auth/react";
import { Button, Container, Paper, Typography, Box } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import LogoHeader from "@/app/components/AppBar/LogoHeader";

export default function SignInPage() {
  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={3}
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 4,
        }}
      >
        <Box mb={3}>
          <LogoHeader />
        </Box>
        <Typography component="h1" variant="h5">
          Sign In
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, mb: 3 }}>
          to continue to Klorad Editor
        </Typography>
        <Button
          type="button"
          fullWidth
          variant="contained"
          startIcon={<GoogleIcon />}
          onClick={() => signIn("google", { callbackUrl: "/" })}
          sx={{
            backgroundColor: "#4285F4",
            color: "white",
            "&:hover": {
              backgroundColor: "#357ae8",
            },
          }}
        >
          Sign in with Google
        </Button>
      </Paper>
    </Container>
  );
}

