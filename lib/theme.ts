"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#6C63FF",
      light: "#9C94FF",
      dark: "#4A42D6",
    },
    secondary: {
      main: "#00D4AA",
      light: "#33DEBB",
      dark: "#009977",
    },
    background: {
      default: "#0A0B1E",
      paper: "#111235",
    },
    error: { main: "#FF5C6A" },
    warning: { main: "#FFB84D" },
    success: { main: "#00D4AA" },
    text: {
      primary: "#E8E8F0",
      secondary: "#9494B2",
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
    h1: { fontWeight: 800, letterSpacing: "-0.02em" },
    h2: { fontWeight: 700, letterSpacing: "-0.01em" },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "10px 24px",
          boxShadow: "none",
          "&:hover": { boxShadow: "0 4px 20px rgba(108,99,255,0.35)" },
        },
        // @ts-ignore
        containedPrimary: {
          background: "linear-gradient(135deg, #6C63FF 0%, #9C94FF 100%)",
          "&:hover": {
            background: "linear-gradient(135deg, #5A52EE 0%, #8A82EE 100%)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "#111235",
          border: "1px solid rgba(108,99,255,0.15)",
          boxShadow: "0 4px 30px rgba(0,0,0,0.4)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
            "& fieldset": { borderColor: "rgba(108,99,255,0.3)" },
            "&:hover fieldset": { borderColor: "rgba(108,99,255,0.6)" },
            "&.Mui-focused fieldset": { borderColor: "#6C63FF" },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600 },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-head": {
            backgroundColor: "rgba(108,99,255,0.12)",
            fontWeight: 700,
            color: "#9C94FF",
          },
        },
      },
    },
  },
});

export default theme;
