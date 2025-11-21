import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
  Animated,
  Dimensions,
} from "react-native";
import { Audio } from "expo-av";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import VocabularyCard from "./VocabularyCard";
import API from "../../api";
import { useAuth } from "../../contexts/AuthContext";
import { useAchievementContext } from "../../contexts/AchievementContext";
import { AchievementModalWrapper } from "../../components/AchievementModalWrapper";
import type {
  Word,
  PronounResponse,
  StageStats,
  MatchingItem,
  FeedbackType,
} from "../../types";

// Animated Confetti Piece Component
const ConfettiPiece = ({
  index,
  screenWidth,
  screenHeight,
}: {
  index: number;
  screenWidth: number;
  screenHeight: number;
}) => {
  const animatedY = useRef(new Animated.Value(-100)).current;
  const animatedRotation = useRef(new Animated.Value(0)).current;

  const colors = [
    "#FFD700",
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
  ];

  React.useEffect(() => {
    const startAnimation = () => {
      animatedY.setValue(-100);
      animatedRotation.setValue(0);

      Animated.parallel([
        Animated.timing(animatedY, {
          toValue: screenHeight + 100,
          duration: 3000 + Math.random() * 2000,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.timing(animatedRotation, {
            toValue: 1,
            duration: 1000 + Math.random() * 1000,
            useNativeDriver: true,
          })
        ),
      ]).start(() => {
        setTimeout(startAnimation, Math.random() * 2000);
      });
    };

    setTimeout(startAnimation, index * 50);
  }, [animatedY, animatedRotation, index, screenHeight]);

  const rotate = animatedRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: Math.random() * screenWidth,
          width: 8 + Math.random() * 4,
          height: 12 + Math.random() * 6,
          backgroundColor: colors[Math.floor(Math.random() * colors.length)],
          borderRadius: Math.random() > 0.5 ? 4 : 0,
          zIndex: 1000,
          transform: [{ translateY: animatedY }, { rotate }],
        },
      ]}
    />
  );
};

// Animated Confetti Component
const AnimatedConfetti = () => {
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  return (
    <View style={styles.confettiContainer}>
      {Array.from({ length: 60 }, (_, index) => (
        <ConfettiPiece
          key={index}
          index={index}
          screenWidth={screenWidth}
          screenHeight={screenHeight}
        />
      ))}
    </View>
  );
};

