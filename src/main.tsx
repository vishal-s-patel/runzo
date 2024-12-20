import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter, Route, Routes } from 'react-router'
import MatchDetail from './pages/MatchDetail.tsx'
import PlayerDetail from './pages/PlayerDetail.tsx'
import Match from './pages/Match.tsx'
import { PostMatch } from './pages/PostMatch.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route index element={<App />}></Route>
        <Route path='match-details' element={<MatchDetail />}></Route>
        <Route path='player-details' element={<PlayerDetail />}></Route>
        <Route path="match" element={<Match />} />
        <Route path="post-match" element={<PostMatch />}></Route>
      </Routes>
    </BrowserRouter>
    
  </StrictMode>,
)
