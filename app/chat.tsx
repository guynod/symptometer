import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Markdown from 'react-native-markdown-display';
import { startChat, sendMessage, cleanupChat } from '../services/gemini';
import { getActiveSymptoms } from '../services/symptoms';
import { useAuth } from '../config/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { getDb } from '../config/firebase';
import { COLLECTIONS } from '../config/firebase-schema';
import { useSymptoms } from '../hooks/useSymptoms';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
}

interface ChatSession {
  id: string;
}

interface UserDetails {
  name?: string;
  age?: number;
}

export default function ChatScreen() {
  const { width } = useWindowDimensions();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [chatInstance, setChatInstance] = useState<ChatSession | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const { user } = useAuth();
  const { symptoms } = useSymptoms();
  const [userDetails, setUserDetails] = useState<UserDetails>({});

  const loadUserDetails = useCallback(async () => {
    if (!user) return;
    try {
      const userDoc = await getDoc(doc(getDb(), COLLECTIONS.USERS, user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserDetails({
          name: data.name || undefined,
          age: data.age || undefined,
        });
        return {
          name: data.name,
          age: data.age
        };
      }
    } catch (error) {
      console.error('Error loading user details:', error);
    }
    return {};
  }, [user]);

  useEffect(() => {
    initializeChat();
    return () => {
      if (chatInstance?.id) {
        cleanupChat(chatInstance.id);
      }
    };
  }, []);

  const initializeChat = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be signed in to use the chat feature');
      router.back();
      return;
    }

    setIsLoading(true);
    try {
      console.log('Loading user details...');
      const userDoc = await getDoc(doc(getDb(), COLLECTIONS.USERS, user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      const details = {
        name: userData.name,
        age: userData.age
      };
      console.log('User details loaded:', details);

      console.log('Starting chat with details:', { symptoms, userDetails: details });
      const { id } = await startChat(symptoms || [], details);
      setChatInstance({ id });
      setMessages([
        {
          id: '1',
          content: `Hello${details.name ? `, ${details.name}` : ''}! I'm your AI health assistant. I'm aware of your symptoms and I'm here to help. What would you like to discuss?`,
          role: 'assistant',
        },
      ]);
    } catch (error) {
      console.error('Error initializing chat:', error);
      Alert.alert('Error', 'Failed to initialize chat. Please try again later.');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !chatInstance || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      content: inputText.trim(),
      role: 'user' as const,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await sendMessage(chatInstance, userMessage.content);
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant' as const,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.role === 'user' ? styles.userMessage : styles.assistantMessage,
      ]}
    >
      {item.role === 'user' ? (
        <Text style={[styles.messageText, styles.userMessageText]}>
          {item.content}
        </Text>
      ) : (
        <Markdown
          style={{
            body: styles.markdownBody,
            heading1: styles.markdownH1,
            heading2: styles.markdownH2,
            heading3: styles.markdownH3,
            paragraph: styles.markdownParagraph,
            bullet_list: styles.markdownList,
            ordered_list: styles.markdownList,
            bullet_list_icon: styles.markdownListIcon,
            code_inline: styles.markdownCode,
            code_block: styles.markdownCodeBlock,
            fence: styles.markdownCodeBlock,
            link: styles.markdownLink,
            blockquote: styles.markdownBlockquote,
            em: styles.markdownEm,
            strong: styles.markdownStrong,
          }}
        >
          {item.content}
        </Markdown>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={100}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Health Assistant</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        onLayout={() => flatListRef.current?.scrollToEnd()}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          multiline
          maxLength={1000}
          editable={!isLoading}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={isLoading || !inputText.trim()}
          style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="send" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 8,
    padding: 12,
    borderRadius: 16,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    marginRight: 12,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    maxHeight: 100,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  userMessageText: {
    color: '#fff',
  },
  markdownBody: {
    color: '#333',
  },
  markdownH1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333',
  },
  markdownH2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 8,
    color: '#333',
  },
  markdownH3: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 6,
    color: '#333',
  },
  markdownParagraph: {
    marginVertical: 8,
    lineHeight: 20,
    color: '#333',
  },
  markdownList: {
    marginLeft: 20,
  },
  markdownListIcon: {
    fontSize: 16,
    lineHeight: 20,
    color: '#333',
  },
  markdownCode: {
    backgroundColor: '#f5f5f5',
    padding: 2,
    borderRadius: 4,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  markdownCodeBlock: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 4,
    marginVertical: 8,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  markdownLink: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  markdownBlockquote: {
    borderLeftWidth: 4,
    borderLeftColor: '#ddd',
    paddingLeft: 10,
    marginLeft: 10,
    fontStyle: 'italic',
  },
  markdownEm: {
    fontStyle: 'italic',
  },
  markdownStrong: {
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 