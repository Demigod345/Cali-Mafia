// @ts-nocheck

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';
import { motion } from 'framer-motion';
import {
  Moon,
  Sun,
  MessageCircle,
  UserCircle2,
  Crown,
  Skull,
} from 'lucide-react';
import contractData from '../../constants/contractData.json';
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
import { log } from 'console';
// Reuse the existing styled components and theme
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Arial', sans-serif;
    background-color: #000000;
    color: #ffffff;
  }
`;

const theme = {
  colors: {
    primary: '#1db954',
    secondary: '#4caf50',
    danger: '#ff4136',
    light: '#ffffff',
    dark: '#000000',
  },
};

const FullPageCenter = styled.div`
  display: flex;
  min-height: 100vh;
  width: 100vw;
  background-color: ${(props) => props.theme.colors.dark};
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const GameWrapper = styled.div`
  width: 90%;
  max-width: 1200px;
`;

const TextStyle = styled.div`
  color: ${(props) => props.theme.colors.light};
  margin-bottom: 1em;
  font-size: 2em;
`;

const Button = styled.button`
  color: ${(props) => props.theme.colors.dark};
  padding: 0.25em 1em;
  margin: 0.25em;
  border-radius: 8px;
  font-size: 1.5em;
  background: ${(props) => props.theme.colors.primary};
  cursor: pointer;
  border: none;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Input = styled.input`
  flex-grow: 1;
  padding: 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid ${(props) => props.theme.colors.primary};
  background-color: ${(props) => props.theme.colors.dark};
  color: ${(props) => props.theme.colors.light};
`;

const PlayerList = styled.div`
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: ${(props) => props.theme.colors.dark};
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: 0.5rem;
`;

const PlayerListItem = styled.div<{ isAlive: boolean; isMafia: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: ${(props) =>
    props.isAlive
      ? props.isMafia
        ? props.theme.colors.danger
        : props.theme.colors.light
      : props.theme.colors.secondary};
`;

const ChatArea = styled.div`
  background-color: ${(props) => props.theme.colors.dark};
  color: ${(props) => props.theme.colors.light};
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  height: 16rem;
  overflow-y: auto;
`;

const ChatMessage = styled.div<{ isModerator: boolean }>`
  margin-bottom: 0.5rem;
  font-weight: ${(props) => (props.isModerator ? 'bold' : 'normal')};
  color: ${(props) =>
    props.isModerator ? props.theme.colors.primary : 'inherit'};
`;

const Form = styled.form`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const RoleSelector = styled.select`
  padding: 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid ${(props) => props.theme.colors.primary};
  background-color: ${(props) => props.theme.colors.dark};
  color: ${(props) => props.theme.colors.light};
`;

const PhaseIndicator = styled.div`
  font-size: 1.5em;
  margin-bottom: 1em;
  color: ${(props) => props.theme.colors.primary};
