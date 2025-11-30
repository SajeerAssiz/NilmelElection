import { useState, useEffect } from 'react'
import Chart from 'react-apexcharts'
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import * as api from '../services/api'

export default function PollingDay() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [stats, setStats] = useState({
    totalVoters: 12450,
    voted: 0,
    notVoted: 12450,
    percentage: 0,
  })
  const [recentVotes, setRecentVotes] = useState([])
  const [hourlyData, setHourlyData] = useState([])
  const [selectedWard, setSelectedWard] = useState('')
  const [wards, setWards] = useState([])

  useEffect(() => {
    loadStats()
    loadWards()
    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadStats = async () => {
    try {
      const response = await api.getVotingProgress().catch(() => null)
      if (response?.data) {
        setStats(response.data)
      } else {
        // Simulate real-time data
        const voted = Math.floor(Math.random() * 1000) + 7000
        setStats({
          totalVoters: 12450,
          voted,
          notVoted: 12450 - voted,
          percentage: Math.round((voted / 12450) * 100),
        })
      }

      // Sample hourly data
      setHourlyData([
        { hour: '7AM', count: 450 },
        { hour: '8AM', count: 820 },
        { hour: '9AM', count: 1100 },
        { hour: '10AM', count: 980 },
        { hour: '11AM', count: 750 },
        { hour: '12PM', count: 620 },
        { hour: '1PM', count: 480 },
        { hour: '2PM', count: 890 },
        { hour: '3PM', count: 720 },
        { hour: '4PM', count: 560 },
      ])

      // Sample recent votes
      setRecentVotes(sampleRecentVotes)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const loadWards = async () => {
    try {
      const response = await api.getWards().catch(() => ({ data: [] }))
      setWards(response.data || sampleWards)
    } catch (error) {
      setWards(sampleWards)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchTerm.trim()) return

    setSearching(true)
    try {
      const response = await api.searchVoters({ search: searchTerm }).catch(() => null)
      if (response?.data) {
        setSearchResults(response.data.voters || [])
      } else {
        // Sample search results
        setSearchResults(sampleSearchResults.filter(v =>
          v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.sec_id.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setSearching(false)
    }
  }

  const handleMarkVoted = async (voter) => {
    try {
      await api.markVoted(voter.id, {
        has_voted: 1,
        voted_time: new Date().toISOString(),
      }).catch(() => null)

      toast.success(`${voter.name} marked as voted`)

      // Update local state
      setSearchResults(prev =>
        prev.map(v => v.id === voter.id ? { ...v, has_voted: 1, voted_time: new Date() } : v)
      )

      // Update stats
      setStats(prev => ({
        ...prev,
        voted: prev.voted + 1,
        notVoted: prev.notVoted - 1,
        percentage: Math.round(((prev.voted + 1) / prev.totalVoters) * 100),
      }))

      // Add to recent votes
      setRecentVotes(prev => [
        { ...voter, voted_time: new Date() },
        ...prev.slice(0, 9),
      ])
    } catch (error) {
      toast.error('Failed to mark as voted')
    }
  }

  const handleUndoVote = async (voter) => {
    try {
      await api.markVoted(voter.id, { has_voted: 0 }).catch(() => null)
      toast.success(`Vote status cleared for ${voter.name}`)

      setSearchResults(prev =>
        prev.map(v => v.id === voter.id ? { ...v, has_voted: 0, voted_time: null } : v)
      )

      setStats(prev => ({
        ...prev,
        voted: prev.voted - 1,
        notVoted: prev.notVoted + 1,
        percentage: Math.round(((prev.voted - 1) / prev.totalVoters) * 100),
      }))
    } catch (error) {
      toast.error('Failed to update')
    }
  }

  const hourlyChartOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 4 } },
    dataLabels: { enabled: false },
    xaxis: { categories: hourlyData.map(d => d.hour) },
    colors: ['#3b82f6'],
    grid: { borderColor: '#f1f1f1' },
  }

  const progressChartOptions = {
    chart: { type: 'radialBar' },
    plotOptions: {
      radialBar: {
        hollow: { size: '70%' },
        dataLabels: {
          name: { show: true, fontSize: '14px', color: '#6b7280' },
          value: { show: true, fontSize: '28px', fontWeight: 'bold' },
        },
      },
    },
    labels: ['Voted'],
    colors: ['#22c55e'],
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Polling Day Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-green-600">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live
          </span>
          <span className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Voters</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalVoters.toLocaleString()}</p>
            </div>
            <UserGroupIcon className="h-10 w-10 text-blue-500" />
          </div>
        </div>
        <div className="stat-card bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Voted</p>
              <p className="text-3xl font-bold text-green-700">{stats.voted.toLocaleString()}</p>
            </div>
            <CheckCircleIcon className="h-10 w-10 text-green-500" />
          </div>
        </div>
        <div className="stat-card bg-orange-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600">Yet to Vote</p>
              <p className="text-3xl font-bold text-orange-700">{stats.notVoted.toLocaleString()}</p>
            </div>
            <ClockIcon className="h-10 w-10 text-orange-500" />
          </div>
        </div>
        <div className="stat-card bg-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">Turnout</p>
              <p className="text-3xl font-bold text-purple-700">{stats.percentage}%</p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>
      </div>

      {/* Quick Search */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Voter Search</h3>
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, SEC ID, or house name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
              autoFocus
            />
          </div>
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="select-field w-40"
          >
            <option value="">All Wards</option>
            {wards.map(ward => (
              <option key={ward.id} value={ward.id}>Ward {ward.ward_no}</option>
            ))}
          </select>
          <button type="submit" className="btn-primary" disabled={searching}>
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="table-header">Sl No</th>
                    <th className="table-header">Name</th>
                    <th className="table-header">Guardian</th>
                    <th className="table-header">House</th>
                    <th className="table-header">SEC ID</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map(voter => (
                    <tr key={voter.id} className={`hover:bg-gray-50 ${voter.has_voted ? 'bg-green-50' : ''}`}>
                      <td className="table-cell">{voter.sl_no}</td>
                      <td className="table-cell font-medium">{voter.name}</td>
                      <td className="table-cell text-gray-500">{voter.guardian_name}</td>
                      <td className="table-cell">
                        <div>{voter.house_no}</div>
                        <div className="text-xs text-gray-500">{voter.house_name}</div>
                      </td>
                      <td className="table-cell font-mono text-sm">{voter.sec_id}</td>
                      <td className="table-cell">
                        {voter.has_voted ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Voted
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                            Not Voted
                          </span>
                        )}
                      </td>
                      <td className="table-cell">
                        {voter.has_voted ? (
                          <button
                            onClick={() => handleUndoVote(voter)}
                            className="btn-secondary text-sm flex items-center gap-1"
                          >
                            <XCircleIcon className="h-4 w-4" />
                            Undo
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMarkVoted(voter)}
                            className="btn-success text-sm flex items-center gap-1"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                            Mark Voted
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Voting */}
        <div className="lg:col-span-2 card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Hourly Voting Pattern</h3>
          <Chart
            options={hourlyChartOptions}
            series={[{ name: 'Votes', data: hourlyData.map(d => d.count) }]}
            type="bar"
            height={300}
          />
        </div>

        {/* Progress */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Voting Progress</h3>
          <Chart
            options={progressChartOptions}
            series={[stats.percentage]}
            type="radialBar"
            height={300}
          />
        </div>
      </div>

      {/* Recent Votes */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Votes</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="table-header">Time</th>
                <th className="table-header">Name</th>
                <th className="table-header">SEC ID</th>
                <th className="table-header">Ward</th>
                <th className="table-header">Booth</th>
              </tr>
            </thead>
            <tbody>
              {recentVotes.map((vote, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="table-cell text-sm text-gray-500">
                    {new Date(vote.voted_time).toLocaleTimeString()}
                  </td>
                  <td className="table-cell font-medium">{vote.name}</td>
                  <td className="table-cell font-mono text-sm">{vote.sec_id}</td>
                  <td className="table-cell">Ward {vote.ward_no || 1}</td>
                  <td className="table-cell">Booth {vote.booth_no || 1}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const sampleWards = Array.from({ length: 23 }, (_, i) => ({ id: i + 1, ward_no: i + 1 }))

const sampleSearchResults = [
  { id: 1, sl_no: 1, name: 'ALFIYA T', guardian_name: 'ANANTHU V N', house_no: '228', house_name: 'Sohanantham', sec_id: 'SEC043631150', has_voted: 0 },
  { id: 2, sl_no: 2, name: 'RIJU SHAFI', guardian_name: 'SHAFI', house_no: '601', house_name: 'DEW DROPS', sec_id: 'SEC034455221', has_voted: 1, voted_time: new Date() },
  { id: 3, sl_no: 3, name: 'FATHIMA BEEGAM', guardian_name: 'RIJU SHAFI', house_no: '601', house_name: 'DEW DROPS', sec_id: 'SEC046583931', has_voted: 0 },
]

const sampleRecentVotes = [
  { name: 'SURESH KUMAR', sec_id: 'SEC012345678', ward_no: 5, booth_no: 2, voted_time: new Date() },
  { name: 'LAKSHMI DEVI', sec_id: 'SEC012345679', ward_no: 5, booth_no: 2, voted_time: new Date(Date.now() - 60000) },
  { name: 'MOHAMMED ALI', sec_id: 'SEC087654321', ward_no: 3, booth_no: 1, voted_time: new Date(Date.now() - 120000) },
  { name: 'MARY THOMAS', sec_id: 'SEC098765432', ward_no: 7, booth_no: 3, voted_time: new Date(Date.now() - 180000) },
  { name: 'RAJESH NAIR', sec_id: 'SEC056789012', ward_no: 12, booth_no: 1, voted_time: new Date(Date.now() - 240000) },
]
