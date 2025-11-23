import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  TextInput,
  SafeAreaView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ArrowLeft } from "lucide-react-native";
import { Audio } from "expo-av";
import API from "../../api/index";
import { useAuth } from "../../contexts/AuthContext";
import { useAchievementContext } from "../../contexts/AchievementContext";
import type { Lesson as BaseLessonType } from "../../types";

interface ListeningQuestion {
  _id: string;
  audioFileId?: string;
  answerText: string;
}

interface ListeningLesson extends Omit<BaseLessonType, "questions"> {
  questions: ListeningQuestion[];
}

export default function ListeningPractice() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const lessonId = params.lessonId as string;
  const lessonTitle = params.lessonTitle as string;
  const { user, isLoading: authLoading } = useAuth();
  const { completeLessonWithAchievementCheck } = useAchievementContext();

  const [loading, setLoading] = useState(false);
  const [lesson, setLesson] = useState<ListeningLesson | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [checkedAnswers, setCheckedAnswers] = useState<boolean[]>([]);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState<boolean[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [soundEffect, setSoundEffect] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    fetchLesson();
    return () => {
      // Cleanup audio when component unmounts
      if (sound) {
        sound.unloadAsync();
      }
      if (soundEffect) {
        soundEffect.unloadAsync();
      }
    };
  }, [lessonId]);

  async function fetchLesson() {
    try {
      setLoading(true);
      console.log("Fetching lesson:", lessonId);
      const response = await API.getLessonById(lessonId);
      console.log("Lesson response:", response);

      const lessonData = response.data || response;
      setLesson(lessonData as unknown as ListeningLesson);

      // Initialize user answers array
      setUserAnswers(new Array(lessonData.questions?.length || 0).fill(""));
      setCheckedAnswers(
        new Array(lessonData.questions?.length || 0).fill(false)
      );
      setShowCorrectAnswer(
        new Array(lessonData.questions?.length || 0).fill(false)
      );

      // Set current lesson when user opens the lesson
      if (user?._id && lessonId) {
        try {
          await API.updateCurrentLesson(user._id, lessonId, "listening", 0);
          console.log("✅ Current lesson set to listening:", lessonId);
        } catch (error) {
          console.error("Error setting current lesson:", error);
        }
      }
    } catch (err) {
      console.error("Failed to fetch lesson", err);
      Alert.alert("Error", "Failed to load lesson");
    } finally {
      setLoading(false);
    }
  }

  async function playAudio(audioFileId: string) {
    try {
      // Stop current sound if playing
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      setIsPlaying(true);

      // Get audio URL from API
      const audioUrl = `${API.BASE_URL}/api/audio/${audioFileId}`;
      console.log("Playing audio:", audioUrl);

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );

      setSound(newSound);

      // Set up playback status update
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error("Error playing audio:", error);
      Alert.alert("Error", "Failed to play audio");
      setIsPlaying(false);
    }
  }

  async function stopAudio() {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  }

  async function playSoundEffect(soundFile: string) {
    try {
      // Unload previous sound effect if exists
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

      // Auto cleanup after playing
      newSoundEffect.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          newSoundEffect.unloadAsync();
          setSoundEffect(null);
        }
      });
    } catch (error) {
      console.error("Error playing sound effect:", error);
    }
  }

  function handleAnswerChange(text: string) {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = text;
    setUserAnswers(newAnswers);

    // Reset checked status when user changes answer
    const newChecked = [...checkedAnswers];
    newChecked[currentQuestionIndex] = false;
    setCheckedAnswers(newChecked);

    // Reset show correct answer
    const newShowCorrect = [...showCorrectAnswer];
    newShowCorrect[currentQuestionIndex] = false;
    setShowCorrectAnswer(newShowCorrect);
  }

  function checkCurrentAnswer() {
    if (!lesson) return;

    const newChecked = [...checkedAnswers];
    newChecked[currentQuestionIndex] = true;
    setCheckedAnswers(newChecked);

    // Play sound effect based on answer correctness
    const isCorrect = isCurrentAnswerCorrect();
    playSoundEffect(isCorrect ? "correct" : "incorrect");
  }

  function isCurrentAnswerCorrect(): boolean {
    if (!lesson) return false;
    const userAnswer = userAnswers[currentQuestionIndex]?.trim().toLowerCase();
    const correctAnswer = lesson.questions[currentQuestionIndex].answerText
      ?.trim()
      .toLowerCase();
    return userAnswer === correctAnswer;
  }

  // Levenshtein distance algorithm
  function levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];

    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    return matrix[len1][len2];
  }

  // Compare words and determine color
  function compareWords(
    userWord: string,
    correctWord: string
  ): "correct" | "close" | "wrong" {
    const userLower = userWord.toLowerCase();
    const correctLower = correctWord.toLowerCase();

    if (userLower === correctLower) return "correct";

    const distance = levenshteinDistance(userLower, correctLower);
    const maxLen = Math.max(userLower.length, correctLower.length);
    const similarity = 1 - distance / maxLen;

    // If similarity > 70%, consider it "close"
    if (similarity >= 0.7) return "close";

    return "wrong";
  }

  // Render user answer with colored words
  function renderColoredAnswer(userAnswer: string, correctAnswer: string) {
    const userWords = userAnswer.trim().split(/\s+/);
    const correctWords = correctAnswer.trim().split(/\s+/);
    const maxLength = Math.max(userWords.length, correctWords.length);

    const renderedWords = [];

    for (let i = 0; i < maxLength; i++) {
      const userWord = userWords[i] || "";
      const correctWord = correctWords[i] || "";

      if (!userWord && correctWord) {
        // Missing word
        renderedWords.push(
          <Text key={i} style={styles.wrongWord}>
            {"*".repeat(correctWord.length)}{" "}
          </Text>
        );
      } else if (userWord && !correctWord) {
        // Extra word
        renderedWords.push(
          <Text key={i} style={styles.wrongWord}>
            {"*".repeat(userWord.length)}{" "}
          </Text>
        );
      } else {
        const comparison = compareWords(userWord, correctWord);

        if (comparison === "correct") {
          renderedWords.push(
            <Text key={i} style={styles.correctWord}>
              {userWord}{" "}
            </Text>
          );
        } else if (comparison === "close") {
          renderedWords.push(
            <Text key={i} style={styles.closeWord}>
              {userWord}{" "}
            </Text>
          );
        } else {
          renderedWords.push(
            <Text key={i} style={styles.wrongWord}>
              {"*".repeat(userWord.length)}{" "}
            </Text>
          );
        }
      }
    }

    return <Text>{renderedWords}</Text>;
  }

  function toggleShowCorrectAnswer() {
    const newShowCorrect = [...showCorrectAnswer];
    newShowCorrect[currentQuestionIndex] =
      !newShowCorrect[currentQuestionIndex];
    setShowCorrectAnswer(newShowCorrect);
  }

  function goToNextQuestion() {
    if (currentQuestionIndex < (lesson?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      stopAudio();
    }
  }

  function goToPreviousQuestion() {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      stopAudio();
    }
  }

  function handleSubmit() {
    // Check if all questions are answered
    const unanswered = userAnswers.filter((a) => !a.trim()).length;

    if (unanswered > 0) {
      Alert.alert(
        "Incomplete",
        `You have ${unanswered} unanswered question${
          unanswered > 1 ? "s" : ""
        }. Do you want to submit anyway?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Submit",
            onPress: async () => {
              setShowResults(true);
              // Update progress
              await updateLessonProgress();
            },
          },
        ]
      );
    } else {
      setShowResults(true);
      // Update progress
      updateLessonProgress();
    }
  }

  async function updateLessonProgress() {
    try {
      if (user?._id && lessonId) {
        // Calculate score
        const score = calculateScore();

        const newAchievements = await completeLessonWithAchievementCheck(
          lessonId,
          "listening",
          score.percentage // ✅ Pass score
        );
        console.log("Listening lesson completed, progress updated!");

        // Navigate to achievement page if any achievements were unlocked
        if (newAchievements && newAchievements.length > 0) {
          console.log(
            "Navigating to achievement page with:",
            newAchievements[0]
          );
          setTimeout(() => {
            router.push({
              pathname: "/(achievements)/achievement-unlocked",
              params: {
                achievement: JSON.stringify(newAchievements[0]),
              },
            });
          }, 800); // Small delay to show results first
        }
      }
    } catch (error) {
      console.error("Error updating lesson progress:", error);
      // Không hiện lỗi cho user
    }
  }

  function calculateScore() {
    if (!lesson) return { correct: 0, total: 0, percentage: 0 };

    let correct = 0;
    lesson.questions.forEach((q: ListeningQuestion, index: number) => {
      const userAnswer = userAnswers[index]?.trim().toLowerCase();
      const correctAnswer = q.answerText?.trim().toLowerCase();

      if (userAnswer === correctAnswer) {
        correct++;
      }
    });

    const total = lesson.questions.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    return { correct, total, percentage };
  }

  function resetPractice() {
    setUserAnswers(new Array(lesson?.questions.length || 0).fill(""));
    setCheckedAnswers(new Array(lesson?.questions.length || 0).fill(false));
    setShowCorrectAnswer(new Array(lesson?.questions.length || 0).fill(false));
    setCurrentQuestionIndex(0);
    setShowResults(false);
    stopAudio();
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Loading lesson...</Text>
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.errorState}>
        <Ionicons name="alert-circle" size={64} color="#666" />
        <Text style={styles.errorText}>Lesson not found</Text>
      </View>
    );
  }

  const currentQuestion = lesson.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / lesson.questions.length) * 100;

  if (showResults) {
    const score = calculateScore();

    return (
      <ScrollView style={styles.container}>
        <View style={styles.resultsContainer}>
          <View style={styles.scoreCard}>
            <Text style={styles.resultsTitle}>Results</Text>
            <View style={styles.scoreCircle}>
              <Text style={styles.scorePercentage}>{score.percentage}%</Text>
            </View>
            <Text style={styles.scoreText}>
              {score.correct} / {score.total} correct
            </Text>
          </View>

          <View style={styles.answersReview}>
            <Text style={styles.reviewTitle}>Review Answers</Text>
            {lesson.questions.map((q: ListeningQuestion, index: number) => {
              const userAnswer = userAnswers[index]?.trim();
              const correctAnswer = q.answerText?.trim();
              const isCorrect =
                userAnswer.toLowerCase() === correctAnswer.toLowerCase();

              return (
                <View key={q._id} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewQuestionNumber}>
                      Question {index + 1}
                    </Text>
                    <Ionicons
                      name={isCorrect ? "checkmark-circle" : "close-circle"}
                      size={24}
                      color={isCorrect ? "#10B981" : "#EF4444"}
                    />
                  </View>

                  <View style={styles.reviewAnswers}>
                    <View style={styles.answerRow}>
                      <Text style={styles.answerLabel}>Your answer:</Text>
                      <Text
                        style={[
                          styles.answerValue,
                          isCorrect ? styles.correctAnswer : styles.wrongAnswer,
                        ]}
                      >
                        {userAnswer || "(No answer)"}
                      </Text>
                    </View>

                    {!isCorrect && (
                      <View style={styles.answerRow}>
                        <Text style={styles.answerLabel}>Correct answer:</Text>
                        <Text
                          style={[styles.answerValue, styles.correctAnswer]}
                        >
                          {correctAnswer}
                        </Text>
                      </View>
                    )}
                  </View>

                  {q.audioFileId && (
                    <TouchableOpacity
                      style={styles.playAgainButton}
                      onPress={() => playAudio(q.audioFileId!)}
                    >
                      <Ionicons name="play" size={16} color="#8B5CF6" />
                      <Text style={styles.playAgainText}>Listen again</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>

          <View style={styles.resultActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.retryButton]}
              onPress={resetPractice}
            >
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.homeButton]}
              onPress={() => router.back()}
            >
              <Ionicons name="home" size={20} color="#8B5CF6" />
              <Text style={[styles.actionButtonText, { color: "#8B5CF6" }]}>
                Back to Lessons
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

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
            {lesson?.name || "Listening Practice"}
          </Text>
          <Text style={styles.headerSubtitle}>
            {lesson?.topic || "Practice"}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Question {currentQuestionIndex + 1} of {lesson.questions.length}
        </Text>
      </View>

      {/* Question Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.questionCard}>
          <Text style={styles.questionNumber}>
            Question {currentQuestionIndex + 1}
          </Text>

          {/* Audio Player */}
          {currentQuestion.audioFileId && (
            <View style={styles.audioPlayer}>
              <TouchableOpacity
                style={styles.playButton}
                onPress={() =>
                  isPlaying
                    ? stopAudio()
                    : playAudio(currentQuestion.audioFileId!)
                }
              >
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={48}
                  color="#fff"
                />
              </TouchableOpacity>
              <Text style={styles.audioHint}>
                {isPlaying ? "Playing..." : "Tap to listen"}
              </Text>
            </View>
          )}

          {/* Answer Input */}
          <View style={styles.answerSection}>
            <Text style={styles.answerLabel}>Your Answer:</Text>
            <TextInput
              style={styles.answerInput}
              value={userAnswers[currentQuestionIndex]}
              onChangeText={handleAnswerChange}
              placeholder="Type what you hear..."
              placeholderTextColor="#666"
              multiline
              autoCorrect={false}
              autoCapitalize="none"
            />

            {/* Check Answer Button */}
            <TouchableOpacity
              style={styles.checkButton}
              onPress={checkCurrentAnswer}
              disabled={!userAnswers[currentQuestionIndex]?.trim()}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#fff"
              />
              <Text style={styles.checkButtonText}>Check Answer</Text>
            </TouchableOpacity>

            {/* Feedback */}
            {checkedAnswers[currentQuestionIndex] && (
              <View
                style={[
                  styles.feedbackContainer,
                  isCurrentAnswerCorrect()
                    ? styles.correctFeedback
                    : styles.incorrectFeedback,
                ]}
              >
                <Ionicons
                  name={
                    isCurrentAnswerCorrect()
                      ? "checkmark-circle"
                      : "close-circle"
                  }
                  size={24}
                  color={isCurrentAnswerCorrect() ? "#10B981" : "#EF4444"}
                />
                <View style={styles.feedbackTextContainer}>
                  {isCurrentAnswerCorrect() ? (
                    <Text style={styles.feedbackText}>Correct! Well done!</Text>
                  ) : (
                    <>
                      <Text style={styles.feedbackText}>Your answer:</Text>
                      <View style={styles.coloredAnswerContainer}>
                        {renderColoredAnswer(
                          userAnswers[currentQuestionIndex],
                          lesson?.questions[currentQuestionIndex].answerText ||
                            ""
                        )}
                      </View>

                      {/* Show/Hide Answer Button */}
                      <TouchableOpacity
                        style={styles.showAnswerButton}
                        onPress={toggleShowCorrectAnswer}
                      >
                        <Ionicons
                          name={
                            showCorrectAnswer[currentQuestionIndex]
                              ? "eye-off"
                              : "eye"
                          }
                          size={16}
                          color="#EF4444"
                        />
                        <Text style={styles.showAnswerButtonText}>
                          {showCorrectAnswer[currentQuestionIndex]
                            ? "Hide answer"
                            : "Show answer"}
                        </Text>
                      </TouchableOpacity>

                      {/* Correct Answer (only shown when toggled) */}
                      {showCorrectAnswer[currentQuestionIndex] && (
                        <View style={styles.correctAnswerContainer}>
                          <Text style={styles.correctAnswerLabel}>
                            Correct answer:
                          </Text>
                          <Text style={styles.correctAnswerText}>
                            {lesson?.questions[currentQuestionIndex].answerText}
                          </Text>
                        </View>
                      )}
                    </>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentQuestionIndex === 0 && styles.navButtonDisabled,
          ]}
          onPress={goToPreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={currentQuestionIndex === 0 ? "#666" : "#fff"}
          />
          <Text
            style={[
              styles.navButtonText,
              currentQuestionIndex === 0 && styles.navButtonTextDisabled,
            ]}
          >
            Previous
          </Text>
        </TouchableOpacity>

        {currentQuestionIndex === lesson.questions.length - 1 ? (
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
            <Ionicons name="checkmark" size={24} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.navButton} onPress={goToNextQuestion}>
            <Text style={styles.navButtonText}>Next</Text>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
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
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgb(38, 39, 48)",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 10,
  },
  errorState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgb(38, 39, 48)",
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginTop: 16,
  },
  progressContainer: {
    padding: 16,
    backgroundColor: "#3c3d47",
    borderBottomWidth: 1,
    borderBottomColor: "#4a4b55",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#4a4b55",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#8B5CF6",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  questionCard: {
    backgroundColor: "#3c3d47",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#4a4b55",
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8B5CF6",
    marginBottom: 20,
  },
  audioPlayer: {
    alignItems: "center",
    paddingVertical: 40,
    marginBottom: 30,
  },
  playButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#8B5CF6",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  audioHint: {
    fontSize: 14,
    color: "#999",
    marginTop: 16,
  },
  answerSection: {
    marginTop: 20,
  },
  answerLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
  },
  answerInput: {
    backgroundColor: "#2a2b33",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#fff",
    minHeight: 100,
    textAlignVertical: "top",
    borderWidth: 2,
    borderColor: "#4a4b55",
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#3c3d47",
    borderTopWidth: 1,
    borderTopColor: "#4a4b55",
    gap: 12,
  },
  navButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4a4b55",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  navButtonTextDisabled: {
    color: "#666",
  },
  submitButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8B5CF6",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  resultsContainer: {
    padding: 16,
  },
  scoreCard: {
    backgroundColor: "#3c3d47",
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#4a4b55",
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 20,
  },
  scoreCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  scorePercentage: {
    fontSize: 48,
    fontWeight: "700",
    color: "#fff",
  },
  scoreText: {
    fontSize: 18,
    color: "#999",
  },
  answersReview: {
    marginBottom: 20,
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
  },
  reviewItem: {
    backgroundColor: "#3c3d47",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#4a4b55",
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  reviewQuestionNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  reviewAnswers: {
    gap: 8,
  },
  answerRow: {
    marginBottom: 8,
  },
  //   answerLabel: {
  //     fontSize: 14,
  //     color: "#999",
  //     marginBottom: 4,
  //   },
  answerValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  correctAnswer: {
    color: "#10B981",
  },
  wrongAnswer: {
    color: "#EF4444",
  },
  playAgainButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#4a4b55",
  },
  playAgainText: {
    fontSize: 14,
    color: "#8B5CF6",
    fontWeight: "500",
  },
  resultActions: {
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  retryButton: {
    backgroundColor: "#8B5CF6",
  },
  homeButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#8B5CF6",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  checkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8B5CF6",
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  checkButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  feedbackContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 12,
  },
  correctFeedback: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderWidth: 1,
    borderColor: "#10B981",
  },
  incorrectFeedback: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  feedbackTextContainer: {
    flex: 1,
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  correctAnswerText: {
    fontSize: 14,
    color: "#10B981",
  },
  showAnswerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingVertical: 4,
  },
  showAnswerButtonText: {
    fontSize: 14,
    color: "#EF4444",
    fontWeight: "500",
  },
  coloredAnswerContainer: {
    marginTop: 8,
    marginBottom: 8,
    padding: 12,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 8,
  },
  correctWord: {
    color: "#10B981",
    fontWeight: "600",
  },
  closeWord: {
    color: "#F59E0B",
    fontWeight: "600",
  },
  wrongWord: {
    color: "#EF4444",
    fontWeight: "600",
  },
  correctAnswerContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#10B981",
  },
  correctAnswerLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
});
