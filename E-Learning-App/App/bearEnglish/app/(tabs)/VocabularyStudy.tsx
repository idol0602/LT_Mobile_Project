// VocabularyStudy.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";

type Word = {
  _id: string;
  word: string;
  definition: string;
  pronunciation?: string;
  partOfSpeech?: string;
  exampleSentence?: string;
};

type PronounResponse = {
  success: boolean;
  transcription: string;
  duration_seconds: number;
  aai_id: string;
  accuracy_percentage: number;
};
const SAMPLE_WORDS: Word[] = [];

// ======= Component =======
export default function VocabularyStudy() {
  const [stage, setStage] = useState<number>(1);
  const [pool, setPool] = useState<Word[]>(SAMPLE_WORDS.slice());
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // For stage2 matching
  const [leftItems, setLeftItems] = useState<Word[]>([]);
  const [rightItems, setRightItems] = useState<{ id: string; text: string }[]>(
    []
  );
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);

  // For stage3 recording
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [uploading, setUploading] = useState(false);

  // For stage4 typing
  const [typeAnswer, setTypeAnswer] = useState<string>("");

  // Generic progress
  const [roundCount, setRoundCount] = useState<number>(1);
  const recheckPoolRef = useRef<Word[]>([]); // words that are "not remembered" in current pass

  useEffect(() => {
    setPool(SAMPLE_WORDS.slice());
    resetStageState(stage);
  }, []);

  useEffect(() => {
    // reset state when stage changes
    resetStageState(stage);
  }, [stage]);

  function resetStageState(s: number) {
    setCurrentIndex(0);
    setRoundCount(1);
    recheckPoolRef.current = [];
    setSelectedLeft(null);
    setSelectedRight(null);
    setRecording(null);
    setIsRecording(false);
    setUploading(false);
    setTypeAnswer("");
    if (s === 2) prepareStage2(pool);
  }

  // ========= Stage 1: Flashcards =========
  function onStage1Answer(remembered: boolean) {
    const current = pool[currentIndex];
    if (!current) return;

    if (!remembered) {
      // mark to recheck later
      recheckPoolRef.current.push(current);
    }

    // move index
    const nextIndex = currentIndex + 1;
    if (nextIndex < pool.length) {
      setCurrentIndex(nextIndex);
    } else {
      // end of pass
      if (recheckPoolRef.current.length > 0) {
        // repeat only the not-remembered ones
        setPool(recheckPoolRef.current.slice());
        recheckPoolRef.current = [];
        setCurrentIndex(0);
        setRoundCount((r) => r + 1);
      } else {
        // all remembered -> next stage
        setStage(2);
      }
    }
  }

  // ========= Stage 2: Match word <-> meaning =========
  function prepareStage2(initialPool: Word[]) {
    const left = initialPool.slice(); // words (display word)
    // right side: definitions shuffled
    const defs = initialPool.map((w) => ({ id: w._id, text: w.definition }));
    shuffleArray(defs);
    setLeftItems(left);
    setRightItems(defs);
    setSelectedLeft(null);
    setSelectedRight(null);
    recheckPoolRef.current = [];
  }

  function shuffleArray<T>(arr: T[]) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
  }

  function onPickLeft(id: string) {
    setSelectedLeft(id === selectedLeft ? null : id);
  }
  function onPickRight(id: string) {
    setSelectedRight(id === selectedRight ? null : id);
  }

  function onCheckMatch() {
    if (!selectedLeft || !selectedRight) return;
    const leftWord = leftItems.find((w) => w._id === selectedLeft)!;
    const rightDef = rightItems.find((r) => r.id === selectedRight)!;
    if (leftWord && rightDef) {
      if (leftWord.definition === rightDef.text) {
        // correct -> remove pair
        const newLeft = leftItems.filter((w) => w._id !== leftWord._id);
        const newRight = rightItems.filter((r) => r.id !== rightDef.id);
        setLeftItems(newLeft);
        setRightItems(newRight);
        setSelectedLeft(null);
        setSelectedRight(null);
        // if no lefts remain -> check recheck pool
        if (newLeft.length === 0) {
          if (recheckPoolRef.current.length > 0) {
            // repeat not-remembered ones
            setPool(recheckPoolRef.current.slice());
            setStage(2); // re-enter stage 2
            prepareStage2(recheckPoolRef.current.slice());
            recheckPoolRef.current = [];
            setRoundCount((r) => r + 1);
          } else {
            // go to stage3
            setPool(SAMPLE_WORDS.slice());
            setStage(3);
          }
        }
      } else {
        // incorrect -> keep these words for recheck
        const wrongLeft = leftWord;
        recheckPoolRef.current.push(wrongLeft);
        // remove all current pairs (so next pass will be for recheck set)
        // We want to finish current pass: so if there are other leftItems, remove this left to continue
        const newLeft = leftItems.filter((w) => w._id !== leftWord._id);
        const newRight = rightItems.filter((r) => r.id !== rightDef.id);
        setLeftItems(newLeft);
        setRightItems(newRight);
        setSelectedLeft(null);
        setSelectedRight(null);

        if (newLeft.length === 0) {
          // finish pass -> repeat recheckPool
          setPool(recheckPoolRef.current.slice());
          prepareStage2(recheckPoolRef.current.slice());
          recheckPoolRef.current = [];
          setRoundCount((r) => r + 1);
        }
      }
    }
  }

  // ========= Stage 3: Pronunciation =========
  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Microphone permission is required."
        );
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      await rec.startAsync();
      setRecording(rec);
      setIsRecording(true);
    } catch (err) {
      console.error("startRecording error", err);
      Alert.alert("Error", "Không thể bắt đầu thu âm.");
    }
  }

  async function stopRecordingAndUpload(wordItem: Word) {
    if (!recording) return;
    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      if (!uri) {
        Alert.alert("Error", "Không tìm thấy file ghi âm.");
        return;
      }
      // Upload the file
      setUploading(true);
      const response = await uploadAudioFile(uri, wordItem.word);
      setUploading(false);
      handlePronounResult(response, wordItem);
    } catch (err) {
      console.error("stopRecording error", err);
      Alert.alert("Error", "Lỗi khi dừng/ tải lên file ghi âm.");
      setIsRecording(false);
      setUploading(false);
    }
  }

  async function uploadAudioFile(uri: string, expectedWord: string) {
    // Convert file to blob if necessary, FormData upload
    const apiUrl = "http://192.168.1.210:3000/pronoun";
    const form = new FormData();

    // Expo file uri starts with file://
    const fileInfo = await FileSystem.getInfoAsync(uri);
    const fileName = uri.split("/").pop() || `${expectedWord}.m4a`;
    const fileType = "audio/m4a"; // assumption for expo-av preset

    // fetch the file binary
    const fileBlob = {
      uri,
      name: fileName,
      type: fileType,
    } as any;

    form.append("file", fileBlob);
    form.append("word", expectedWord);

    // Use fetch (axios multipart in RN may require extra config)
    const res = await fetch(apiUrl, {
      method: "POST",
      body: form,
      headers: {
        // Do NOT set Content-Type; let fetch set the boundary for multipart
        Accept: "application/json",
      },
    });

    const json = await res.json();
    return json as PronounResponse;
  }

  function handlePronounResult(res: PronounResponse, wordItem: Word) {
    if (!res || !res.success) {
      Alert.alert("Pronounce check failed", "Không thể xử lý kết quả.");
      // keep for recheck
      recheckPoolRef.current.push(wordItem);
      proceedStage3NextOrRepeat();
      return;
    }
    const acc = res.accuracy_percentage ?? 0;
    const threshold = 80;
    if (acc >= threshold) {
      // correct -> remove from pool
      const newPool = pool.filter((p) => p._id !== wordItem._id);
      setPool(newPool);
      if (newPool.length === 0) {
        // all good -> next stage
        setPool(SAMPLE_WORDS.slice());
        setStage(4);
      }
    } else {
      // not good -> keep for recheck
      recheckPoolRef.current.push(wordItem);
      proceedStage3NextOrRepeat();
    }
  }

  function proceedStage3NextOrRepeat() {
    // If current pool still has items, advance to next index; else repeat
    if (pool.length > 0) {
      // remove the first element handled (we removed it in handlePronounResult if correct)
      // here ensure we pop the first processed one if it wasn't removed
      // but simpler: we always process pool[0], so setPool to pool.slice(1) if the first wasn't removed
      setPool((prev) => {
        if (prev.length <= 1) {
          return prev.slice(0); // handled elsewhere
        } else {
          return prev.slice(1);
        }
      });
    }

    // If pool becomes empty but recheckPool has items -> repeat them
    setTimeout(() => {
      if (pool.length <= 1) {
        if (recheckPoolRef.current.length > 0) {
          setPool(recheckPoolRef.current.slice());
          recheckPoolRef.current = [];
          setRoundCount((r) => r + 1);
        } else if (pool.length <= 1 && recheckPoolRef.current.length === 0) {
          // If last processed was correct and pool empty -> stage progressed inside handlePronounResult
        }
      }
    }, 300);
  }

  // ========= Stage 4: Typing =========
  function onSubmitTypedAnswer(wordItem: Word) {
    // Exact string match required (per user request)
    if (typeAnswer === wordItem.word) {
      // correct -> remove
      const newPool = pool.filter((p) => p._id !== wordItem._id);
      setPool(newPool);
      setTypeAnswer("");
      if (newPool.length === 0) {
        Alert.alert("Finished", "Bạn đã hoàn thành tất cả các giai đoạn!");
        setStage(1);
        setPool(SAMPLE_WORDS.slice());
      }
    } else {
      // incorrect -> add to recheck set
      recheckPoolRef.current.push(wordItem);
      // move forward in pass:
      setPool((prev) => prev.slice(1));
      if (pool.length <= 1) {
        // end of pass -> repeat recheck
        setPool(recheckPoolRef.current.slice());
        recheckPoolRef.current = [];
        setRoundCount((r) => r + 1);
      }
      setTypeAnswer("");
    }
  }

  // ======= UI rendering helpers =======
  function renderStage1() {
    const word = pool[currentIndex];
    if (!word) return <Text>Đang chuẩn bị...</Text>;

    return (
      <View style={styles.card}>
        <Text style={styles.title}>{word.word}</Text>
        <Text style={styles.sub}>{word.partOfSpeech}</Text>
        <Text style={styles.pron}>{word.pronunciation}</Text>
        <Text style={styles.example}>{word.exampleSentence}</Text>

        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.btn, styles.btnRemember]}
            onPress={() => onStage1Answer(true)}
          >
            <Text style={styles.btnText}>Đã nhớ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnNotRemember]}
            onPress={() => onStage1Answer(false)}
          >
            <Text style={styles.btnText}>Chưa nhớ</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>
          Giai đoạn 1 — Vòng: {roundCount} ({currentIndex + 1}/{pool.length})
        </Text>
      </View>
    );
  }

  function renderStage2() {
    return (
      <View style={{ flex: 1 }}>
        <Text style={styles.hint}>
          Giai đoạn 2 — Vòng: {roundCount} (ghép từ & nghĩa)
        </Text>
        <View style={styles.stage2Container}>
          <View style={styles.col}>
            <Text style={styles.colTitle}>Từ</Text>
            <ScrollView>
              {leftItems.map((l) => (
                <TouchableOpacity
                  key={l._id}
                  style={[
                    styles.matchCard,
                    selectedLeft === l._id && styles.matchCardSelected,
                  ]}
                  onPress={() => onPickLeft(l._id)}
                >
                  <Text style={styles.matchWord}>{l.word}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={styles.col}>
            <Text style={styles.colTitle}>Nghĩa</Text>
            <ScrollView>
              {rightItems.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={[
                    styles.matchCard,
                    selectedRight === r.id && styles.matchCardSelected,
                  ]}
                  onPress={() => onPickRight(r.id)}
                >
                  <Text style={styles.matchDef}>{r.text}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.btn, styles.btnCheck]}
            onPress={onCheckMatch}
          >
            <Text style={styles.btnText}>Kiểm tra cặp</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  function renderStage3() {
    const current = pool[0];
    if (!current) {
      return <Text>Đang xử lý...</Text>;
    }
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Phát âm: {current.word}</Text>
        <Text style={styles.pron}>{current.pronunciation}</Text>
        <Text style={styles.example}>{current.definition}</Text>

        {isRecording ? (
          <TouchableOpacity
            style={[styles.btn, styles.btnRecording]}
            onPress={() => stopRecordingAndUpload(current)}
          >
            <Text style={styles.btnText}>Dừng & Gửi</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.btn, styles.btnRecord]}
            onPress={() => startRecording()}
          >
            <Text style={styles.btnText}>Bắt đầu ghi âm</Text>
          </TouchableOpacity>
        )}

        {uploading && (
          <View style={{ marginTop: 10 }}>
            <ActivityIndicator size="small" />
            <Text>Đang gửi file...</Text>
          </View>
        )}

        <Text style={styles.hint}>
          Giai đoạn 3 — Vòng: {roundCount} (các từ chưa thuộc sẽ được lặp lại)
        </Text>
      </View>
    );
  }

  function renderStage4() {
    const current = pool[0];
    if (!current) return <Text>Hoàn tất hoặc đang chuẩn bị...</Text>;

    return (
      <View style={styles.card}>
        <Text style={styles.title}>Gõ lại từ: (exact match)</Text>
        <Text style={styles.sub}>Nghĩa: {current.definition}</Text>

        <TextInput
          style={styles.input}
          placeholder="Nhập chính xác từ vựng"
          value={typeAnswer}
          onChangeText={setTypeAnswer}
          autoCapitalize="none"
        />

        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.btn, styles.btnCheck]}
            onPress={() => onSubmitTypedAnswer(current)}
          >
            <Text style={styles.btnText}>Nộp</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>
          Giai đoạn 4 — Vòng: {roundCount} (yêu cầu khớp chính xác)
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Học Từ Vựng — Giai đoạn {stage}</Text>

      <View style={{ flex: 1, width: "100%" }}>
        {stage === 1 && renderStage1()}
        {stage === 2 && renderStage2()}
        {stage === 3 && renderStage3()}
        {stage === 4 && renderStage4()}
      </View>

      <View style={styles.footer}>
        <Text>Pool: {pool.length} từ</Text>
        <Text>Round: {roundCount}</Text>
      </View>
    </View>
  );
}

