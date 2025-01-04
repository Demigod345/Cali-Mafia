import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Button } from './StyledComponents';
import { Player } from '../../types';
import { ROLE_VILLAGER, ROLE_MAFIA, getRoleName } from '../../utils/gameUtils';
import { Copy } from 'lucide-react';

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

const PublicKeyContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const PublicKey = styled.p`
  margin-right: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CopyButton = styled(Button)`
  padding: 0.25rem;
  min-width: auto;
`;

const InvitationCodeInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  background: ${theme.colors.dark};
  color: ${theme.colors.primary};
  border: 1px solid ${theme.colors.primary};
  border-radius: 0.25rem;
`;

interface RoleAssignmentProps {
  players: Player[];
  assignRole: (
    address: string,
    role: number,
    invitationCode?: string,
  ) => Promise<void>;
}

const RoleAssignment: React.FC<RoleAssignmentProps> = ({
  players,
  assignRole,
}) => {
  const [assignedRoles, setAssignedRoles] = useState<Record<string, number>>(
    {},
  );
  const [invitationCodes, setInvitationCodes] = useState<
    Record<string, string>
  >({});

  const handleAssignRole = async (playerAddress: string, role: number) => {
    if (role === ROLE_MAFIA && !invitationCodes[playerAddress]) {
      alert('Please enter an invitation code for assigning Mafia role.');
      return;
    }
    await assignRole(playerAddress, role, invitationCodes[playerAddress]);
    setAssignedRoles((prev) => ({ ...prev, [playerAddress]: role }));
  };

  const handleCopyPublicKey = (publicKey: string) => {
    navigator.clipboard.writeText(publicKey);
  };

  const handleInvitationCodeChange = (playerAddress: string, code: string) => {
    setInvitationCodes((prev) => ({ ...prev, [playerAddress]: code }));
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
              <PublicKeyContainer>
                <PublicKey>{player.public_identity_key}</PublicKey>
                <CopyButton
                  onClick={() =>
                    handleCopyPublicKey(player.public_identity_key)
                  }
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Copy size={16} />
                </CopyButton>
              </PublicKeyContainer>
              {assignedRoles[player.address] ? (
                <p>
                  Assigned Role: {getRoleName(assignedRoles[player.address])}
                </p>
              ) : (
                <>
                  <InvitationCodeInput
                    type="text"
                    placeholder="Enter invitation code for Mafia"
                    value={invitationCodes[player.address] || ''}
                    onChange={(e) =>
                      handleInvitationCodeChange(player.address, e.target.value)
                    }
                  />
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
