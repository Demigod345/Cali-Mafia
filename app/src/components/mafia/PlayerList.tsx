import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircle2, Skull } from 'lucide-react';
import { Button } from './StyledComponents';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Player } from '../../types';
import { ROLE_UNASSIGNED } from '../../utils/gameUtils';

const PlayerListWrapper = styled(motion.div)`
  margin-bottom: 1rem;
  padding: 1.5rem;
  background: linear-gradient(
    to bottom,
    ${theme.colors.secondary},
    ${theme.colors.dark}
  );
  border: 1px solid ${theme.colors.primary};
  border-radius: 0.5rem;
  animation: ${(props) => props.theme.glowAnimation} 3s infinite;
`;

const PlayerListItem = styled(motion.div)<{ is_active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding: 1rem;
  background: ${theme.colors.dark};
  border: 1px solid ${theme.colors.primary};
  border-radius: 0.5rem;
  color: ${(props) =>
    props.is_active ? theme.colors.primary : theme.colors.gray};
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(5px);
  }
`;

interface PlayerListProps {
  players: Player[];
  currentPhase: number;
  onEliminatePlayer: (address: string) => void;
  onRevealRole: (address: string) => void;
}

const PlayerList: React.FC<PlayerListProps> = ({
  players,
  currentPhase,
  onEliminatePlayer,
  onRevealRole,
}) => {
  return (
    <PlayerListWrapper>
      <h3>Players:</h3>
      <AnimatePresence>
        {players.map((player) => (
          <PlayerListItem
            key={player.name}
            is_active={player.is_active}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <span>
              {player.is_active ? <UserCircle2 /> : <Skull />} {player.name}
              {player.is_moderator && <span> (Moderator)</span>}
            </span>
            {player.is_active && !player.is_moderator && currentPhase === 4 && (
              <Button
                onClick={() => onEliminatePlayer(player.address)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Eliminate
              </Button>
            )}
            {!player.is_active && (
              <Button
                onClick={() => onRevealRole(player.address)}
                disabled={player.revealed_role !== ROLE_UNASSIGNED}
              >
                Reveal Role
              </Button>
            )}
          </PlayerListItem>
        ))}
      </AnimatePresence>
    </PlayerListWrapper>
  );
};

export default PlayerList;
