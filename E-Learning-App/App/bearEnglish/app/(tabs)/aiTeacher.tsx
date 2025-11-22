"use client";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Send, Sparkles } from "lucide-react-native";
import { useState, useRef, useCallback, useEffect } from "react";
import Svg, { Circle, Path } from "react-native-svg";
import API from "../../api/index";

const WhiteBearIcon = ({ size = 60 }) => (
  <Svg width={size} height={size} viewBox="0 0 120 140" fill="none">
    {/* Background decorations */}
    <Circle cx="15" cy="25" r="3" fill="#4a4d60" opacity="0.6" />
    <Circle cx="105" cy="30" r="2.5" fill="#4a4d60" opacity="0.6" />
    <Circle cx="20" cy="110" r="2" fill="#4a4d60" opacity="0.5" />
    <Circle cx="110" cy="100" r="2.5" fill="#4a4d60" opacity="0.5" />

    {/* Star decorations */}
    <Path
      d="M 25 50 L 27 56 L 33 56 L 28 60 L 30 66 L 25 62 L 20 66 L 22 60 L 17 56 L 23 56 Z"
      fill="#4a4d60"
      opacity="0.4"
    />
    <Path
      d="M 100 45 L 101 49 L 105 49 L 102 52 L 103 56 L 100 53 L 97 56 L 98 52 L 95 49 L 99 49 Z"
      fill="#4a4d60"
      opacity="0.4"
    />

    {/* Left Ear */}
    <Circle
      cx="30"
      cy="25"
      r="16"
      fill="#FFFFFF"
      stroke="#E8E8E8"
      strokeWidth="1"
    />
    {/* Right Ear */}
    <Circle
      cx="90"
      cy="25"
      r="16"
      fill="#FFFFFF"
      stroke="#E8E8E8"
      strokeWidth="1"
    />

    {/* Head - Rounded rectangle shape */}
    <Path
      d="M 35 35 L 85 35 Q 100 35 100 50 L 100 95 Q 100 110 85 110 L 35 110 Q 20 110 20 95 L 20 50 Q 20 35 35 35 Z"
      fill="#FFFFFF"
      stroke="#E8E8E8"
      strokeWidth="1.5"
    />

    {/* Left Eye */}
    <Circle cx="40" cy="60" r="5" fill="#1a1a1a" />
    {/* Right Eye */}
    <Circle cx="80" cy="60" r="5" fill="#1a1a1a" />

    {/* Left Eye Shine */}
    <Circle cx="41" cy="58" r="1.5" fill="#FFFFFF" opacity="0.8" />
    {/* Right Eye Shine */}
    <Circle cx="81" cy="58" r="1.5" fill="#FFFFFF" opacity="0.8" />

    {/* Nose */}
    <Circle cx="60" cy="78" r="6" fill="#1a1a1a" />

    {/* Mouth - Simple dot */}
    <Circle cx="60" cy="92" r="2.5" fill="#1a1a1a" />
  </Svg>
);

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

const generateUserId = () => {
  return (
    "user-" +
    Math.random().toString(36).substring(2, 10) +
    Date.now().toString(36)
  );
};

const renderMessageContent = (text: string, isUser: boolean) => {
  if (isUser) {
    return <Text style={styles.userMessageText}>{text}</Text>;
  }

  const sections: string[] = text.split("\n\n***\n\n");

  return sections.map((section, index) => (
    <View key={index} style={styles.messageSection}>
      {section.split("\n").map((line, lineIndex) => {
        const parts = line.split(/(\*\*.*?\*\*)/g);

        return (
          <Text key={lineIndex} style={styles.aiMessageText}>
            {parts.map((part, partIndex) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return (
                  <Text key={partIndex} style={styles.boldText}>
                    {part.substring(2, part.length - 2)}
                  </Text>
                );
              } else {
                return <Text key={partIndex}>{part}</Text>;
              }
            })}
          </Text>
        );
      })}
    </View>
  ));
};

