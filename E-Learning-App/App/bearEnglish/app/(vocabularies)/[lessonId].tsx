import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
  Animated,
  Dimensions,
} from "react-native";

import { useRouter, useLocalSearchParams } from "expo-router";
import API from "../../api/index";
import VocabularyCard from "./VocabularyCard";
import type { Vocabulary } from "../../types";

const { width: screenWidth } = Dimensions.get("window");

export default function VocabularyFlashcards() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const lessonId = params.lessonId as string;
  const lessonTitle = params.lessonTitle as string;

  const [loading, setLoading] = useState(false);
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const flipAnimations = useRef(new Map<string, Animated.Value>()).current;
  const flatListRef = useRef<FlatList>(null);

  const fetchVocabularies = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching vocabularies for lesson:", lessonId);
      const response = await API.getVocabulariesByLessonId(lessonId);

      console.log("Vocabularies response:", response);

      const data = response.data || response;
      setVocabularies(data || []);
    } catch (err) {
      console.error("Failed to fetch vocabularies", err);
      Alert.alert("Error", "Failed to load vocabularies");
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    if (lessonId) {
      fetchVocabularies();
    }
  }, [lessonId, fetchVocabularies]);

  // Navigation with circular logic - when at end, go to start and vice versa
  function navigateToCard(newIndex: number) {
    let targetIndex = newIndex;

    // Circular navigation logic
    if (newIndex < 0) {
      targetIndex = vocabularies.length - 1; // Go to last card
    } else if (newIndex >= vocabularies.length) {
      targetIndex = 0; // Go to first card
    }

    setCurrentIndex(targetIndex);

    // Reset card to front side when navigating
    resetCardToFront(vocabularies[targetIndex]._id);

    // Scroll to the target card
    flatListRef.current?.scrollToOffset({
      offset: targetIndex * screenWidth,
      animated: true,
    });
  }

  // Reset card to front side (unflipped state)
  function resetCardToFront(cardId: string) {
    const flipAnimation = getFlipAnimation(cardId);

    // Reset animation to 0 (front side)
    flipAnimation.setValue(0);

    // Remove from flipped cards set
    setFlippedCards((prev) => {
      const newSet = new Set(prev);
      newSet.delete(cardId);
      return newSet;
    });
  }

  function getFlipAnimation(cardId: string) {
    if (!flipAnimations.has(cardId)) {
      flipAnimations.set(cardId, new Animated.Value(0));
    }
    return flipAnimations.get(cardId)!;
  }

  function toggleFlipCard(cardId: string) {
    const flipAnimation = getFlipAnimation(cardId);
    const isFlipped = flippedCards.has(cardId);

    Animated.spring(flipAnimation, {
      toValue: isFlipped ? 0 : 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();

    setFlippedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  }

  function renderVocabularyCard({
    item,
    index,
  }: {
    item: Vocabulary;
    index: number;
  }) {
    const isFlipped = flippedCards.has(item._id);
    const flipAnimation = getFlipAnimation(item._id);

    return (
      <VocabularyCard
        item={item}
        index={index}
        isFlipped={isFlipped}
        flipAnimation={flipAnimation}
        onFlip={toggleFlipCard}
        totalCards={vocabularies.length}
      />
    );
  }
  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading vocabularies...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header is hidden - using only title without back button */}
      <View style={styles.headerMinimal}>
        <Text style={styles.title}>{lessonTitle || "Vocabulary"}</Text>
        <TouchableOpacity
          style={styles.studyButton}
          onPress={() =>
            router.push({
              pathname: "./VocabularyStudy",
              params: { lessonId, lessonTitle },
            })
          }
        >
          <Text style={styles.studyButtonText}>Learning</Text>
        </TouchableOpacity>
      </View>

      {vocabularies.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No vocabularies found</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchVocabularies}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            ref={flatListRef}
            data={vocabularies}
            keyExtractor={(item) => item._id}
            renderItem={({ item, index }) =>
              renderVocabularyCard({ item, index })
            }
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={screenWidth}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContainer}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.round(
                event.nativeEvent.contentOffset.x / screenWidth
              );

              // Only update if index actually changed
              if (newIndex !== currentIndex && vocabularies[newIndex]) {
                setCurrentIndex(newIndex);
                // Reset the new card to front side
                resetCardToFront(vocabularies[newIndex]._id);
              }
            }}
          />

          {/* Enhanced Navigation */}
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigateToCard(currentIndex - 1)}
            >
              <Text style={styles.navButtonText}>‹</Text>
            </TouchableOpacity>

            <View style={styles.dotContainer}>
              {vocabularies.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dot,
                    index === currentIndex && styles.activeDot,
                  ]}
                  onPress={() => navigateToCard(index)}
                />
              ))}
            </View>

            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigateToCard(currentIndex + 1)}
            >
              <Text style={styles.navButtonText}>›</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1b24",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#4a4b55",
  },
  headerMinimal: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    padding: 17,
    backgroundColor: "#1a1b24",
    borderBottomWidth: 2,
    borderBottomColor: "#2a2b35",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    marginRight: 16,
  },
  backText: {
    color: "#4A90E2",
    fontSize: 16,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    flex: 1,
    letterSpacing: 0.5,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    padding: 16,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgb(38, 39, 48)",
  },
  loadingText: {
    color: "#aaa",
    marginTop: 10,
  },
  listContainer: {
    padding: 16,
  },
  flashcard: {
    backgroundColor: "#3c3d47",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#4a4b55",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
    minHeight: 400,
    width: "90%",
    position: "relative",
  },
  cardFront: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 400,
    borderRadius: 20,
    backgroundColor: "#3c3d47",
  },
  cardBack: {
    padding: 24,
    minHeight: 400,
    justifyContent: "space-between",
    borderRadius: 20,
    backgroundColor: "#3c3d47",
  },
  cardImage: {
    width: 160,
    height: 160,
    borderRadius: 16,
    marginBottom: 20,
  },
  frontContent: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  backHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    flexWrap: "wrap",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  word: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  wordSmall: {
    color: "#4A90E2",
    fontSize: 18,
    fontWeight: "700",
    marginRight: 8,
  },
  audioButton: {
    padding: 8,
    backgroundColor: "#4A90E2",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  audioButtonText: {
    fontSize: 16,
  },
  pronunciation: {
    color: "#4A90E2",
    fontSize: 16,
    fontStyle: "italic",
    marginBottom: 4,
  },
  partOfSpeech: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 8,
  },
  definition: {
    color: "#fff",
    fontSize: 18,
    lineHeight: 26,
    textAlign: "center",
    flex: 1,
    marginVertical: 16,
  },
  example: {
    color: "#ccc",
    fontSize: 16,
    fontStyle: "italic",
    lineHeight: 22,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  studyButton: {
    backgroundColor: "#667eea",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#667eea",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  studyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  exampleContainer: {
    backgroundColor: "#2c2d36",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#4A90E2",
    marginTop: 12,
  },
  exampleLabel: {
    color: "#aaa",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  flipHint: {
    color: "#888",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
  carouselContainer: {
    paddingHorizontal: 0,
  },
  cardContainer: {
    width: screenWidth,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cardSide: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backfaceVisibility: "hidden",
  },
  cardNavigation: {
    alignItems: "center",
    marginTop: 16,
  },
  cardIndex: {
    color: "#aaa",
    fontSize: 14,
    fontWeight: "600",
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "rgba(26, 27, 36, 0.9)",
    marginHorizontal: 20,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
  navButton: {
    backgroundColor: "#667eea",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#667eea",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  navButtonText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  dotContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  activeDot: {
    backgroundColor: "#667eea",
    width: 16,
    height: 16,
    borderRadius: 8,
    shadowColor: "#667eea",
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
    borderColor: "rgba(255,255,255,0.2)",
  },
});
