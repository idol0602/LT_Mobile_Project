"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Container,
  Paper,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
} from "@mui/material";
import { BookOpen, Zap, FileText, MessageSquare, Package } from "lucide-react";
import BookIcon from "@mui/icons-material/Book";
import UploadIcon from "@mui/icons-material/Upload";
import AddIcon from "@mui/icons-material/Add";

import {
  getVocabularies,
  addVocabulary,
  getVocabulariesByIds,
  updateVocabulary,
  deleteVocabulary,
  getVocabularyStats,
} from "../../services/vocabularyApi";

import { VocabForm } from "../../components/vocabulary/VocabForm";
import { VocabTable } from "../../components/vocabulary/VocabTable";
import { StatCards } from "../../components/StatCards";
import { PageHeader } from "../../components/PageHeader";
import { VocabFilter } from "../../components/vocabulary/VocabFilter";
import type { SelectChangeEvent } from "@mui/material";
import { ImportModal } from "../../components/ImportModal";

export default function VocabulariesPage() {
  const [vocabularies, setVocabularies] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVocab, setEditingVocab] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [posFilter, setPosFilter] = useState("all");
  const [searchLang, setSearchLang] = useState("both");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [stats, setStats] = useState({ totalWords: 0, countByPos: [] });
  const [totalVocabs, setTotalVocabs] = useState(0);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    vocabId: string | null;
  }>({ open: false, vocabId: null });

  // 🔹 Fetch ban đầu
  useEffect(() => {
    initialFetch();
  }, []);
  const initialFetch = async () => {
    setLoading(true);
    try {
      const [vocabResponse, statsResponse] = await Promise.all([
        getVocabularies(page, rowsPerPage, searchTerm, searchLang, posFilter),
        getVocabularyStats(),
      ]);
      setVocabularies(vocabResponse.data.data);
      setStats(statsResponse.data);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu ban đầu:", err);
      setError("Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Lấy lại dữ liệu khi đổi trang hoặc bộ lọc
  useEffect(() => {
    fetchVocabularies();
  }, [page, rowsPerPage, searchTerm, searchLang, posFilter]);

  const fetchVocabularies = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getVocabularies(
        page,
        rowsPerPage,
        searchTerm,
        searchLang,
        posFilter
      );
      // 3. LƯU DỮ LIỆU TỪ SERVER
      setVocabularies(response.data.data); // Dữ liệu của trang hiện tại
      setTotalVocabs(response.data.total); // Tổng số từ vựng (ví dụ: 6)
    } catch (err) {
      console.error("Lỗi khi tải từ vựng:", err);
      setError("Không thể tải dữ liệu từ server.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsResponse = await getVocabularyStats();
      setStats(statsResponse.data);
    } catch (error) {
      console.error("Lỗi khi cập nhật thống kê:", error);
    }
  };

  // 🔹 Xử lý thêm / sửa
  const handleSave = async (vocabData: any, imageFile: File | null) => {
    const formData = new FormData();
    const { _id, createdAt, updatedAt, __v, ...rest } = vocabData;
    Object.keys(rest).forEach((key) => {
      if (rest[key] !== undefined && rest[key] !== null) {
        formData.append(key, rest[key].toString());
      }
    });
    if (imageFile) formData.append("image", imageFile);

    try {
      if (editingVocab) {
        await updateVocabulary(editingVocab._id, formData);
        setSnackbar({
          open: true,
          message: "Cập nhật từ vựng thành công!",
          severity: "success",
        });
      } else {
        await addVocabulary(formData);
        setSnackbar({
          open: true,
          message: "Thêm từ vựng mới thành công!",
          severity: "success",
        });
      }
      await Promise.all([fetchVocabularies(), fetchStats()]);
    } catch (error) {
      console.error("Lỗi khi lưu:", error);
      setSnackbar({
        open: true,
        message: "Đã xảy ra lỗi khi lưu từ vựng.",
        severity: "error",
      });
    } finally {
      setIsModalOpen(false);
      setEditingVocab(null);
    }
  };

  // 🔹 Xử lý xóa
  const handleDeleteClick = (id: string) => {
    setDeleteConfirm({ open: true, vocabId: id });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.vocabId) return;
    try {
      await deleteVocabulary(deleteConfirm.vocabId);
      setSnackbar({
        open: true,
        message: "Đã xóa từ vựng thành công!",
        severity: "warning",
      });
      await Promise.all([fetchVocabularies(), fetchStats()]);
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      setSnackbar({
        open: true,
        message: "Đã xảy ra lỗi khi xóa từ vựng.",
        severity: "error",
      });
    } finally {
      setDeleteConfirm({ open: false, vocabId: null });
    }
  };

  // 🔹 Bộ lọc
  const handleSearchLangChange = (e: SelectChangeEvent<string>) => {
    setSearchLang(e.target.value);
  };

  const handleChangePage = (event: unknown, newPage: number) =>
    setPage(newPage);
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setPosFilter("all");
    setSearchLang("both");
    setPage(0);
  };

  const handleEdit = (vocab: any) => {
    setEditingVocab(vocab);
    setIsModalOpen(true);
  };

  const handleCloseSnackbar = () =>
    snackbar && setSnackbar({ ...snackbar, open: false });

  const filteredData = useMemo(() => {
    return vocabularies
      .filter((v) => v.word.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter((v) => posFilter === "all" || v.partOfSpeech === posFilter);
  }, [vocabularies, searchTerm, posFilter]);

  if (error) return <div>Lỗi: {error}</div>;
  const handleImportSuccess = (message: string) => {
    setSnackbar({ open: true, message, severity: "success" });
    // Tải lại cả từ vựng và thống kê
    Promise.all([fetchVocabularies(), fetchStats()]);
  };

  const handleImportError = (message: string) => {
    setSnackbar({ open: true, message, severity: "error" });
  };
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <BookIcon color="primary" />
            <Typography variant="h4" fontWeight="bold">
              Vocabulary Management
            </Typography>
          </Stack>
          <Typography color="text.secondary" mt={0.5}>
            Organize and manage your content
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => setIsImportModalOpen(true)}
          >
            Import
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingVocab(null);
              setIsModalOpen(true);
            }}
          >
            Add Word
          </Button>
        </Stack>
      </Box>

      {/* LOADING */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* THỐNG KÊ */}
          <StatCards stats={stats} />

          {/* FILTER */}
          <VocabFilter
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            posFilter={posFilter}
            onPosFilterChange={(e) => setPosFilter(e.target.value)}
            searchLang={searchLang}
            onSearchLangChange={handleSearchLangChange}
            onReset={handleResetFilters}
          />

          {/* BẢNG TỪ VỰNG */}
          <VocabTable
            vocabularies={filteredData}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            totalCount={totalVocabs}
          />
        </>
      )}

      {/* FORM THÊM/SỬA TỪ VỰNG */}
      <VocabForm
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingVocab(null);
        }}
        onSave={handleSave}
        selectedVocab={editingVocab}
      />

      {/* IMPORT MODAL */}
      <ImportModal
        open={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
        onImportError={handleImportError}
      />

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar?.open || false}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar?.severity || "info"}
          sx={{ width: "100%" }}
        >
          {snackbar?.message}
        </Alert>
      </Snackbar>

      {/* DIALOG XÁC NHẬN XÓA */}
      <Dialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, vocabId: null })}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa từ vựng này không? Hành động này không thể
            hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirm({ open: false, vocabId: null })}
          >
            Hủy
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
