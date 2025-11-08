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
      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      setResult(data);
    } catch (err) {
      console.error(err);
      setError("❌ Lỗi server hoặc kết nối!");
    } finally {
      setLoading(false);
    }
  }, [text, sourceLang, targetLang]);

  return (
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 50 }}
      showsVerticalScrollIndicator={false} // ❌ Ẩn thanh scroll dọc
    >
      <Text style={styles.title}>🌍 BearTranslate</Text>

      {/* INPUT */}
      <Text style={styles.label}>Văn bản cần dịch:</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập văn bản..."
        placeholderTextColor="#999"
        value={text}
        onChangeText={setText}
        multiline
      />

      {/* LANGUAGE SWAP */}
      <View style={styles.langContainer}>
        <Text style={styles.langText}>
          {sourceLang === "en" ? "English" : "Vietnamese"}
        </Text>

        <TouchableOpacity style={styles.swapButton} onPress={swapLanguages}>
          <Text style={styles.swapText}>🔁</Text>
        </TouchableOpacity>

        <Text style={styles.langText}>
          {targetLang === "en" ? "English" : "Vietnamese"}
        </Text>
      </View>

      {/* TRANSLATE BUTTON */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleTranslate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>🔄 Dịch ngay</Text>
        )}
      </TouchableOpacity>

      {/* RESULT */}
      {error && <Text style={styles.error}>{error}</Text>}

      {result && (
        <View style={styles.resultBox}>
          <ScrollView
            style={{ maxHeight: 400 }}
            showsVerticalScrollIndicator={false} // ❌ Ẩn thanh cuộn dọc bên trong kết quả
          >
            {/* Source */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                📝 Văn bản gốc ({sourceLang.toUpperCase()}):
              </Text>
              <Text style={styles.textBlock}>{text}</Text>

              {result.sourceIpa && (
                <Text style={styles.ipa}>{result.sourceIpa}</Text>
              )}

              <TouchableOpacity
                onPress={() => playAudio(result.originalAudio)}
                style={styles.audioButton}
              >
                <Text style={{ color: "#fff" }}>🎧 Nghe gốc</Text>
              </TouchableOpacity>
            </View>

            {/* Translation */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                🌐 Bản dịch ({targetLang.toUpperCase()}):
              </Text>
              <Text style={styles.textBlock}>{result.translated}</Text>

              {result.ipa ? (
                <Text style={styles.ipa}>{result.ipa}</Text>
              ) : result.targetPhonetic ? (
                <Text style={styles.phonetic}>[{result.targetPhonetic}]</Text>
              ) : null}

              <TouchableOpacity
                onPress={() => playAudio(result.translatedAudio)}
                style={styles.audioButton}
              >
                <Text style={{ color: "#fff" }}>🎧 Nghe dịch</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgb(38, 39, 48)",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    color: "#fff",
  },
  label: {
    fontWeight: "600",
    color: "#ddd",
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "rgb(58, 59, 70)", // ✅ Đổi màu input
    color: "#fff",
    borderWidth: 1,
    borderColor: "rgb(80, 81, 95)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: "top",
  },
  langContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },
  langText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginHorizontal: 10,
  },
  swapButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 30,
    padding: 10,
  },
  swapText: {
    fontSize: 20,
    color: "#fff",
  },
  button: {
    backgroundColor: "#10b981",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#888",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  error: {
    color: "#f87171",
    marginTop: 20,
    textAlign: "center",
  },
  resultBox: {
    marginTop: 25,
    backgroundColor: "rgb(48, 49, 60)", // ✅ Đổi màu ô kết quả
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgb(70, 71, 85)",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    color: "#60a5fa",
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 8,
  },
  textBlock: {
    color: "#e5e5e5",
    fontSize: 16,
    lineHeight: 22,
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
  audioButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    alignItems: "center",
  },
});
