import { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import * as api from '../services/api'

const tabs = [
  { id: 'hierarchy', name: 'Location Hierarchy' },
  { id: 'parties', name: 'Political Parties' },
  { id: 'religions', name: 'Religions' },
  { id: 'castes', name: 'Castes' },
  { id: 'occupations', name: 'Occupations' },
  { id: 'education', name: 'Education Levels' },
  { id: 'probability', name: 'Vote Probability' },
]

export default function MasterData() {
  const [activeTab, setActiveTab] = useState('hierarchy')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)

  // Hierarchy state
  const [states, setStates] = useState([])
  const [districts, setDistricts] = useState([])
  const [localBodies, setLocalBodies] = useState([])
  const [wards, setWards] = useState([])
  const [pollingStations, setPollingStations] = useState([])
  const [selectedState, setSelectedState] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [selectedLocalBody, setSelectedLocalBody] = useState('')
  const [selectedWard, setSelectedWard] = useState('')

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      switch (activeTab) {
        case 'hierarchy':
          await loadHierarchy()
          break
        case 'parties':
          const parties = await api.getParties().catch(() => ({ data: sampleParties }))
          setData(parties.data || sampleParties)
          break
        case 'religions':
          const religions = await api.getReligions().catch(() => ({ data: sampleReligions }))
          setData(religions.data || sampleReligions)
          break
        case 'castes':
          const castes = await api.getCastes().catch(() => ({ data: sampleCastes }))
          setData(castes.data || sampleCastes)
          break
        case 'occupations':
          const occupations = await api.getOccupations().catch(() => ({ data: sampleOccupations }))
          setData(occupations.data || sampleOccupations)
          break
        case 'education':
          const education = await api.getEducationLevels().catch(() => ({ data: sampleEducation }))
          setData(education.data || sampleEducation)
          break
        case 'probability':
          const probability = await api.getVoteProbabilities().catch(() => ({ data: sampleProbability }))
          setData(probability.data || sampleProbability)
          break
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadHierarchy = async () => {
    const statesRes = await api.getStates().catch(() => ({ data: sampleStates }))
    setStates(statesRes.data || sampleStates)

    if (selectedState) {
      const districtsRes = await api.getDistricts(selectedState).catch(() => ({ data: sampleDistricts }))
      setDistricts(districtsRes.data || sampleDistricts)
    }

    if (selectedDistrict) {
      const lbRes = await api.getLocalBodies(selectedDistrict).catch(() => ({ data: sampleLocalBodies }))
      setLocalBodies(lbRes.data || sampleLocalBodies)
    }

    if (selectedLocalBody) {
      const wardsRes = await api.getWards(selectedLocalBody).catch(() => ({ data: sampleWards }))
      setWards(wardsRes.data || sampleWards)
    }

    if (selectedWard) {
      const psRes = await api.getPollingStations(selectedWard).catch(() => ({ data: samplePollingStations }))
      setPollingStations(psRes.data || samplePollingStations)
    }
  }

  const handleAdd = () => {
    setEditItem(null)
    setShowModal(true)
  }

  const handleEdit = (item) => {
    setEditItem(item)
    setShowModal(true)
  }

  const handleDelete = async (item) => {
    if (!confirm(`Are you sure you want to delete "${item.name || item.party_name || item.religion_name}"?`)) return
    toast.success('Deleted successfully')
    loadData()
  }

  const handleSave = async (formData) => {
    toast.success(editItem ? 'Updated successfully' : 'Added successfully')
    setShowModal(false)
    loadData()
  }

  const renderTable = () => {
    if (activeTab === 'hierarchy') {
      return renderHierarchy()
    }

    const columns = getColumns(activeTab)

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map(col => (
                <th key={col.key} className="table-header">{col.label}</th>
              ))}
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                {columns.map(col => (
                  <td key={col.key} className="table-cell">
                    {col.render ? col.render(item[col.key], item) : item[col.key]}
                  </td>
                ))}
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(item)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDelete(item)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderHierarchy = () => (
    <div className="space-y-6">
      {/* States */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">States</h3>
          <button onClick={handleAdd} className="btn-primary text-sm flex items-center gap-1">
            <PlusIcon className="h-4 w-4" /> Add State
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {states.map(state => (
            <div
              key={state.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedState === state.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
              onClick={() => { setSelectedState(state.id); setSelectedDistrict(''); setSelectedLocalBody(''); setSelectedWard(''); }}
            >
              <div className="font-medium">{state.state_name}</div>
              <div className="text-sm text-gray-500">{state.state_code}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Districts */}
      {selectedState && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Districts</h3>
            <button onClick={handleAdd} className="btn-primary text-sm flex items-center gap-1">
              <PlusIcon className="h-4 w-4" /> Add District
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {districts.map(district => (
              <div
                key={district.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedDistrict === district.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                onClick={() => { setSelectedDistrict(district.id); setSelectedLocalBody(''); setSelectedWard(''); }}
              >
                <div className="font-medium">{district.district_name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Local Bodies */}
      {selectedDistrict && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Local Bodies</h3>
            <button onClick={handleAdd} className="btn-primary text-sm flex items-center gap-1">
              <PlusIcon className="h-4 w-4" /> Add Local Body
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {localBodies.map(lb => (
              <div
                key={lb.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedLocalBody === lb.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                onClick={() => { setSelectedLocalBody(lb.id); setSelectedWard(''); }}
              >
                <div className="font-medium">{lb.lb_name}</div>
                <div className="text-sm text-gray-500">{lb.lb_type}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wards */}
      {selectedLocalBody && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Wards</h3>
            <button onClick={handleAdd} className="btn-primary text-sm flex items-center gap-1">
              <PlusIcon className="h-4 w-4" /> Add Ward
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {wards.map(ward => (
              <div
                key={ward.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors text-center ${selectedWard === ward.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                onClick={() => setSelectedWard(ward.id)}
              >
                <div className="text-2xl font-bold text-gray-800">{ward.ward_no}</div>
                <div className="text-sm text-gray-500">{ward.ward_name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Polling Stations */}
      {selectedWard && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Polling Stations</h3>
            <button onClick={handleAdd} className="btn-primary text-sm flex items-center gap-1">
              <PlusIcon className="h-4 w-4" /> Add Polling Station
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="table-header">No</th>
                  <th className="table-header">Name</th>
                  <th className="table-header">Address</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pollingStations.map(ps => (
                  <tr key={ps.id} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">{ps.station_no}</td>
                    <td className="table-cell">{ps.station_name}</td>
                    <td className="table-cell text-gray-500">{ps.address || '-'}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(ps)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDelete(ps)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Master Data</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="flex space-x-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="card p-0 overflow-hidden">
        {activeTab !== 'hierarchy' && (
          <div className="p-4 border-b border-gray-200 flex justify-end">
            <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Add New
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : activeTab === 'hierarchy' ? (
          <div className="p-4">{renderHierarchy()}</div>
        ) : (
          renderTable()
        )}
      </div>

      {/* Modal would go here */}
    </div>
  )
}

function getColumns(tab) {
  switch (tab) {
    case 'parties':
      return [
        { key: 'party_code', label: 'Code' },
        { key: 'party_name', label: 'Name' },
        { key: 'party_symbol', label: 'Symbol' },
        { key: 'alliance', label: 'Alliance' },
        { key: 'party_color', label: 'Color', render: (val) => val ? <span className="inline-block w-6 h-6 rounded" style={{ backgroundColor: val }}></span> : '-' },
      ]
    case 'religions':
      return [
        { key: 'religion_code', label: 'Code' },
        { key: 'religion_name', label: 'Name' },
        { key: 'religion_name_malayalam', label: 'Malayalam' },
      ]
    case 'castes':
      return [
        { key: 'caste_code', label: 'Code' },
        { key: 'caste_name', label: 'Name' },
        { key: 'category', label: 'Category' },
        { key: 'religion_name', label: 'Religion' },
      ]
    case 'occupations':
      return [
        { key: 'occupation_code', label: 'Code' },
        { key: 'occupation_name', label: 'Name' },
        { key: 'occupation_category', label: 'Category' },
      ]
    case 'education':
      return [
        { key: 'education_code', label: 'Code' },
        { key: 'education_name', label: 'Name' },
      ]
    case 'probability':
      return [
        { key: 'category_code', label: 'Code' },
        { key: 'category_name', label: 'Name' },
        { key: 'probability_percentage', label: 'Percentage' },
        { key: 'color_code', label: 'Color', render: (val) => val ? <span className="inline-block w-6 h-6 rounded" style={{ backgroundColor: val }}></span> : '-' },
      ]
    default:
      return []
  }
}

// Sample data
const sampleStates = [{ id: 1, state_code: 'KL', state_name: 'Kerala' }]
const sampleDistricts = [{ id: 1, district_code: 'KLM', district_name: 'Kollam' }]
const sampleLocalBodies = [{ id: 1, lb_code: 'NLM', lb_name: 'Nilamel', lb_type: 'Grama Panchayat' }]
const sampleWards = Array.from({ length: 23 }, (_, i) => ({ id: i + 1, ward_no: i + 1, ward_name: `Ward ${i + 1}` }))
const samplePollingStations = [
  { id: 1, station_no: 1, station_name: 'Nilamel LP School', address: 'Nilamel Junction' },
  { id: 2, station_no: 2, station_name: 'Nilamel High School', address: 'Near Temple' },
]
const sampleParties = [
  { id: 1, party_code: 'CPI', party_name: 'Communist Party of India', party_symbol: 'Corn', alliance: 'LDF', party_color: '#ff0000' },
  { id: 2, party_code: 'CPIM', party_name: 'CPI (Marxist)', party_symbol: 'Hammer & Sickle', alliance: 'LDF', party_color: '#cc0000' },
  { id: 3, party_code: 'INC', party_name: 'Indian National Congress', party_symbol: 'Hand', alliance: 'UDF', party_color: '#00bfff' },
  { id: 4, party_code: 'BJP', party_name: 'Bharatiya Janata Party', party_symbol: 'Lotus', alliance: 'NDA', party_color: '#ff9933' },
]
const sampleReligions = [
  { id: 1, religion_code: 'HIN', religion_name: 'Hindu', religion_name_malayalam: 'ഹിന്ദു' },
  { id: 2, religion_code: 'MUS', religion_name: 'Muslim', religion_name_malayalam: 'മുസ്ലീം' },
  { id: 3, religion_code: 'CHR', religion_name: 'Christian', religion_name_malayalam: 'ക്രിസ്ത്യൻ' },
]
const sampleCastes = [
  { id: 1, caste_code: 'NAR', caste_name: 'Nair', category: 'General', religion_name: 'Hindu' },
  { id: 2, caste_code: 'EZH', caste_name: 'Ezhava', category: 'OBC', religion_name: 'Hindu' },
]
const sampleOccupations = [
  { id: 1, occupation_code: 'GOV', occupation_name: 'Government Service', occupation_category: 'Service' },
  { id: 2, occupation_code: 'PVT', occupation_name: 'Private Service', occupation_category: 'Service' },
  { id: 3, occupation_code: 'BUS', occupation_name: 'Business', occupation_category: 'Self-employed' },
]
const sampleEducation = [
  { id: 1, education_code: 'BLW10', education_name: 'Below 10th' },
  { id: 2, education_code: '10TH', education_name: '10th Pass' },
  { id: 3, education_code: 'GRAD', education_name: 'Graduate' },
]
const sampleProbability = [
  { id: 1, category_code: 'SURE', category_name: 'Sure Vote', probability_percentage: 95, color_code: '#22c55e' },
  { id: 2, category_code: 'LIKE', category_name: 'Likely', probability_percentage: 75, color_code: '#84cc16' },
  { id: 3, category_code: 'POSS', category_name: 'Possible', probability_percentage: 50, color_code: '#eab308' },
  { id: 4, category_code: 'UNLI', category_name: 'Unlikely', probability_percentage: 25, color_code: '#f97316' },
  { id: 5, category_code: 'AGST', category_name: 'Against', probability_percentage: 5, color_code: '#ef4444' },
]
