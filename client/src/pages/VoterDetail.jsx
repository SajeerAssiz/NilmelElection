import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeftIcon,
  PencilIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import * as api from '../services/api'
import VoterModal from '../components/VoterModal'

export default function VoterDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [voter, setVoter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadVoter()
  }, [id])

  const loadVoter = async () => {
    try {
      const response = await api.getVoter(id).catch(() => null)
      if (response?.data) {
        setVoter(response.data)
      } else {
        // Sample data
        setVoter(sampleVoter)
      }
    } catch (error) {
      console.error('Error loading voter:', error)
      setVoter(sampleVoter)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkVoted = async () => {
    try {
      await api.markVoted(voter.id, { has_voted: 1, voted_time: new Date().toISOString() })
      toast.success('Marked as voted')
      loadVoter()
    } catch (error) {
      toast.error('Failed to update')
    }
  }

  const handleSaveVoter = async (data) => {
    try {
      await api.updateVoter(voter.id, data)
      toast.success('Voter updated successfully')
      setShowModal(false)
      loadVoter()
    } catch (error) {
      toast.error('Failed to update voter')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!voter) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Voter not found</p>
        <button onClick={() => navigate('/voters')} className="btn-primary mt-4">
          Back to Voters
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/voters')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{voter.name}</h1>
            <p className="text-sm text-gray-500">SEC ID: {voter.sec_id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!voter.has_voted && (
            <button onClick={handleMarkVoted} className="btn-success flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4" />
              Mark as Voted
            </button>
          )}
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <PencilIcon className="h-4 w-4" />
            Edit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Serial No" value={voter.sl_no} />
              <InfoItem label="SEC ID" value={voter.sec_id} />
              <InfoItem label="Name" value={voter.name} />
              <InfoItem label="Name (Malayalam)" value={voter.name_malayalam || '-'} />
              <InfoItem label="Guardian Name" value={voter.guardian_name} />
              <InfoItem label="Relationship" value={voter.relationship || '-'} />
              <InfoItem label="Gender" value={voter.gender === 'M' ? 'Male' : voter.gender === 'F' ? 'Female' : 'Other'} />
              <InfoItem label="Age" value={voter.age} />
              <InfoItem label="Date of Birth" value={voter.date_of_birth || '-'} />
              <InfoItem label="EPIC No" value={voter.epic_no || '-'} />
            </div>
          </div>

          {/* Address Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Address Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="House No" value={voter.house_no} />
              <InfoItem label="House Name" value={voter.house_name} />
              <InfoItem label="Old Ward No" value={voter.old_ward_no || '-'} />
              <InfoItem label="Address" value={voter.address || '-'} />
            </div>
          </div>

          {/* Demographic Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Demographic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Religion" value={voter.religion_name || '-'} />
              <InfoItem label="Caste" value={voter.caste_name || '-'} />
              <InfoItem label="Occupation" value={voter.occupation_name || '-'} />
              <InfoItem label="Education" value={voter.education_name || '-'} />
              <InfoItem label="Annual Income" value={voter.annual_income || '-'} />
              <InfoItem label="Blood Group" value={voter.blood_group || '-'} />
            </div>
          </div>

          {/* Political Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Political Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Party Affiliation" value={voter.party_name || '-'} />
              <InfoItem label="Vote Probability" value={voter.probability_name || '-'} />
              <InfoItem label="Party Member" value={voter.is_party_member ? 'Yes' : 'No'} />
              <InfoItem label="Party Worker" value={voter.is_party_worker ? 'Yes' : 'No'} />
              <InfoItem label="Booth Agent" value={voter.is_booth_agent ? 'Yes' : 'No'} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Voting Status */}
          <div className={`card ${voter.has_voted ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${voter.has_voted ? 'bg-green-100' : 'bg-orange-100'} mb-3`}>
                <CheckCircleIcon className={`h-8 w-8 ${voter.has_voted ? 'text-green-600' : 'text-orange-600'}`} />
              </div>
              <h4 className={`text-lg font-semibold ${voter.has_voted ? 'text-green-800' : 'text-orange-800'}`}>
                {voter.has_voted ? 'Voted' : 'Not Voted'}
              </h4>
              {voter.has_voted && voter.voted_time && (
                <p className="text-sm text-green-600 mt-1">
                  {new Date(voter.voted_time).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact</h3>
            <div className="space-y-3">
              {voter.mobile_primary && (
                <div className="flex items-center gap-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                  <a href={`tel:${voter.mobile_primary}`} className="text-blue-600 hover:underline">
                    {voter.mobile_primary}
                  </a>
                </div>
              )}
              {voter.mobile_secondary && (
                <div className="flex items-center gap-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                  <a href={`tel:${voter.mobile_secondary}`} className="text-blue-600 hover:underline">
                    {voter.mobile_secondary}
                  </a>
                </div>
              )}
              {voter.email && (
                <div className="flex items-center gap-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <a href={`mailto:${voter.email}`} className="text-blue-600 hover:underline">
                    {voter.email}
                  </a>
                </div>
              )}
              {voter.address && (
                <div className="flex items-start gap-3">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <span className="text-gray-700">{voter.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Special Categories */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Special Categories</h3>
            <div className="space-y-2">
              {[
                { key: 'is_nri', label: 'NRI' },
                { key: 'is_govt_employee', label: 'Govt Employee' },
                { key: 'is_pensioner', label: 'Pensioner' },
                { key: 'is_physically_challenged', label: 'Physically Challenged' },
                { key: 'is_senior_citizen', label: 'Senior Citizen' },
                { key: 'needs_transport', label: 'Needs Transport' },
                { key: 'needs_assistance', label: 'Needs Assistance' },
              ].map(item => voter[item.key] && (
                <span key={item.key} className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 mr-2 mb-2">
                  {item.label}
                </span>
              ))}
              {!Object.keys(voter).some(k => k.startsWith('is_') && voter[k]) && (
                <span className="text-gray-500 text-sm">None</span>
              )}
            </div>
          </div>

          {/* Family Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Family</h3>
            <div className="space-y-2">
              <InfoItem label="Family ID" value={voter.family_id || '-'} />
              <InfoItem label="Family Head" value={voter.is_family_head ? 'Yes' : 'No'} />
            </div>
          </div>

          {/* Remarks */}
          {voter.remarks && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Remarks</h3>
              <p className="text-gray-700">{voter.remarks}</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showModal && (
        <VoterModal
          voter={voter}
          onClose={() => setShowModal(false)}
          onSave={handleSaveVoter}
        />
      )}
    </div>
  )
}

function InfoItem({ label, value }) {
  return (
    <div>
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-gray-900">{value}</dd>
    </div>
  )
}

const sampleVoter = {
  id: 1,
  sl_no: 1,
  name: 'ALFIYA T',
  name_malayalam: 'ആൽഫിയ ടി',
  guardian_name: 'ANANTHU V N',
  relationship: 'Father',
  house_no: '228',
  house_name: 'Sohanantham',
  gender: 'F',
  age: 23,
  sec_id: 'SEC043631150',
  epic_no: 'ABC1234567',
  mobile_primary: '9876543210',
  mobile_secondary: '9876543211',
  email: 'alfiya@example.com',
  address: 'Sohanantham, Ward 5, Nilamel',
  religion_name: 'Hindu',
  caste_name: 'Nair',
  occupation_name: 'Private Service',
  education_name: 'Graduate',
  annual_income: '3-5 Lakhs',
  blood_group: 'O+',
  party_name: 'UDF',
  probability_name: 'Likely (70-90%)',
  is_party_member: false,
  is_party_worker: false,
  is_booth_agent: false,
  is_nri: false,
  is_govt_employee: false,
  is_pensioner: false,
  is_physically_challenged: false,
  is_senior_citizen: false,
  needs_transport: false,
  needs_assistance: false,
  has_voted: 0,
  family_id: 'FAM001',
  is_family_head: false,
  remarks: '',
}
