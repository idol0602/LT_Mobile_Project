import React, { useState, useMemo } from "react";
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
  LinearProgress,
  Chip,
  Tabs,
  Tab,
  Tooltip,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import DownloadIcon from "@mui/icons-material/Download";
import * as XLSX from "xlsx";

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
  rowNumber?: number;
  status?: "pending" | "success" | "error" | "warning";
  errorMessage?: string;
}

interface ImportStats {
  total: number;
  success: number;
  error: number;
  warning: number;
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
  const [importProgress, setImportProgress] = useState(0);
  const [currentTab, setCurrentTab] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
      processFile(file);
    }
  };

  const validateRow = (row: VocabPreview, index: number): VocabPreview => {
    const errors: string[] = [];

    if (!row.word || row.word.trim() === "") {
      errors.push("Word is required");
    }
    if (!row.definition || row.definition.trim() === "") {
      errors.push("Definition is required");
    }
    if (!row.partOfSpeech || row.partOfSpeech.trim() === "") {
      errors.push("Part of Speech is required");
    }

    const validatedRow: VocabPreview = {
      ...row,
      rowNumber: index + 2, // +2 vì header row và index bắt đầu từ 0
      status: errors.length > 0 ? "error" : "pending",
      errorMessage: errors.join(", "),
    };

    return validatedRow;
  };

  const processFile = (file: File) => {
    setIsProcessingFile(true);
    setValidationErrors([]);
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) return;

      try {
        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

        // Map và validate dữ liệu
        const mappedData: VocabPreview[] = jsonData.map((row, index) => {
          const vocabRow: VocabPreview = {
            word: row.word || row.Word || "",
            definition: row.definition || row.Definition || "",
            partOfSpeech:
              row.partOfSpeech ||
              row["Part of Speech"] ||
              row.PartOfSpeech ||
              "",
            pronunciation: row.pronunciation || row.Pronunciation || "",
            exampleSentence:
              row.exampleSentence ||
              row["Example Sentence"] ||
              row.ExampleSentence ||
              "",
          };
          return validateRow(vocabRow, index);
        });

        setPreviewData(mappedData);

        // Hiển thị cảnh báo nếu có lỗi
        const errors = mappedData.filter((row) => row.status === "error");
        if (errors.length > 0) {
          setValidationErrors(
            errors.map((err) => `Row ${err.rowNumber}: ${err.errorMessage}`)
          );
        }
      } catch (error) {
        console.error("Error processing file:", error);
        onImportError("Không thể đọc file. Vui lòng kiểm tra định dạng file.");
      } finally {
        setIsProcessingFile(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || previewData.length === 0) return;

    // Lọc ra các dòng hợp lệ
    const validRows = previewData.filter((row) => row.status !== "error");

    if (validRows.length === 0) {
      onImportError("Không có dòng nào hợp lệ để import!");
      return;
    }

    setIsUploading(true);
    setImportProgress(0);

    const BATCH_SIZE = 50; // Import 50 từ một lần
    const batches = [];

    for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
      batches.push(validRows.slice(i, i + BATCH_SIZE));
    }

    let successCount = 0;
    let errorCount = 0;
    const updatedData = [...previewData];

    try {
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const formData = new FormData();

        // Tạo file Excel tạm cho batch này
        const batchData = batch.map((row) => ({
          word: row.word,
          definition: row.definition,
          partOfSpeech: row.partOfSpeech,
          pronunciation: row.pronunciation || "",
          exampleSentence: row.exampleSentence || "",
        }));

        const ws = XLSX.utils.json_to_sheet(batchData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Vocabularies");
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const batchFile = new Blob([wbout], {
          type: "application/octet-stream",
        });

        formData.append("file", batchFile, `batch_${i}.xlsx`);

        try {
          await importVocabularies(formData);

          // Đánh dấu thành công
          batch.forEach((row) => {
            const index = updatedData.findIndex(
              (d) => d.rowNumber === row.rowNumber
            );
            if (index !== -1) {
              updatedData[index].status = "success";
              successCount++;
            }
          });
        } catch (error: any) {
          // Đánh dấu lỗi
          batch.forEach((row) => {
            const index = updatedData.findIndex(
              (d) => d.rowNumber === row.rowNumber
            );
            if (index !== -1) {
              updatedData[index].status = "error";
              updatedData[index].errorMessage =
                error.response?.data?.message || "Import failed";
              errorCount++;
            }
          });
        }

        // Cập nhật progress
        setImportProgress(((i + 1) / batches.length) * 100);
        setPreviewData([...updatedData]);
      }

      // Hiển thị kết quả
      if (errorCount === 0) {
        onImportSuccess(`Import thành công ${successCount} từ vựng!`);
        setTimeout(() => {
          handleCloseModal();
        }, 2000);
      } else {
        onImportError(
          `Import hoàn tất: ${successCount} thành công, ${errorCount} thất bại`
        );
      }
    } catch (error: any) {
      console.error("Lỗi khi import:", error);
      onImportError("Import thất bại. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloseModal = () => {
    if (!isUploading) {
      setSelectedFile(null);
      setPreviewData([]);
      setIsProcessingFile(false);
      setImportProgress(0);
      setCurrentTab(0);
      setValidationErrors([]);
      onClose();
    }
  };

  const stats: ImportStats = useMemo(() => {
    return {
      total: previewData.length,
      success: previewData.filter((d) => d.status === "success").length,
      error: previewData.filter((d) => d.status === "error").length,
      warning: previewData.filter((d) => d.status === "warning").length,
    };
  }, [previewData]);

  const filteredData = useMemo(() => {
    if (currentTab === 0) return previewData;
    if (currentTab === 1)
      return previewData.filter((d) => d.status === "success");
    if (currentTab === 2)
      return previewData.filter((d) => d.status === "error");
    return previewData;
  }, [previewData, currentTab]);

  const downloadTemplate = () => {
    const template = [
      {
        word: "example",
        definition:
          "a thing characteristic of its kind or illustrating a general rule",
        partOfSpeech: "noun",
        pronunciation: "/ɪɡˈzɑːmpl/",
        exampleSentence: "This is an example sentence.",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "vocabulary_import_template.xlsx");
  };

  const downloadErrors = () => {
    const errorRows = previewData.filter((d) => d.status === "error");
    const ws = XLSX.utils.json_to_sheet(
      errorRows.map((row) => ({
        rowNumber: row.rowNumber,
        word: row.word,
        definition: row.definition,
        partOfSpeech: row.partOfSpeech,
        pronunciation: row.pronunciation,
        exampleSentence: row.exampleSentence,
        error: row.errorMessage,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Errors");
    XLSX.writeFile(wb, "import_errors.xlsx");
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "success":
        return <CheckCircleIcon color="success" fontSize="small" />;
      case "error":
        return <ErrorIcon color="error" fontSize="small" />;
      case "warning":
        return <WarningIcon color="warning" fontSize="small" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={handleCloseModal} maxWidth="lg" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h6">Import Từ vựng từ Excel</Typography>
          {stats.total > 0 && (
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Chip
                size="small"
                label={`Tổng: ${stats.total}`}
                color="default"
                variant="outlined"
              />
              {stats.success > 0 && (
                <Chip
                  size="small"
                  icon={<CheckCircleIcon />}
                  label={`Thành công: ${stats.success}`}
                  color="success"
                />
              )}
              {stats.error > 0 && (
                <Chip
                  size="small"
                  icon={<ErrorIcon />}
                  label={`Lỗi: ${stats.error}`}
                  color="error"
                />
              )}
            </Stack>
          )}
        </Box>
        <IconButton onClick={handleCloseModal} disabled={isUploading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box flex={1}>
              File Excel phải có các cột:{" "}
              <strong>
                word, definition, partOfSpeech, pronunciation, exampleSentence
              </strong>
            </Box>
            <Button
              size="small"
              startIcon={<DownloadIcon />}
              onClick={downloadTemplate}
              variant="outlined"
            >
              Tải mẫu
            </Button>
          </Stack>
        </Alert>

        {validationErrors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Phát hiện {validationErrors.length} lỗi validation:
            </Typography>
            <Box sx={{ maxHeight: 100, overflowY: "auto" }}>
              {validationErrors.slice(0, 5).map((error, idx) => (
                <Typography
                  key={idx}
                  variant="body2"
                  sx={{ fontSize: "0.85rem" }}
                >
                  • {error}
                </Typography>
              ))}
              {validationErrors.length > 5 && (
                <Typography
                  variant="body2"
                  sx={{ fontSize: "0.85rem", fontStyle: "italic" }}
                >
                  ... và {validationErrors.length - 5} lỗi khác
                </Typography>
              )}
            </Box>
          </Alert>
        )}

        {/* Box chọn file */}
        <Box
          sx={{
            p: 3,
            border: "2px dashed",
            borderColor: selectedFile ? "primary.main" : "divider",
            borderRadius: 2,
            textAlign: "center",
            cursor: isUploading ? "not-allowed" : "pointer",
            bgcolor: "action.hover",
            mb: 2,
            transition: "all 0.3s",
            "&:hover": {
              borderColor: "primary.main",
              bgcolor: "action.selected",
            },
          }}
          component="label"
        >
          <UploadFileIcon sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
          <Typography variant="body1" gutterBottom>
            {selectedFile
              ? `📄 ${selectedFile.name}`
              : "Kéo thả hoặc nhấn để chọn file"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Hỗ trợ: .xlsx, .xls (tối đa 10,000 từ)
          </Typography>
          <input
            type="file"
            hidden
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </Box>

        {/* Progress bar khi đang import */}
        {isUploading && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Đang import... {Math.round(importProgress)}%
            </Typography>
            <LinearProgress variant="determinate" value={importProgress} />
          </Box>
        )}

        {/* Processing indicator */}
        {isProcessingFile && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 4,
            }}
          >
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Đang xử lý file...</Typography>
          </Box>
        )}

        {/* Preview dữ liệu với tabs */}
        {previewData.length > 0 && !isProcessingFile && (
          <Box>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
              <Tabs value={currentTab} onChange={(_, v) => setCurrentTab(v)}>
                <Tab label={`Tất cả (${stats.total})`} />
                <Tab
                  label={`Thành công (${stats.success})`}
                  disabled={stats.success === 0}
                />
                <Tab
                  label={`Lỗi (${stats.error})`}
                  disabled={stats.error === 0}
                />
              </Tabs>
            </Box>

            <Paper sx={{ maxHeight: 400, overflowY: "auto" }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell width={50}>Row</TableCell>
                    <TableCell width={50}>Status</TableCell>
                    <TableCell>Word</TableCell>
                    <TableCell>Definition</TableCell>
                    <TableCell>Part of Speech</TableCell>
                    <TableCell>Pronunciation</TableCell>
                    <TableCell>Example</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.map((vocab, idx) => (
                    <TableRow
                      key={idx}
                      sx={{
                        bgcolor:
                          vocab.status === "error"
                            ? "error.lighter"
                            : vocab.status === "success"
                            ? "success.lighter"
                            : "inherit",
                      }}
                    >
                      <TableCell>{vocab.rowNumber}</TableCell>
                      <TableCell>
                        <Tooltip
                          title={vocab.errorMessage || vocab.status || ""}
                        >
                          <span>{getStatusIcon(vocab.status)}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <strong>{vocab.word}</strong>
                      </TableCell>
                      <TableCell
                        sx={{
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {vocab.definition}
                      </TableCell>
                      <TableCell>{vocab.partOfSpeech}</TableCell>
                      <TableCell>{vocab.pronunciation}</TableCell>
                      <TableCell
                        sx={{
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {vocab.exampleSentence}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
        <Box>
          {stats.error > 0 && (
            <Button
              size="small"
              startIcon={<DownloadIcon />}
              onClick={downloadErrors}
              disabled={isUploading}
            >
              Tải file lỗi
            </Button>
          )}
        </Box>
        <Box>
          <Button
            onClick={handleCloseModal}
            disabled={isUploading}
            sx={{ mr: 1 }}
          >
            {isUploading ? "Đang import..." : "Đóng"}
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={
              !selectedFile ||
              isUploading ||
              previewData.length === 0 ||
              previewData.filter((d) => d.status !== "error").length === 0
            }
          >
            {isUploading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                Importing...
              </>
            ) : (
              `Import ${
                previewData.filter((d) => d.status !== "error").length
              } từ`
            )}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
