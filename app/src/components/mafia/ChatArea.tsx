import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Message } from '../../types';

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
  margin-bottom: 1rem;
  height: 20rem;
  overflow-y: auto;
  animation: ${(props) => props.theme.glowAnimation} 3s infinite;

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
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(5px);
  }
`;

interface ChatAreaProps {
  messages: Message[];
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages }) => {
  return (
    <ChatAreaWrapper initial="hidden" animate="visible">
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          is_moderator={message.author === 'Moderator'}
        >
          <strong>{message.author}:</strong> {message.text}
        </ChatMessage>
      ))}
    </ChatAreaWrapper>
  );
};

export default ChatArea;