export default function AIChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      text: "Xin chào tôi là gấu BearEnglish đây, bạn cần hỏi đáp gì không? 🐻‍❄️",
      isUser: false,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [messageIdCounter, setMessageIdCounter] = useState(1);
  const [userId, setUserId] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!userId) {
      const newId = generateUserId();
      setUserId(newId);
    }
  }, []);

  const sendMessageToAI = useCallback(
    async (text: string) => {
      if (isLoading || !text.trim() || !userId) return;

      const newUserMessage: Message = {
        id: messageIdCounter,
        text: text.trim(),
        isUser: true,
      };
      setMessageIdCounter((prev) => prev + 1);
      setMessages((prev) => [...prev, newUserMessage]);
      setInputText("");
      setIsLoading(true);

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      try {
        const data = await API.sendMessageToAI(text, userId);
        const botReply = data.reply;

        const newAIMessage: Message = {
          id: messageIdCounter + 1,
          text: botReply,
          isUser: false,
        };
        setMessageIdCounter((prev) => prev + 1);
        setMessages((prev) => [...prev, newAIMessage]);
      } catch (error) {
        console.error("Error calling chat API:", error);
        Alert.alert(
          "Connection Error",
          "Unable to connect to AI server. Please check if localhost:3000 is running."
        );
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== newUserMessage.id)
        );
      } finally {
        setIsLoading(false);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    },
    [isLoading, messageIdCounter, userId]
  );

  const handleSendPress = () => {
    sendMessageToAI(inputText);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 10}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          {/* Modern Header */}
          <LinearGradient colors={["#0f0f23", "#16213e"]} style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.bearEmojiLarge}>🐻‍❄️</Text>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>AI Teacher Bear</Text>
                <Text style={styles.headerSubtitle}>
                  White Bear English Assistant
                </Text>
              </View>
              <Sparkles size={24} color="rgba(255,255,255,0.8)" />
            </View>
          </LinearGradient>

          {/* Chat Area */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.chatArea}
            contentContainerStyle={styles.chatContentContainer}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={
                  msg.isUser
                    ? styles.userMessageContainer
                    : styles.aiMessageContainer
                }
              >
                {!msg.isUser && (
                  <View style={styles.aiAvatarSmall}>
                    <Text style={styles.bearEmoji}>🐻‍❄️</Text>
                  </View>
                )}
                {msg.isUser ? (
                  <LinearGradient
                    colors={["#4CAF50", "#45a049"]}
                    style={styles.userMessageBubble}
                  >
                    {renderMessageContent(msg.text, msg.isUser)}
                  </LinearGradient>
                ) : (
                  <View style={styles.aiMessageBubble}>
                    {renderMessageContent(msg.text, msg.isUser)}
                  </View>
                )}
              </View>
            ))}

            {isLoading && (
              <View style={styles.loadingContainer}>
                <View style={styles.aiAvatarSmall}>
                  <Text style={styles.bearEmoji}>🐻‍❄️</Text>
                </View>
                <View style={styles.loadingBubble}>
                  <ActivityIndicator size="small" color="#00d4ff" />
                  <Text style={styles.loadingText}>
                    White Bear is thinking...
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Modern Input Area */}
          <View style={styles.inputArea}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Ask White Bear about English..."
                placeholderTextColor="#a0a0a0"
                value={inputText}
                onChangeText={setInputText}
                editable={!isLoading}
                onSubmitEditing={handleSendPress}
                multiline
              />
              <TouchableOpacity
                style={[
                  styles.sendButtonWrapper,
                  (isLoading || !inputText.trim()) && styles.sendButtonDisabled,
                ]}
                onPress={handleSendPress}
                disabled={isLoading || !inputText.trim()}
              >
                <LinearGradient
                  colors={
                    isLoading || !inputText.trim()
                      ? ["#95a5a6", "#7f8c8d"]
                      : ["#4CAF50", "#45a049"]
                  }
                  style={styles.sendButton}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Send size={20} color="#ffffff" />
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginTop: 2,
  },
  chatArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  chatContentContainer: {
    paddingVertical: 20,
    gap: 16,
  },
  userMessageContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    gap: 8,
  },
  aiMessageContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    gap: 8,
  },
  aiAvatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2c2c54",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#ffffff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#40407a",
  },
  userMessageBubble: {
    maxWidth: "75%",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  userMessageText: {
    color: "#ffffff",
    fontSize: 15,
    lineHeight: 22,
  },
  aiMessageBubble: {
    maxWidth: "75%",
    backgroundColor: "#2c2c54",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#ffffff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#40407a",
  },
  messageSection: {
    marginBottom: 6,
  },
  aiMessageText: {
    color: "#f1f2f6",
    fontSize: 15,
    lineHeight: 22,
  },
  boldText: {
    fontWeight: "700",
    color: "#00d4ff",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  loadingBubble: {
    backgroundColor: "#2c2c54",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#ffffff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#40407a",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    color: "#a4b0be",
    fontSize: 14,
    fontStyle: "italic",
  },
  inputArea: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 90,
    backgroundColor: "#1a1a2e",
    borderTopWidth: 1,
    borderTopColor: "#40407a",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: "#2c2c54",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#f1f2f6",
    fontSize: 15,
    maxHeight: 100,
    shadowColor: "#ffffff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#40407a",
  },
  sendButtonWrapper: {
    alignSelf: "flex-end",
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  bearEmoji: {
    fontSize: 18,
  },
  bearEmojiLarge: {
    fontSize: 28,
  },
});