// ====== Styles ======
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#ffffff",
    alignItems: "center",
  },
  header: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  card: {
    width: "100%",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f6f6f6",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  sub: { fontSize: 14, color: "#555", marginVertical: 4 },
  pron: { fontSize: 14, fontStyle: "italic", color: "#333" },
  example: { marginTop: 8, color: "#333" },
  row: {
    flexDirection: "row",
    marginTop: 12,
    justifyContent: "space-between",
  },
  btn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 6,
    alignItems: "center",
  },
  btnRemember: { backgroundColor: "#4CAF50" },
  btnNotRemember: { backgroundColor: "#F44336" },
  btnCheck: { backgroundColor: "#2196F3" },
  btnRecord: { backgroundColor: "#FF9800" },
  btnRecording: { backgroundColor: "#D32F2F" },
  btnText: { color: "#fff", fontWeight: "700" },
  hint: { marginTop: 10, color: "#666" },
  stage2Container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    width: "100%",
  },
  col: {
    width: "48%",
    backgroundColor: "#fafafa",
    borderRadius: 8,
    padding: 8,
    maxHeight: 360,
  },
  colTitle: { fontWeight: "700", marginBottom: 6 },
  matchCard: {
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  matchCardSelected: { borderColor: "#2196F3", borderWidth: 2 },
  matchWord: { fontSize: 16, fontWeight: "600" },
  matchDef: { fontSize: 14 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginTop: 10,
    borderRadius: 8,
  },
  footer: {
    width: "100%",
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: "#eee",
    marginTop: 12,
    alignItems: "center",
  },
});
