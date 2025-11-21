import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Languages } from "lucide-react-native";
import API from "../../api";
import type { ReadingLesson } from "../../types";
import RenderHTML from "react-native-render-html";

export default function ReadingLessonDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [lesson, setLesson] = useState<ReadingLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: number;
  }>({});
  const [showResults, setShowResults] = useState(false);

  // Translation states
  const [showTranslation, setShowTranslation] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string>("");
  const [isTranslating, setIsTranslating] = useState(false);

  const fetchLesson = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching lesson with ID:", id);
      const response = await API.getLessonById(id as string);
      console.log("Lesson fetched successfully:", response.data?.name);
      setLesson(response.data as ReadingLesson);
    } catch (error) {
      console.error("Error fetching lesson:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to load lesson. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  const handleTranslateContent = async () => {
    if (!lesson?.readingContent) return;

    setIsTranslating(true);
    try {
      // Chuyển HTML thành plain text để dịch
      const plainText = lesson.readingContent
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      const response = await API.translate(plainText, "en", "vi");
      setTranslatedContent(response.translated);
      setShowTranslation(true);
    } catch (error) {
      console.error("Translation error:", error);
      Alert.alert("Error", "Failed to translate content. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSelectAnswer = (questionIndex: number, optionIndex: number) => {
    if (showResults) return; // Không cho chọn sau khi đã submit

    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: optionIndex,
    });
  };

  const handleSubmit = () => {
    const totalQuestions = lesson?.questions?.length || 0;
    const answeredQuestions = Object.keys(selectedAnswers).length;

    if (answeredQuestions < totalQuestions) {
      Alert.alert(
        "Incomplete",
        `You have answered ${answeredQuestions} out of ${totalQuestions} questions. Please answer all questions.`
      );
      return;
    }

    setShowResults(true);
  };

  const calculateScore = () => {
    if (!lesson?.questions) return { correct: 0, total: 0, percentage: 0 };

    let correct = 0;
    lesson.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswerIndex) {
        correct++;
      }
    });

    const total = lesson.questions.length;
    const percentage = Math.round((correct / total) * 100);

    return { correct, total, percentage };
  };

  const getOptionStyle = (questionIndex: number, optionIndex: number) => {
    if (!showResults) {
      return selectedAnswers[questionIndex] === optionIndex
        ? styles.optionSelected
        : styles.option;
    }

    const question = lesson?.questions?.[questionIndex];
    const isCorrect = question?.correctAnswerIndex === optionIndex;
    const isSelected = selectedAnswers[questionIndex] === optionIndex;

    if (isCorrect) {
      return styles.optionCorrect;
    }
    if (isSelected && !isCorrect) {
      return styles.optionWrong;
    }
    return styles.option;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EC4899" />
          <Text style={styles.loadingText}>Loading lesson...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Lesson not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const score = showResults ? calculateScore() : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#e0e0e0" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {lesson.name}
          </Text>
          <Text style={styles.headerSubtitle}>{lesson.topic}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Reading Content */}
        <View style={styles.readingSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reading Passage</Text>
            <TouchableOpacity
              style={styles.translateButton}
              onPress={handleTranslateContent}
              disabled={isTranslating}
            >
              {isTranslating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Languages size={20} color="#fff" />
              )}
              <Text style={styles.translateButtonText}>
                {isTranslating ? "Translating..." : "Translate"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.readingContent}>
            <RenderHTML
              contentWidth={width - 64}
              source={{ html: lesson.readingContent || "<p>No content</p>" }}
              baseStyle={{
                color: "#e0e0e0",
                fontSize: 16,
                lineHeight: 24,
              }}
            />
          </View>

          {/* Translation content displayed below reading */}
          {showTranslation && translatedContent && (
            <View style={styles.translationSection}>
              <Text style={styles.translationSectionTitle}>
                Vietnamese Translation
              </Text>
              <View style={styles.translationContent}>
                <Text style={styles.translationText}>{translatedContent}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Questions */}
        <View style={styles.questionsSection}>
          <Text style={styles.sectionTitle}>Questions</Text>
          {lesson.questions?.map((question, qIndex) => (
            <View key={qIndex} style={styles.questionCard}>
              <Text style={styles.questionText}>
                {qIndex + 1}. {question.questionText}
              </Text>

              {question.options?.map((option, oIndex) => {
                const isSelected = selectedAnswers[qIndex] === oIndex;
                const isCorrect = question.correctAnswerIndex === oIndex;
                const isWrong = showResults && isSelected && !isCorrect;

                return (
                  <TouchableOpacity
                    key={oIndex}
                    style={[styles.optionBase, getOptionStyle(qIndex, oIndex)]}
                    onPress={() => handleSelectAnswer(qIndex, oIndex)}
                    disabled={showResults}
                  >
                    <View style={styles.optionContent}>
                      <View
                        style={[
                          styles.optionRadio,
                          isSelected &&
                            !showResults &&
                            styles.optionRadioSelected,
                          showResults && isCorrect && styles.optionRadioCorrect,
                          isWrong && styles.optionRadioWrong,
                        ]}
                      >
                        {/* Chỉ hiển thị inner dot khi: chưa submit và được chọn, HOẶC sau submit và là đáp án đúng */}
                        {((isSelected && !showResults) ||
                          (showResults && isCorrect)) && (
                          <View
                            style={[
                              styles.optionRadioInner,
                              showResults &&
                                isCorrect && { backgroundColor: "#4CAF50" },
                              !showResults && { backgroundColor: "#2196F3" },
                            ]}
                          />
                        )}
                        {/* Hiển thị inner dot đỏ cho câu trả lời sai */}
                        {isWrong && (
                          <View
                            style={[
                              styles.optionRadioInner,
                              { backgroundColor: "#F44336" },
                            ]}
                          />
                        )}
                      </View>
                      <Text style={styles.optionText}>{option}</Text>
                    </View>
                    {/* {showResults && isCorrect && (
                      <CheckCircle2 size={20} color="#4CAF50" />
                    )} */}
                    {/* {isWrong && <XCircle size={20} color="#F44336" />} */}
                  </TouchableOpacity>
                );
              })}

              {showResults && question.answerText && (
                <View style={styles.explanationBox}>
                  <Text style={styles.explanationTitle}>Explanation:</Text>
                  <Text style={styles.explanationText}>
                    {question.answerText}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Results */}
        {showResults && score && (
          <View style={styles.resultsCard}>
            <Text style={styles.resultsTitle}>Your Score</Text>
            <View style={styles.scoreContainer}>
              <Text style={styles.scorePercentage}>{score.percentage}%</Text>
              <Text style={styles.scoreDetail}>
                {score.correct} / {score.total} correct
              </Text>
            </View>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setSelectedAnswers({});
                setShowResults(false);
              }}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Submit Button */}
      {!showResults && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Answers</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgb(38, 39, 48)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgb(60, 62, 75)",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e0e0e0",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#a0a0a0",
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  readingSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#e0e0e0",
    marginBottom: 12,
  },
  readingContent: {
    backgroundColor: "rgb(50, 52, 65)",
    borderRadius: 12,
    padding: 16,
  },
  questionsSection: {
    padding: 16,
    paddingTop: 0,
  },
  questionCard: {
    backgroundColor: "rgb(50, 52, 65)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e0e0e0",
    marginBottom: 12,
    lineHeight: 24,
  },
  optionBase: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
  },
  option: {
    backgroundColor: "rgb(60, 62, 75)",
    borderColor: "rgb(70, 72, 85)",
  },
  optionSelected: {
    backgroundColor: "#2196F320",
    borderColor: "#2196F3",
  },
  optionCorrect: {
    backgroundColor: "#4CAF5020",
    borderColor: "#4CAF50",
  },
  optionWrong: {
    backgroundColor: "#F4433620",
    borderColor: "#F44336",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#808080",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  optionRadioSelected: {
    borderColor: "#2196F3",
  },
  optionRadioCorrect: {
    borderColor: "#4CAF50",
  },
  optionRadioWrong: {
    borderColor: "#F44336",
  },
  optionRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2196F3",
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: "#e0e0e0",
    lineHeight: 20,
  },
  explanationBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "rgb(70, 72, 85)",
    borderRadius: 8,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64B5F6",
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 14,
    color: "#e0e0e0",
    lineHeight: 20,
  },
  resultsCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: "rgb(50, 52, 65)",
    borderRadius: 12,
    alignItems: "center",
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#e0e0e0",
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  scorePercentage: {
    fontSize: 48,
    fontWeight: "700",
    color: "#4CAF50",
  },
  scoreDetail: {
    fontSize: 16,
    color: "#a0a0a0",
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "rgb(38, 39, 48)",
    borderTopWidth: 1,
    borderTopColor: "rgb(60, 62, 75)",
  },
  submitButton: {
    backgroundColor: "#EC4899",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#a0a0a0",
  },
  errorText: {
    fontSize: 16,
    color: "#F44336",
  },
  bottomPadding: {
    height: 20,
  },
  // Translation styles
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  translateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2196F3",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  translateButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgb(38, 39, 48)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgb(60, 62, 75)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e0e0e0",
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 16,
  },
  translationContent: {
    backgroundColor: "rgb(50, 52, 65)",
    borderRadius: 12,
    padding: 16,
  },
  translationText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#e0e0e0",
  },
  // Translation section styles
  translationSection: {
    marginTop: 16,
    backgroundColor: "rgb(50, 52, 65)",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  translationSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2196F3",
    marginBottom: 12,
  },
});
