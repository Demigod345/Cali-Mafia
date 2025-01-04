import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Button } from './StyledComponents';
import { Player } from '../../types';
import { ROLE_VILLAGER, ROLE_MAFIA } from '../../utils/gameUtils';

const RoleAssignmentGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const RoleCard = styled(motion.div)<{ assigned: boolean }>`
  padding: 1.5rem;
  background: ${(props) =>
    props.assigned ? theme.colors.secondary : theme.colors.dark};
  color: ${theme.colors.primary};
  border: 1px solid ${theme.colors.primary};
  border-radius: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px ${theme.colors.primaryGlow};
  }
`;

interface RoleAssignmentProps {
  players: Player[];
  assignRole: (address: string, role: number) => Promise<void>;
}

const RoleAssignment: React.FC<RoleAssignmentProps> = ({
  players,
  assignRole,
}) => {
  const [assignedRoles, setAssignedRoles] = useState<Record<string, number>>(
    {},
  );

  const handleAssignRole = async (playerAddress: string, role: number) => {
    await assignRole(playerAddress, role);
    setAssignedRoles((prev) => ({ ...prev, [playerAddress]: role }));
  };

  return (
    <RoleAssignmentGrid>
      {players.map(
        (player) =>
          !player.is_moderator && (
            <RoleCard
              key={player.address}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              assigned={!!assignedRoles[player.address]}
            >
              <h3>{player.name}</h3>
              {assignedRoles[player.address] ? (
                <p>
                  Assigned Role: {getRoleName(assignedRoles[player.address])}
                </p>
              ) : (
                <>
                  <Button
                    onClick={() =>
                      handleAssignRole(player.address, ROLE_VILLAGER)
                    }
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Assign Villager
                  </Button>
                  <Button
                    onClick={() => handleAssignRole(player.address, ROLE_MAFIA)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Assign Mafia
                  </Button>
                </>
              )}
            </RoleCard>
          ),
      )}
    </RoleAssignmentGrid>
  );
};

export default RoleAssignment;
