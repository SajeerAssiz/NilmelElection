import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Voters from './pages/Voters'
import VoterDetail from './pages/VoterDetail'
import MasterData from './pages/MasterData'
import PollingDay from './pages/PollingDay'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="voters" element={<Voters />} />
        <Route path="voters/:id" element={<VoterDetail />} />
        <Route path="master-data" element={<MasterData />} />
        <Route path="polling-day" element={<PollingDay />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App
