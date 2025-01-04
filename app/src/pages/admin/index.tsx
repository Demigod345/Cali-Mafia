// @ts-nocheck

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from 'styled-components';
import { motion } from 'framer-motion';
import {
  Moon,
  Sun,
  MessageCircle,
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
  GetPlayerNonceRequest,
  GetProposalMessagesRequest,
  SendProposalMessageRequest,
} from '../../api/clientApi';
import { ResponseData } from '@calimero-is-near/calimero-p2p-sdk';
import { twoFeltToString } from '../../utils/starknet';
import { theme, GlobalStyle } from '../../styles/theme';
import {
  FullPageCenter,
  GameWrapper,
  Header,
  HeaderTitle,
  HeaderInfo,
  InfoItem,
  Button,
  Input,
  Form,
} from '../../components/mafia/StyledComponents';
import PlayerList from '../../components/mafia/PlayerList';
import ChatArea from '../../components/mafia/ChatArea';
import RoleAssignment from '../../components/mafia/RoleAssignment';

import {
  PHASE_ROLE_ASSIGNMENT,
  PHASE_NIGHT,
  PHASE_DAY,
  getPhaseName,
} from '../../utils/gameUtils';
import { Player, GameState, Message } from '../../types';

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
        loading: 'Assigning role...',
        success: `Role assigned successfully: ${getRoleName(role)}`,
        error: 'Failed to assign role. Please try again.',
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
        loading: 'Eliminating player...',
        success: 'Player eliminated successfully!',
        error: 'Failed to eliminate player. Please try again.',
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
        loading: 'Revealing role...',
        success: 'Role revealed successfully!',
        error: 'Failed to reveal role. Please try again.',
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
            setGameIdEntered(true);
            return 'Game joined successfully!';
          } else {
            throw new Error('Game not found');
          }
        })(),
        {
          loading: 'Joining game...',
          success: (message) => message,
          error: (err) =>
            err.message || 'Failed to join the game. Please try again.',
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
            <motion.div variants={itemVariants}>
              <Shield size={24} />
              <span>Playing as: {currentPlayer.name}</span>
              {currentPlayer.is_moderator && (
                <span className="text-primary">(Moderator)</span>
              )}
            </motion.div>
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
              <motion.div variants={itemVariants}>
                {currentPhase === PHASE_NIGHT ? (
                  <Moon />
                ) : currentPhase === PHASE_DAY ? (
                  <Sun />
                ) : (
                  <MessageCircle />
                )}
                {getPhaseName(currentPhase)} Phase
              </motion.div>

              {currentPhase === PHASE_ROLE_ASSIGNMENT && (
                <RoleAssignment players={players} assignRole={assignRole} />
              )}

              {(currentPhase === PHASE_NIGHT || currentPhase === PHASE_DAY) && (
                <>
                  <PlayerList
                    players={players}
                    currentPhase={currentPhase}
                    onEliminatePlayer={eliminatePlayer}
                    onRevealRole={revealRole}
                  />

                  <ChatArea messages={messages} />

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
