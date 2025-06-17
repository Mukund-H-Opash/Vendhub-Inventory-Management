// src/theme.js
"use client";
import { Roboto } from "next/font/google";
import { createTheme } from "@mui/material/styles";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2", // A professional blue
      light: "#42a5f5",
      dark: "#1565c0",
    },
    secondary: {
      main: "#9c27b0", // A complementary purple
    },
    background: {
      default: "#f4f6f8", // A light grey background
      paper: "#ffffff",
    },
    text: {
      primary: "#1c2025",
      secondary: "#5A6978",
    },
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Softer button edges
          textTransform: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12, // Softer card edges
          transition:
            "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 4px 20px 0 rgba(0,0,0,0.12)",
          },
        },
      },
    },
  },
});

export default theme;