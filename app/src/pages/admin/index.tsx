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
  CallData,
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
  GetPlayerNonceRequest,
  GetPlayerNonceResponse,
  GetProposalMessagesRequest,
  GetProposalMessagesResponse,
  SendProposalMessageRequest,
  SendProposalMessageResponse,
} from '../../api/clientApi';
import { ResponseData } from '@calimero-is-near/calimero-p2p-sdk';
import { twoFeltToString } from '../../utils/starknet';

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
  is_active: boolean;
}>`
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
  address: String;
  public_identity_key: String;
  is_moderator: boolean;
  is_active: boolean;
  revealed_role: number;
};

type GameState = {
  created: boolean;
  started: boolean;
  ended: boolean;
  current_phase: number;
  player_count: number;
  current_day: number;
  moderator: String;
  is_moderator_chosen: boolean;
  mafia_count: number;
  villager_count: number;
  moderator_count: number;
  active_mafia_count: number;
  active_villager_count: number;
};

type Message = {
  id: String;
  proposal_id: String;
  author: String;
  text: String;
  created_at: String;
};

const PHASE_ROLE_ASSIGNMENT = 3;
const PHASE_NIGHT = 4;
const PHASE_DAY = 5;

const ROLE_UNASSIGNED = 0;
const ROLE_VILLAGER = 1;
const ROLE_MAFIA = 2;

const getRoleName = (role: number) => {
  switch (role) {
    case ROLE_VILLAGER:
      return 'Villager';
    case ROLE_MAFIA:
      return 'Mafia';
    default:
      return 'Unassigned';
  }
};

const getPhaseName = (phase: number) => {
  switch (phase) {
    case PHASE_ROLE_ASSIGNMENT:
      return 'Role Assignment';
    case PHASE_NIGHT:
      return 'Night';
    case PHASE_DAY:
      return 'Day';
    default:
      return 'Unknown';
  }
};

const ModeratorMafiaPortal: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPhase, setCurrentPhase] = useState(PHASE_ROLE_ASSIGNMENT);
  const [gameState, setGameState] = useState(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [connection, setConnection] = useState<WalletAccount | null>(null);
  const [address, setAddress] = useState('');
  const [gameId, setGameId] = useState<String | null>(null);
  const [gameIdEntered, setGameIdEntered] = useState(false);
  const [mafiaContract, setMafiaContract] = useState<Contract | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<String | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  // Calimero rpc calls written here ========================================

  async function storePlayerRoleNonce(request: AssignRoleRequest) {
    const result: ResponseData<AssignRoleResponse> =
      await new LogicApiDataSource().assignRole(request);

    if (result.error) {
      console.error('Error creating action', result.error);
    }

    console.log('Role assigned to player');
    // Yaha result which comes back is null only, if it is error it will be caught in the if condition
  }

  async function getPlayerRoleNonce(request: GetPlayerNonceRequest) {
    const result: ResponseData<GetPlayerNonceResponse> =
      await new LogicApiDataSource().getPlayerNonce(request);

    if (result.error) {
      console.error('Error creating action', result.error);
    }

    console.log('Player nonce is', result.data);
    return result.data;
  }
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
  }, [address]);

  const fetchGameData = async () => {
    try {
      const contract = await getContract();
      if (contract) {
        const gameStateResponse = await contract.get_game_state(gameId);
        console.log('Game state:', gameStateResponse);
        // Update game state in the component
        setCurrentPhase(Number(gameStateResponse.current_phase));
        setGameState(gameStateResponse);
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
            const public_identity_key = twoFeltToString(
              playerInfo.public_identity_key_1,
              playerInfo.public_identity_key_2,
            );
            const player = {
              name: playerName,
              address: num.toHex(playerAddress),
              public_identity_key: public_identity_key,
              is_active: playerInfo.is_active,
              is_moderator: playerInfo.is_moderator,
              revealed_role: playerInfo.revealed_role,
            };

            if (playerAddress == address) {
              setCurrentPlayer(player);
            }

            return player;
          }),
        );
        console.log('Players:', playersInfo);
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

  const assignRole = async (playerAddress: String, role: number) => {
    console.log('Assigning role to player', playerAddress, getRoleName(role));

    await toast.promise(
      (async () => {
        // a
        const contract = await getContract();
        // const nonce = Math.floor(Math.random() * 10) + 1;
        const nonce = 1;

        const commitment = await contract.get_role_commitment_hash(
          gameId,
          playerAddress,
          role,
          nonce,
        );

        const call = await connection.execute([
          {
            contractAddress: contractData.contractAddress,
            entrypoint: 'submit_role_commitment',
            calldata: CallData.compile({
              game_id: gameId,
              player: playerAddress,
              commitment: commitment,
              mafia_count: 1,
              villager_count: 2,
            }),
          },
        ]);

        await storePlayerRoleNonce({
          address: playerAddress,
          role: role.toString(),
          nonce: nonce,
        });

        const response = await fetch('http://localhost:3000/api/events', {
          method: 'POST',
          body: JSON.stringify({
            game_id: gameId,
            transaction_hash: call.transaction_hash,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          toast.error('Failed to update the chat server. Please try again.');
        } else {
          toast.success('Message sent successfully!');
        }
        // await fetchGameData();
      })(),
      {
        loading: 'Starting the game...',
        success: 'Game started successfully!',
        error: 'Failed to start the game. Please try again.',
      },
    );
  };

  async function eliminatePlayer(playerAddress: String) {
    await toast.promise(
      (async () => {
        await fetchGameData();

        const call = await connection.execute([
          {
            contractAddress: contractData.contractAddress,
            entrypoint: 'eliminate_player_by_mafia',
            calldata: CallData.compile({
              game_id: gameId,
              player: playerAddress,
              mafia_remaining: gameState.active_mafia_count,
              mafia_1_commitment: 123,
              mafia_2_commitment: 123,
            }),
          },
        ]);

        const response = await fetch('http://localhost:3000/api/events', {
          method: 'POST',
          body: JSON.stringify({
            game_id: gameId,
            transaction_hash: call.transaction_hash,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          toast.error('Failed to update the chat server. Please try again.');
        } else {
          toast.success('Message sent successfully!');
        }
        // await fetchGameData();
      })(),
      {
        loading: 'Starting the game...',
        success: 'Game started successfully!',
        error: 'Failed to start the game. Please try again.',
      },
    );
  }

  async function revealRole(playerAddress: String) {
    await toast.promise(
      (async () => {
        const RoleNonce = await getPlayerRoleNonce({ address: playerAddress });

        const call = await connection.execute([
          {
            contractAddress: contractData.contractAddress,
            entrypoint: 'reveal_role',
            calldata: CallData.compile({
              game_id: gameId,
              player: playerAddress,
              role: RoleNonce.role,
              nonce: RoleNonce.nonce,
            }),
          },
        ]);

        const response = await fetch('http://localhost:3000/api/events', {
          method: 'POST',
          body: JSON.stringify({
            game_id: gameId,
            transaction_hash: call.transaction_hash,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          toast.error('Failed to update the chat server. Please try again.');
        } else {
          toast.success('Message sent successfully!');
        }
        // await fetchGameData();
      })(),
      {
        loading: 'Starting the game...',
        success: 'Game started successfully!',
        error: 'Failed to start the game. Please try again.',
      },
    );
  }

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

  async function fetchProposalMessages() {
    const params: GetProposalMessagesRequest = {
      proposal_id: '1',
    };
    const result: ResponseData<GetProposalMessagesResponse> =
      await new LogicApiDataSource().getProposalMessages(params);

    // console.log(result);
    // const messages = ;
    setMessages(result?.data?.messages || []);
    if (result?.error) {
      console.error('Error:', result.error);
      window.alert(`${result.error.message}`);
      return;
    }
  }

  async function sendProposalMessage(message: String) {
    const params: SendProposalMessageRequest = {
      proposal_id: '1',
      message: {
        id: '1',
        proposal_id: '1',
        author: currentPlayer?.name || 'Anonymous',
        text: message,
        created_at: new Date().toISOString(),
      },
    };
    const result: ResponseData<SendProposalMessageResponse> =
      await new LogicApiDataSource().sendProposalMessage(params);

    await fetchProposalMessages();
    if (result?.error) {
      console.error('Error:', result.error);
      window.alert(`${result.error.message}`);
      return;
    }
  }

  const doesGameExist = async (gameId: String) => {
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
      await toast.promise(
        (async () => {
          const gameExists = await doesGameExist(gameId);
          if (gameExists) {
            await fetchGameData();
            await fetchPlayers();
            // await fetchProposalMessages(1);
            setGameIdEntered(true);
          } else {
            toast.error(
              'Game not found. Please check the Game ID and try again.',
            );
          }
        })(),
        {
          loading: 'Starting the game...',
          success: 'Game started successfully!',
          error: 'Failed to start the game. Please try again.',
        },
      );
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
              storePlayerRoleNonce({ address: address, role: '1', nonce: 1 })
            }
          >
            Assign Role
          </button>
          <button onClick={() => getPlayerRoleNonce({ address: address })}>
            Get Player Nonce
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
                {getPhaseName(currentPhase)} Phase
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
                {currentPhase === PHASE_NIGHT ? (
                  <Moon />
                ) : currentPhase === PHASE_DAY ? (
                  <Sun />
                ) : (
                  <Crown />
                )}
                {getPhaseName(currentPhase)} Phase
              </PhaseIndicator>

              {currentPhase === PHASE_ROLE_ASSIGNMENT && (
                <>
                  <RoleAssignmentGrid variants={containerVariants}>
                    {players.map(
                      (player) =>
                        !player.is_moderator && (
                          <RoleCard
                            key={player.address}
                            variants={itemVariants}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <h3>{player.name}</h3>
                            {/* <p>{player}</p> */}
                            <Button
                              onClick={() =>
                                assignRole(player.address, ROLE_VILLAGER)
                              }
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Assign Villager
                            </Button>
                            <Button
                              onClick={() =>
                                assignRole(player.address, ROLE_MAFIA)
                              }
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Assign Mafia
                            </Button>
                          </RoleCard>
                        ),
                    )}
                  </RoleAssignmentGrid>
                </>
              )}

              {(currentPhase === PHASE_NIGHT || currentPhase === PHASE_DAY) && (
                <>
                  <PlayerList variants={containerVariants}>
                    <h3>Players:</h3>
                    <AnimatePresence>
                      {players.map((player) => (
                        <PlayerListItem
                          key={player.name}
                          is_active={player.is_active}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                        >
                          <span>
                            {player.is_active ? <UserCircle2 /> : <Skull />}{' '}
                            {player.name}{' '}
                            {player.is_moderator && <p>(Moderator)</p>}
                          </span>
                          {player.is_active &&
                            !player.is_moderator &&
                            currentPhase === PHASE_NIGHT && (
                              <Button
                                onClick={() => eliminatePlayer(player.address)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Eliminate
                              </Button>
                            )}

                          {!player.is_active && (
                            <Button onClick={() => revealRole(player.address)}>
                              {' '}
                              Reveal Role{' '}
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
                        is_moderator={message.author === 'Moderator'}
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
