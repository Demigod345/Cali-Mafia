'use client'

import React, { useState, useEffect, useCallback } from 'react'
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import useSound from 'use-sound'
import { Moon, Sun, MessageCircle, UserCircle2, AlertTriangle, Crown } from 'lucide-react'

// Game constants
const ROLES = ['Mafia', 'Detective', 'Doctor', 'Civilian']
const PHASES = ['Night', 'Discussion', 'Voting']
const PHASE_DURATION = 2 // seconds
const MIN_PLAYERS = 1
const MAX_PLAYERS = 12

// Styled Components
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Arial', sans-serif;
    background-color: #000000;
    color: #ffffff;
  }
`

const theme = {
  colors: {
    primary: '#1db954',
    secondary: '#4caf50',
    danger: '#ff4136',
    light: '#ffffff',
    dark: '#000000',
  },
}

const FullPageCenter = styled.div`
  display: flex;
  min-height: 100vh;
  width: 100vw;
  background-color: ${props => props.theme.colors.dark};
  justify-content: center;
  align-items: center;
  flex-direction: column;
`

const TextStyle = styled.div`
  color: ${props => props.theme.colors.light};
  margin-bottom: 1em;
  font-size: 2em;
`

const Button = styled.button`
  color: ${props => props.theme.colors.dark};
  padding: 0.25em 1em;
  margin: 0.25em;
  border-radius: 8px;
  font-size: 1.5em;
  background: ${props => props.theme.colors.primary};
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
`

const ButtonSm = styled(Button)`
  font-size: 1rem;
`

const LogoutButton = styled(Button)`
  background: ${props => props.theme.colors.light};
  color: ${props => props.theme.colors.dark};
  margin-top: 2rem;
`

const GameWrapper = styled.div`
  width: 90%;
  max-width: 1200px;
`

const PlayerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`

const PlayerCard = styled(motion.div)<{ isAlive: boolean; isNight: boolean; isCurrent: boolean }>`
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: ${props => 
    props.isAlive 
      ? (props.isNight ? props.theme.colors.dark : props.theme.colors.light)
      : props.theme.colors.danger};
  color: ${props => props.isNight ? props.theme.colors.light : props.theme.colors.dark};
  border: ${props => props.isCurrent ? `2px solid ${props.theme.colors.primary}` : 'none'};
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const ChatArea = styled.div<{ isNight: boolean }>`
  background-color: ${props => props.isNight ? props.theme.colors.dark : props.theme.colors.light};
  color: ${props => props.isNight ? props.theme.colors.light : props.theme.colors.dark};
  border: 1px solid ${props => props.theme.colors.primary};
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  height: 16rem;
  overflow-y: auto;
`

const ChatMessage = styled.div<{ isModerator: boolean }>`
  margin-bottom: 0.5rem;
  font-weight: ${props => props.isModerator ? 'bold' : 'normal'};
  color: ${props => props.isModerator ? props.theme.colors.primary : 'inherit'};
`

const Form = styled.form`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`

const Input = styled.input`
  flex-grow: 1;
  padding: 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid ${props => props.theme.colors.primary};
  background-color: ${props => props.theme.colors.dark};
  color: ${props => props.theme.colors.light};
`

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
`

const ModalContent = styled.div`
  background-color: ${props => props.theme.colors.dark};
  color: ${props => props.theme.colors.light};
  padding: 2rem;
  border-radius: 0.5rem;
  max-width: 500px;
  width: 100%;
  border: 1px solid ${props => props.theme.colors.primary};
`

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: ${props => props.theme.colors.primary};
`

const PlayerList = styled.div`
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: ${props => props.theme.colors.dark};
  border: 1px solid ${props => props.theme.colors.primary};
  border-radius: 0.5rem;
`

const PlayerListItem = styled.div<{ isAlive: boolean }>`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  color: ${props => props.isAlive ? props.theme.colors.light : props.theme.colors.danger};
`

const ModeratorInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: ${props => props.theme.colors.primary};
`

const NameModal = styled(Modal)`
  background-color: rgba(0, 0, 0, 0.9);
`

