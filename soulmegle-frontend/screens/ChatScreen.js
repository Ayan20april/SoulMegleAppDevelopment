import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import io from 'socket.io-client';

const API_URL = 'http://soulmegle-4w4g.onrender.com'; 
const socket = io(API_URL);

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    socket.on('receive-message', (msg) => {
      setMessages((prev) => [...prev, { text: msg, sender: 'Other' }]);
    });

    return () => socket.off('receive-message');
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('send-message', { room: 'chatroom1', message });
      setMessages([...messages, { text: message, sender: 'You' }]);
      setMessage('');
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <FlatList
        data={messages}
        renderItem={({ item }) => <Text>{item.sender}: {item.text}</Text>}
        keyExtractor={(_, index) => index.toString()}
      />
      <TextInput value={message} onChangeText={setMessage} placeholder="Type a message" />
      <TouchableOpacity onPress={sendMessage}><Text>Send</Text></TouchableOpacity>
    </View>
  );
}
