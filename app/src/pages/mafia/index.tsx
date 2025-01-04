'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styled, {
  createGlobalStyle,
  ThemeProvider,
  keyframes,
} from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Moon,
  Sun,
  MessageCircle,
  UserCircle2,
  Crown,
  Skull,
  Users,
  Activity,
  Shield,
  Eye,
} from 'lucide-react';
import {
  RpcProvider,
  Contract,
  WalletAccount,
  num,
  shortString,
} from 'starknet';
import { connect } from 'get-starknet';
import { Toaster, toast } from 'react-hot-toast';
import { getStarknetRpcUrl } from '../../utils/env';
import contractData from '../../constants/contractData.json';

// Constants
const PHASE_ROLE_ASSIGNMENT: number = 3;
const PHASE_NIGHT: number = 4;
const PHASE_DAY: number = 5;
const ROLE_VILLAGER: number = 1;
const ROLE_MAFIA: number = 2;

// Theme
const theme = {
  colors: {
    primary: '#00ff00',
    primaryGlow: 'rgba(0, 255, 0, 0.15)',
    secondary: '#006400',
    danger: '#ff0000',
    light: '#ffffff',
    dark: '#000000',
    gray: '#1a1a1a',
    overlay: 'rgba(0, 255, 0, 0.05)',
  },
};

// Animations
const glowAnimation = keyframes`
  0% { box-shadow: 0 0 5px ${theme.colors.primaryGlow}; }
  50% { box-shadow: 0 0 20px ${theme.colors.primaryGlow}; }
  100% { box-shadow: 0 0 5px ${theme.colors.primaryGlow}; }
`;

// Styled Components
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Inter', sans-serif;
    background: linear-gradient(to bottom right, ${theme.colors.dark}, #001400);
    color: ${theme.colors.light};
    min-height: 100vh;
  }
`;

const FullPageCenter = styled.div`
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

const GameWrapper = styled(motion.div)`
  width: 90%;
  max-width: 1200px;
`;

const Header = styled.header`
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

const HeaderTitle = styled.h1`
  font-size: 2rem;
  color: ${theme.colors.primary};
  margin: 0;
  text-shadow: 0 0 10px ${theme.colors.primaryGlow};
`;

const HeaderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const InfoItem = styled.div`
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

const Button = styled(motion.button)`
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

const Input = styled.input`
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

const PlayerList = styled(motion.div)`
  margin-bottom: 1rem;
  padding: 1.5rem;
  background: linear-gradient(
    to bottom,
    ${theme.colors.secondary},
    ${theme.colors.dark}
  );
  border: 1px solid ${theme.colors.primary};
  border-radius: 0.5rem;
  animation: ${glowAnimation} 3s infinite;
`;

const PlayerListItem = styled(motion.div)<{
  isAlive: boolean;
  isMafia: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding: 1rem;
  background: ${theme.colors.dark};
  border: 1px solid
    ${(props) => (props.isMafia ? theme.colors.danger : theme.colors.primary)};
  border-radius: 0.5rem;
  color: ${(props) =>
    props.isAlive
      ? props.isMafia
        ? theme.colors.danger
        : theme.colors.primary
      : theme.colors.gray};
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(5px);
  }
`;

const ChatArea = styled(motion.div)`
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
  animation: ${glowAnimation} 3s infinite;

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

const ChatMessage = styled(motion.div)<{ isModerator: boolean }>`
  margin-bottom: 0.75rem;
  padding: 1rem;
  background: ${(props) =>
    props.isModerator ? theme.colors.primary : theme.colors.dark};
  color: ${(props) =>
    props.isModerator ? theme.colors.dark : theme.colors.primary};
  border: 1px solid ${theme.colors.primary};
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(5px);
  }
`;

const Form = styled.form`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const PhaseIndicator = styled(motion.div)`
  font-size: 2rem;
  margin-bottom: 1.5em;
  color: ${theme.colors.primary};
  display: flex;
  align-items: center;
  gap: 1rem;
  text-shadow: 0 0 10px ${theme.colors.primaryGlow};