export default function VocabularyStudy() {
  const params = useLocalSearchParams();
  const lessonId = (params.lessonId as string) || undefined;
  const lessonTitle = (params.lessonTitle as string) || "Học từ vựng";
  const { user, isLoading: authLoading } = useAuth();

  // Core states
  const [stage, setStage] = useState<number>(1);
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [currentWords, setCurrentWords] = useState<Word[]>([]);
  const [completedWords, setCompletedWords] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [roundCount, setRoundCount] = useState<number>(1);

  // Loading states
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Stage 1 (Flash Card) states
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [flipAnimations, setFlipAnimations] = useState<
    Map<string, Animated.Value>
  >(new Map());

  // Stage 2 (Matching) states
  const [leftItems, setLeftItems] = useState<Word[]>([]);
  const [rightItems, setRightItems] = useState<{ id: string; text: string }[]>(
    []
  );
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());

  // Stage 3 (Pronunciation) states
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Stage 4 (Typing) states
  const [typeAnswer, setTypeAnswer] = useState<string>("");
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [feedbackType, setFeedbackType] = useState<
    "correct" | "incorrect" | null
  >(null);

  // Statistics tracking for summary
  const [stageStats, setStageStats] = useState<{
    [key: number]: { correct: number; incorrect: number };
  }>({
    1: { correct: 0, incorrect: 0 },
    2: { correct: 0, incorrect: 0 },
    3: { correct: 0, incorrect: 0 },
    4: { correct: 0, incorrect: 0 },
  });

  // Animation values
  const correctScale = useSharedValue(1);
  const incorrectShake = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const feedbackOpacity = useSharedValue(0);

  // --- Animations
  const animateCorrect = () => {
    correctScale.value = withSequence(
      withTiming(1.18, { duration: 140 }),
      withSpring(1, { damping: 10, stiffness: 120 })
    );
  };

  const animateIncorrect = () => {
    incorrectShake.value = withSequence(
      withTiming(-8, { duration: 45 }),
      withTiming(8, { duration: 45 }),
      withTiming(-4, { duration: 45 }),
      withTiming(0, { duration: 45 })
    );
  };

  const showFeedbackAnimation = (type: "correct" | "incorrect") => {
    setFeedbackType(type);
    setShowFeedback(true);
    feedbackOpacity.value = withSequence(
      withTiming(1, { duration: 180 }),
      withTiming(1, { duration: 800 }),
      withTiming(0, { duration: 180 })
    );

    setTimeout(() => setShowFeedback(false), 1200);
  };

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const feedbackAnimatedStyle = useAnimatedStyle(() => ({
    opacity: feedbackOpacity.value,
  }));

  // --- Utilities
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const setupMatchingGame = useCallback(() => {
    if (currentWords.length === 0) {
      setLeftItems([]);
      setRightItems([]);
      return;
    }

    const words = shuffleArray(currentWords.map((w) => ({ ...w })));
    const definitions = shuffleArray(
      words.map((w) => ({ id: w._id, text: w.definition }))
    );

    setLeftItems(words);
    setRightItems(definitions);
    setMatchedPairs(new Set());
    setSelectedLeft(null);
    setSelectedRight(null);
  }, [currentWords]);

  const resetStage = useCallback(
    (newStage: number) => {
      setCurrentIndex(0);
      setRoundCount(1);

      switch (newStage) {
        case 1:
          setFlippedCards(new Set());
          setFlipAnimations(new Map());
          break;
        case 2:
          setupMatchingGame();
          break;
        case 3:
          setRecording(null);
          setIsRecording(false);
          setUploading(false);
          break;
        case 4:
          setTypeAnswer("");
          setShowFeedback(false);
          setFeedbackType(null);
          break;
      }
    },
    [setupMatchingGame]
  );

  // --- Fetch data
  useEffect(() => {
    if (!lessonId) {
      setError("Không có lesson ID được cung cấp");
      setLoading(false);
      return;
    }

    const fetchVocabularies = async () => {
      try {
        setLoading(true);
        setError(null);

        const words = await API.fetchVocabulariesForStudy(lessonId);
        setAllWords(words);
        setCurrentWords(words);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "Không thể tải từ vựng. Vui lòng thử lại."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVocabularies();
  }, [lessonId]);

  // When currentWords updated and we are in stage 2, (re)setup matching
  useEffect(() => {
    if (stage === 2) setupMatchingGame();
  }, [currentWords, stage, setupMatchingGame]);

  // --- Stage 1: Flashcards
  const handleStage1Answer = (remembered: boolean) => {
    const currentWord = currentWords[currentIndex];
    if (!currentWord) return;

    // Use local copy to ensure immediate decision
    let newCompleted = new Set(completedWords);
    if (remembered) {
      newCompleted.add(currentWord._id);
      setCompletedWords(new Set(newCompleted));
      updateStats(stage, true);
      playCorrectSound();
      animateCorrect();
      showFeedbackAnimation("correct");
    } else {
      updateStats(stage, false);
      playIncorrectSound();
      animateIncorrect();
      showFeedbackAnimation("incorrect");
    }

    const nextIndex = currentIndex + 1;

    setTimeout(() => {
      if (nextIndex >= currentWords.length) {
        const allCompleted = newCompleted.size >= allWords.length;
        if (!allCompleted) {
          const incompleteWords = allWords.filter(
            (w) => !newCompleted.has(w._id)
          );
          setCurrentWords(incompleteWords);
          setCurrentIndex(0);
          setRoundCount((r) => r + 1);
          Alert.alert(
            "Cần ôn tập thêm",
            `Bạn cần ôn tập lại ${incompleteWords.length} từ chưa nhớ.`
          );
        } else {
          // advance
          setStage(2);
          setCurrentWords([...allWords]);
          setCompletedWords(new Set());
          resetStage(2);
        }
      } else {
        setCurrentIndex(nextIndex);
      }
    }, 650);
  };

  // --- Stage 2: Matching
  const handleLeftSelection = (wordId: string) => {
    if (matchedPairs.has(wordId)) return;
    setSelectedLeft((prev) => (prev === wordId ? null : wordId));
  };

  const handleRightSelection = (defId: string) => {
    if (matchedPairs.has(defId)) return;
    setSelectedRight((prev) => (prev === defId ? null : defId));
  };

  const checkMatch = () => {
    if (!selectedLeft || !selectedRight) return;

    const selectedWord = leftItems.find((w) => w._id === selectedLeft);
    const selectedDef = rightItems.find((r) => r.id === selectedRight);

    const isCorrect =
      selectedWord && selectedDef && selectedWord._id === selectedDef.id;

    if (isCorrect && selectedWord) {
      updateStats(stage, true);
      playCorrectSound();
      animateCorrect();
      showFeedbackAnimation("correct");

      // update matched pairs and completed
      setMatchedPairs((prev) => {
        const next = new Set(prev);
        next.add(selectedLeft);
        next.add(selectedRight);

        // if all matched, decide next step
        const uniqueMatchedCount = Array.from(next).filter((id) =>
          leftItems.some((w) => w._id === id)
        ).length;
        if (uniqueMatchedCount >= leftItems.length) {
          // all matched in this round
          // check overall completion
          setTimeout(() => {
            const allCompleted =
              Array.from(completedWords).length + uniqueMatchedCount >=
              allWords.length;
            if (!allCompleted) {
              const newCompleted = new Set(completedWords);
              leftItems.forEach((w) => newCompleted.add(w._id));
              const incomplete = allWords.filter(
                (w) => !newCompleted.has(w._id)
              );
              setCurrentWords(incomplete);
              setCompletedWords(new Set());
              setRoundCount((r) => r + 1);
              resetStage(2);
              Alert.alert(
                "Cần ôn tập thêm",
                `Bạn cần ôn tập lại ${incomplete.length} từ chưa ghép đúng.`
              );
            } else {
              setStage(3);
              setCurrentWords([...allWords]);
              setCompletedWords(new Set());
              resetStage(3);
            }
          }, 700);
        }

        // mark the word as completed globally
        setCompletedWords(
          (prevC) => new Set([...Array.from(prevC), selectedLeft])
        );
        return next;
      });
    } else {
      updateStats(stage, false);
      playIncorrectSound();
      animateIncorrect();
      showFeedbackAnimation("incorrect");
    }

    setSelectedLeft(null);
    setSelectedRight(null);
  };

  // --- Stage 3: Pronunciation
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Quyền truy cập", "Cần quyền microphone để ghi âm");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const recording = new Audio.Recording();

      const recordingOptions = {
        android: {
          extension: ".m4a",
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 64000,
        },
        ios: {
          extension: ".m4a",
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 64000,
        },
        web: {
          mimeType: "audio/webm;codecs=opus",
        },
      } as any;

      await recording.prepareToRecordAsync(recordingOptions);
      await recording.startAsync();

      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.error("Recording start error:", error);
      Alert.alert("Lỗi", "Không thể bắt đầu ghi âm");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) {
        Alert.alert("Lỗi", "Không thể lấy file ghi âm");
        return;
      }

      await uploadAndCheckPronunciation(uri);
    } catch (error) {
      console.error("Recording stop error:", error);
      Alert.alert("Lỗi", "Không thể dừng ghi âm");
    }
  };

  // Exit to lesson screen
  const exitToLesson = () => {
    router.back(); // Navigate back to the previous screen (lesson)
  };

  // Play audio for pronunciation
  const playAudio = async (audioFile: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: audioFile });
      await sound.playAsync();
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  // Play feedback sounds
  const playCorrectSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/sounds/correct.mp3")
      );
      await sound.playAsync();
    } catch (error) {
      console.error("Error playing correct sound:", error);
    }
  };

  const playIncorrectSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/sounds/incorrect.mp3")
      );
      await sound.playAsync();
    } catch (error) {
      console.error("Error playing incorrect sound:", error);
    }
  };

  const playCompleteSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/sounds/complete.mp3")
      );
      await sound.playAsync();
    } catch (error) {
      console.error("Error playing complete sound:", error);
    }
  };

  // Update statistics
  const updateStats = (stage: number, isCorrect: boolean) => {
    setStageStats((prev) => ({
      ...prev,
      [stage]: {
        correct: prev[stage].correct + (isCorrect ? 1 : 0),
        incorrect: prev[stage].incorrect + (isCorrect ? 0 : 1),
      },
    }));
  };

  const uploadAndCheckPronunciation = async (audioUri: string) => {
    const currentWord = currentWords[currentIndex];
    if (!currentWord) return;

    try {
      setUploading(true);

      const result = await API.checkPronunciation(audioUri, currentWord.word);
      console.log("Pronunciation response:", result);

      const acc = result.accuracy_percentage ?? 0;
      if (result.success && acc >= 80) {
        // Mark as completed and move to next immediately
        const newCompleted = new Set([...completedWords, currentWord._id]);
        setCompletedWords(newCompleted);
        updateStats(stage, true);
        playCorrectSound();
        animateCorrect();
        showFeedbackAnimation("correct");
        Alert.alert("Tuyệt vời!", `Phát âm chính xác ${acc.toFixed(1)}%`, [
          {
            text: "OK",
            onPress: () => moveToNextWordWithCompleted(newCompleted),
          },
        ]);
      } else {
        updateStats(stage, false);
        playIncorrectSound();
        animateIncorrect();
        showFeedbackAnimation("incorrect");
        Alert.alert(
          "Thử lại",
          `Phát âm chưa đủ chính xác (${acc.toFixed(1)}%). Hãy thử lại.`
        );
      }
    } catch (error) {
      console.error("Pronunciation check error:", error);
      updateStats(stage, false);
      playIncorrectSound();

      // Better error handling
      let errorMessage = "Không thể kiểm tra phát âm. Vui lòng thử lại.";
      if (
        error instanceof TypeError &&
        error.message.includes("Network request failed")
      ) {
        errorMessage =
          "Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.";
      }

      Alert.alert("Lỗi", errorMessage);
    } finally {
      setUploading(false);
      // Clean up recording properly - only if it hasn't been stopped already
      if (recording) {
        try {
          const status = await recording.getStatusAsync();
          if (status.canRecord || status.isRecording) {
            await recording.stopAndUnloadAsync();
          }
        } catch (unloadError) {
          console.error("Error checking/unloading recording:", unloadError);
        }
      }
      setRecording(null);
    }
  };

  const moveToNextWordWithCompleted = (newCompletedSet: Set<string>) => {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= currentWords.length) {
      // Check if all original words are completed using the passed completed set
      const incompleteFromAll = allWords.filter(
        (w) => !newCompletedSet.has(w._id)
      );
      const allCompleted = incompleteFromAll.length === 0;

      if (!allCompleted) {
        // Still have incomplete words - repeat them in same stage
        setCurrentWords(incompleteFromAll);
        setCurrentIndex(0);
        setRoundCount((r) => r + 1);
        resetStage(stage);
        Alert.alert(
          "Cần ôn tập thêm",
          `Bạn cần ôn tập lại ${incompleteFromAll.length} từ.`
        );
      } else {
        if (stage < 4) {
          const nextStage = stage + 1;
          Alert.alert(
            "Chuyển giai đoạn",
            `Bạn hoàn thành giai đoạn ${stage}. Sang giai đoạn ${nextStage}.`,
            [
              {
                text: "OK",
                onPress: () => {
                  setStage(nextStage);
                  setCurrentWords([...allWords]);
                  setCompletedWords(new Set());
                  resetStage(nextStage);
                },
              },
            ]
          );
        } else {
          // Hoàn thành tất cả stages - Gọi API để update progress
          handleLessonComplete();
        }
      }
    } else {
      setCurrentIndex(nextIndex);
    }
  };

  // Get achievement context
  const { completeLessonWithAchievementCheck } = useAchievementContext();

  // Hàm xử lý khi hoàn thành bài học
  const handleLessonComplete = async () => {
    try {
      if (user?._id && lessonId) {
        await completeLessonWithAchievementCheck(lessonId, "vocab");
        console.log("Lesson completed, progress updated!");
      }
    } catch (error) {
      console.error("Error updating lesson progress:", error);
      // Không hiện lỗi cho user, vì việc học đã hoàn thành
    } finally {
      Alert.alert("Hoàn thành", "Bạn đã hoàn thành tất cả các giai đoạn!", [
        { text: "OK", onPress: () => setStage(5) },
      ]);
    }
  };

  // --- Stage 4: Typing
  const checkTypingAnswer = () => {
    const currentWord = currentWords[currentIndex];
    if (!currentWord) return;

    const userAnswer = typeAnswer.trim().toLowerCase();
    const correctAnswer = currentWord.word.toLowerCase();

    if (userAnswer === correctAnswer) {
      const newCompleted = new Set([...completedWords, currentWord._id]);
      setCompletedWords(newCompleted);
      updateStats(stage, true);
      playCorrectSound();
      animateCorrect();
      showFeedbackAnimation("correct");
      setTimeout(() => {
        setTypeAnswer("");
        moveToNextWordWithCompleted(newCompleted);
      }, 700);
    } else {
      updateStats(stage, false);
      playIncorrectSound();
      animateIncorrect();
      showFeedbackAnimation("incorrect");
      setTypeAnswer("");
    }
  };

  // --- Render helpers (kept concise, visuals improved)
  // Play completion sound when reaching stage 5
  useEffect(() => {
    if (stage === 5) {
      playCompleteSound();
    }
  }, [stage]);

  const renderSummary = () => {
    const totalCorrect = Object.values(stageStats).reduce(
      (sum, stage) => sum + stage.correct,
      0
    );
    const totalIncorrect = Object.values(stageStats).reduce(
      (sum, stage) => sum + stage.incorrect,
      0
    );
    const totalAttempts = totalCorrect + totalIncorrect;
    const accuracy =
      totalAttempts > 0
        ? ((totalCorrect / totalAttempts) * 100).toFixed(1)
        : "0";

    return (
      <View style={styles.summaryContainer}>
        {/* Beautiful animated confetti effect */}
        <AnimatedConfetti />
        <LinearGradient
          colors={["#4CAF50", "#45a049"]}
          style={styles.summaryHeader}
        >
          <MaterialIcons name="emoji-events" size={48} color="white" />
          <Text style={styles.summaryTitle}>Chúc mừng! 🎉</Text>
          <Text style={styles.summarySubtitle}>
            Bạn đã hoàn thành tất cả giai đoạn
          </Text>
        </LinearGradient>
        <View style={styles.summaryContent}>
          <View style={styles.overallStats}>
            <Text style={styles.overallTitle}>Kết quả tổng quan</Text>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Độ chính xác:</Text>
              <Text style={styles.statValue}>{accuracy}%</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Tổng câu đúng:</Text>
              <Text style={[styles.statValue, { color: "#4CAF50" }]}>
                {totalCorrect}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Tổng câu sai:</Text>
              <Text style={[styles.statValue, { color: "#f44336" }]}>
                {totalIncorrect}
              </Text>
            </View>
          </View>

          <View style={styles.stageBreakdown}>
            <Text style={styles.breakdownTitle}>Chi tiết từng giai đoạn</Text>
            {Object.entries(stageStats).map(([stageNum, stats]) => {
              const stageTotal = stats.correct + stats.incorrect;
              const stageAccuracy =
                stageTotal > 0
                  ? ((stats.correct / stageTotal) * 100).toFixed(1)
                  : "0";
              const stageName = ["", "Thẻ từ", "Ghép đôi", "Phát âm", "Gõ từ"][
                parseInt(stageNum)
              ];

              return (
                <View key={stageNum} style={styles.stageStatCard}>
                  <Text style={styles.stageStatTitle}>
                    Giai đoạn {stageNum}: {stageName}
                  </Text>
                  <View style={styles.stageStatRow}>
                    <Text style={styles.stageStatLabel}>
                      Đúng: {stats.correct}
                    </Text>
                    <Text style={styles.stageStatLabel}>
                      Sai: {stats.incorrect}
                    </Text>
                    <Text style={styles.stageStatAccuracy}>
                      {stageAccuracy}%
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          <TouchableOpacity style={styles.finishButton} onPress={exitToLesson}>
            <LinearGradient
              colors={["#3B82F6", "#1E40AF"]}
              style={styles.finishButtonGradient}
            >
              <MaterialIcons name="home" size={24} color="white" />
              <Text style={styles.finishButtonText}>Về trang chủ</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderStage1 = () => {
    if (currentWords.length === 0 || currentIndex >= currentWords.length)
      return renderStageComplete();
    const word = currentWords[currentIndex];
    const cardId = word._id;

    if (!flipAnimations.has(cardId))
      setFlipAnimations(
        (prev) => new Map(prev.set(cardId, new Animated.Value(0)))
      );

    const isFlipped = flippedCards.has(cardId);
    const flipAnimation = flipAnimations.get(cardId) || new Animated.Value(0);

    const handleCardFlip = (id: string) => {
      const cur = flipAnimations.get(id);
      if (!cur) return;
      const willFlip = !flippedCards.has(id);
      setFlippedCards((prev) => {
        const next = new Set(prev);
        if (willFlip) next.add(id);
        else next.delete(id);
        return next;
      });
      Animated.timing(cur, {
        toValue: willFlip ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    };

    return (
      <View style={styles.flashcardContainer}>
        <VocabularyCard
          item={word}
          index={currentIndex}
          isFlipped={isFlipped}
          flipAnimation={flipAnimation}
          onFlip={() => handleCardFlip(cardId)}
          totalCards={currentWords.length}
        />

        <View style={styles.stage1Actions}>
          <TouchableOpacity
            style={styles.rememberedButton}
            onPress={() => handleStage1Answer(true)}
          >
            <LinearGradient
              colors={["#4CAF50", "#45a049"]}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="checkmark-circle" size={22} color="white" />
              <Text style={styles.actionButtonText}>Đã nhớ</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.notRememberedButton}
            onPress={() => handleStage1Answer(false)}
          >
            <LinearGradient
              colors={["#f44336", "#d32f2f"]}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="close-circle" size={22} color="white" />
              <Text style={styles.actionButtonText}>Chưa nhớ</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Giai đoạn 1 — Vòng {roundCount}
          </Text>
          <Text style={styles.progressCount}>
            {currentIndex + 1}/{currentWords.length}
          </Text>
        </View>
      </View>
    );
  };

  const renderStage2 = () => {
    if (leftItems.length === 0) return renderStageComplete();

    const availableLeft = leftItems.filter((w) => !matchedPairs.has(w._id));
    const availableRight = rightItems.filter((r) => !matchedPairs.has(r.id));

    return (
      <View style={styles.matchingContainer}>
        <Text style={styles.stageTitle}>Ghép từ với nghĩa</Text>

        <View style={styles.matchingGrid}>
          <View style={styles.matchingColumn}>
            <Text style={styles.columnTitle}>Từ</Text>
            <ScrollView style={styles.scrollColumn}>
              {availableLeft.map((w) => (
                <TouchableOpacity
                  key={w._id}
                  style={[
                    styles.matchingItem,
                    selectedLeft === w._id && styles.matchingItemSelected,
                  ]}
                  onPress={() => handleLeftSelection(w._id)}
                >
                  <Text style={styles.matchingText}>{w.word}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.matchingColumn}>
            <Text style={styles.columnTitle}>Nghĩa</Text>
            <ScrollView style={styles.scrollColumn}>
              {availableRight.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={[
                    styles.matchingItem,
                    selectedRight === r.id && styles.matchingItemSelected,
                  ]}
                  onPress={() => handleRightSelection(r.id)}
                >
                  <Text style={styles.matchingText}>{r.text}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.checkButton,
            (!selectedLeft || !selectedRight) && styles.checkButtonDisabled,
          ]}
          onPress={checkMatch}
          disabled={!selectedLeft || !selectedRight}
        >
          <LinearGradient
            colors={["#2196F3", "#1976D2"]}
            style={styles.buttonGradient}
          >
            <Ionicons name="checkmark" size={18} color="white" />
            <Text style={styles.buttonText}>Kiểm tra</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Giai đoạn 2 — Vòng {roundCount}
          </Text>
          <Text style={styles.progressCount}>
            {
              Array.from(matchedPairs).filter((id) =>
                leftItems.some((w) => w._id === id)
              ).length
            }
            /{leftItems.length} cặp
          </Text>
        </View>
      </View>
    );
  };

  const renderStage3 = () => {
    if (currentWords.length === 0 || currentIndex >= currentWords.length)
      return renderStageComplete();
    const word = currentWords[currentIndex];

    return (
      <Animated.View style={[styles.card, cardAnimatedStyle]}>
        <LinearGradient
          colors={["#FF6B6B", "#FF8E53"]}
          style={styles.cardHeader}
        >
          <MaterialIcons name="record-voice-over" size={28} color="white" />
          <Text style={styles.wordTitle}>{word.word}</Text>
          <Text style={styles.partOfSpeech}>Luyện phát âm</Text>
        </LinearGradient>

        <View style={styles.cardContent}>
          <View style={styles.pronunciationRow}>
            <Ionicons name="volume-high" size={18} color="#FF6B6B" />
            <Text style={styles.pronunciation}>{word.pronunciation}</Text>
          </View>

          <Text style={styles.definition}>{word.definition}</Text>

          {/* Audio playback button */}
          <TouchableOpacity
            style={styles.playAudioButton}
            onPress={async () => {
              try {
                const audioUrl =
                  word.audioUrl || (await API.getWordAudioUrl(word.word));
                playAudio(audioUrl);
              } catch (error) {
                console.error("Error getting audio URL:", error);
                Alert.alert("Lỗi", "Không thể phát âm thanh");
              }
            }}
          >
            <Ionicons name="play-circle" size={24} color="#FF6B6B" />
            <Text style={styles.playAudioText}>Nghe phát âm</Text>
          </TouchableOpacity>

          <View style={styles.recordingSection}>
            {isRecording ? (
              <TouchableOpacity
                style={styles.recordingButton}
                onPress={stopRecording}
              >
                <LinearGradient
                  colors={["#f44336", "#d32f2f"]}
                  style={styles.recordingGradient}
                >
                  <MaterialIcons name="stop" size={28} color="white" />
                  <Text style={styles.recordingText}>Dừng & Gửi</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.recordButton}
                onPress={startRecording}
                disabled={uploading}
              >
                <LinearGradient
                  colors={["#FF6B6B", "#FF8E53"]}
                  style={styles.recordingGradient}
                >
                  <MaterialIcons name="mic" size={28} color="white" />
                  <Text style={styles.recordingText}>Bắt đầu ghi âm</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {isRecording && (
              <Text style={styles.recordingIndicator}>🔴 Đang ghi âm...</Text>
            )}
            {uploading && (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="small" />
                <Text style={styles.uploadingText}>
                  Đang phân tích phát âm...
                </Text>
              </View>
            )}
          </View>

          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Giai đoạn 3 — Vòng {roundCount}
            </Text>
            <Text style={styles.progressCount}>
              {currentIndex + 1}/{currentWords.length}
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderStage4 = () => {
    if (currentWords.length === 0 || currentIndex >= currentWords.length)
      return renderStageComplete();
    const word = currentWords[currentIndex];

    return (
      <Animated.View style={[styles.card, cardAnimatedStyle]}>
        <LinearGradient
          colors={["#9C27B0", "#673AB7"]}
          style={styles.cardHeader}
        >
          <MaterialIcons name="keyboard" size={28} color="white" />
          <Text style={styles.wordTitle}>Gõ từ</Text>
          <Text style={styles.partOfSpeech}>Typing Challenge</Text>
        </LinearGradient>

        <View style={styles.cardContent}>
          <Text style={styles.definition}>{word.definition}</Text>

          {/* Hide example sentence in stage 4 for cleaner UI */}
          {false && word.exampleSentence && (
            <View style={styles.exampleContainer}>
              <Ionicons name="chatbubble-outline" size={14} color="#999" />
              <Text style={styles.example}>{word.exampleSentence}</Text>
            </View>
          )}

          <TextInput
            style={styles.textInput}
            placeholder="Nhập từ tiếng Anh..."
            value={typeAnswer}
            onChangeText={setTypeAnswer}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[
              styles.submitButton,
              !typeAnswer.trim() && styles.submitButtonDisabled,
            ]}
            onPress={checkTypingAnswer}
            disabled={!typeAnswer.trim()}
          >
            <LinearGradient
              colors={["#9C27B0", "#673AB7"]}
              style={styles.buttonGradient}
            >
              <Ionicons name="send" size={18} color="white" />
              <Text style={styles.buttonText}>Gửi đáp án</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Giai đoạn 4 — Vòng {roundCount}
            </Text>
            <Text style={styles.progressCount}>
              {currentIndex + 1}/{currentWords.length}
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderStageComplete = () => {
    const incompleteWords = allWords.filter((w) => !completedWords.has(w._id));
    const allCompleted = completedWords.size >= allWords.length;

    return (
      <View style={styles.completionContainer}>
        <LinearGradient
          colors={["#4CAF50", "#45a049"]}
          style={styles.completionCard}
        >
          <Ionicons name="checkmark-circle" size={64} color="white" />
          <Text style={styles.completionTitle}>
            {allCompleted
              ? "Hoàn thành!"
              : `Giai đoạn ${stage} chưa hoàn thành`}
          </Text>
          <Text style={styles.completionText}>
            {allCompleted
              ? `Tất cả ${allWords.length} từ đã hoàn thành.`
              : `Bạn cần ôn lại ${incompleteWords.length} từ.`}
          </Text>

          {!allCompleted && (
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => {
                setCurrentWords(incompleteWords);
                setCompletedWords(new Set());
                setCurrentIndex(0);
                setRoundCount((r) => r + 1);
                resetStage(stage);
              }}
            >
              <Text
                style={styles.continueButtonText}
              >{`Ôn lại ${incompleteWords.length} từ`}</Text>
            </TouchableOpacity>
          )}

          {allCompleted && stage < 4 && (
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => {
                setStage((s) => s + 1);
                setCurrentWords([...allWords]);
                setCompletedWords(new Set());
                resetStage(stage + 1);
              }}
            >
              <Text style={styles.continueButtonText}>Tiếp tục</Text>
            </TouchableOpacity>
          )}
        </LinearGradient>
      </View>
    );
  };

  const renderFeedback = () => {
    if (!showFeedback) return null;
    return (
      <Animated.View style={[styles.feedbackOverlay, feedbackAnimatedStyle]}>
        <View
          style={[
            styles.feedbackContainer,
            feedbackType === "correct"
              ? styles.feedbackCorrect
              : styles.feedbackIncorrect,
          ]}
        >
          <Ionicons
            name={
              feedbackType === "correct" ? "checkmark-circle" : "close-circle"
            }
            size={48}
            color="white"
          />
          <Text style={styles.feedbackText}>
            {feedbackType === "correct" ? "Chính xác!" : "Sai rồi!"}
          </Text>
        </View>
      </Animated.View>
    );
  };

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Đang tải từ vựng...</Text>
      </View>
    );

  if (error)
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Lỗi tải dữ liệu</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );

  if (allWords.length === 0)
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Không có từ vựng</Text>
        <Text style={styles.errorText}>Bài học này chưa có từ vựng nào.</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      {/* Exit button */}
      <TouchableOpacity style={styles.exitButton} onPress={exitToLesson}>
        <Ionicons name="close" size={24} color="white" />
      </TouchableOpacity>

      <LinearGradient colors={["#3B82F6", "#1E40AF"]} style={styles.header}>
        <Text style={styles.headerTitle}>{lessonTitle}</Text>
        <Text style={styles.headerSubtitle}>
          {stage === 5 ? "Hoàn thành" : `Giai đoạn ${stage}/4`}
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {stage === 1 && renderStage1()}
        {stage === 2 && renderStage2()}
        {stage === 3 && renderStage3()}
        {stage === 4 && renderStage4()}
        {stage === 5 && renderSummary()}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <View style={styles.footerItem}>
            <Ionicons name="library" size={18} color="#667eea" />
            <Text style={styles.footerText}>{allWords.length} từ</Text>
          </View>
          <View style={styles.footerItem}>
            <Ionicons name="checkmark-done" size={18} color="#4CAF50" />
            <Text style={styles.footerText}>
              {completedWords.size} hoàn thành
            </Text>
          </View>
          <View style={styles.footerItem}>
            <Ionicons name="refresh" size={18} color="#FF9800" />
            <Text style={styles.footerText}>Vòng {roundCount}</Text>
          </View>
        </View>
      </View>

      {renderFeedback()}

      {/* Achievement Modal */}
      <AchievementModalWrapper />
    </View>
  );
}

// --- Styles (kept consistent with project theme)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f1724" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f1724",
  },
  loadingText: { marginTop: 12, color: "#fff" },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  errorText: { color: "#ccc", marginTop: 8, textAlign: "center" },

  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 18,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
  },
  headerSubtitle: {
    color: "#fff",
    textAlign: "center",
    marginTop: 4,
    opacity: 0.95,
  },

  content: { flex: 1, padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 16,
    overflow: "hidden",
  },
  cardHeader: { padding: 18, alignItems: "center" },
  wordTitle: { fontSize: 28, fontWeight: "800", color: "#fff", marginTop: 8 },
  partOfSpeech: { fontSize: 13, color: "#fff", opacity: 0.9, marginTop: 4 },
  cardContent: { padding: 18 },

  flashcardContainer: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  stage1Actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    gap: 12,
  },
  rememberedButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 6,
  },
  notRememberedButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginLeft: 6,
  },
  actionButtonGradient: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  actionButtonText: { color: "#fff", marginLeft: 8, fontWeight: "700" },

  pronunciationRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  pronunciation: {
    fontSize: 15,
    fontStyle: "italic",
    color: "#4b66ff",
    marginLeft: 8,
  },
  definition: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 12,
  },
  exampleContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f8faff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  example: { color: "#666", marginLeft: 8 },

  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  buttonText: { color: "#fff", marginLeft: 8, fontWeight: "700" },

  progressContainer: { alignItems: "center", marginTop: 12 },
  progressText: { color: "#7c9cff", fontWeight: "600" },
  progressCount: { color: "#aaa", marginTop: 4 },

  matchingContainer: { flex: 1 },
  stageTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
  },
  matchingGrid: { flexDirection: "row", gap: 8 },
  matchingColumn: { flex: 1, marginHorizontal: 4 },
  columnTitle: {
    color: "#9fb0ff",
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "700",
  },
  scrollColumn: { maxHeight: 400 },
  matchingItem: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  matchingItemSelected: { borderColor: "#4b66ff", backgroundColor: "#f0f6ff" },
  matchingText: { textAlign: "center", fontWeight: "600" },
  checkButton: { borderRadius: 12, overflow: "hidden", marginVertical: 12 },
  checkButtonDisabled: { opacity: 0.5 },

  recordingSection: { alignItems: "center", marginVertical: 12 },
  recordButton: { borderRadius: 16, overflow: "hidden" },
  recordingButton: { borderRadius: 16, overflow: "hidden" },
  recordingGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  recordingText: { color: "#fff", marginLeft: 10, fontWeight: "700" },
  recordingIndicator: { color: "#f44336", marginTop: 8, fontWeight: "700" },
  uploadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  uploadingText: { marginLeft: 8, fontWeight: "700" },

  textInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    textAlign: "center",
    marginVertical: 12,
  },
  submitButton: { borderRadius: 12, overflow: "hidden" },
  submitButtonDisabled: { opacity: 0.5 },

  completionContainer: { padding: 20, alignItems: "center" },
  completionCard: {
    padding: 26,
    borderRadius: 16,
    alignItems: "center",
    width: "100%",
  },
  completionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 12,
  },
  completionText: { color: "#fff", marginTop: 8, textAlign: "center" },
  continueButton: {
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 14,
  },
  continueButtonText: { color: "#fff", fontWeight: "700" },

  footer: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  footerContent: { flexDirection: "row", justifyContent: "space-around" },
  footerItem: { flexDirection: "row", alignItems: "center" },
  footerText: { marginLeft: 6, color: "#3B82F6" },

  feedbackOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },
  feedbackContainer: { padding: 28, borderRadius: 12, alignItems: "center" },
  feedbackCorrect: { backgroundColor: "#4CAF50" },
  feedbackIncorrect: { backgroundColor: "#f44336" },
  feedbackText: { color: "#fff", marginTop: 10, fontWeight: "800" },

  // New styles for audio playback button
  playAudioButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F5",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#FFE0E0",
  },
  playAudioText: {
    marginLeft: 8,
    color: "#FF6B6B",
    fontWeight: "600",
    fontSize: 16,
  },

  // Exit button styling
  exitButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    padding: 10,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  // Summary screen styles
  summaryContainer: {
    flex: 1,
    backgroundColor: "#0f1724",
  },
  summaryHeader: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginHorizontal: 16,
    marginTop: 20,
  },
  summaryTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginTop: 15,
    textAlign: "center",
  },
  summarySubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    marginTop: 8,
    textAlign: "center",
  },
  summaryContent: {
    padding: 20,
  },
  overallStats: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  overallTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 15,
    textAlign: "center",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  statValue: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  stageBreakdown: {
    marginBottom: 30,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 15,
    textAlign: "center",
  },
  stageStatCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 10,
    padding: 15,
    marginVertical: 5,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  stageStatTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  stageStatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stageStatLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
  stageStatAccuracy: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  finishButton: {
    borderRadius: 15,
    overflow: "hidden",
    marginTop: 10,
  },
  finishButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  finishButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  // Confetti animation styles
  confettiContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    pointerEvents: "none",
  },
  confettiEmoji: {
    position: "absolute",
    top: -50,
    opacity: 0.9,
  },
  emojiText: {
    fontSize: 24,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  confettiPaper: {
    position: "absolute",
    top: -20,
    opacity: 0.8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  confettiPiece: {
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
});
