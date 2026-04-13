"use client";

import {
  Box,
  Container,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import StorageIcon from "@mui/icons-material/Storage";
import DownloadIcon from "@mui/icons-material/Download";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface FileItem {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  expiresAt: string;
  downloadCount: number;
  oneTimeOnly: boolean;
  createdAt: string;
  isExpired: boolean;
}

interface DashboardClientProps {
  files: FileItem[];
  userEmail: string;
  baseUrl: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getExpiryChip(expiresAt: string, isExpired: boolean) {
  if (isExpired) {
    return <Chip label="Expired" color="error" size="small" />;
  }
  const diff = new Date(expiresAt).getTime() - Date.now();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const label = hours > 0 ? `${hours}h ${mins}m left` : `${mins}m left`;
  const color = hours < 1 ? "warning" : "success";
  return <Chip label={label} color={color} size="small" variant="outlined" />;
}

export default function DashboardClient({ files, userEmail, baseUrl }: DashboardClientProps) {
  const router = useRouter();
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);
  const activeFiles = files.filter((f) => !f.isExpired);

  const copyLink = async (fileId: string) => {
    const link = `${baseUrl}/file/${fileId}`;
    await navigator.clipboard.writeText(link);
    setSnackbar({ open: true, message: "Share link copied!", severity: "success" });
  };

  const deleteFile = async (fileId: string) => {
    setDeletingId(fileId);
    try {
      const res = await fetch(`/api/file/${fileId}`, { method: "DELETE" });
      if (res.ok) {
        setSnackbar({ open: true, message: "File deleted", severity: "success" });
        router.refresh();
      } else {
        const d = await res.json();
        setSnackbar({ open: true, message: d.error || "Delete failed", severity: "error" });
      }
    } catch {
      setSnackbar({ open: true, message: "Network error", severity: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Navbar userEmail={userEmail} />
      <Box
        sx={{
          minHeight: "100vh",
          background: "radial-gradient(ellipse at 10% 0%, rgba(108,99,255,0.08) 0%, transparent 50%), #0A0B1E",
          pt: 4,
          pb: 8,
        }}
      >
        <Container maxWidth="xl">
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 4,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h4" fontWeight={800}>
                My Files
              </Typography>
              <Typography color="text.secondary" mt={0.5}>
                Manage your uploaded files and share links
              </Typography>
            </Box>
            <Button
              component={Link}
              href="/upload"
              variant="contained"
              startIcon={<CloudUploadIcon />}
              size="large"
            >
              Upload File
            </Button>
          </Box>

          {/* Stats */}
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 2, mb: 4 }}>
            {[
              { label: "Total Files", value: files.length, icon: <InsertDriveFileIcon />, color: "#6C63FF" },
              { label: "Active Links", value: activeFiles.length, icon: <DownloadIcon />, color: "#00D4AA" },
              { label: "Storage Used", value: formatBytes(totalSize), icon: <StorageIcon />, color: "#FFB84D" },
              { label: "Total Downloads", value: files.reduce((a, f) => a + f.downloadCount, 0), icon: <DownloadIcon />, color: "#FF5C6A" },
            ].map((stat) => (
              <Paper
                key={stat.label}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: "1px solid rgba(108,99,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: `${stat.color}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: stat.color,
                  }}
                >
                  {stat.icon}
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>

          {/* Files Table */}
          {files.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 10,
                border: "2px dashed rgba(108,99,255,0.2)",
                borderRadius: 4,
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 64, color: "primary.main", mb: 2, opacity: 0.5 }} />
              <Typography variant="h5" fontWeight={700} gutterBottom>
                No files yet
              </Typography>
              <Typography color="text.secondary" mb={3}>
                Upload your first file to generate a secure shareable link
              </Typography>
              <Button component={Link} href="/upload" variant="contained" size="large">
                Upload Your First File
              </Button>
            </Box>
          ) : (
            <TableContainer
              component={Paper}
              sx={{ borderRadius: 3, border: "1px solid rgba(108,99,255,0.15)" }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>File Name</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Uploaded</TableCell>
                    <TableCell>Expires</TableCell>
                    <TableCell align="center">Downloads</TableCell>
                    <TableCell align="center">Type</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {files.map((file) => (
                    <TableRow
                      key={file.id}
                      sx={{
                        opacity: file.isExpired ? 0.5 : 1,
                        "&:hover": { bgcolor: "rgba(108,99,255,0.04)" },
                        transition: "background-color 0.2s",
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <InsertDriveFileIcon sx={{ color: "primary.main", opacity: 0.7 }} />
                          <Box>
                            <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 220 }}>
                              {file.originalName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {file.mimeType}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatBytes(file.size)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(file.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {getExpiryChip(file.expiresAt, file.isExpired)}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={file.downloadCount}
                          size="small"
                          sx={{ bgcolor: "rgba(0,212,170,0.1)", color: "secondary.main" }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {file.oneTimeOnly && (
                          <Chip label="1x" size="small" color="warning" variant="outlined" />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                          {!file.isExpired && (
                            <Tooltip title="Copy share link">
                              <IconButton
                                size="small"
                                onClick={() => copyLink(file.id)}
                                sx={{ color: "primary.main" }}
                              >
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Delete file">
                            <IconButton
                              size="small"
                              onClick={() => deleteFile(file.id)}
                              disabled={deletingId === file.id}
                              sx={{ color: "error.main" }}
                            >
                              {deletingId === file.id ? (
                                <CircularProgress size={16} />
                              ) : (
                                <DeleteIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Container>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
