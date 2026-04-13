"use client";

import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  LinearProgress,
  Divider,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import LockIcon from "@mui/icons-material/Lock";
import TimerIcon from "@mui/icons-material/Timer";
import ShieldIcon from "@mui/icons-material/Shield";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";

interface FileData {
  fileId: string;
  originalName: string;
  mimeType: string;
  size: number;
  expiresAt: string;
  downloadCount: number;
  oneTimeOnly: boolean;
  downloadUrl: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function useCountdown(expiresAt: string) {
  const [remaining, setRemaining] = useState(() => {
    return Math.max(0, new Date(expiresAt).getTime() - Date.now());
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.max(0, new Date(expiresAt).getTime() - Date.now());
      setRemaining(diff);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
  const total = new Date(expiresAt).getTime() - (Date.now() - remaining + 24 * 60 * 60 * 1000 - remaining);
  const progress = (remaining / (24 * 60 * 60 * 1000)) * 100;

  return { hours, minutes, seconds, progress, isExpired: remaining === 0 };
}

interface FileAccessClientProps {
  fileId: string;
}

export default function FileAccessClient({ fileId }: FileAccessClientProps) {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const fetchMetadata = useCallback(async () => {
    try {
      const res = await fetch(`/api/file/${fileId}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load file");
        return;
      }
      setFileData(data);
    } catch {
      setError("Failed to load file information");
    } finally {
      setLoading(false);
    }
  }, [fileId]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  const handleDownload = async () => {
    if (!fileData) return;
    setDownloading(true);
    setDownloadError("");

    try {
      // downloadUrl already contains a fresh nonce from the metadata fetch
      const res = await fetch(fileData.downloadUrl);

      if (!res.ok) {
        const data = await res.json();
        setDownloadError(data.error || "Download failed");
        // Refresh metadata to get a new nonce for the next attempt
        await fetchMetadata();
        return;
      }

      // Trigger browser file download
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileData.originalName;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Refresh to get updated download count and new nonce
      await fetchMetadata();
    } catch {
      setDownloadError("Network error. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(ellipse at 50% 0%, rgba(108,99,255,0.12) 0%, transparent 60%), #0A0B1E",
          p: 2,
          pt: 8,
        }}
      >
        <Container maxWidth="sm">
          {loading ? (
            <Box sx={{ textAlign: "center" }}>
              <CircularProgress size={56} />
              <Typography sx={{ mt: 2 }} color="text.secondary">Loading file information...</Typography>
            </Box>
          ) : error ? (
            <Card>
              <CardContent sx={{ p: 5, textAlign: "center" }}>
                <ErrorOutlineIcon sx={{ fontSize: 72, color: "error.main", mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }} gutterBottom>
                  Access Denied
                </Typography>
                <Alert severity="error" sx={{ borderRadius: 2, mt: 2 }}>
                  {error}
                </Alert>
              </CardContent>
            </Card>
          ) : fileData ? (
            <FileCard
              fileData={fileData}
              downloading={downloading}
              downloadError={downloadError}
              onDownload={handleDownload}
            />
          ) : null}
        </Container>
      </Box>
    </>
  );
}

function FileCard({
  fileData,
  downloading,
  downloadError,
  onDownload,
}: {
  fileData: FileData;
  downloading: boolean;
  downloadError: string;
  onDownload: () => void;
}) {
  const { hours, minutes, seconds, progress, isExpired } = useCountdown(fileData.expiresAt);

  if (isExpired) {
    return (
      <Card>
        <CardContent sx={{ p: 5, textAlign: "center" }}>
          <TimerIcon sx={{ fontSize: 72, color: "warning.main", mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }} gutterBottom>Link Expired</Typography>
          <Typography color="text.secondary">
            This file link has expired and is no longer accessible.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent sx={{ p: 4 }}>
        {/* File icon + name */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: 3,
              background: "linear-gradient(135deg, rgba(108,99,255,0.2), rgba(0,212,170,0.2))",
              border: "1px solid rgba(108,99,255,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <InsertDriveFileIcon sx={{ fontSize: 40, color: "primary.main" }} />
          </Box>

          <Typography variant="h5" gutterBottom sx={{ fontWeight: 800, wordBreak: "break-word" }}>
            {fileData.originalName}
          </Typography>

          <Box sx={{ display: "flex", gap: 1, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip label={formatBytes(fileData.size)} size="small" variant="outlined" />
            <Chip label={fileData.mimeType} size="small" variant="outlined" />
            <Chip
              icon={<ShieldIcon />}
              label="Nonce-protected"
              size="small"
              color="primary"
            />
            {fileData.oneTimeOnly && (
              <Chip label="One-time link" size="small" color="warning" />
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Countdown timer */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <TimerIcon sx={{ fontSize: 16, color: progress < 20 ? "warning.main" : "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                Link expires in
              </Typography>
            </Box>
            <Typography
              variant="body2"
              color={progress < 20 ? "warning.main" : "text.primary"}
              sx={{ fontWeight: 700, fontFamily: "monospace" }}
            >
              {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              borderRadius: 2,
              height: 6,
              bgcolor: "rgba(255,255,255,0.08)",
              "& .MuiLinearProgress-bar": {
                bgcolor: progress < 20 ? "warning.main" : progress < 50 ? "primary.main" : "secondary.main",
              },
            }}
          />
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Downloads</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{fileData.downloadCount}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <LockIcon sx={{ fontSize: 14, color: "secondary.main" }} />
            <Typography variant="caption" color="secondary.main" sx={{ fontWeight: 600 }}>
              Secured with nonce validation
            </Typography>
          </Box>
        </Box>

        {downloadError && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {downloadError}
          </Alert>
        )}

        <Button
          variant="contained"
          fullWidth
          size="large"
          startIcon={downloading ? <CircularProgress size={18} color="inherit" /> : <DownloadIcon />}
          onClick={onDownload}
          disabled={downloading || (fileData.oneTimeOnly && fileData.downloadCount >= 1)}
          sx={{ py: 1.8 }}
        >
          {downloading
            ? "Downloading..."
            : fileData.oneTimeOnly && fileData.downloadCount >= 1
            ? "Already Downloaded"
            : "Download File"}
        </Button>

        <Typography variant="caption" color="text.secondary" align="center" sx={{ display: "block", mt: 2 }}>
          🛡️ Each download requires a unique nonce — links cannot be replayed
        </Typography>
      </CardContent>
    </Card>
  );
}
