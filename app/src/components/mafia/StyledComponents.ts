import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../../styles/theme';

export const glowAnimation = keyframes`
  0% { box-shadow: 0 0 5px ${theme.colors.primaryGlow}; }
  50% { box-shadow: 0 0 20px ${theme.colors.primaryGlow}; }
  100% { box-shadow: 0 0 5px ${theme.colors.primaryGlow}; }
`;

export const FullPageCenter = styled.div`
  display: flex;
  min-height: 100vh;
  width: 100vw;
  background: radial-gradient(
    circle at 50% 50%,
    ${theme.colors.overlay},
    transparent
  );
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 2rem 0;
`;

export const GameWrapper = styled(motion.div)`
  width: 90%;
  max-width: 1200px;
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: linear-gradient(
    to right,
    ${theme.colors.dark},
    ${theme.colors.secondary}
  );
  border: 1px solid ${theme.colors.primary};
  border-radius: 0.5rem;
  margin-bottom: 2rem;
  animation: ${glowAnimation} 3s infinite;
`;

export const HeaderTitle = styled.h1`
  font-size: 2rem;
  color: ${theme.colors.primary};
  margin: 0;
  text-shadow: 0 0 10px ${theme.colors.primaryGlow};
`;

export const HeaderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

export const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  color: ${theme.colors.primary};
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background: ${theme.colors.dark};
  border: 1px solid ${theme.colors.primary};
`;

export const Button = styled(motion.button)`
  color: ${theme.colors.dark};
  padding: 0.75em 1.5em;
  margin: 0.25em;
  border-radius: 8px;
  font-size: 1rem;
  background: ${theme.colors.primary};
  cursor: pointer;
  border: none;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  text-shadow: none;

  &:hover {
    background: ${theme.colors.primaryGlow};
    color: ${theme.colors.primary};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

export const Input = styled.input`
  flex-grow: 1;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid ${theme.colors.primary};
  background: ${theme.colors.dark};
  color: ${theme.colors.primary};
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    box-shadow: 0 0 10px ${theme.colors.primaryGlow};
  }
`;

export const Form = styled.form`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

export const PhaseIndicator = styled(motion.div)`
  font-size: 2rem;
  margin-bottom: 1.5em;
  color: ${theme.colors.primary};
  display: flex;
  align-items: center;
  gap: 1rem;
  text-shadow: 0 0 10px ${theme.colors.primaryGlow};
`;

export const RoleAssignmentGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

export const RoleCard = styled(motion.div)<{ selected: boolean }>`
  padding: 1.5rem;
  background: ${(props) =>
    props.selected ? theme.colors.primary : theme.colors.dark};
  color: ${(props) =>
    props.selected ? theme.colors.dark : theme.colors.primary};
  border: 1px solid ${theme.colors.primary};
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px ${theme.colors.primaryGlow};
  }
`;

export const PlayerStatus = styled.div`
  padding: 1rem;
  background: ${theme.colors.dark};
  border: 1px solid ${theme.colors.primary};
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: ${theme.colors.primary};
`;
