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
  Paper,
  LinearProgress,
  Chip,
  Tabs,
  Tab,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import DownloadIcon from "@mui/icons-material/Download";
import AudioFileIcon from "@mui/icons-material/AudioFile";
import * as XLSX from "xlsx";
import axios from "axios";

interface LessonImportModalProps {
  open: boolean;
  onClose: () => void;
  onImportSuccess: (message: string) => void;
  onImportError: (message: string) => void;
}

interface LessonInfo {
  name: string;
  level: string;
  topic: string;
  type: string;
  readingContent?: string;
}

interface VocabRow {
  word: string;
  meaning: string;
  exampleSentence: string;
}

interface QuestionRow {
  questionText: string;
  options: string;
  correctAnswerIndex: number;
  answerText?: string;
  audioFileName?: string;
}

interface ImportPreview {
  lessonInfo?: LessonInfo;
  vocabularies: VocabRow[];
  questions: QuestionRow[];
  status: "pending" | "success" | "error";
  errorMessage?: string;
}

const API_BASE_URL = "http://localhost:5050/api";

export function LessonImportModal({
  open,
  onClose,
  onImportSuccess,
  onImportError,
}: LessonImportModalProps) {
  const [selectedExcelFile, setSelectedExcelFile] = useState<File | null>(null);
  const [selectedAudioFiles, setSelectedAudioFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [currentTab, setCurrentTab] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleExcelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedExcelFile(file);
      processExcelFile(file);
    }
  };

  const handleAudioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setSelectedAudioFiles(files);
    }
  };

  const processExcelFile = (file: File) => {
    setIsProcessing(true);
    setValidationErrors([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) return;

      try {
        const workbook = XLSX.read(data, { type: "binary" });
        const errors: string[] = [];

        // SHEET 1: Lesson Info
        let lessonInfo: LessonInfo | undefined;
        if (workbook.SheetNames.includes("Lesson Info")) {
          const sheet1 = workbook.Sheets["Lesson Info"];
          const data1: any[] = XLSX.utils.sheet_to_json(sheet1);
          if (data1.length > 0) {
            const row = data1[0];
            lessonInfo = {
              name: row.name || row.Name || "",
              level: row.level || row.Level || "",
              topic: row.topic || row.Topic || "",
              type: row.type || row.Type || "",
              readingContent: row.readingContent || row.ReadingContent || "",
            };

            // Validate lesson info
            if (!lessonInfo.name) errors.push("Lesson name is required");
            if (!lessonInfo.level) errors.push("Lesson level is required");
            if (!lessonInfo.topic) errors.push("Lesson topic is required");
            if (!lessonInfo.type) errors.push("Lesson type is required");
            if (
              !["vocab", "listen", "grammar", "reading"].includes(
                lessonInfo.type
              )
            ) {
              errors.push(
                "Invalid lesson type. Must be: vocab, listen, grammar, or reading"
              );
            }
          } else {
            errors.push("Sheet 'Lesson Info' is empty");
          }
        } else {
          errors.push("Sheet 'Lesson Info' not found");
        }

        // SHEET 2: Vocabularies (for vocab type)
        let vocabularies: VocabRow[] = [];
        if (
          lessonInfo?.type === "vocab" &&
          workbook.SheetNames.includes("Vocabularies")
        ) {
          const sheet2 = workbook.Sheets["Vocabularies"];
          const data2: any[] = XLSX.utils.sheet_to_json(sheet2);
          vocabularies = data2.map((row, idx) => ({
            word: row.word || row.Word || "",
            meaning: row.meaning || row.Meaning || "",
            exampleSentence:
              row.exampleSentence ||
              row.ExampleSentence ||
              row["Example Sentence"] ||
              "",
          }));

          if (vocabularies.length === 0) {
            errors.push("Vocab lesson must have at least one vocabulary");
          }
        }

        // SHEET 3: Questions (for listen, grammar, reading)
        let questions: QuestionRow[] = [];
        if (
          ["listen", "grammar", "reading"].includes(lessonInfo?.type || "") &&
          workbook.SheetNames.includes("Questions")
        ) {
          const sheet3 = workbook.Sheets["Questions"];
          const data3: any[] = XLSX.utils.sheet_to_json(sheet3);
          questions = data3.map((row, idx) => ({
            questionText:
              row.questionText ||
              row.QuestionText ||
              row["Question Text"] ||
              "",
            options: row.options || row.Options || "",
            correctAnswerIndex: Number(
              row.correctAnswerIndex ||
                row.CorrectAnswerIndex ||
                row["Correct Answer Index"] ||
                0
            ),
            answerText:
              row.answerText || row.AnswerText || row["Answer Text"] || "",
            audioFileName:
              row.audioFileName ||
              row.AudioFileName ||
              row["Audio File Name"] ||
              "",
          }));

          if (questions.length === 0) {
            errors.push(
              `${lessonInfo?.type} lesson must have at least one question`
            );
          }

          // Validate questions
          questions.forEach((q, idx) => {
            if (!q.questionText)
              errors.push(`Question ${idx + 1}: questionText is required`);
            if (!q.options)
              errors.push(`Question ${idx + 1}: options is required`);
          });
        }

        setPreview({
          lessonInfo,
          vocabularies,
          questions,
          status: errors.length > 0 ? "error" : "pending",
          errorMessage: errors.join("; "),
        });

        setValidationErrors(errors);
      } catch (error) {
        console.error("Error processing Excel:", error);
        onImportError("Không thể đọc file Excel. Vui lòng kiểm tra định dạng.");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleUpload = async () => {
    if (!selectedExcelFile || !preview || !preview.lessonInfo) return;

    setIsUploading(true);
    setImportProgress(0);

    const formData = new FormData();
    formData.append("excel", selectedExcelFile);

    // Thêm audio files nếu có
    selectedAudioFiles.forEach((file) => {
      formData.append("audios", file);
    });

    try {
      const response = await axios.post(
        `${API_BASE_URL}/lessons/import`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total
              ? (progressEvent.loaded / progressEvent.total) * 100
              : 0;
            setImportProgress(progress);
          },
        }
      );

      setPreview((prev) => (prev ? { ...prev, status: "success" } : null));
      onImportSuccess(`Import thành công: ${response.data.data.name}`);

      setTimeout(() => {
        handleCloseModal();
      }, 2000);
    } catch (error: any) {
      console.error("Import error:", error);
      const errorMsg =
        error.response?.data?.message || "Import thất bại. Vui lòng thử lại.";
      setPreview((prev) =>
        prev ? { ...prev, status: "error", errorMessage: errorMsg } : null
      );
      onImportError(errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloseModal = () => {
    if (!isUploading) {
      setSelectedExcelFile(null);
      setSelectedAudioFiles([]);
      setPreview(null);
      setIsProcessing(false);
      setImportProgress(0);
      setCurrentTab(0);
      setValidationErrors([]);
      onClose();
    }
  };

  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Lesson Info
    const lessonInfoData = [
      {
        name: "Daily Routine Vocabulary",
        level: "Beginner",
        topic: "Daily life",
        type: "vocab",
        readingContent: "(Only fill if type = reading)",
      },
    ];
    const ws1 = XLSX.utils.json_to_sheet(lessonInfoData);
    XLSX.utils.book_append_sheet(wb, ws1, "Lesson Info");

    // Sheet 2: Vocabularies
    const vocabData = [
      { word: "brush", meaning: "chải", exampleSentence: "I brush my hair" },
      {
        word: "breakfast",
        meaning: "bữa sáng",
        exampleSentence: "I eat breakfast",
      },
    ];
    const ws2 = XLSX.utils.json_to_sheet(vocabData);
    XLSX.utils.book_append_sheet(wb, ws2, "Vocabularies");

    // Sheet 3: Questions
    const questionData = [
      {
        questionText: "What did the man do?",
        options: "went home|ate dinner|slept",
        correctAnswerIndex: 1,
        answerText: "He ate dinner.",
        audioFileName: "audio1.mp3",
      },
      {
        questionText: "Choose the correct sentence",
        options: "I'm fine|I fine|Fine I",
        correctAnswerIndex: 0,
        answerText: "I'm fine.",
        audioFileName: "",
      },
    ];
    const ws3 = XLSX.utils.json_to_sheet(questionData);
    XLSX.utils.book_append_sheet(wb, ws3, "Questions");

    XLSX.writeFile(wb, "lesson_import_template.xlsx");
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
          <Typography variant="h6">Import Lesson từ Excel</Typography>
          {preview?.lessonInfo && (
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Chip
                size="small"
                label={preview.lessonInfo.type.toUpperCase()}
                color="primary"
              />
              <Chip
                size="small"
                label={preview.lessonInfo.level}
                variant="outlined"
              />
              {preview.status === "success" && (
                <Chip
                  size="small"
                  icon={<CheckCircleIcon />}
                  label="Thành công"
                  color="success"
                />
              )}
              {preview.status === "error" && (
                <Chip
                  size="small"
                  icon={<ErrorIcon />}
                  label="Có lỗi"
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
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Cấu trúc Excel: 3 Sheets
              </Typography>
              <Typography variant="caption" display="block">
                • Sheet 1 (Lesson Info): name, level, topic, type,
                readingContent
              </Typography>
              <Typography variant="caption" display="block">
                • Sheet 2 (Vocabularies): word, meaning, exampleSentence (cho
                type = vocab)
              </Typography>
              <Typography variant="caption" display="block">
                • Sheet 3 (Questions): questionText, options (A|B|C|D),
                correctAnswerIndex, answerText, audioFileName
              </Typography>
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
            <Box sx={{ maxHeight: 120, overflowY: "auto" }}>
              {validationErrors.map((error, idx) => (
                <Typography
                  key={idx}
                  variant="body2"
                  sx={{ fontSize: "0.85rem" }}
                >
                  • {error}
                </Typography>
              ))}
            </Box>
          </Alert>
        )}

        {/* Excel file upload */}
        <Box
          sx={{
            p: 3,
            border: "2px dashed",
            borderColor: selectedExcelFile ? "primary.main" : "divider",
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
            {selectedExcelFile
              ? `📄 ${selectedExcelFile.name}`
              : "Chọn file Excel"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Hỗ trợ: .xlsx, .xls
          </Typography>
          <input
            type="file"
            hidden
            accept=".xlsx, .xls"
            onChange={handleExcelChange}
            disabled={isUploading}
          />
        </Box>

        {/* Audio files upload (for listen type) */}
        {preview?.lessonInfo?.type === "listen" && (
          <Box
            sx={{
              p: 2,
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 2,
              textAlign: "center",
              bgcolor: "action.hover",
              mb: 2,
            }}
            component="label"
          >
            <AudioFileIcon
              sx={{ fontSize: 40, color: "secondary.main", mb: 1 }}
            />
            <Typography variant="body2" gutterBottom>
              {selectedAudioFiles.length > 0
                ? `🎵 ${selectedAudioFiles.length} file(s) đã chọn`
                : "Chọn file audio (MP3)"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Chọn nhiều file audio tương ứng với audioFileName trong Questions
              sheet
            </Typography>
            <input
              type="file"
              hidden
              accept="audio/mp3,audio/mpeg"
              multiple
              onChange={handleAudioChange}
              disabled={isUploading}
            />
          </Box>
        )}

        {/* Progress bar */}
        {isUploading && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Đang import... {Math.round(importProgress)}%
            </Typography>
            <LinearProgress variant="determinate" value={importProgress} />
          </Box>
        )}

        {/* Processing indicator */}
        {isProcessing && (
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

        {/* Preview */}
        {preview && !isProcessing && (
          <Box>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
              <Tabs value={currentTab} onChange={(_, v) => setCurrentTab(v)}>
                <Tab label="Thông tin Lesson" />
                {preview.vocabularies.length > 0 && (
                  <Tab label={`Từ vựng (${preview.vocabularies.length})`} />
                )}
                {preview.questions.length > 0 && (
                  <Tab label={`Câu hỏi (${preview.questions.length})`} />
                )}
              </Tabs>
            </Box>

            {/* Tab 0: Lesson Info */}
            {currentTab === 0 && preview.lessonInfo && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {preview.lessonInfo.name}
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Level:</strong> {preview.lessonInfo.level}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Topic:</strong> {preview.lessonInfo.topic}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Type:</strong> {preview.lessonInfo.type}
                  </Typography>
                  {preview.lessonInfo.readingContent && (
                    <Typography variant="body2">
                      <strong>Reading Content:</strong>{" "}
                      {preview.lessonInfo.readingContent.substring(0, 200)}...
                    </Typography>
                  )}
                </Stack>
              </Paper>
            )}

            {/* Tab 1: Vocabularies */}
            {currentTab === 1 && preview.vocabularies.length > 0 && (
              <Paper sx={{ maxHeight: 400, overflowY: "auto" }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Word</TableCell>
                      <TableCell>Meaning</TableCell>
                      <TableCell>Example</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {preview.vocabularies.map((vocab, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>
                          <strong>{vocab.word}</strong>
                        </TableCell>
                        <TableCell>{vocab.meaning}</TableCell>
                        <TableCell>{vocab.exampleSentence}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            )}

            {/* Tab 2: Questions */}
            {currentTab === 2 && preview.questions.length > 0 && (
              <Paper sx={{ maxHeight: 400, overflowY: "auto" }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Question</TableCell>
                      <TableCell>Options</TableCell>
                      <TableCell>Correct</TableCell>
                      <TableCell>Answer</TableCell>
                      <TableCell>Audio</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {preview.questions.map((q, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{q.questionText}</TableCell>
                        <TableCell>{q.options}</TableCell>
                        <TableCell>{q.correctAnswerIndex}</TableCell>
                        <TableCell>{q.answerText}</TableCell>
                        <TableCell>
                          {q.audioFileName && (
                            <Tooltip title={q.audioFileName}>
                              <AudioFileIcon fontSize="small" color="action" />
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleCloseModal} disabled={isUploading}>
          {isUploading ? "Đang import..." : "Đóng"}
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={
            !selectedExcelFile ||
            isUploading ||
            !preview ||
            preview.status === "error" ||
            validationErrors.length > 0
          }
        >
          {isUploading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
              Importing...
            </>
          ) : (
            "Import Lesson"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
