"use client";

import { Box, Container, Typography, Button, Grid, Card, CardContent } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import TimerIcon from "@mui/icons-material/Timer";
import FilterCenterFocusIcon from "@mui/icons-material/FilterCenterFocus";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "radial-gradient(circle at 50% -20%, rgba(108,99,255,0.15) 0%, transparent 60%), #0A0B1E",
        }}
      >
        {/* Hero Section */}
        <Box sx={{ pt: { xs: 12, md: 20 }, pb: 10, textAlign: "center", flexGrow: 1 }}>
          <Container maxWidth="md">
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "3rem", md: "4.5rem" },
                fontWeight: 800,
                lineHeight: 1.1,
                mb: 3,
                background: "linear-gradient(135deg, #fff 0%, #a5a5b4 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Share files securely, <br />
              <Typography
                component="span"
                sx={{
                  fontSize: "inherit",
                  fontWeight: "inherit",
                  background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                without compromising privacy.
              </Typography>
            </Typography>

            <Typography
              variant="h6"
              sx={{
                color: "text.secondary",
                fontWeight: 400,
                maxWidth: 600,
                mx: "auto",
                mb: 6,
                lineHeight: 1.6,
              }}
            >
              Upload files up to 50MB and share them with expiring links.
              Protected against replay attacks using cryptographic nonces.
            </Typography>

            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                component={Link}
                href="/signup"
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{ py: 1.5, px: 4, fontSize: "1.1rem" }}
              >
                Get Started Free
              </Button>
              <Button
                component={Link}
                href="/login"
                variant="outlined"
                size="large"
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: "1.1rem",
                  borderColor: "rgba(255,255,255,0.2)",
                  color: "white",
                  "&:hover": { borderColor: "primary.main" },
                }}
              >
                Sign In
              </Button>
            </Box>
          </Container>
        </Box>

        {/* Features Section */}
        <Container maxWidth="lg" sx={{ pb: 12 }}>
          <Grid container spacing={4}>
            {[
              {
                icon: <TimerIcon sx={{ fontSize: 40, color: "secondary.main" }} />,
                title: "24-Hour Expiry",
                desc: "All files and share links automatically self-destruct after 24 hours, leaving no trace behind.",
                color: "rgba(0,212,170,0.15)",
              },
              {
                icon: <LockIcon sx={{ fontSize: 40, color: "primary.main" }} />,
                title: "Nonce Protection",
                desc: "Every download requires a unique, single-use cryptographic token, preventing replay attacks and link abuse.",
                color: "rgba(108,99,255,0.15)",
              },
              {
                icon: <FilterCenterFocusIcon sx={{ fontSize: 40, color: "warning.main" }} />,
                title: "One-Time Downloads",
                desc: "Send highly sensitive files that can only be downloaded exactly once before the link becomes permanently invalid.",
                color: "rgba(255,184,77,0.15)",
              },
            ].map((feature, i) => (
              <Grid size={{ xs: 12, md: 4 }} key={i}>
                <Card sx={{ height: "100%", background: "rgba(255,255,255,0.02)" }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 3,
                        background: feature.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 3,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                      {feature.title}
                    </Typography>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {feature.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Footer */}
        <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.05)", py: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} SecureShare. Built with Next.js App Router.
          </Typography>
        </Box>
      </Box>
    </>
  );
}
