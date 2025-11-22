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
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, MessageCircle, X, Send } from "lucide-react-native";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import RenderHTML from "react-native-render-html";
import API from "../../api";
import type { GrammarLesson } from "../../types";
import { useAuth } from "../../contexts/AuthContext";

// Component to render AI response with basic markdown formatting
const MarkdownText = ({ text }: { text: string }) => {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|\n)/g);

  return (
    <Text style={styles.responseText}>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          // Bold text
          return (
            <Text
              key={index}
              style={[styles.responseText, { fontWeight: "bold" }]}
            >
              {part.slice(2, -2)}
            </Text>
          );
        } else if (part.startsWith("*") && part.endsWith("*")) {
          // Italic text
          return (
            <Text
              key={index}
              style={[styles.responseText, { fontStyle: "italic" }]}
            >
              {part.slice(1, -1)}
            </Text>
          );
        } else if (part === "\n") {
          // Line break
          return <Text key={index}>{"\n"}</Text>;
        } else {
          // Regular text
          return (
            <Text key={index} style={styles.responseText}>
              {part}
            </Text>
          );
        }
      })}
    </Text>
  );
};

export default function GrammarLessonDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { user } = useAuth();

  const [lesson, setLesson] = useState<GrammarLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: number;
  }>({});
  const [soundEffect, setSoundEffect] = useState<Audio.Sound | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<
    number | null
  >(null);
  const [isAskingAI, setIsAskingAI] = useState(false);
  const [aiResponse, setAiResponse] = useState("");

  const fetchLesson = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching grammar lesson with ID:", id);
      const response = await API.getLessonById(id as string);
      console.log("Grammar lesson fetched successfully:", response.data?.name);
      setLesson(response.data as GrammarLesson);
    } catch (error) {
      console.error("Error fetching grammar lesson:", error);
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
    return () => {
      if (soundEffect) {
        soundEffect.unloadAsync();
      }
    };
  }, [fetchLesson]);

  const playSoundEffect = async (soundFile: string) => {
    try {
      if (soundEffect) {
        await soundEffect.unloadAsync();
        setSoundEffect(null);
      }

      const { sound: newSoundEffect } = await Audio.Sound.createAsync(
        soundFile === "correct"
          ? require("../../assets/sounds/correct.mp3")
          : soundFile === "incorrect"
          ? require("../../assets/sounds/incorrect.mp3")
          : require("../../assets/sounds/complete.mp3"),
        { shouldPlay: true }
      );

      setSoundEffect(newSoundEffect);

      newSoundEffect.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          newSoundEffect.unloadAsync();
          setSoundEffect(null);
        }
      });
    } catch (error) {
      console.error("Error playing sound effect:", error);
    }
  };

  const handleSelectAnswer = (questionIndex: number, optionIndex: number) => {
    // Prevent re-selection for already answered questions
    if (selectedAnswers[questionIndex] !== undefined) return;

    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: optionIndex,
    });

    // Play sound effect immediately when answer is selected
    const question = lesson?.questions?.[questionIndex];
    if (question && question.correctAnswerIndex !== undefined) {
      const isCorrect = optionIndex === question.correctAnswerIndex;
      playSoundEffect(isCorrect ? "correct" : "incorrect");
    }
  };

  const askAITutor = (questionIndex: number) => {
    setCurrentQuestionIndex(questionIndex);
    const question = lesson?.questions?.[questionIndex];
    if (question) {
      setAiQuestion(
        `Explain this grammar question: "${question.questionText}"`
      );
    }
    setShowAIModal(true);
  };

  const handleAskAI = async () => {
    if (!aiQuestion.trim()) return;

    setIsAskingAI(true);
    try {
      const response = await API.sendMessageToAI(
        aiQuestion + " vietnamese",
        "grammar-student"
      );
      setAiResponse(response.reply);
    } catch (error) {
      console.error("Error asking AI:", error);
      Alert.alert("Error", "Failed to get AI response. Please try again.");
    } finally {
      setIsAskingAI(false);
    }
  };

  const handleSubmit = async () => {
    const totalQuestions = lesson?.questions?.length || 0;
    const answeredQuestions = Object.keys(selectedAnswers).length;

    if (answeredQuestions < totalQuestions) {
      Alert.alert(
        "Incomplete",
        `You have answered ${answeredQuestions} out of ${totalQuestions} questions. Please answer all questions.`
      );
      return;
    }

    playSoundEffect("complete");

    // Calculate score
    const score = calculateScore();

    // 🆕 Update currentLesson progress to 100%
    if (user?._id) {
      try {
        await API.updateCurrentLesson(
          user._id as any,
          id as string,
          "grammar",
          100
        );

        // 🆕 Mark lesson as completed if score >= 70%
        if (score.percentage >= 70) {
          await API.completeLesson(user._id as any, id as string, "grammar");
          console.log("✅ Grammar lesson marked as completed");
        }
      } catch (error) {
        console.error("Error updating progress:", error);
      }
    }

    // Navigate to results screen
    router.push({
      pathname: "/(grammar)/results",
      params: {
        lessonId: id,
        lessonName: lesson?.name || "Grammar Lesson",
        score: score.percentage.toString(),
        correct: score.correct.toString(),
        total: score.total.toString(),
      },
    } as any);
  };

  const calculateScore = () => {
    if (!lesson?.questions) return { correct: 0, total: 0, percentage: 0 };

    let correct = 0;
    lesson.questions.forEach((question: any, index: number) => {
      if (selectedAnswers[index] === question.correctAnswerIndex) {
        correct++;
      }
    });

    const total = lesson.questions.length;
    const percentage = Math.round((correct / total) * 100);

    return { correct, total, percentage };
  };

  const getOptionStyle = (questionIndex: number, optionIndex: number) => {
    const isSelected = selectedAnswers[questionIndex] === optionIndex;
    return isSelected ? styles.optionSelected : styles.option;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F59E0B" />
          <Text style={styles.loadingText}>Loading grammar lesson...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Grammar lesson not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/(grammar)" as any)}
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
        {/* Grammar Content */}
        {lesson.readingContent && (
          <View style={styles.grammarSection}>
            <Text style={styles.sectionTitle}>Grammar Explanation</Text>
            <View style={styles.grammarContent}>
              <RenderHTML
                contentWidth={width - 64}
                source={{ html: lesson.readingContent }}
                baseStyle={{
                  color: "#e0e0e0",
                  fontSize: 16,
                  lineHeight: 24,
                }}
                tagsStyles={{
                  h2: {
                    color: "#F59E0B",
                    fontSize: 20,
                    fontWeight: "bold",
                    marginBottom: 8,
                  },
                  h3: {
                    color: "#F59E0B",
                    fontSize: 18,
                    fontWeight: "bold",
                    marginBottom: 6,
                  },
                  p: { marginBottom: 12, lineHeight: 22 },
                  strong: { fontWeight: "bold", color: "#e0e0e0" },
                  em: { fontStyle: "italic", color: "#a0a0a0" },
                }}
              />
            </View>
          </View>
        )}

        {/* Questions */}
        <View style={styles.questionsSection}>
          <Text style={styles.sectionTitle}>Practice Questions</Text>
          {lesson.questions?.map((question: any, qIndex: number) => (
            <View key={qIndex} style={styles.questionCard}>
              <Text style={styles.questionText}>
                {qIndex + 1}. {question.questionText}
              </Text>

              {question.options?.map((option: string, oIndex: number) => {
                const isSelected = selectedAnswers[qIndex] === oIndex;
                const isCorrect = question.correctAnswerIndex === oIndex;
                const hasAnswered = selectedAnswers[qIndex] !== undefined;
                const isWrong = isSelected && !isCorrect;

                // Show immediate feedback after selection
                let optionStyle = styles.option;
                let radioStyleExtra = {};
                let radioInnerColor = "#F59E0B";

                if (hasAnswered) {
                  if (isSelected) {
                    if (isCorrect) {
                      optionStyle = styles.optionCorrect;
                      radioStyleExtra = styles.optionRadioCorrect;
                      radioInnerColor = "#10B981";
                    } else {
                      optionStyle = styles.optionWrong;
                      radioStyleExtra = styles.optionRadioWrong;
                      radioInnerColor = "#F44336";
                    }
                  }
                } else if (isSelected) {
                  optionStyle = styles.optionSelected;
                  radioStyleExtra = styles.optionRadioSelected;
                }

                return (
                  <TouchableOpacity
                    key={oIndex}
                    style={[styles.optionBase, optionStyle]}
                    onPress={() => handleSelectAnswer(qIndex, oIndex)}
                    disabled={hasAnswered}
                  >
                    <View style={styles.optionContent}>
                      <View style={[styles.optionRadio, radioStyleExtra]}>
                        {isSelected && (
                          <View
                            style={[
                              styles.optionRadioInner,
                              { backgroundColor: radioInnerColor },
                            ]}
                          />
                        )}
                      </View>
                      <Text style={styles.optionText}>{option}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* bearTeacher Button */}
              {selectedAnswers[qIndex] !== undefined && (
                <TouchableOpacity
                  style={styles.aiButton}
                  onPress={() => askAITutor(qIndex)}
                >
                  <MessageCircle size={16} color="#F59E0B" />
                  <Text style={styles.aiButtonText}>Ask bearTeacher</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Answers</Text>
        </TouchableOpacity>
      </View>

      {/* AI Tutor Modal */}
      <Modal
        visible={showAIModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAIModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>bearTeacher - Grammar Tutor</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowAIModal(false)}
            >
              <X size={24} color="#e0e0e0" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Ask your grammar question:</Text>
              <TextInput
                style={styles.textInput}
                value={aiQuestion}
                onChangeText={setAiQuestion}
                placeholder="Type your question here..."
                placeholderTextColor="#666"
                multiline
                numberOfLines={3}
              />
              <TouchableOpacity
                style={[
                  styles.askButton,
                  isAskingAI && styles.askButtonDisabled,
                ]}
                onPress={handleAskAI}
                disabled={isAskingAI}
              >
                {isAskingAI ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Send size={16} color="#fff" />
                )}
                <Text style={styles.askButtonText}>
                  {isAskingAI ? "Asking..." : "Ask bearTeacher"}
                </Text>
              </TouchableOpacity>
            </View>

            {aiResponse && (
              <View style={styles.responseContainer}>
                <Text style={styles.responseTitle}>bearTeacher Response:</Text>
                <MarkdownText text={aiResponse} />
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  grammarSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#e0e0e0",
    marginBottom: 12,
  },
  grammarContent: {
    backgroundColor: "rgb(50, 52, 65)",
    borderRadius: 12,
    padding: 16,
  },
  grammarText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#e0e0e0",
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
    backgroundColor: "#F59E0B20",
    borderColor: "#F59E0B",
  },
  optionCorrect: {
    backgroundColor: "#10B98120",
    borderColor: "#10B981",
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
    borderColor: "#F59E0B",
  },
  optionRadioCorrect: {
    borderColor: "#10B981",
  },
  optionRadioWrong: {
    borderColor: "#F44336",
  },
  optionRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
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
    color: "#F59E0B",
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 14,
    color: "#e0e0e0",
    lineHeight: 20,
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
    backgroundColor: "#F59E0B",
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
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderColor: "#F59E0B",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
    alignSelf: "flex-start",
    gap: 6,
  },
  aiButtonText: {
    color: "#F59E0B",
    fontSize: 12,
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
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e0e0e0",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "rgb(50, 52, 65)",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#e0e0e0",
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  askButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F59E0B",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    alignSelf: "flex-start",
  },
  askButtonDisabled: {
    opacity: 0.6,
  },
  askButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  responseContainer: {
    backgroundColor: "rgb(50, 52, 65)",
    borderRadius: 12,
    padding: 16,
  },
  responseTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F59E0B",
    marginBottom: 8,
  },
  responseText: {
    fontSize: 14,
    color: "#e0e0e0",
    lineHeight: 22,
  },
});
