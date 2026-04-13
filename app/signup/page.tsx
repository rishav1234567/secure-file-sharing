"use client";

import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Divider,
  CircularProgress,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!agreed) {
      setError("Please accept the terms to continue");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const strength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3;
  const strengthColors = ["", "#FF5C6A", "#FFB84D", "#00D4AA"];
  const strengthLabels = ["", "Weak", "Fair", "Strong"];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at 80% 50%, rgba(0,212,170,0.1) 0%, transparent 60%), radial-gradient(ellipse at 20% 20%, rgba(108,99,255,0.1) 0%, transparent 50%), #0A0B1E",
        p: 2,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 440 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 3,
              background: "linear-gradient(135deg, #00D4AA, #6C63FF)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
              boxShadow: "0 8px 32px rgba(0,212,170,0.35)",
            }}
          >
            <PersonAddIcon sx={{ color: "#fff", fontSize: 32 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }} gutterBottom>
            Create account
          </Typography>
          <Typography color="text.secondary">
            Start sharing files securely in seconds
          </Typography>
        </Box>

        <Card>
          <CardContent sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <TextField
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                autoComplete="email"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }
                }}
              />

              <Box>
                <TextField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  fullWidth
                  autoComplete="new-password"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" size="small">
                            {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }
                  }}
                />
                {/* Password strength bar */}
                {password.length > 0 && (
                  <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
                    {[1, 2, 3].map((level) => (
                      <Box
                        key={level}
                        sx={{
                          flex: 1,
                          height: 4,
                          borderRadius: 2,
                          bgcolor: strength >= level ? strengthColors[strength] : "rgba(255,255,255,0.1)",
                          transition: "background-color 0.3s",
                        }}
                      />
                    ))}
                    <Typography variant="caption" sx={{ color: strengthColors[strength], ml: 1, minWidth: 40 }}>
                      {strengthLabels[strength]}
                    </Typography>
                  </Box>
                )}
              </Box>

              <TextField
                label="Confirm password"
                type={showPassword ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                fullWidth
                error={confirm.length > 0 && confirm !== password}
                helperText={confirm.length > 0 && confirm !== password ? "Passwords do not match" : ""}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }
                }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    sx={{ color: "primary.main" }}
                  />
                }
                label={
                  <Typography variant="body2" color="text.secondary">
                    I understand that files are stored for 24 hours and links expire
                  </Typography>
                }
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                fullWidth
                sx={{ py: 1.5 }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : "Create Account"}
              </Button>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" color="text.secondary">OR</Typography>
            </Divider>

            <Typography align="center" color="text.secondary">
              Already have an account?{" "}
              <Typography
                component={Link}
                href="/login"
                color="primary"
                sx={{ fontWeight: 600, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
              >
                Sign in
              </Typography>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
