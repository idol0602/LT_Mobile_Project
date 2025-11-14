import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
} from "react-native";
import { Audio } from "expo-av";
import { API_BASE } from "../../constants/api";
import type { Vocabulary } from "../../types";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface VocabularyCardProps {
  item: Vocabulary;
  index: number;
  isFlipped: boolean;
  flipAnimation: Animated.Value;
  onFlip: (cardId: string) => void;
  totalCards: number;
}

export default function VocabularyCard({
  item,
  index,
  isFlipped,
  flipAnimation,
  onFlip,
  totalCards,
}: VocabularyCardProps) {
  async function playAudio(word: string) {
    try {
      const url = `${API_BASE}/api/audio/play?word=${encodeURIComponent(word)}`;
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true }
      );
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (err) {
      console.error("Play audio error", err);
    }
  }

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  const frontOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  const backOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <View style={styles.cardContainer}>
      {/* Card Counter */}
      <View style={styles.cardCounter}>
        <Text style={styles.counterText}>
          {index + 1} / {totalCards}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((index + 1) / totalCards) * 100}%` },
            ]}
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.flashcard}
        onPress={() => onFlip(item._id)}
        activeOpacity={0.95}
      >
        {/* Front side - Word and Image */}
        <Animated.View
          style={[
            styles.cardSide,
            styles.cardFront,
            {
              opacity: frontOpacity,
              transform: [{ rotateY: frontInterpolate }],
            },
          ]}
          pointerEvents={isFlipped ? "none" : "auto"}
        >
          <View style={styles.cardTopSection}>
            {item.imageFileId && (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: `${API_BASE}/api/images/${item.imageFileId}` }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              </View>
            )}

            <View style={styles.wordSection}>
              <Text style={styles.word}>{item.word}</Text>
              {item.pronunciation && (
                <Text style={styles.pronunciation}>/{item.pronunciation}/</Text>
              )}
            </View>
          </View>

          <View style={styles.cardBottomSection}>
            <TouchableOpacity
              style={styles.audioButton}
              onPress={(e) => {
                e.stopPropagation();
                playAudio(item.word);
              }}
            >
              <Text style={styles.audioButtonText}>🔊</Text>
              <Text style={styles.audioLabel}>Listen</Text>
            </TouchableOpacity>

            <Text style={styles.flipHint}>Tap card to see meaning →</Text>
          </View>
        </Animated.View>

        {/* Back side - Definition and Details */}
        <Animated.View
          style={[
            styles.cardSide,
            styles.cardBack,
            {
              opacity: backOpacity,
              transform: [{ rotateY: backInterpolate }],
            },
          ]}
          pointerEvents={isFlipped ? "auto" : "none"}
        >
          <View style={styles.backTopSection}>
            <View style={styles.backHeader}>
              <Text style={styles.wordSmall}>{item.word}</Text>
              {item.partOfSpeech && (
                <View style={styles.partOfSpeechBadge}>
                  <Text style={styles.partOfSpeech}>{item.partOfSpeech}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.definitionSection}>
            <Text style={styles.definition}>{item.definition}</Text>
          </View>

          {item.exampleSentence && (
            <View style={styles.exampleSection}>
              <View style={styles.exampleContainer}>
                <Text style={styles.exampleLabel}>Example:</Text>
                <Text style={styles.example}>
                  &ldquo;{item.exampleSentence}&rdquo;
                </Text>
              </View>
            </View>
          )}

          <View style={styles.backBottomSection}>
            <Text style={styles.flipHint}>← Tap to see word again</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: screenWidth,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  cardCounter: {
    width: "90%",
    marginBottom: 16,
    alignItems: "center",
  },
  counterText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "#2a2b35",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4A90E2",
    borderRadius: 2,
  },
  flashcard: {
    width: "90%",
    height: screenHeight * 0.65,
    borderRadius: 24,
    backgroundColor: "#2a2b35",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 12,
    position: "relative",
  },
  cardSide: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backfaceVisibility: "hidden",
    borderRadius: 24,
    padding: 0,
  },
  cardFront: {
    backgroundColor: "linear-gradient(145deg, #3c3d47, #2a2b35)",
    borderWidth: 1,
    borderColor: "#4a4b55",
  },
  cardBack: {
    backgroundColor: "linear-gradient(145deg, #2a2b35, #3c3d47)",
    borderWidth: 1,
    borderColor: "#4a4b55",
  },
  cardTopSection: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
  cardImage: {
    width: screenHeight * 0.2,
    height: screenHeight * 0.15,
    borderRadius: 16,
  },
  wordSection: {
    alignItems: "center",
  },
  word: {
    color: "#ffffff",
    fontSize: 36,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 1,
  },
  pronunciation: {
    color: "#4A90E2",
    fontSize: 18,
    fontStyle: "italic",
    textAlign: "center",
  },
  cardBottomSection: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
  },
  audioButton: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 50,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#4A90E2",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
  audioButtonText: {
    fontSize: 20,
    marginRight: 8,
  },
  audioLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  flipHint: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
  },
  // Back side styles
  backTopSection: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#4a4b55",
  },
  backHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  wordSmall: {
    color: "#4A90E2",
    fontSize: 24,
    fontWeight: "700",
  },
  partOfSpeechBadge: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  partOfSpeech: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  definitionSection: {
    flex: 2,
    justifyContent: "center",
    padding: 24,
  },
  definition: {
    color: "#ffffff",
    fontSize: 20,
    lineHeight: 32,
    textAlign: "center",
    fontWeight: "400",
  },
  exampleSection: {
    padding: 24,
    paddingTop: 0,
  },
  exampleContainer: {
    backgroundColor: "#1a1b24",
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#4A90E2",
  },
  exampleLabel: {
    color: "#4A90E2",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  example: {
    color: "#cccccc",
    fontSize: 16,
    fontStyle: "italic",
    lineHeight: 24,
  },
  backBottomSection: {
    padding: 24,
    alignItems: "center",
  },
});
