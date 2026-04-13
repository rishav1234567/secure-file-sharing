"use client";

import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Divider,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import ShieldIcon from "@mui/icons-material/Shield";
import Navbar from "@/components/Navbar";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UploadClientProps {
  userEmail: string;
}

interface UploadResult {
  fileId: string;
  shareLink: string;
  expiresAt: string;
  oneTimeOnly: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadClient({ userEmail }: UploadClientProps) {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [oneTimeOnly, setOneTimeOnly] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
      setError("");
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setProgress(0);
    setError("");

    // Simulate progress (real upload tracked via XHR below)
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 10, 90));
    }, 200);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("oneTimeOnly", oneTimeOnly.toString());

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);
      setProgress(100);

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }

      setResult(data);
    } catch {
      clearInterval(interval);
      setError("Network error. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const copyLink = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Navbar userEmail={userEmail} />
      <Box
        sx={{
          minHeight: "100vh",
          background: "radial-gradient(ellipse at 60% 0%, rgba(0,212,170,0.08) 0%, transparent 50%), #0A0B1E",
          pt: 4,
          pb: 8,
        }}
      >
        <Container maxWidth="sm">
          <Box sx={{ textAlign: "center", mb: 5 }}>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Upload a File
            </Typography>
            <Typography color="text.secondary">
              Files expire in 24 hours. Links are nonce-protected against replay attacks.
            </Typography>
          </Box>

          {!result ? (
            <Card>
              <CardContent sx={{ p: 4 }}>
                {/* Drop Zone */}
                <Box
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !selectedFile && document.getElementById("fileInput")?.click()}
                  sx={{
                    border: `2px dashed`,
                    borderColor: isDragging ? "primary.main" : selectedFile ? "secondary.main" : "rgba(108,99,255,0.3)",
                    borderRadius: 3,
                    p: 5,
                    textAlign: "center",
                    cursor: selectedFile ? "default" : "pointer",
                    transition: "all 0.3s ease",
                    bgcolor: isDragging ? "rgba(108,99,255,0.06)" : "transparent",
                    "&:hover": !selectedFile
                      ? { borderColor: "primary.main", bgcolor: "rgba(108,99,255,0.04)" }
                      : {},
                  }}
                >
                  {selectedFile ? (
                    <Box>
                      <InsertDriveFileIcon sx={{ fontSize: 56, color: "secondary.main", mb: 1 }} />
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        {selectedFile.name}
                      </Typography>
                      <Chip label={formatBytes(selectedFile.size)} size="small" color="secondary" />
                      <Chip label={selectedFile.type || "unknown"} size="small" sx={{ ml: 1 }} />
                    </Box>
                  ) : (
                    <Box>
                      <CloudUploadIcon sx={{ fontSize: 64, color: "primary.main", mb: 2, opacity: 0.6 }} />
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        Drop your file here
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        or click to browse — up to 50MB
                      </Typography>
                    </Box>
                  )}
                </Box>

                <input
                  id="fileInput"
                  type="file"
                  hidden
                  onChange={handleFileSelect}
                />

                {selectedFile && (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<CloseIcon />}
                      onClick={() => { setSelectedFile(null); setError(""); }}
                    >
                      Remove file
                    </Button>
                  </Box>
                )}

                <Divider sx={{ my: 3 }} />

                {/* Options */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      One-time download
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Link cannot be used more than once
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={oneTimeOnly}
                        onChange={(e) => setOneTimeOnly(e.target.checked)}
                        color="secondary"
                      />
                    }
                    label=""
                  />
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                {uploading && (
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{ borderRadius: 2, height: 6 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                      Uploading... {progress}%
                    </Typography>
                  </Box>
                )}

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  startIcon={<CloudUploadIcon />}
                  sx={{ py: 1.5 }}
                >
                  {uploading ? "Uploading..." : "Upload & Generate Link"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* Success State */
            <Card>
              <CardContent sx={{ p: 4, textAlign: "center" }}>
                <CheckCircleIcon sx={{ fontSize: 72, color: "secondary.main", mb: 2 }} />
                <Typography variant="h5" fontWeight={800} gutterBottom>
                  File Uploaded Successfully!
                </Typography>
                <Typography color="text.secondary" mb={3}>
                  Your secure share link is ready. It expires in 24 hours.
                </Typography>

                {/* Share link */}
                <Box
                  sx={{
                    bgcolor: "rgba(108,99,255,0.08)",
                    border: "1px solid rgba(108,99,255,0.2)",
                    borderRadius: 2,
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 3,
                    textAlign: "left",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      flex: 1,
                      wordBreak: "break-all",
                      color: "primary.light",
                      fontFamily: "monospace",
                      fontSize: 13,
                    }}
                  >
                    {result.shareLink}
                  </Typography>
                  <Tooltip title={copied ? "Copied!" : "Copy link"}>
                    <IconButton onClick={copyLink} size="small" color={copied ? "secondary" : "primary"}>
                      {copied ? <CheckCircleIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Tags */}
                <Box sx={{ display: "flex", gap: 1, justifyContent: "center", mb: 3, flexWrap: "wrap" }}>
                  <Chip icon={<ShieldIcon />} label="Nonce-protected" color="primary" size="small" />
                  {result.oneTimeOnly && <Chip label="One-time only" color="warning" size="small" />}
                  <Chip label={`Expires: ${new Date(result.expiresAt).toLocaleString()}`} size="small" variant="outlined" />
                </Box>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => { setResult(null); setSelectedFile(null); setProgress(0); }}
                  >
                    Upload Another
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    component={Link}
                    href="/dashboard"
                  >
                    Go to Dashboard
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Container>
      </Box>
    </>
  );
}
