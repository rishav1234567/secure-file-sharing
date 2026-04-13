"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Avatar,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LogoutIcon from "@mui/icons-material/Logout";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface NavbarProps {
  userEmail?: string;
}

export default function Navbar({ userEmail }: NavbarProps) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: "rgba(17, 18, 53, 0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(108,99,255,0.15)",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ gap: 2 }}>
          {/* Logo */}
          <Box
            component={Link}
            href={userEmail ? "/dashboard" : "/"}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              textDecoration: "none",
              flexGrow: 1,
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LockIcon sx={{ color: "#fff", fontSize: 20 }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                background: "linear-gradient(135deg, #6C63FF, #9C94FF)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              SecureShare
            </Typography>
          </Box>

          {userEmail ? (
            <>
              <Button
                component={Link}
                href="/dashboard"
                startIcon={<DashboardIcon />}
                variant="text"
                sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}
              >
                Dashboard
              </Button>
              <Button
                component={Link}
                href="/upload"
                startIcon={<CloudUploadIcon />}
                variant="contained"
                size="small"
              >
                Upload
              </Button>
              <Tooltip title={userEmail}>
                <IconButton
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  sx={{ ml: 1 }}
                >
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: "primary.main",
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    {userEmail[0].toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                slotProps={{
                  paper: {
                    sx: { mt: 1, minWidth: 180, border: "1px solid rgba(108,99,255,0.2)" },
                  }
                }}
              >
                <MenuItem disabled sx={{ fontSize: 12, color: "text.secondary" }}>
                  {userEmail}
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ color: "error.main", gap: 1 }}>
                  <LogoutIcon fontSize="small" />
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button component={Link} href="/login" variant="text">
                Login
              </Button>
              <Button component={Link} href="/signup" variant="contained">
                Sign Up
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
