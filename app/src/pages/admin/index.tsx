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
import { LogicApiDataSource } from '../../api/dataSource/LogicApiDataSource';
import {
  AssignRoleRequest,
  AssignRoleResponse,
  GetGameStateRequest,
  GetGameStateResponse,
  GetPlayerNonceRequest,
  GetPlayerNonceResponse,
  GetPlayersRequest,
  GetPlayersResponse,
  GetProposalMessagesRequest,
  GetProposalMessagesResponse,
  SendProposalMessageRequest,
  SendProposalMessageResponse,
  SetGameStateRequest,
  SetGameStateResponse,
  StorePlayersRequest,
  StorePlayersResponse,
} from '../../api/clientApi';
import { ResponseData } from '@calimero-is-near/calimero-p2p-sdk';

// Enhanced theme with gradients and shadows
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

const glowAnimation = keyframes`
  0% { box-shadow: 0 0 5px ${theme.colors.primaryGlow}; }
  50% { box-shadow: 0 0 20px ${theme.colors.primaryGlow}; }
  100% { box-shadow: 0 0 5px ${theme.colors.primaryGlow}; }
`;

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

const RoleCard = styled(motion.div)<{ selected: boolean }>`
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

type Player = {
  name: String;
  is_active: boolean;
  address: String;
  role: String;
  nonce: number;
  is_moderator: boolean;
};

type GameState = {
  current_phase: number;
  player_count: number;
  current_day: number;
  moderator: string;
  is_moderator_chosen: boolean;
  mafia_count: number;
  villager_count: number;
  moderator_count: number;
  active_mafia_count: number;
  active_villager_count: number;
};

type GamePhase = 'Role Assignment' | 'Night' | 'Day';

type Message = {
  id: string;
  proposal_id: string;
  author: string;
  text: string;
  created_at: string;
};

const ModeratorMafiaPortal: React.FC = () => {
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
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  // Calimero rpc calls written here ========================================

  async function storePlayers(request: StorePlayersRequest) {
    const result: ResponseData<StorePlayersResponse> =
      await new LogicApiDataSource().storePlayers(request);

    if (result.error) {
      console.error('Error creating action', result.error);
    }

    console.log('Players are stored to the state', result.data);
  }

  async function getPlayers(request: GetPlayersRequest) {
    const result: ResponseData<GetPlayersResponse> =
      await new LogicApiDataSource().getPlayers(request);

    if (result.error) {
      console.error('Error creating action', result.error);
    }

    console.log('Players recieved from the state are', result.data);
  }

  async function AssignRole(request: AssignRoleRequest) {
    const result: ResponseData<AssignRoleResponse> =
      await new LogicApiDataSource().assignRole(request);

    if (result.error) {
      console.error('Error creating action', result.error);
    }

    console.log('Role assigned to player');
    // Yaha result which comes back is null only, if it is error it will be caught in the if condition
  }

  async function getPlayerNonce(request: GetPlayerNonceRequest) {
    const result: ResponseData<GetPlayerNonceResponse> =
      await new LogicApiDataSource().getPlayerNonce(request);

    if (result.error) {
      console.error('Error creating action', result.error);
    }

    console.log('Player nonce is', result.data);
  }

  async function setGameState(request: SetGameStateRequest) {
    const result: ResponseData<SetGameStateResponse> =
      await new LogicApiDataSource().setGameState(request);

    if (result.error) {
      console.error('Error creating action', result.error);
    }

    console.log('Game state set', result.data);
  }

  async function getGameState(request: GetGameStateRequest) {
    const result: ResponseData<GetGameStateResponse> =
      await new LogicApiDataSource().getGameState(request);

    if (result.error) {
      console.error('Error creating action', result.error);
    }

    console.log('Game state set', result.data);
  }

  // useEffect(() => {
  //   storePlayers({players: [{name: 'player1', is_active: true, address: '0x123', role: 'Villager', nonce: 1, is_moderator: false}]});
  //   // getPlayers({});
  //   AssignRole({address:'0x123', role: 'Mafia', nonce: 123});
  //   getPlayers({});

  // },[]);

  // ==========================================================================

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

    if (gameId) {
      const fetchData = async () => {
        await fetchGameData();
        await fetchPlayers();
        await fetchProposalMessages(1);
      };

      fetchData();
      const interval = setInterval(() => fetchProposalMessages(1), 5000); // Fetch messages every 5 seconds

      return () => clearInterval(interval);
    }
  }, [gameId, address]);

  const fetchGameData = async () => {
    try {
      const contract = await getContract();
      if (contract) {
        const gameStateResponse = await contract.get_game_state(gameId);
        console.log('Game state:', gameStateResponse);
        // Update game state in the component
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
              role: '',
              isAlive: true,
              isModerator: playerInfo.is_moderator,
              address: num.toHex(playerAddress),
            };

            // Set current player if address matches
            if (playerAddress === address) {
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

  const assignRole = useCallback((playerName: string, role: string) => {
    setPlayers((prev) =>
      prev.map((player) =>
        player.name === playerName ? { ...player, role } : player,
      ),
    );
  }, []);

  const commitRoles = useCallback(async () => {
    try {
      const contract = await getContract();
      if (contract && gameId) {
        // Implement the contract call to commit roles
        // This is a placeholder and needs to be replaced with the actual contract method
        // await contract.commit_roles(gameId, players.map(p => ({ name: p.name, role: p.role })))
        console.log(
          'Roles committed:',
          players.map((p) => `${p.name}: ${p.role}`),
        );
        setCurrentPhase('Night');
        toast.success('Roles committed successfully!');
      }
    } catch (error) {
      console.error('Error committing roles:', error);
      toast.error('Failed to commit roles. Please try again.');
    }
  }, [players, gameId]);

  const eliminatePlayer = useCallback(
    async (playerName: string) => {
      try {
        const contract = await getContract();
        if (contract && gameId) {
          // Implement the contract call to eliminate a player
          // This is a placeholder and needs to be replaced with the actual contract method
          // await contract.eliminate_player(gameId, playerName)
          setPlayers((prev) =>
            prev.map((player) =>
              player.name === playerName
                ? { ...player, isAlive: false }
                : player,
            ),
          );
          toast.success(`${playerName} has been eliminated.`);
        }
      } catch (error) {
        console.error('Error eliminating player:', error);
        toast.error('Failed to eliminate player. Please try again.');
      }
    },
    [gameId],
  );

  const fetchProposalMessages = async () => {
    const params: GetProposalMessagesRequest = {
      proposal_id: '1',
    };
    try {
      const result: ResponseData<GetProposalMessagesResponse> =
        await new LogicApiDataSource().getProposalMessages(params);
      if (result?.error) {
        console.error('Error:', result.error);
        toast.error(`Failed to fetch messages: ${result.error.message}`);
        return;
      }
      setMessages(result.data.messages);
    } catch (error) {
      console.error('Error fetching proposal messages:', error);
      toast.error('Failed to fetch messages. Please try again.');
    }
  };

  const sendProposalMessage = async (text: string) => {
    const params: SendProposalMessageRequest = {
      proposal_id: '1',
      message: {
        id: `msg_${Date.now()}`,
        proposal_id: '1',
        author: 'Moderator',
        text: text,
        created_at: new Date().toISOString(),
      },
    };
    try {
      const result: ResponseData<SendProposalMessageResponse> =
        await new LogicApiDataSource().sendProposalMessage(params);
      if (result?.error) {
        console.error('Error:', result.error);
        toast.error(`Failed to send message: ${result.error.message}`);
        return;
      }
      await fetchProposalMessages(1);
    } catch (error) {
      console.error('Error sending proposal message:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };

  const sendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (newMessage.trim() && gameId) {
        await sendProposalMessage(newMessage.trim());
        setNewMessage('');
      }
    },
    [newMessage, gameId],
  );

  const togglePhase = useCallback(async () => {
    try {
      const contract = await getContract();
      if (contract && gameId) {
        // Implement the contract call to toggle the game phase
        // This is a placeholder and needs to be replaced with the actual contract method
        // await contract.toggle_phase(gameId)
        setCurrentPhase((prev) => (prev === 'Night' ? 'Day' : 'Night'));
        toast.success(
          `Phase changed to ${currentPhase === 'Night' ? 'Day' : 'Night'}`,
        );
      }
    } catch (error) {
      console.error('Error toggling phase:', error);
      toast.error('Failed to change game phase. Please try again.');
    }
  }, [gameId, currentPhase]);

  const doesGameExist = async (gameId: string) => {
    const contract = await getContract();
    if (!contract) return false;
    try {
      const res = await contract.does_game_exist(gameId);
      return res;
    } catch (error) {
      console.error('Error checking if game exists:', error);
      toast.error('Failed to check if the game exists. Please try again.');
      return false;
    }
  };

  const handleGameIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (gameId) {
      const gameExists = await doesGameExist(gameId);
      if (gameExists) {
        await fetchGameData();
        await fetchPlayers();
        await fetchProposalMessages(1);
        setGameIdEntered(true);
      } else {
        toast.error('Game not found. Please check the Game ID and try again.');
      }
    }
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
          <button
            onClick={() =>
              storePlayers({
                players: [
                  {
                    name: 'player1',
                    is_active: true,
                    address: '0x123',
                    role: 'Villager',
                    nonce: 1,
                    is_moderator: false,
                  },
                ],
              })
            }
          >
            Mock Set Players
          </button>
          <button onClick={() => getPlayers({})}>Get Players for test</button>
          <button
            onClick={() =>
              AssignRole({ address: '0x123', role: 'dj', nonce: 234 })
            }
          >
            Assign Role
          </button>
          <button onClick={() => getPlayerNonce({ address: '0x123' })}>
            Get Player Nonce
          </button>
          <button onClick={() => getGameState({})}>Get Game State</button>
          <button
            onClick={() =>
              setGameState({
                game_state: {
                  current_phase: 3,
                  player_count: 10,
                  current_day: 0,
                  moderator: 'ox376',
                  is_moderator_chosen: true,
                  mafia_count: 10000,
                  villager_count: 0,
                  moderator_count: 0,
                  active_mafia_count: 0,
                  active_villager_count: 0,
                },
              })
            }
          >
            Set Game State
          </button>
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
              {currentPlayer.isModerator && (
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

              {currentPhase === 'Role Assignment' && (
                <>
                  <RoleAssignmentGrid variants={containerVariants}>
                    {players.map((player) => (
                      <RoleCard
                        key={player.name}
                        selected={player.name === selectedPlayer}
                        onClick={() => setSelectedPlayer(player.name)}
                        variants={itemVariants}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <h3>{player.name}</h3>
                        <Button
                          onClick={() => assignRole(player.name, 'Villager')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Assign Villager
                        </Button>
                        <Button
                          onClick={() => assignRole(player.name, 'Mafia')}
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
                    disabled={players.some((p) => !p.role)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Commit Roles and Start Game
                  </Button>
                </>
              )}

              {(currentPhase === 'Night' || currentPhase === 'Day') && (
                <>
                  <PlayerList variants={containerVariants}>
                    <h3>Players:</h3>
                    <AnimatePresence>
                      {players.map((player) => (
                        <PlayerListItem
                          key={player.name}
                          isAlive={player.isAlive}
                          isMafia={player.role === 'Mafia'}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                        >
                          <span>
                            {player.isAlive ? <UserCircle2 /> : <Skull />}{' '}
                            {player.name}
                            {!player.isAlive && ` - ${player.role}`}
                          </span>
                          {player.isAlive &&
                            currentPhase === 'Night' &&
                            currentPlayer?.isModerator && (
                              <Button
                                onClick={() => eliminatePlayer(player.name)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Eliminate
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
                        isModerator={message.author === 'Moderator'}
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

export default ModeratorMafiaPortal;
