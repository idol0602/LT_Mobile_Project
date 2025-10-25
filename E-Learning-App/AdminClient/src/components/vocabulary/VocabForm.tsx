// src/components/VocabForm.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  IconButton,
  Fade,
  Chip,
  type SelectChangeEvent,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import CloseIcon from "@mui/icons-material/Close";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

// Định nghĩa kiểu dữ liệu cho vocabulary
interface Vocabulary {
  _id?: string;
  word: string;
  definition: string;
  pronunciation: string;
  partOfSpeech: string;
  exampleSentence: string;
  imageFileId?: string;
}

interface VocabFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (vocabData: Vocabulary, imageFile: File | null) => void;
  selectedVocab: Vocabulary | null;
}

const initialFormState: Vocabulary = {
  word: "",
  definition: "",
  pronunciation: "",
  partOfSpeech: "",
  exampleSentence: "",
};

export function VocabForm({
  open,
  onClose,
  onSave,
  selectedVocab,
}: VocabFormProps) {
  const [formData, setFormData] = useState<Vocabulary>(initialFormState);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Vocabulary>>({}); // State để lưu lỗi validation

  useEffect(() => {
    // Reset form khi dialog được mở
    if (open) {
      if (selectedVocab) {
        setFormData(selectedVocab);
        if (selectedVocab.imageFileId) {
          setPreview(
            `http://localhost:5050/api/images/${selectedVocab.imageFileId}`
          );
        }
      } else {
        setFormData(initialFormState);
        setPreview(null);
        setImageFile(null);
      }
      setErrors({}); // Xóa các lỗi cũ
    }
  }, [selectedVocab, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Xóa lỗi khi người dùng bắt đầu nhập
    if (errors[e.target.name as keyof Vocabulary]) {
      setErrors({ ...errors, [e.target.name]: undefined });
    }
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
    if (errors.partOfSpeech) {
      setErrors({ ...errors, partOfSpeech: undefined });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreview(null);
  };

  // Hàm xác thực dữ liệu
  const validate = () => {
    const newErrors: Partial<Vocabulary> = {};
    if (!formData.word.trim()) newErrors.word = "Từ vựng là bắt buộc";
    if (!formData.definition.trim())
      newErrors.definition = "Định nghĩa là bắt buộc";
    if (!formData.partOfSpeech)
      newErrors.partOfSpeech = "Vui lòng chọn loại từ";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return; // Dừng lại nếu validation thất bại
    onSave(formData, imageFile);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={Fade}
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle
        sx={{
          background: (theme) =>
            `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          {selectedVocab ? "Chỉnh sửa Từ vựng" : "Thêm Từ vựng mới"}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {/* SỬ DỤNG CSS GRID (display: 'grid') THAY VÌ COMPONENT GRID CỦA MUI */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
          }}
        >
          {/* CỘT UPLOAD ẢNH */}
          <Box sx={{ gridColumn: { xs: "1 / -1", md: "1 / 2" } }}>
            <Box
              sx={{
                mb: 1,
                p: 2,
                border: "2px dashed",
                borderColor: "divider",
                borderRadius: 2,
                textAlign: "center",
                bgcolor: preview ? "transparent" : "action.hover",
              }}
            >
              {preview ? (
                <Box sx={{ position: "relative", display: "inline-block" }}>
                  <Box
                    component="img"
                    src={preview}
                    alt="Preview"
                    sx={{
                      width: "100%",
                      maxHeight: 200,
                      objectFit: "cover",
                      borderRadius: 2,
                    }}
                  />
                  <IconButton
                    onClick={handleRemoveImage}
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      background: "rgba(0,0,0,0.5)",
                      color: "white",
                      "&:hover": { background: "rgba(0,0,0,0.8)" },
                    }}
                    size="small"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Box sx={{ py: 4 }}>
                  <PhotoCameraIcon
                    sx={{ fontSize: 48, color: "text.disabled", mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Thêm hình ảnh minh họa
                  </Typography>
                </Box>
              )}
            </Box>
            <Button
              fullWidth
              variant="outlined"
              component="label"
              startIcon={<ImageIcon />}
            >
              {preview ? "Thay đổi hình ảnh" : "Chọn hình ảnh"}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileChange}
              />
            </Button>
            {imageFile && (
              <Chip
                label={imageFile.name}
                size="small"
                onDelete={handleRemoveImage}
                sx={{ mt: 1 }}
              />
            )}
          </Box>

          {/* CỘT THÔNG TIN CHỮ */}
          <Box
            sx={{
              gridColumn: { xs: "1 / -1", md: "2 / 3" },
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
            }}
          >
            <TextField
              name="word"
              label="Từ vựng"
              value={formData.word}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.word}
              helperText={errors.word}
            />
            <TextField
              name="definition"
              label="Định nghĩa"
              value={formData.definition}
              onChange={handleChange}
              fullWidth
              required
              multiline
              rows={2}
              error={!!errors.definition}
              helperText={errors.definition}
            />
            <TextField
              name="pronunciation"
              label="Phiên âm"
              value={formData.pronunciation}
              onChange={handleChange}
              fullWidth
              placeholder="Ví dụ: /həˈloʊ/"
            />
            <FormControl fullWidth required error={!!errors.partOfSpeech}>
              <InputLabel>Loại từ</InputLabel>
              <Select
                name="partOfSpeech"
                value={formData.partOfSpeech}
                label="Loại từ"
                onChange={handleSelectChange}
              >
                <MenuItem value="noun">Noun</MenuItem>
                <MenuItem value="verb">Verb</MenuItem>
                <MenuItem value="adjective">Adjective</MenuItem>
                <MenuItem value="adverb">Adverb</MenuItem>
              </Select>
              {errors.partOfSpeech && (
                <Typography
                  variant="caption"
                  sx={{ color: "error.main", mt: 0.5, ml: 1.5 }}
                >
                  {errors.partOfSpeech}
                </Typography>
              )}
            </FormControl>
          </Box>

          <Box sx={{ gridColumn: "1 / -1" }}>
            <TextField
              name="exampleSentence"
              label="Câu ví dụ"
              value={formData.exampleSentence}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              placeholder="Nhập câu ví dụ sử dụng từ vựng này..."
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          bgcolor: "action.hover",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Button onClick={onClose} sx={{ color: "text.secondary" }}>
          Hủy
        </Button>
        <Button onClick={handleSubmit} variant="contained">
          {selectedVocab ? "Cập nhật" : "Lưu mới"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
