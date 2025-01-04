import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { theme } from '../../styles/theme';

const FinalScreenWrapper = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: ${theme.colors.dark};
  border: 2px solid ${theme.colors.primary};
  border-radius: 1rem;
  color: ${theme.colors.primary};
  text-align: center;
`;

const WinnerText = styled.h2`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const TrophyIcon = styled(Trophy)`
  width: 64px;
  height: 64px;
  margin-bottom: 1rem;
  color: ${theme.colors.primary};
`;

interface FinalScreenProps {
  winner: string;
}

const FinalScreen: React.FC<FinalScreenProps> = ({ winner }) => {
  return (
    <FinalScreenWrapper
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <TrophyIcon />
      <WinnerText>Game Over!</WinnerText>
      <p>The winner is: {winner}</p>
    </FinalScreenWrapper>
  );
};

export default FinalScreen;
