import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { Step1_BasicInfo } from "./lesson/modal/Step1_BasicInfo";
import { Step2_Vocab } from "./lesson/modal/Step2_Vocab";
import { Step2_Reading } from "./lesson/modal/Step2_Reading";

import { addLesson, updateLesson } from "../services/api";

// ==================== INTERFACES ====================

export interface Question {
  questionText: string;
  options: [string, string, string, string]; // Mảng 4 chuỗi
  correctAnswerIndex: number; // Lưu VỊ TRÍ (0, 1, 2, 3) của đáp án đúng
}

export interface LessonData {
  _id?: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | ""; // ✅ đổi sang chữ
  topic: string;
  type: "vocab" | "listen" | "grammar" | "reading" | "";
  vocabularies?: string[];
  readingContent?: string;
  questions?: Question[];
}

export interface LessonErrors {
  name?: string;
  level?: string;
  topic?: string;
  type?: string;
}

interface LessonWizardModalProps {
  open: boolean;
  onClose: () => void;
  selectedLesson: LessonData | null;
  onSaveSuccess: (lesson?: LessonData) => void;
}

// ==================== COMPONENT ====================

const steps = ["Basic Information", "Content Details"];

export function LessonWizardModal({
  open,
  onClose,
  selectedLesson,
  onSaveSuccess,
}: LessonWizardModalProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [lessonData, setLessonData] = useState<LessonData>({
    name: "",
    level: "",
    topic: "",
    type: "",
    vocabularies: [],
    readingContent: "",
    questions: [],
  });
  const [errors, setErrors] = useState<LessonErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  // Khi mở modal, reset hoặc load dữ liệu được chọn
  useEffect(() => {
    if (open) {
      setLessonData(
        selectedLesson
          ? { ...selectedLesson }
          : {
              name: "",
              level: "",
              topic: "",
              type: "",
              vocabularies: [],
              readingContent: "",
              questions: [],
            }
      );
      setActiveStep(0);
      setErrors({});
    }
  }, [open, selectedLesson]);

  // ==================== HANDLERS ====================

  const handleDataChange = (field: keyof LessonData, value: any) => {
    setLessonData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof LessonErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep1 = () => {
    const newErrors: LessonErrors = {};
    if (!lessonData.name.trim()) newErrors.name = "Name is required";
    if (!lessonData.level.trim()) newErrors.level = "Level is required";
    if (!lessonData.topic.trim()) newErrors.topic = "Topic is required";
    if (!lessonData.type.trim()) newErrors.type = "Lesson type is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (validateStep1()) setActiveStep(1);
    } else if (activeStep === 1) {
      handleSave();
    }
  };

  const handleBack = () => setActiveStep(0);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const dataToSave = { ...lessonData }; // giữ nguyên vì level là string

      let response;
      if (lessonData._id) {
        // ✅ Cập nhật
        response = await updateLesson(lessonData._id, dataToSave);
      } else {
        // ✅ Thêm mới
        response = await addLesson(dataToSave);
      }

      console.log("✅ Saved lesson:", response.data);
      onSaveSuccess(response.data?.data || dataToSave);
      onClose();
    } catch (err: any) {
      console.error("❌ Failed to save lesson:", err);
      alert("Failed to save lesson. Check console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  // ==================== STEP CONTENT ====================

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Step1_BasicInfo
            lessonData={lessonData}
            onDataChange={handleDataChange}
            errors={errors}
          />
        );

      case 1:
        switch (lessonData.type) {
          case "vocab":
            return (
              <Step2_Vocab
                selectedVocabIds={lessonData.vocabularies || []}
                onVocabChange={(ids) => handleDataChange("vocabularies", ids)}
              />
            );

          case "reading":
            return (
              <Step2_Reading
                readingData={{
                  readingContent: lessonData.readingContent || "",
                  questions: lessonData.questions || [],
                }}
                onDataChange={handleDataChange}
              />
            );

          default:
            return (
              <Alert severity="warning">
                Content type "{lessonData.type || "undefined"}" not implemented
                yet.
              </Alert>
            );
        }

      default:
        return null;
    }
  };

  // ==================== RENDER ====================

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {selectedLesson?._id ? "Edit Lesson" : "Create New Lesson"}
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent()}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={isSaving}>
            Back
          </Button>
        )}
        <Button onClick={handleNext} variant="contained" disabled={isSaving}>
          {isSaving ? (
            <CircularProgress size={24} />
          ) : activeStep === steps.length - 1 ? (
            "Save Lesson"
          ) : (
            "Next"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
