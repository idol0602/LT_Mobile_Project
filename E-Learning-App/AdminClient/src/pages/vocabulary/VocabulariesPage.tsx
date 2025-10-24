// src/pages/VocabulariesPage.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Container,
  Paper,
  Grid,
  type SelectChangeEvent,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { BookOpen, Zap, FileText, MessageSquare, Package } from "lucide-react"; // lucide-react chỉ dùng cho icon, có thể thay bằng MUI icons nếu muốn
import {
  getVocabularies,
  addVocabulary,
  updateVocabulary,
  deleteVocabulary,
  getVocabularyStats,
} from "../../services/api";

import { VocabForm } from "../../components/vocabulary/VocabForm";
import { VocabTable } from "../../components/vocabulary/VocabTable";
import { StatCards } from "../../components/StatCards";
import { PageHeader } from "../../components/PageHeader";
import { VocabFilter } from "../../components/vocabulary/VocabFilter";
import BookIcon from "@mui/icons-material/Book"; // Dùng icon của MUI
export default function VocabulariesPage() {
  const [vocabularies, setVocabularies] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVocab, setEditingVocab] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [posFilter, setPosFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  } | null>(null);
  const [stats, setStats] = useState({ totalWords: 0, countByPos: [] });
  // 3. State cho Dialog xác nhận xóa (thay thế confirm)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    vocabId: string | null;
  }>({ open: false, vocabId: null });
  useEffect(() => {
    // Chỉ gọi initialFetch một lần duy nhất khi component mount
    initialFetch();
  }, []);

  const initialFetch = async () => {
    setLoading(true);
    try {
      const [vocabResponse, statsResponse] = await Promise.all([
        getVocabularies(page, rowsPerPage), // Lấy dữ liệu trang đầu tiên
        getVocabularyStats(),
      ]);
      setVocabularies(vocabResponse.data.data);
      // Giả sử API getVocabularies trả về total trong data
      // setTotalVocabs(vocabResponse.data.total);
      setStats(statsResponse.data);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu ban đầu:", err);
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
  useEffect(() => {
    // Không cần gọi lại initialFetch, chỉ cần lấy dữ liệu cho trang mới
    const fetchPageData = async () => {
      setLoading(true);
      try {
        const response = await getVocabularies(page, rowsPerPage);
        setVocabularies(response.data.data);
        // setTotalVocabs(response.data.total);
      } catch (err) {
        console.error("Lỗi khi chuyển trang:", err);
      } finally {
        setLoading(false);
      }
    };

    // Chỉ chạy khi không phải lần tải đầu tiên
    // (để tránh gọi API 2 lần lúc đầu)
    if (!loading) {
      fetchPageData();
    }
  }, [page, rowsPerPage]);
  console.log("Stats:", stats); // Kiểm tra dữ liệu stats nhận được
  const fetchVocabularies = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getVocabularies(page, rowsPerPage);
      setVocabularies(response.data.data);
    } catch (err) {
      console.error("Lỗi khi tải từ vựng:", err);
      setError("Không thể tải dữ liệu từ server.");
    } finally {
      setLoading(false);
    }
  };
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Luôn quay về trang đầu khi thay đổi số lượng item/trang
  };

  const filteredData = useMemo(() => {
    return vocabularies
      .filter((v) => v.word.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter((v) => posFilter === "all" || v.partOfSpeech === posFilter);
  }, [vocabularies, searchTerm, posFilter]);
  const handleSave = async (vocabData: any, imageFile: File | null) => {
    const formData = new FormData();
    const { _id, createdAt, updatedAt, __v, ...rest } = vocabData;
    Object.keys(rest).forEach((key) => formData.append(key, rest[key]));
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      if (editingVocab) {
        await updateVocabulary(editingVocab._id, formData);
        // 4. Gọi Snackbar thay vì alert
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
      // Đóng dialog sau khi hoàn tất
      setDeleteConfirm({ open: false, vocabId: null });
    }
  };

  const handleCloseSnackbar = () => {
    if (snackbar) {
      setSnackbar({ ...snackbar, open: false });
    }
  };
  // ✅ --- HÀM DELETE ĐÃ HOÀN THIỆN ---
  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa từ vựng này không?")) {
      try {
        await deleteVocabulary(id);
        fetchVocabularies(); // Tải lại danh sách sau khi xóa
      } catch (error) {
        console.error("Lỗi khi xóa:", error);
        alert("Đã xảy ra lỗi khi xóa từ vựng.");
      }
    }
  };

  const handleEdit = (vocab: any) => {
    setEditingVocab(vocab);
    setIsModalOpen(true);
  };
  const handleResetFilters = () => {
    setSearchTerm("");
    setPosFilter("all");
    setPage(0);
  };
  const partOfSpeechConfig: Record<string, { icon: any; color: string }> = {
    noun: { icon: BookOpen, color: "#A0DDE6" },
    verb: { icon: Zap, color: "#10b981" },
    adjective: { icon: FileText, color: "#f59e0b" },
    adverb: { icon: MessageSquare, color: "#8b5cf6" },
    default: { icon: Package, color: "#71717a" },
  };

  if (error) return <div>Lỗi: {error}</div>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeader
        title="Vocabulary Management"
        buttonText="Add Word"
        onButtonClick={() => {
          setEditingVocab(null);
          setIsModalOpen(true);
        }}
        icon={<BookIcon />}
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <StatCards stats={stats} />

          <VocabFilter
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            posFilter={posFilter}
            onPosFilterChange={(e) => setPosFilter(e.target.value)}
            onReset={() => {
              setSearchTerm("");
              setPosFilter("all");
              setPage(0);
            }}
          />

          <VocabTable
            vocabularies={filteredData}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}

      <VocabForm
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingVocab(null);
        }}
        onSave={handleSave}
        selectedVocab={editingVocab}
      />
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

      {/* Dialog cho xác nhận xóa */}
      <Dialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, vocabId: null })}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có thực sự muốn xóa từ vựng này không? Hành động này không thể
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