// Custom hooks
const useGameLogic = (initialPlayers: string[]) => {
  const [gamePlayers, setGamePlayers] = useState<{ name: string; role: string; alive: boolean; votes: number }[]>([])
  const [currentPhase, setCurrentPhase] = useState(PHASES[0])
  const [phaseTime, setPhaseTime] = useState(PHASE_DURATION)
  const [gameStarted, setGameStarted] = useState(false)
  const [moderator, setModerator] = useState<string>('')

  useEffect(() => {
    if (initialPlayers.length >= MIN_PLAYERS && !gameStarted) {
      const newPlayers = initialPlayers.map(name => ({
        name,
        role: ROLES[Math.floor(Math.random() * ROLES.length)],
        alive: true,
        votes: 0
      }))
      setGamePlayers(newPlayers)
      setModerator(initialPlayers[Math.floor(Math.random() * initialPlayers.length)])
      setGameStarted(true)
    }
  }, [initialPlayers, gameStarted])

  useEffect(() => {
    if (!gameStarted) return

    const timer = setInterval(() => {
      setPhaseTime((prevTime) => {
        if (prevTime <= 0) {
          const nextPhaseIndex = (PHASES.indexOf(currentPhase) + 1) % PHASES.length
          setCurrentPhase(PHASES[nextPhaseIndex])
          if (PHASES[nextPhaseIndex] === 'Night') {
            setGamePlayers(players => players.map(p => ({ ...p, votes: 0 })))
          }
          return PHASE_DURATION
        }
        return prevTime - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [currentPhase, gameStarted])

  const voteForPlayer = useCallback((index: number) => {
    if (currentPhase === 'Voting') {
      setGamePlayers(prevPlayers => {
        const newPlayers = prevPlayers.map(p => ({ ...p, votes: 0 }))
        newPlayers[index].votes = 1
        return newPlayers
      })
    }
  }, [currentPhase])

  const eliminatePlayer = useCallback((index: number) => {
    setGamePlayers(prevPlayers => {
      const newPlayers = [...prevPlayers]
      newPlayers[index].alive = false
      return newPlayers
    })
  }, [])

  const startGame = useCallback(() => {
    if (initialPlayers.length >= MIN_PLAYERS && !gameStarted) {
      const newPlayers = initialPlayers.map(name => ({
        name,
        role: ROLES[Math.floor(Math.random() * ROLES.length)],
        alive: true,
        votes: 0
      }))
      setGamePlayers(newPlayers)
      setGameStarted(true)
    }
  }, [initialPlayers, gameStarted])

  return { gamePlayers, currentPhase, phaseTime, voteForPlayer, eliminatePlayer, gameStarted, startGame }
}

const useChat = () => {
  const [messages, setMessages] = useState<{ sender: string; text: string; isModerator?: boolean }[]>([])

  const addMessage = useCallback((sender: string, text: string, isModerator: boolean = false) => {
    setMessages((prevMessages) => [...prevMessages, { sender, text, isModerator }])
  }, [])

  return { messages, addMessage }
}

const usePlayerManagement = () => {
  const [players, setPlayers] = useState<string[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<string | null>(null)
  const [moderator, setModerator] = useState<string | null>(null)

  const addPlayer = useCallback((name: string) => {
    setPlayers(prev => [...prev, name])
    if (players.length === 0) {
      setModerator(name)
    }
  }, [players])

  return { players, currentPlayer, setCurrentPlayer, moderator, addPlayer }
}


export default function MafiaGame() {
  const { players, currentPlayer, setCurrentPlayer, moderator, addPlayer } = usePlayerManagement()
  const { gamePlayers, currentPhase, phaseTime, voteForPlayer, eliminatePlayer, gameStarted, startGame } = useGameLogic(players)
  const { messages, addMessage } = useChat()
  const [newMessage, setNewMessage] = useState('')
  const [moderatorMessage, setModeratorMessage] = useState('')
  const [isVotingModalOpen, setIsVotingModalOpen] = useState(false)
  const [showNameModal, setShowNameModal] = useState(true)
  const [playerName, setPlayerName] = useState('')

  const [playNightMusic] = useSound('/night-music.mp3')
  const [playDayMusic] = useSound('/day-music.mp3')

  useEffect(() => {
    if (currentPhase === 'Night') {
      playNightMusic()
    } else {
      playDayMusic()
    }
  }, [currentPhase, playNightMusic, playDayMusic])

  useEffect(() => {
    setIsVotingModalOpen(currentPhase === 'Voting')
  }, [currentPhase])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() && currentPlayer) {
      const sender = gamePlayers.find(p => p.name === currentPlayer)
      if (sender && sender.alive) {
        addMessage(currentPlayer, newMessage.trim())
        setNewMessage('')
      }
    }
  }

  const handleModeratorMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (moderatorMessage.trim()) {
      addMessage('Moderator', moderatorMessage.trim(), true)
      setModeratorMessage('')
    }
  }

  const logout = () => {
    localStorage.removeItem('mafiaCurrentPlayer')
    // router.push('/auth')
  }

  const isNightPhase = currentPhase === 'Night'

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <FullPageCenter>
        {showNameModal && (
          <NameModal>
            <ModalContent>
              <ModalTitle>Enter Your Name</ModalTitle>
              <Form onSubmit={(e) => {
                e.preventDefault()
                if (playerName.trim()) {
                  addPlayer(playerName.trim())
                  setCurrentPlayer(playerName.trim())
                  setShowNameModal(false)
                }
              }}>
                <Input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Your name"
                />
                <Button type="submit">Join Game</Button>
              </Form>
            </ModalContent>
          </NameModal>
        )}
        {!showNameModal && (
          <GameWrapper>
            <TextStyle>Mafia Game</TextStyle>

            <ModeratorInfo>
              <Crown /> Current Moderator: {moderator}
            </ModeratorInfo>

            {!gameStarted ? (
              <>
                <PlayerList>
                  <h3>Waiting for players ({players.length}/{MIN_PLAYERS}):</h3>
                  {players.map((player, index) => (
                    <PlayerListItem key={index} isAlive={true}>
                      <UserCircle2 /> {player}
                      {player === currentPlayer && ' (You)'}
                    </PlayerListItem>
                  ))}
                </PlayerList>
                {currentPlayer === moderator && (
                  <Button onClick={startGame} disabled={players.length < MIN_PLAYERS}>
                    Start Game
                  </Button>
                )}
              </>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {isNightPhase ? <Moon /> : <Sun />}
                  {currentPhase} Phase: {phaseTime}s
                </motion.div>

                <PlayerList>
                  <h3>Players:</h3>
                  {gamePlayers.map((player, index) => (
                    <PlayerListItem key={index} isAlive={player.alive}>
                      {player.alive ? <UserCircle2 /> : <AlertTriangle />} {player.name}
                      {player.name === currentPlayer && ' (You)'}
                      {!player.alive && ' (Eliminated)'}
                    </PlayerListItem>
                  ))}
                </PlayerList>

                <PlayerGrid>
                  <AnimatePresence>
                    {gamePlayers.map((player, index) => (
                      <PlayerCard
                        key={index}
                        isAlive={player.alive}
                        isNight={isNightPhase}
                        isCurrent={player.name === currentPlayer}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                      >
                        <span>{player.name}</span>
                        {player.alive ? (
                          player.votes > 0 && <span>Votes: {player.votes}</span>
                        ) : (
                          <AlertTriangle />
                        )}
                      </PlayerCard>
                    ))}
                  </AnimatePresence>
                </PlayerGrid>

                <ChatArea isNight={isNightPhase}>
                  {messages.map((message, index) => (
                    <ChatMessage key={index} isModerator={message.isModerator || false}>
                      <strong>{message.sender}:</strong> {message.text}
                    </ChatMessage>
                  ))}
                </ChatArea>

                <Form onSubmit={handleSendMessage}>
                  <Input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={!gamePlayers.find(p => p.name === currentPlayer)?.alive}
                  />
                  <Button type="submit" disabled={!gamePlayers.find(p => p.name === currentPlayer)?.alive}>
                    <MessageCircle />
                    Send
                  </Button>
                </Form>

                <Form onSubmit={handleModeratorMessage}>
                  <Input
                    type="text"
                    value={moderatorMessage}
                    onChange={(e) => setModeratorMessage(e.target.value)}
                    placeholder="Moderator message..."
                  />
                  <Button type="submit">
                    Send Moderator Message
                  </Button>
                </Form>

                <ButtonSm onClick={() => setIsVotingModalOpen(true)}>
                  Open Voting
                </ButtonSm>

                {isVotingModalOpen && (
                  <Modal>
                    <ModalContent>
                      <ModalTitle>Voting Phase</ModalTitle>
                      <div>Select a player to vote for elimination. Choose wisely!</div>
                      {gamePlayers.map((player, index) => (
                        <Button
                          key={index}
                          onClick={() => voteForPlayer(index)}
                          disabled={!player.alive || player.name === currentPlayer}
                        >
                          {player.name} {player.votes > 0 && `(${player.votes})`}
                        </Button>
                      ))}
                    </ModalContent>
                  </Modal>
                )}
              </>
            )}

            <LogoutButton onClick={logout}>Logout</LogoutButton>
          </GameWrapper>
        )}
      </FullPageCenter>
    </ThemeProvider>
  )
}

