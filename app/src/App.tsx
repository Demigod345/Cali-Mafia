import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import HomePage from './pages/home';
import ModeratorMafiaPortal from './pages/admin';
import MafiaGame from './pages/mafia';
import SetupPage from './pages/setup';
import Authenticate from './pages/login/Authenticate';
import { AccessTokenWrapper } from '@calimero-is-near/calimero-p2p-sdk';
import { getNodeUrl } from './utils/node';
export default function App() {
  return (
    <AccessTokenWrapper getNodeUrl={getNodeUrl}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SetupPage />} />
          <Route path="/auth" element={<Authenticate />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/mafia" element={<MafiaGame />} />
          <Route path="/admin" element={<ModeratorMafiaPortal />} />
        </Routes>
      </BrowserRouter>
    </AccessTokenWrapper>
  );
}
