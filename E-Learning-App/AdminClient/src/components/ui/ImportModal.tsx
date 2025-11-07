import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import * as XLSX from "xlsx"; // để đọc Excel

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onImportSuccess: (message: string) => void;
  onImportError: (message: string) => void;
}

import { importVocabularies } from "../../services/vocabularyApi";

interface VocabPreview {
  word: string;
  definition: string;
  partOfSpeech: string;
  pronunciation?: string;
  exampleSentence?: string;
}

export function ImportModal({
  open,
  onClose,
  onImportSuccess,
  onImportError,
}: ImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<VocabPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setIsProcessingFile(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) return;
      const workbook = XLSX.read(data, { type: "binary" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
      // Map dữ liệu về VocabPreview
      const mappedData: VocabPreview[] = jsonData.map((row) => ({
        word: row.word || "",
        definition: row.definition || "",
        partOfSpeech: row.partOfSpeech || "",
        pronunciation: row.pronunciation || "",
        exampleSentence: row.exampleSentence || "",
        // image: row.image || "",
      }));
      setPreviewData(mappedData);
      setIsProcessingFile(false);
    };
    reader.readAsBinaryString(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await importVocabularies(formData);
      onImportSuccess(response.data.message || "Import thành công!");
      setPreviewData([]);
      setSelectedFile(null);
    } catch (error: any) {
      console.error("Lỗi khi import:", error);
      onImportError(
        error.response?.data?.message ||
          "Import thất bại. Vui lòng kiểm tra file."
      );
    } finally {
      setIsUploading(false);
      onClose();
    }
  };

  const handleCloseModal = () => {
    setSelectedFile(null);
    setPreviewData([]);
    setIsProcessingFile(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCloseModal} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Import Từ vựng từ Excel
        <IconButton onClick={handleCloseModal}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 2 }}>
          Lưu ý: File Excel phải có các cột chính xác:{" "}
          <strong>
            word, definition, partOfSpeech, pronunciation, exampleSentence
          </strong>
          .
        </Alert>

        {/* Box chọn file */}
        <Box
          sx={{
            p: 3,
            border: "2px dashed",
            borderColor: "divider",
            borderRadius: 2,
            textAlign: "center",
            cursor: "pointer",
            bgcolor: "action.hover",
            mb: 3,
          }}
          component="label"
        >
          <UploadFileIcon sx={{ fontSize: 48, color: "primary.main" }} />
          <Typography>
            {selectedFile
              ? `Đã chọn file: ${selectedFile.name}`
              : "Kéo thả hoặc nhấn để chọn file (.xlsx, .xls)"}
          </Typography>
          <input
            type="file"
            hidden
            accept=".xlsx, .xls, .csv"
            onChange={handleFileChange}
          />
        </Box>

        {/* Preview dữ liệu */}
        {isProcessingFile && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {previewData.length > 0 && (
          <Paper sx={{ maxHeight: 300, overflowY: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Word</TableCell>
                  <TableCell>Definition</TableCell>
                  <TableCell>Part of Speech</TableCell>
                  <TableCell>Pronunciation</TableCell>
                  <TableCell>Example</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {previewData.map((vocab, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{vocab.word}</TableCell>
                    <TableCell>{vocab.definition}</TableCell>
                    <TableCell>{vocab.partOfSpeech}</TableCell>
                    <TableCell>{vocab.pronunciation}</TableCell>
                    <TableCell>{vocab.exampleSentence}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleCloseModal} disabled={isUploading}>
          Hủy
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={!selectedFile || isUploading || previewData.length === 0}
        >
          {isUploading ? <CircularProgress size={24} /> : "Import"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