`;

type Player = {
  name: string;
  role: string;
  isAlive: boolean;
};

type GamePhase = 'Role Assignment' | 'Night' | 'Day';

const ModeratorMafiaPortal: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPhase, setCurrentPhase] =
    useState<GamePhase>('Role Assignment');
  const [messages, setMessages] = useState<
    Array<{ sender: string; text: string; isModerator: boolean }>
  >([]);
  const [newMessage, setNewMessage] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [connection, setConnection] = useState<WalletAccount | null>(null);
  const [address, setAddress] = useState('');
  const [gameId, setGameId] = useState<string | null>(null);
  const [mafiaContract, setMafiaContract] = useState<Contract | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  const provider = new RpcProvider({
    nodeUrl: getStarknetRpcUrl(),
  });

  useEffect(() => {
    const handleConnectWallet = async () => {
      try {
        const selectedWalletSWO = await connect({ modalTheme: 'dark' });
        const wallet = await new WalletAccount(
          { nodeUrl: getStarknetRpcUrl()},
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

    // console.log(process.env.VITE_CONTEXT_ID);
    // console.log(getStarknetRpcUrl());
    
    handleConnectWallet();

    const fetchData = async () => {
      await fetchGameData();
      await fetchPlayers();
    };

    fetchData();
    // const interval = setInterval(fetchData, 5000); // Fetch every 5 seconds

    // return () => clearInterval(interval);
  }, [gameId, address]);

  const fetchGameData = async () => {
    try {
      const contract = await getContract();
      if (contract) {
        const gameStateResponse = await contract.get_game_state(gameId);
        console.log('Game state:', gameStateResponse);
        // setGameState(gameStateResponse);
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
        let currentPlayerFound = false;
        const playersInfo = await Promise.all(
          playerAddresses.map(async (playerAddress) => {
            const playerInfo = await contract.get_player_info(
              gameId,
              playerAddress,
            );
            playerInfo.address = num.toHex(playerAddress);
            playerInfo.name = shortString.decodeShortString(playerInfo.name);
            if (
              playerInfo.address.toString().toLowerCase() ===
              address.toString().toLowerCase()
            ) {
              playerInfo.is_current_player = true;
              currentPlayerFound = true;
            }
            return playerInfo;
          }),
        );
        // setPlayers(playersInfo);
        console.log('Players:', playersInfo);
        if (!currentPlayerFound) {
          toast.error('Current player not found in the game');
        }
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

  const addPlayer = useCallback(() => {
    if (newPlayerName) {
      setPlayers((prev) => [
        ...prev,
        { name: newPlayerName, role: '', isAlive: true },
      ]);
      setNewPlayerName('');
    }
  }, [newPlayerName]);

  const assignRole = useCallback((playerName: string, role: string) => {
    setPlayers((prev) =>
      prev.map((player) =>
        player.name === playerName ? { ...player, role } : player,
      ),
    );
  }, []);

  const commitRoles = useCallback(() => {
    console.log('Assigned Roles:');
    players.forEach((player) => {
      console.log(`${player.name}: ${player.role}`);
    });
    setCurrentPhase('Night');
  }, [players]);

  const eliminatePlayer = useCallback((playerName: string) => {
    setPlayers((prev) =>
      prev.map((player) =>
        player.name === playerName ? { ...player, isAlive: false } : player,
      ),
    );
  }, []);

  const sendMessage = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (newMessage.trim()) {
        setMessages((prev) => [
          ...prev,
          { sender: 'Moderator', text: newMessage, isModerator: true },
        ]);
        setNewMessage('');
      }
    },
    [newMessage],
  );

  const togglePhase = useCallback(() => {
    setCurrentPhase((prev) => (prev === 'Night' ? 'Day' : 'Night'));
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <FullPageCenter>
        <GameWrapper>
          <TextStyle>Moderator & Mafia Portal</TextStyle>

          <PhaseIndicator>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {currentPhase === 'Night' ? (
                <Moon />
              ) : currentPhase === 'Day' ? (
                <Sun />
              ) : (
                <Crown />
              )}
              {currentPhase} Phase
            </motion.div>
          </PhaseIndicator>

          {currentPhase === 'Role Assignment' && (
            <>
              <PlayerList>
                <h3>Assign Roles:</h3>
                {players.map((player) => (
                  <PlayerListItem
                    key={player.name}
                    isAlive={player.isAlive}
                    isMafia={player.role === 'Mafia'}
                  >
                    <span>{player.name}</span>
                    <RoleSelector
                      value={player.role}
                      onChange={(e) => assignRole(player.name, e.target.value)}
                    >
                      <option value="">Select Role</option>
                      <option value="Civilian">Villager</option>
                      <option value="Mafia">Mafia</option>
                    </RoleSelector>
                  </PlayerListItem>
                ))}
              </PlayerList>

              <Button
                onClick={commitRoles}
                disabled={players.some((p) => !p.role)}
              >
                Commit Roles and Start Game
              </Button>
            </>
          )}

          {(currentPhase === 'Night' || currentPhase === 'Day') && (
            <>
              <Button onClick={togglePhase}>Toggle Phase</Button>

              <PlayerList>
                <h3>Players:</h3>
                {players.map((player) => (
                  <PlayerListItem
                    key={player.name}
                    isAlive={player.isAlive}
                    isMafia={player.role === 'Mafia'}
                  >
                    <span>
                      {player.isAlive ? <UserCircle2 /> : <Skull />}{' '}
                      {player.name}
                      {!player.isAlive && ` - ${player.role}`}
                    </span>
                    {player.isAlive && currentPhase === 'Night' && (
                      <Button onClick={() => eliminatePlayer(player.name)}>
                        Eliminate
                      </Button>
                    )}
                  </PlayerListItem>
                ))}
              </PlayerList>

              <ChatArea>
                {messages.map((message, index) => (
                  <ChatMessage key={index} isModerator={message.isModerator}>
                    <strong>{message.sender}:</strong> {message.text}
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
                <Button type="submit">
                  <MessageCircle />
                  Send
                </Button>
              </Form>
            </>
          )}
        </GameWrapper>
      </FullPageCenter>
    </ThemeProvider>
  );
};

export default ModeratorMafiaPortal;
