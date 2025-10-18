"use client"
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native"
import { useState, useRef, useCallback, useEffect } from "react"
import Svg, { Circle, Path } from "react-native-svg"

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
    <Circle cx="30" cy="25" r="16" fill="#FFFFFF" stroke="#E8E8E8" strokeWidth="1" />
    {/* Right Ear */}
    <Circle cx="90" cy="25" r="16" fill="#FFFFFF" stroke="#E8E8E8" strokeWidth="1" />

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
)

interface Message {
  id: number
  text: string
  isUser: boolean
}

interface ChatResponse {
  reply: string
}

const CHAT_API_URL = "http://localhost:3000/chat"

const generateUserId = () => {
  return "user-" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
}

const renderMessageContent = (text: string, isUser: boolean) => {
  if (isUser) {
    return <Text style={styles.userMessageText}>{text}</Text>
  }

  const sections: string[] = text.split("\n\n***\n\n")

  return sections.map((section, index) => (
    <View key={index} style={styles.messageSection}>
      {section.split("\n").map((line, lineIndex) => {
        const parts = line.split(/(\*\*.*?\*\*)/g)

        return (
          <Text key={lineIndex} style={styles.aiMessageText}>
            {parts.map((part, partIndex) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return (
                  <Text key={partIndex} style={styles.boldText}>
                    {part.substring(2, part.length - 2)}
                  </Text>
                )
              } else {
                return <Text key={partIndex}>{part}</Text>
              }
            })}
          </Text>
        )
      })}
    </View>
  ))
}

export default function AIChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      text: "Hello! I'm your English learning assistant. How can I help you today? 🐻‍❄️",
      isUser: false,
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [inputText, setInputText] = useState("")
  const [messageIdCounter, setMessageIdCounter] = useState(1)
  const [userId, setUserId] = useState("")
  const scrollViewRef = useRef<ScrollView>(null)

  useEffect(() => {
    if (!userId) {
      const newId = generateUserId()
      setUserId(newId)
    }
  }, [])

  const sendMessageToAI = useCallback(
    async (text: string) => {
      if (isLoading || !text.trim() || !userId) return

      const newUserMessage: Message = {
        id: messageIdCounter,
        text: text.trim(),
        isUser: true,
      }
      setMessageIdCounter((prev) => prev + 1)
      setMessages((prev) => [...prev, newUserMessage])
      setInputText("")
      setIsLoading(true)

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true })
      }, 100)

      try {
        const response = await fetch(CHAT_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text.trim(),
            userId: userId,
          }),
        })

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

        const data: ChatResponse = await response.json()
        const botReply = data.reply

        const newAIMessage: Message = {
          id: messageIdCounter + 1,
          text: botReply,
          isUser: false,
        }
        setMessageIdCounter((prev) => prev + 1)
        setMessages((prev) => [...prev, newAIMessage])
      } catch (error) {
        console.error("Error calling chat API:", error)
        Alert.alert("Connection Error", "Unable to connect to AI server. Please check if localhost:3000 is running.")
        setMessages((prev) => prev.filter((msg) => msg.id !== newUserMessage.id))
      } finally {
        setIsLoading(false)
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }, 100)
      }
    },
    [isLoading, messageIdCounter, userId],
  )

  const handleSendPress = () => {
    sendMessageToAI(inputText)
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <WhiteBearIcon size={50} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>English Learning Assistant</Text>
            <Text style={styles.headerSubtitle}>Always here to help</Text>
          </View>
        </View>
      </View>

      {/* Chat Area */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <View key={msg.id} style={msg.isUser ? styles.userMessageContainer : styles.aiMessageContainer}>
            {!msg.isUser && (
              <View style={styles.aiAvatarSmall}>
                <WhiteBearIcon size={32} />
              </View>
            )}
            <View style={msg.isUser ? styles.userMessageBubble : styles.aiMessageBubble}>
              {renderMessageContent(msg.text, msg.isUser)}
            </View>
          </View>
        ))}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <View style={styles.aiAvatarSmall}>
              <WhiteBearIcon size={32} />
            </View>
            <View style={styles.loadingBubble}>
              <ActivityIndicator size="small" color="#64B5F6" />
              <Text style={styles.loadingText}>Thinking...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder="Ask me anything about English..."
          placeholderTextColor="#808080"
          value={inputText}
          onChangeText={setInputText}
          editable={!isLoading}
          onSubmitEditing={handleSendPress}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, (isLoading || !inputText.trim()) && styles.sendButtonDisabled]}
          onPress={handleSendPress}
          disabled={isLoading || !inputText.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgb(38, 39, 48)",
  },
  header: {
    backgroundColor: "rgb(50, 52, 65)",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgb(60, 62, 75)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: "#e0e0e0",
    fontSize: 18,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "#a0a0a0",
    fontSize: 12,
    marginTop: 2,
  },
  chatArea: {
    flex: 1,
    paddingHorizontal: 12,
  },
  chatContentContainer: {
    paddingVertical: 16,
    gap: 12,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgb(50, 52, 65)",
    justifyContent: "center",
    alignItems: "center",
  },
  userMessageBubble: {
    maxWidth: "75%",
    backgroundColor: "#2196F3",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userMessageText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
  },
  aiMessageBubble: {
    maxWidth: "75%",
    backgroundColor: "rgb(50, 52, 65)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgb(60, 62, 75)",
  },
  messageSection: {
    marginBottom: 8,
  },
  aiMessageText: {
    color: "#e0e0e0",
    fontSize: 14,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: "700",
    color: "#64B5F6",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  loadingBubble: {
    backgroundColor: "rgb(50, 52, 65)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgb(60, 62, 75)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    color: "#a0a0a0",
    fontSize: 12,
    fontStyle: "italic",
  },
  inputArea: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: 80,
    backgroundColor: "rgb(38, 39, 48)",
    borderTopWidth: 1,
    borderTopColor: "rgb(60, 62, 75)",
    gap: 8,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    backgroundColor: "rgb(50, 52, 65)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#e0e0e0",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "rgb(60, 62, 75)",
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#2196F3",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#666",
    opacity: 0.5,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
})
