import { Audio } from "expo-av";
import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import API from "../../api/index";

interface BackendResult {
  translated: string;
  ipa?: string | null;
  sourceIpa?: string | null;
  targetPhonetic?: string | null;
  originalAudio: string;
  translatedAudio: string;
}

const playAudio = async (base64Data: string) => {
  try {
    if (!base64Data) return;
    const uri = `data:audio/mp3;base64,${base64Data}`;
    const { sound } = await Audio.Sound.createAsync({ uri });
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (err) {
    console.error("Error playing audio:", err);
  }
};

export default function Dictionary() {
  const [text, setText] = useState("");
  const [sourceLang, setSourceLang] = useState<"en" | "vi">("en");
  const [targetLang, setTargetLang] = useState<"en" | "vi">("vi");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BackendResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
    })();
  }, []);

  const showAlert = (message: string) => {
    if (Platform.OS === "web") console.error(message);
    else Alert.alert("Thông báo", message);
  };

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setResult(null);
  };

  const handleTranslate = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      showAlert("⚠️ Vui lòng nhập văn bản!");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await API.translate(trimmed, sourceLang, targetLang);
      if ((data as any).error) {
        setError((data as any).error);
        setLoading(false);
        return;
      }

      setResult(data as BackendResult);
    } catch (err) {
      console.error(err);
      setError("❌ Lỗi server hoặc kết nối!");
    } finally {
      setLoading(false);
    }
  }, [text, sourceLang, targetLang]);

  return (
    <View style={styles.container}>
      {/* Header with gradient */}
      <LinearGradient colors={["#0f0f23", "#16213e"]} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}> White Bear Dictionary</Text>
          <Text style={styles.headerSubtitle}>Translate with White Bear</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {/* MAIN TRANSLATION CARD */}
        <View style={styles.translationCard}>
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>📝 Enter text to translate</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Type something..."
                placeholderTextColor="#a4b0be"
                value={text}
                onChangeText={setText}
                multiline
                scrollEnabled={true}
              />
            </View>
          </View>

          {/* LANGUAGE SELECTOR */}
          <View style={styles.languageSection}>
            <View style={styles.langRow}>
              <TouchableOpacity style={styles.langSelector}>
                <Text style={styles.langFlag}>
                  {sourceLang === "en" ? "🇺🇸" : "🇻🇳"}
                </Text>
                <Text style={styles.langName}>
                  {sourceLang === "en" ? "English" : "Tiếng Việt"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.swapButton}
                onPress={swapLanguages}
              >
                <LinearGradient
                  colors={["#00d4ff", "#0099ff"]}
                  style={styles.swapIcon}
                >
                  <Text style={styles.swapText}>↔️</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.langSelector}>
                <Text style={styles.langFlag}>
                  {targetLang === "en" ? "🇺🇸" : "🇻🇳"}
                </Text>
                <Text style={styles.langName}>
                  {targetLang === "en" ? "English" : "Tiếng Việt"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* TRANSLATE BUTTON */}
          <TouchableOpacity
            style={[styles.translateButton, loading && styles.buttonDisabled]}
            onPress={handleTranslate}
            disabled={loading}
          >
            <LinearGradient
              colors={loading ? ["#666", "#444"] : ["#00d4ff", "#0099ff"]}
              style={styles.translateGradient}
            >
              {loading ? (
                <>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.translateText}>Translating...</Text>
                </>
              ) : (
                <>
                  <Text style={styles.translateIcon}>⚡</Text>
                  <Text style={styles.translateText}>Translate</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ERROR */}
        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* RESULT */}
        {result && (
          <View style={styles.resultCard}>
            {/* Source Text */}
            <View style={styles.resultSection}>
              <View style={styles.resultSectionHeader}>
                <Text style={styles.resultSectionTitle}>
                  📝 Văn bản gốc ({sourceLang.toUpperCase()})
                </Text>
                <TouchableOpacity
                  style={styles.audioBtn}
                  onPress={() => playAudio(result.originalAudio)}
                >
                  <LinearGradient
                    colors={["#00d4ff", "#0099ff"]}
                    style={styles.audioBtnGradient}
                  >
                    <Text style={styles.audioBtnText}>🔊</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              <Text style={styles.resultText}>{text}</Text>
              {result.sourceIpa && (
                <Text style={styles.pronunciation}>{result.sourceIpa}</Text>
              )}
            </View>

            {/* Translation */}
            <View style={styles.resultSection}>
              <View style={styles.resultSectionHeader}>
                <Text style={styles.resultSectionTitle}>
                  🌐 Bản dịch ({targetLang.toUpperCase()})
                </Text>
                <TouchableOpacity
                  style={styles.audioBtn}
                  onPress={() => playAudio(result.translatedAudio)}
                >
                  <LinearGradient
                    colors={["#00d4ff", "#0099ff"]}
                    style={styles.audioBtnGradient}
                  >
                    <Text style={styles.audioBtnText}>🔊</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              <Text style={styles.resultText}>{result.translated}</Text>
              {result.ipa ? (
                <Text style={styles.pronunciation}>{result.ipa}</Text>
              ) : result.targetPhonetic ? (
                <Text style={styles.pronunciation}>
                  [{result.targetPhonetic}]
                </Text>
              ) : null}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  header: {
    paddingTop: 44,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 50,
  },
  // Main Translation Card
  translationCard: {
    backgroundColor: "#2c2c54",
    borderRadius: 20,
    margin: 16,
    padding: 20,
    shadowColor: "#ffffff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#40407a",
  },

  // Input Section
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f1f2f6",
    marginBottom: 12,
  },
  inputWrapper: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#40407a",
    minHeight: 100,
  },
  input: {
    color: "#f1f2f6",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: "top",
  },
  // Language Section
  languageSection: {
    marginBottom: 20,
  },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  langSelector: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#40407a",
  },
  langFlag: {
    fontSize: 20,
    marginRight: 8,
  },
  langName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#f1f2f6",
    flex: 1,
  },
  swapButton: {
    marginHorizontal: 12,
  },
  swapIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  swapText: {
    fontSize: 16,
    color: "#fff",
  },
  // Translate Button
  translateButton: {
    marginTop: 20,
  },
  translateGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  translateIcon: {
    fontSize: 18,
    color: "#fff",
  },
  translateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  // Error Card
  errorCard: {
    backgroundColor: "rgba(244, 67, 54, 0.1)",
    borderRadius: 12,
    padding: 16,
    margin: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f44336",
  },
  errorIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  errorText: {
    color: "#f87171",
    fontSize: 14,
    flex: 1,
  },

  // Result Card
  resultCard: {
    backgroundColor: "#2c2c54",
    borderRadius: 20,
    margin: 16,
    padding: 20,
    shadowColor: "#ffffff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#40407a",
  },
  resultHeader: {
    marginBottom: 20,
    alignItems: "center",
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#00d4ff",
  },
  // Result Sections
  resultSection: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  resultSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  resultSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f1f2f6",
  },
  resultText: {
    fontSize: 16,
    color: "#e5e5e5",
    lineHeight: 24,
    marginBottom: 8,
  },
  pronunciation: {
    fontSize: 12,
    color: "#a4b0be",
    fontFamily: "monospace",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  textScrollContainer: {
    maxHeight: 200,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingBottom: 20,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  textBlock: {
    color: "#e5e5e5",
    fontSize: 16,
    lineHeight: 22,
    flexWrap: "wrap",
    textAlign: "left",
  },
  ipa: {
    color: "#cbd5e1",
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    backgroundColor: "rgb(64, 65, 78)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 6,
    alignSelf: "flex-start",
  },
  phonetic: {
    color: "#bbb",
    fontStyle: "italic",
    marginTop: 6,
  },
  // Audio Buttons
  audioBtn: {
    minWidth: 44,
  },
  audioBtnGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  audioBtnText: {
    fontSize: 16,
    color: "#fff",
  },
});
