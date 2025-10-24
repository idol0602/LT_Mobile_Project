import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Modal, 
  Text, 
  ActivityIndicator, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { FAB, Card } from 'react-native-paper';

// 🧠 Tạo userId ngẫu nhiên (UUID ngắn gọn)
const generateUserId = () => {
  return 'user-' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
};

interface Message {
  id: number;
  text: string;
  isUser: boolean; 
}

interface AIChatModalProps {
  visible: boolean;
  onClose: () => void;
}

interface ChatResponse {
  reply: string;
}

const CHAT_API_URL = 'http://localhost:3000/chat';

const renderMessageContent = (text: string, isUser: boolean) => {
  if (isUser) {
    return (
      <View style={styles.userMessageBubble}>
        <Text style={styles.userMessageText}>{text}</Text>
      </View>
    );
  }

  const sections: string[] = text.split('\n\n***\n\n');
  
  return sections.map((section, index) => (
    <Card key={index} style={styles.aiMessageCard}>
      <Card.Content>
        {section.split('\n').map((line, lineIndex) => {
          const parts = line.split(/(\*\*.*?\*\*)/g);
          
          return (
            <Text key={lineIndex} style={styles.aiMessageText}>
              {parts.map((part, partIndex) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <Text key={partIndex} style={styles.boldText}>{part.substring(2, part.length - 2)}</Text>;
                } else {
                  return <Text key={partIndex}>{part}</Text>;
                }
              })}
            </Text>
          );
        })}
      </Card.Content>
    </Card>
  ));
};

const AIChatModal: React.FC<AIChatModalProps> = ({ visible, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [messageIdCounter, setMessageIdCounter] = useState<number>(0);
  const [userId, setUserId] = useState<string>('');

  const scrollViewRef = React.useRef<ScrollView>(null);

  // 🧩 Tạo userId khi modal được mở lần đầu
  useEffect(() => {
    if (!userId) {
      const newId = generateUserId();
      console.log("🔑 UserId khởi tạo:", newId);
      setUserId(newId);
    }
  }, [visible]);

  const sendMessageToAI = useCallback(async (text: string) => {
    if (isLoading || !text.trim() || !userId) return;

    const newUserMessage: Message = { 
      id: messageIdCounter, 
      text: text.trim(), 
      isUser: true 
    };
    setMessageIdCounter(prev => prev + 1);
    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');
    setIsLoading(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // 📨 Gửi userId kèm theo request
      const response = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text.trim(), 
          userId: userId 
        }), 
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data: ChatResponse = await response.json();
      const botReply = data.reply;

      const newAIMessage: Message = { 
        id: messageIdCounter + 1,
        text: botReply, 
        isUser: false 
      };
      setMessageIdCounter(prev => prev + 1);
      setMessages(prev => [...prev, newAIMessage]);

    } catch (error) {
      console.error("❌ Lỗi khi gọi API chat:", error);
      Alert.alert("Lỗi kết nối", "Không thể kết nối đến máy chủ AI (localhost:3000). Vui lòng kiểm tra server.");
      setMessages(prev => prev.filter(msg => msg.id !== newUserMessage.id)); 
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [isLoading, messageIdCounter, userId]);

  const handleSendPress = () => {
    sendMessageToAI(inputText);
  };
  
  return (
    <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <FAB icon="close" onPress={onClose} small />
        </TouchableOpacity>

        <Text style={styles.chatHeader}>Trợ lý AI BearEnglish 🐻‍❄️</Text>
        
        <ScrollView 
          style={styles.chatArea}
          ref={scrollViewRef}
          contentContainerStyle={{ paddingBottom: 10 }}
        >
          {messages.map(msg => (
            <View key={msg.id} style={msg.isUser ? styles.userMessage : styles.aiMessage}>
              {renderMessageContent(msg.text, msg.isUser)}
            </View>
          ))}
          
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6200ee" /> 
              <Text style={styles.loadingText}>AI đang soạn câu trả lời...</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Nhập tin nhắn của bạn..."
            value={inputText}
            onChangeText={setInputText}
            editable={!isLoading}
            onSubmitEditing={handleSendPress}
          />
          <FAB
            style={styles.sendButton}
            icon="send"
            small
            onPress={handleSendPress}
            disabled={isLoading || !inputText.trim()}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: { flex: 1, paddingTop: 40, backgroundColor: '#fff' },
  closeButton: { position: 'absolute', top: 40, left: 10, zIndex: 10, backgroundColor: '#ccc', borderRadius: 50, padding: 2 },
  chatHeader: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee', marginBottom: 10 },
  chatArea: { flex: 1, paddingHorizontal: 10 },
  loadingContainer: { alignItems: 'flex-start', padding: 10, flexDirection: 'row' },
  loadingText: { marginLeft: 10, marginTop: 5, color: '#6200ee', fontStyle: 'italic' },
  userMessage: { alignSelf: 'flex-end', marginVertical: 5, maxWidth: '80%' },
  userMessageBubble: { backgroundColor: '#007bff', borderRadius: 15, padding: 10 },
  userMessageText: { color: '#fff' },
  aiMessage: { alignSelf: 'flex-start', marginVertical: 5, maxWidth: '90%' },
  aiMessageCard: { marginVertical: 5, backgroundColor: '#f0f0f0', borderRadius: 15 },
  aiMessageText: { lineHeight: 22 },
  boldText: { fontWeight: 'bold' },
  inputArea: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderTopColor: '#eee', alignItems: 'center', height: 70 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 25, paddingHorizontal: 15, paddingVertical: 8, marginRight: 10 },
  sendButton: { backgroundColor: '#6200ee' },
});

export default AIChatModal;
