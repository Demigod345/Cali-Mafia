import React from 'react';
import { motion } from 'framer-motion';
import styled, { keyframes } from 'styled-components';
import { theme } from '../../styles/theme';
import { Message } from '../../types';
import { Button, Input, Form } from './StyledComponents';
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
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;

  @media (max-width: 768px) {
    height: 400px;
  }
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
  return (
    <ChatAreaWrapper initial="hidden" animate="visible">
      <MessagesContainer>
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            is_moderator={message.author === 'Moderator'}
          >
            <strong>{message.author}:</strong> {message.text}
          </ChatMessage>
        ))}
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
          <MessageCircle />
          Send
        </Button>
      </Form>
    </ChatAreaWrapper>
  );
};

export default ChatArea;