`;

const RoleAssignmentGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const RoleCard = styled(motion.div)<{ role: number }>`
  padding: 1.5rem;
  background: ${(props) => {
    switch (props.role) {
      case ROLE_MAFIA:
        return theme.colors.danger;
      case ROLE_VILLAGER:
        return theme.colors.primary;
      default:
        return theme.colors.dark;
    }
  }};
  color: ${(props) =>
    props.role !== 0 ? theme.colors.dark : theme.colors.primary};
  border: 1px solid ${theme.colors.primary};
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px
      ${(props) =>
        props.role === ROLE_MAFIA
          ? 'rgba(255, 0, 0, 0.15)'
          : theme.colors.primaryGlow};
  }
`;

const PlayerStatus = styled.div`
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

const CommonBoard = styled(motion.div)`
  background: ${theme.colors.dark};
  border: 1px solid ${theme.colors.primary};
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

// Types
type Player = {
  name: string;
  role: number;
  isAlive: boolean;
  is_moderator: boolean;
  address: string;
  revealed: boolean;
};

type GamePhase = 'Role Assignment' | 'Night' | 'Day';

type Message = {
  id: string;
  author: string;
  text: string;
  timestamp: string;
};

// Main Component
const MafiaGame: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPhase, setCurrentPhase] =
    useState<GamePhase>('Role Assignment');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [connection, setConnection] = useState<WalletAccount | null>(null);
  const [address, setAddress] = useState('');
  const [gameId, setGameId] = useState<string | null>(null);
  const [gameIdEntered, setGameIdEntered] = useState(false);
  const [mafiaContract, setMafiaContract] = useState<Contract | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  const provider = new RpcProvider({
    nodeUrl: getStarknetRpcUrl(),
  });

  useEffect(() => {
    const handleConnectWallet = async () => {
      try {
        const selectedWalletSWO = await connect({ modalTheme: 'dark' });
        const wallet = await new WalletAccount(
          { nodeUrl: getStarknetRpcUrl() },
          selectedWalletSWO,
        );

        if (wallet) {
          setConnection(wallet);
          setAddress(wallet.walletProvider.selectedAddress);
          toast.success('Wallet connected successfully!');
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
        toast.error('Failed to connect wallet. Please try again.');
      }
    };

    handleConnectWallet();

    // if (gameId) {
    //   const fetchData = async () => {
    //     await fetchGameData()
    //     await fetchPlayers()
    //   }

    //   fetchData()
    //   const interval = setInterval(fetchData, 5000) // Fetch data every 5 seconds

    //   return () => clearInterval(interval)
    // }
  }, [address]);

  const fetchGameData = async () => {
    try {
      const contract = await getContract();
      if (contract) {
        const gameStateResponse = await contract.get_game_state(gameId);
        console.log('Game state:', gameStateResponse);
        // Update game state in the component
        setCurrentPhase(getPhaseString(gameStateResponse.current_phase));
      }
    } catch (error) {
      console.error('Error fetching game data:', error);
    }
  };

  const fetchPlayers = async () => {
    try {
      const contract = await getContract();
      if (contract) {
        const playerAddresses = await contract.get_players(gameId);
        const playersInfo = await Promise.all(
          playerAddresses.map(async (playerAddress) => {
            const playerInfo = await contract.get_player_info(
              gameId,
              playerAddress,
            );
            const playerName = shortString.decodeShortString(playerInfo.name);
            const player = {
              name: playerName,
              role: playerInfo.role,
              isAlive: playerInfo.is_active,
              is_moderator: playerInfo.is_moderator,
              address: num.toHex(playerAddress),
              revealed: false,
            };

            if (player.address === address) {
              setCurrentPlayer(player);
            }

            return player;
          }),
        );
        setPlayers(playersInfo);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const getContract = async () => {
    if (mafiaContract != null) {
      return mafiaContract;
    }

    try {
      const { abi: contractAbi } = await provider.getClassAt(
        contractData.contractAddress,
      );
      if (contractAbi === undefined) {
        throw new Error('No ABI found for the contract.');
      }
      const contract = new Contract(
        contractAbi,
        contractData.contractAddress,
        provider,
      );
      setMafiaContract(contract);
      return contract;
    } catch (error) {
      console.error('Error getting contract:', error);
      toast.error(
        'Failed to interact with the game contract. Please try again.',
      );
      return null;
    }
  };

  const assignRole = useCallback(
    async (playerName: string, role: number) => {
      try {
        const contract = await getContract();
        if (contract && gameId) {
          await contract.assign_role(gameId, playerName, role);
          setPlayers((prev) =>
            prev.map((player) =>
              player.name === playerName ? { ...player, role } : player,
            ),
          );
          toast.success(
            `Assigned ${role === ROLE_MAFIA ? 'Mafia' : 'Villager'} role to ${playerName}`,
          );
        }
      } catch (error) {
        console.error('Error assigning role:', error);
        toast.error('Failed to assign role. Please try again.');
      }
    },
    [gameId],
  );

  const commitRoles = useCallback(async () => {
    try {
      const contract = await getContract();
      if (contract && gameId) {
        await contract.commit_roles(gameId);
        setCurrentPhase('Night');
        toast.success('Roles committed successfully!');
      }
    } catch (error) {
      console.error('Error committing roles:', error);
      toast.error('Failed to commit roles. Please try again.');
    }
  }, [gameId]);

  const revealRole = useCallback(
    async (playerName: string) => {
      try {
        const contract = await getContract();
        if (contract && gameId) {
          const role = await contract.reveal_role(gameId, playerName);
          setPlayers((prev) =>
            prev.map((player) =>
              player.name === playerName
                ? { ...player, revealed: true }
                : player,
            ),
          );
          toast.success(
            `${playerName}'s role is ${role === ROLE_MAFIA ? 'Mafia' : 'Villager'}`,
          );
        }
      } catch (error) {
        console.error('Error revealing role:', error);
        toast.error('Failed to reveal role. Please try again.');
      }
    },
    [gameId],
  );

  const sendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (newMessage.trim() && gameId) {
        try {
          const contract = await getContract();
          if (contract) {
            await contract.send_message(gameId, newMessage.trim());
            setNewMessage('');
            toast.success('Message sent successfully!');
          }
        } catch (error) {
          console.error('Error sending message:', error);
          toast.error('Failed to send message. Please try again.');
        }
      }
    },
    [newMessage, gameId],
  );

  const handleGameIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (gameId) {
      try {
        const contract = await getContract();
        if (contract) {
          const gameExists = await contract.does_game_exist(gameId);
          if (gameExists) {
            await fetchGameData();
            await fetchPlayers();
            setGameIdEntered(true);
          } else {
            toast.error(
              'Game not found. Please check the Game ID and try again.',
            );
          }
        }
      } catch (error) {
        console.error('Error checking game existence:', error);
        toast.error('Failed to check if the game exists. Please try again.');
      }
    }
  };

  const getPhaseString = (phase: number): GamePhase => {
    switch (phase) {
      case PHASE_ROLE_ASSIGNMENT:
        return 'Role Assignment';
      case PHASE_NIGHT:
        return 'Night';
      case PHASE_DAY:
        return 'Day';
      default:
        return 'Role Assignment';
    }
  };

  const getRemainingCounts = () => {
    const villagerCount = players.filter(
      (p) => p.isAlive && p.role === ROLE_VILLAGER,
    ).length;
    const mafiaCount = players.filter(
      (p) => p.isAlive && p.role === ROLE_MAFIA,
    ).length;
    return { villagerCount, mafiaCount };
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Toaster position="top-right" />
      <FullPageCenter>
        <GameWrapper
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <Header>
            <HeaderTitle>Cali Mafia</HeaderTitle>
            <HeaderInfo>
              <InfoItem>
                <Users />
                {players.length} Players
              </InfoItem>
              <InfoItem>
                <Activity />
                {currentPhase}
              </InfoItem>
            </HeaderInfo>
          </Header>

          {currentPlayer && (
            <PlayerStatus>
              <Shield size={24} />
              <span>Playing as: {currentPlayer.name}</span>
              {currentPlayer.is_moderator && (
                <span className="text-primary">(Moderator)</span>
              )}
            </PlayerStatus>
          )}

          {!gameIdEntered ? (
            <Form onSubmit={handleGameIdSubmit}>
              <Input
                type="text"
                value={gameId || ''}
                onChange={(e) => setGameId(e.target.value)}
                placeholder="Enter Game ID"
              />
              <Button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
              >
                Join Game
              </Button>
            </Form>
          ) : (
            <motion.div variants={containerVariants}>
              <PhaseIndicator variants={itemVariants}>
                {currentPhase === 'Night' ? (
                  <Moon />
                ) : currentPhase === 'Day' ? (
                  <Sun />
                ) : (
                  <Crown />
                )}
                {currentPhase} Phase
              </PhaseIndicator>

              {currentPhase === 'Role Assignment' &&
                currentPlayer?.is_moderator && (
                  <>
                    <RoleAssignmentGrid variants={containerVariants}>
                      {players
                        .filter((player) => !player.is_moderator)
                        .map((player) => (
                          <RoleCard
                            key={player.name}
                            role={player.role}
                            variants={itemVariants}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <h3>{player.name}</h3>
                            <p>
                              Current Role:{' '}
                              {player.role === 0
                                ? 'Unassigned'
                                : player.role === ROLE_VILLAGER
                                  ? 'Villager'
                                  : 'Mafia'}
                            </p>
                            <Button
                              onClick={() =>
                                assignRole(player.name, ROLE_VILLAGER)
                              }
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Assign Villager
                            </Button>
                            <Button
                              onClick={() =>
                                assignRole(player.name, ROLE_MAFIA)
                              }
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Assign Mafia
                            </Button>
                          </RoleCard>
                        ))}
                    </RoleAssignmentGrid>

                    <Button
                      onClick={commitRoles}
                      disabled={players.some(
                        (p) => !p.is_moderator && p.role === 0,
                      )}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Commit Roles and Start Game
                    </Button>
                  </>
                )}

              {(currentPhase === 'Night' || currentPhase === 'Day') && (
                <>
                  <CommonBoard variants={containerVariants}>
                    <h3>Game Status:</h3>
                    <p>
                      Eliminated Players:{' '}
                      {players
                        .filter((p) => !p.isAlive)
                        .map((p) => p.name)
                        .join(', ')}
                    </p>
                    <p>
                      Remaining Villagers: {getRemainingCounts().villagerCount}
                    </p>
                    <p>Remaining Mafia: {getRemainingCounts().mafiaCount}</p>
                  </CommonBoard>

                  <PlayerList variants={containerVariants}>
                    <h3>Players:</h3>
                    <AnimatePresence>
                      {players.map((player) => (
                        <PlayerListItem
                          key={player.name}
                          isAlive={player.isAlive}
                          isMafia={player.role === ROLE_MAFIA}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                        >
                          <span>
                            {player.isAlive ? <UserCircle2 /> : <Skull />}{' '}
                            {player.name}
                            {(!player.isAlive || player.revealed) &&
                              ` - ${player.role === ROLE_MAFIA ? 'Mafia' : 'Villager'}`}
                          </span>
                          {player.isAlive &&
                            currentPlayer?.is_moderator &&
                            !player.revealed && (
                              <Button
                                onClick={() => revealRole(player.name)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Eye />
                                Reveal Role
                              </Button>
                            )}
                        </PlayerListItem>
                      ))}
                    </AnimatePresence>
                  </PlayerList>

                  <ChatArea
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {messages.map((message) => (
                      <ChatMessage
                        key={message.id}
                        isModerator={
                          players.find((p) => p.name === message.author)
                            ?.is_moderator || false
                        }
                        variants={itemVariants}
                      >
                        <strong>{message.author}:</strong> {message.text}
                      </ChatMessage>
                    ))}
                  </ChatArea>

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
                </>
              )}
            </motion.div>
          )}
        </GameWrapper>
      </FullPageCenter>
    </ThemeProvider>
  );
};

export default MafiaGame;
