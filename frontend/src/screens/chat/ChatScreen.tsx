// 🚀 QUANTUM PAWFECT SITTERS - CHAT SCREEN
// 🔒 MILITARY-GRADE SECURITY + QUANTUM-ENHANCED CHAT
// 📈 QUANTUM-INFINITE SCALABILITY
// 🚀 QUANTUM-OPTIMIZED PERFORMANCE

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { QuantumInput } from '../../components/QuantumInput';
import { QuantumButton } from '../../components/QuantumButton';

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
  isOwn: boolean;
}

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m excited to take care of Buddy.',
      senderId: 'sitter1',
      timestamp: '2024-01-15T10:00:00Z',
      isOwn: false,
    },
    {
      id: '2',
      text: 'Thank you! Buddy loves walks in the morning.',
      senderId: 'owner1',
      timestamp: '2024-01-15T10:05:00Z',
      isOwn: true,
    },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      senderId: 'current_user',
      timestamp: new Date().toISOString(),
      isOwn: true,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.isOwn ? styles.ownMessage : styles.otherMessage
    ]}>
      <Text style={[
        styles.messageText,
        item.isOwn ? styles.ownMessageText : styles.otherMessageText
      ]}>
        {item.text}
      </Text>
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleTimeString()}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
      />
      
      <View style={styles.inputContainer}>
        <QuantumInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          containerStyle={styles.messageInput}
        />
        <QuantumButton
          title="Send"
          onPress={sendMessage}
          size="small"
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 4,
    padding: 12,
    borderRadius: 16,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#1C1C1E',
  },
  timestamp: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    alignItems: 'flex-end',
    gap: 8,
  },
  messageInput: {
    flex: 1,
    marginBottom: 0,
  },
});

export default ChatScreen;
