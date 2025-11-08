import React, { useState } from "react";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  IconButton,
  TextField,
  Typography,
  Tooltip,
} from "@mui/material";
import { Upload, Trash2, Save, X } from "lucide-react";
import axios from "axios";
import { palette } from "../../../styles/palette";
import type { ListeningQuestion } from "../../../types/ListeningQuestion";
interface Step2ListeningProps {
  questions: ListeningQuestion[];
  onQuestionsChange: (questions: ListeningQuestion[]) => void;
}
export const Step2_Listening: React.FC<Step2ListeningProps> = ({
  questions,
  onQuestionsChange,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);

  const handleAddQuestion = () => {
    const newQuestion: ListeningQuestion = {
      id: Date.now().toString(),
      audioFile: null,
      audioUrl: "",
      answerText: "",
    };
    onQuestionsChange([...questions, newQuestion]);
  };

  const handleDelete = (id: string) => {
    onQuestionsChange(questions.filter((q) => q.id !== id));
  };

  const handleFileUpload = (id: string, file: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    onQuestionsChange(
      questions.map((q) =>
        q.id === id ? { ...q, audioFile: file, audioUrl: url } : q
      )
    );
  };

  const handleClearAudio = (id: string) => {
    onQuestionsChange(
      questions.map((q) =>
        q.id === id ? { ...q, audioFile: null, audioUrl: "" } : q
      )
    );
  };

  const handleAnswerChange = (id: string, value: string) => {
    onQuestionsChange(
      questions.map((q) => (q.id === id ? { ...q, answerText: value } : q))
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          mb: 2,
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button variant="contained" onClick={handleAddQuestion}>
            + Add Question
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: palette.surface }}>
              <TableRow>
                <TableCell width="5%">#</TableCell>
                <TableCell width="40%">Audio</TableCell>
                <TableCell>Answer</TableCell>
                <TableCell align="center" width="12%">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {questions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((q, index) => (
                  <TableRow
                    key={q.id}
                    hover
                    sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}
                  >
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>

                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Button
                          component="label"
                          variant="outlined"
                          size="small"
                          startIcon={<Upload size={16} />}
                        >
                          {q.audioFile ? q.audioFile.name : "Upload"}
                          <input
                            type="file"
                            accept="audio/*"
                            hidden
                            onChange={(e) =>
                              handleFileUpload(
                                q.id,
                                e.target.files?.[0] || null
                              )
                            }
                          />
                        </Button>

                        {q.audioUrl && (
                          <>
                            <audio
                              controls
                              src={q.audioUrl}
                              style={{ height: 32 }}
                            />
                            <Tooltip title="Clear audio">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleClearAudio(q.id)}
                              >
                                <X size={14} />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>

                    <TableCell>
                      <TextField
                        placeholder="Correct answer..."
                        value={q.answerText}
                        onChange={(e) =>
                          handleAnswerChange(q.id, e.target.value)
                        }
                        fullWidth
                        size="small"
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Tooltip title="Delete question">
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(q.id)}
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}

              {questions.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    align="center"
                    sx={{ py: 3, color: "gray" }}
                  >
                    No listening questions yet. Click "Add Question" to create
                    one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={questions.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 15]}
        />
      </Paper>
    </Box>
  );
};
