import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import styled, { keyframes } from 'styled-components';
import { theme } from '../../styles/theme';
import { Message } from '../../types';
import { MessageCircle } from 'lucide-react';

const ChatAreaWrapper = styled(motion.div)`
  background: linear-gradient(
    to bottom,
    ${theme.colors.secondary},
    ${theme.colors.dark}
  );
  color: ${theme.colors.primary};
  border: 1px solid ${theme.colors.primary};
  border-radius: 0.5rem;
  padding: 1.5rem;
  height: 600px;
  display: flex;
  flex-direction: column;
`;

const MessagesContainer = styled.div`
  overflow-y: auto;
  flex-grow: 1;
  margin-bottom: 1rem;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${theme.colors.dark};
  }

  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.primary};
    border-radius: 4px;
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ChatMessage = styled(motion.div)<{ is_moderator: boolean }>`
  margin-bottom: 0.75rem;
  padding: 1rem;
  background: ${(props) =>
    props.is_moderator ? theme.colors.primary : theme.colors.dark};
  color: ${(props) =>
    props.is_moderator ? theme.colors.dark : theme.colors.primary};
  border: 1px solid ${theme.colors.primary};
  border-radius: 0.5rem;
  font-size: 0.875rem;
  animation: ${fadeIn} 0.3s ease-out;
`;

const Form = styled.form`
  display: flex;
  gap: 0.5rem;
`;

const Input = styled.input`
  flex-grow: 1;
  padding: 0.5rem;
  border: 1px solid ${theme.colors.primary};
  border-radius: 0.25rem;
  background: ${theme.colors.dark};
  color: ${theme.colors.primary};
`;

const Button = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${theme.colors.primary};
  color: ${theme.colors.dark};
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
`;

interface ChatAreaProps {
  messages: Message[];
  newMessage: string;
  setNewMessage: (message: string) => void;
  sendMessage: (e: React.FormEvent) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  newMessage,
  setNewMessage,
  sendMessage,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Sort messages by created_at
  const sortedMessages = [...messages].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <ChatAreaWrapper initial="hidden" animate="visible">
      <MessagesContainer>
        {sortedMessages.map((message) => (
          <ChatMessage
            key={message.id}
            is_moderator={message.author === 'Moderator'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <strong>{message.author}:</strong> {message.text}
          </ChatMessage>
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      <Form onSubmit={sendMessage}>
        <Input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <Button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageCircle size={16} />
          Send
        </Button>
      </Form>
    </ChatAreaWrapper>
  );
};

export default ChatArea;
