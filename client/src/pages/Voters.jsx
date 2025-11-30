import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import * as api from '../services/api'
import VoterModal from '../components/VoterModal'

export default function Voters() {
  const [voters, setVoters] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    wardId: '',
    pollingStationId: '',
    partyId: '',
    hasVoted: '',
    gender: '',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedVoter, setSelectedVoter] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  })

  // Master data for filters
  const [wards, setWards] = useState([])
  const [parties, setParties] = useState([])

  useEffect(() => {
    loadVoters()
    loadMasterData()
  }, [pagination.page, filters])

  const loadVoters = async () => {
    try {
      setLoading(true)
      const response = await api.getVoters({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        ...filters,
      }).catch(() => null)

      if (response?.data) {
        setVoters(response.data.voters || [])
        setPagination(prev => ({ ...prev, total: response.data.total || 0 }))
      } else {
        // Sample data
        setVoters(sampleVoters)
        setPagination(prev => ({ ...prev, total: sampleVoters.length }))
      }
    } catch (error) {
      console.error('Error loading voters:', error)
      setVoters(sampleVoters)
    } finally {
      setLoading(false)
    }
  }

  const loadMasterData = async () => {
    try {
      const [wardsRes, partiesRes] = await Promise.all([
        api.getWards().catch(() => ({ data: [] })),
        api.getParties().catch(() => ({ data: [] })),
      ])
      setWards(wardsRes.data || [])
      setParties(partiesRes.data || [])
    } catch (error) {
      console.error('Error loading master data:', error)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    loadVoters()
  }

  const handleAddVoter = () => {
    setSelectedVoter(null)
    setShowModal(true)
  }

  const handleEditVoter = (voter) => {
    setSelectedVoter(voter)
    setShowModal(true)
  }

  const handleDeleteVoter = async (voter) => {
    if (!confirm(`Are you sure you want to delete ${voter.name}?`)) return

    try {
      await api.deleteVoter(voter.id)
      toast.success('Voter deleted successfully')
      loadVoters()
    } catch (error) {
      toast.error('Failed to delete voter')
    }
  }

  const handleMarkVoted = async (voter) => {
    try {
      await api.markVoted(voter.id, { has_voted: 1, voted_time: new Date().toISOString() })
      toast.success(`${voter.name} marked as voted`)
      loadVoters()
    } catch (error) {
      toast.error('Failed to update voting status')
    }
  }

  const handleSaveVoter = async (data) => {
    try {
      if (selectedVoter) {
        await api.updateVoter(selectedVoter.id, data)
        toast.success('Voter updated successfully')
      } else {
        await api.createVoter(data)
        toast.success('Voter added successfully')
      }
      setShowModal(false)
      loadVoters()
    } catch (error) {
      toast.error('Failed to save voter')
    }
  }

  const handleExport = () => {
    // Create CSV export
    const headers = ['Sl No', 'Name', 'Guardian Name', 'House No', 'House Name', 'Gender', 'Age', 'SEC ID', 'Mobile', 'Voted']
    const csvContent = [
      headers.join(','),
      ...voters.map(v => [
        v.sl_no,
        `"${v.name}"`,
        `"${v.guardian_name || ''}"`,
        v.house_no,
        `"${v.house_name || ''}"`,
        v.gender,
        v.age,
        v.sec_id,
        v.mobile_primary || '',
        v.has_voted ? 'Yes' : 'No'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'voters.csv'
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Voters</h1>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
            <ArrowDownTrayIcon className="h-4 w-4" />
            Export
          </button>
          <button onClick={handleAddVoter} className="btn-primary flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            Add Voter
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, SEC ID, house name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button type="submit" className="btn-primary">Search</button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-blue-100' : ''}`}
          >
            <FunnelIcon className="h-4 w-4" />
            Filters
          </button>
        </form>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <select
              value={filters.wardId}
              onChange={(e) => setFilters(prev => ({ ...prev, wardId: e.target.value }))}
              className="select-field"
            >
              <option value="">All Wards</option>
              {wards.map(ward => (
                <option key={ward.id} value={ward.id}>Ward {ward.ward_no} - {ward.ward_name}</option>
              ))}
            </select>

            <select
              value={filters.partyId}
              onChange={(e) => setFilters(prev => ({ ...prev, partyId: e.target.value }))}
              className="select-field"
            >
              <option value="">All Parties</option>
              {parties.map(party => (
                <option key={party.id} value={party.id}>{party.party_name}</option>
              ))}
            </select>

            <select
              value={filters.gender}
              onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
              className="select-field"
            >
              <option value="">All Genders</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </select>

            <select
              value={filters.hasVoted}
              onChange={(e) => setFilters(prev => ({ ...prev, hasVoted: e.target.value }))}
              className="select-field"
            >
              <option value="">Voting Status</option>
              <option value="1">Voted</option>
              <option value="0">Not Voted</option>
            </select>

            <button
              onClick={() => setFilters({ wardId: '', pollingStationId: '', partyId: '', hasVoted: '', gender: '' })}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Voters Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="table-header">Sl No</th>
                <th className="table-header">Name</th>
                <th className="table-header">Guardian</th>
                <th className="table-header">House</th>
                <th className="table-header">Gender/Age</th>
                <th className="table-header">SEC ID</th>
                <th className="table-header">Mobile</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="table-cell text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : voters.length === 0 ? (
                <tr>
                  <td colSpan="9" className="table-cell text-center py-8 text-gray-500">
                    No voters found
                  </td>
                </tr>
              ) : (
                voters.map((voter) => (
                  <tr key={voter.id} className="hover:bg-gray-50">
                    <td className="table-cell">{voter.sl_no}</td>
                    <td className="table-cell">
                      <Link to={`/voters/${voter.id}`} className="font-medium text-blue-600 hover:text-blue-800">
                        {voter.name}
                      </Link>
                    </td>
                    <td className="table-cell text-gray-500">{voter.guardian_name}</td>
                    <td className="table-cell">
                      <div>{voter.house_no}</div>
                      <div className="text-xs text-gray-500">{voter.house_name}</div>
                    </td>
                    <td className="table-cell">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        voter.gender === 'M' ? 'bg-blue-100 text-blue-800' :
                        voter.gender === 'F' ? 'bg-pink-100 text-pink-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {voter.gender}
                      </span>
                      <span className="ml-2 text-gray-600">{voter.age}</span>
                    </td>
                    <td className="table-cell font-mono text-sm">{voter.sec_id}</td>
                    <td className="table-cell">{voter.mobile_primary || '-'}</td>
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
                      <div className="flex items-center gap-2">
                        {!voter.has_voted && (
                          <button
                            onClick={() => handleMarkVoted(voter)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Mark as Voted"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEditVoter(voter)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteVoter(voter)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {voters.length} of {pagination.total} voters
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="btn-secondary text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">Page {pagination.page}</span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={voters.length < pagination.limit}
              className="btn-secondary text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Voter Modal */}
      {showModal && (
        <VoterModal
          voter={selectedVoter}
          onClose={() => setShowModal(false)}
          onSave={handleSaveVoter}
        />
      )}
    </div>
  )
}

// Sample data for demonstration
const sampleVoters = [
  { id: 1, sl_no: 1, name: 'ALFIYA T', guardian_name: 'ANANTHU V N', house_no: '228', house_name: 'Sohanantham', gender: 'F', age: 23, sec_id: 'SEC043631150', mobile_primary: '9876543210', has_voted: 0 },
  { id: 2, sl_no: 2, name: 'RIJU SHAFI', guardian_name: 'SHAFI', house_no: '601', house_name: 'DEW DROPS', gender: 'M', age: 36, sec_id: 'SEC034455221', mobile_primary: '9876543211', has_voted: 1 },
  { id: 3, sl_no: 3, name: 'FATHIMA BEEGAM', guardian_name: 'RIJU SHAFI', house_no: '601', house_name: 'DEW DROPS', gender: 'F', age: 27, sec_id: 'SEC046583931', mobile_primary: '9876543212', has_voted: 0 },
  { id: 4, sl_no: 4, name: 'SURESH KUMAR', guardian_name: 'KRISHNAN', house_no: '45', house_name: 'KRISHNA BHAVAN', gender: 'M', age: 52, sec_id: 'SEC012345678', mobile_primary: '9876543213', has_voted: 1 },
  { id: 5, sl_no: 5, name: 'LAKSHMI DEVI', guardian_name: 'SURESH KUMAR', house_no: '45', house_name: 'KRISHNA BHAVAN', gender: 'F', age: 48, sec_id: 'SEC012345679', mobile_primary: '9876543214', has_voted: 1 },
]
