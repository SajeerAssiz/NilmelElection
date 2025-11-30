import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import * as api from '../services/api'

export default function VoterModal({ voter, onClose, onSave }) {
  const [formData, setFormData] = useState({
    sl_no: '',
    name: '',
    name_malayalam: '',
    guardian_name: '',
    guardian_name_malayalam: '',
    relationship: '',
    old_ward_no: '',
    house_no: '',
    house_name: '',
    house_name_malayalam: '',
    gender: '',
    age: '',
    date_of_birth: '',
    sec_id: '',
    epic_no: '',
    polling_station_id: '',
    mobile_primary: '',
    mobile_secondary: '',
    whatsapp_number: '',
    email: '',
    address: '',
    religion_id: '',
    caste_id: '',
    occupation_id: '',
    education_id: '',
    annual_income: '',
    family_id: '',
    is_family_head: false,
    party_affiliation_id: '',
    vote_probability_id: '',
    is_nri: false,
    is_govt_employee: false,
    is_pensioner: false,
    is_physically_challenged: false,
    is_senior_citizen: false,
    needs_transport: false,
    needs_assistance: false,
    blood_group: '',
    remarks: '',
  })

  const [masterData, setMasterData] = useState({
    pollingStations: [],
    religions: [],
    castes: [],
    occupations: [],
    educationLevels: [],
    parties: [],
    voteProbabilities: [],
  })

  const [activeTab, setActiveTab] = useState('basic')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadMasterData()
    if (voter) {
      setFormData({ ...formData, ...voter })
    }
  }, [voter])

  const loadMasterData = async () => {
    try {
      const [religions, parties, occupations, educationLevels, voteProbabilities] = await Promise.all([
        api.getReligions().catch(() => ({ data: [] })),
        api.getParties().catch(() => ({ data: [] })),
        api.getOccupations().catch(() => ({ data: [] })),
        api.getEducationLevels().catch(() => ({ data: [] })),
        api.getVoteProbabilities().catch(() => ({ data: [] })),
      ])

      setMasterData({
        religions: religions.data || sampleReligions,
        parties: parties.data || sampleParties,
        occupations: occupations.data || sampleOccupations,
        educationLevels: educationLevels.data || sampleEducation,
        voteProbabilities: voteProbabilities.data || sampleProbabilities,
        pollingStations: [],
        castes: [],
      })
    } catch (error) {
      // Use sample data
      setMasterData({
        religions: sampleReligions,
        parties: sampleParties,
        occupations: sampleOccupations,
        educationLevels: sampleEducation,
        voteProbabilities: sampleProbabilities,
        pollingStations: [],
        castes: [],
      })
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave(formData)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'basic', name: 'Basic Info' },
    { id: 'contact', name: 'Contact' },
    { id: 'demographic', name: 'Demographic' },
    { id: 'political', name: 'Political' },
    { id: 'special', name: 'Special Categories' },
  ]

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {voter ? 'Edit Voter' : 'Add New Voter'}
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 px-6 overflow-x-auto">
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
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Serial No</label>
                  <input type="number" name="sl_no" value={formData.sl_no} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SEC ID *</label>
                  <input type="text" name="sec_id" value={formData.sec_id} onChange={handleChange} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name (English) *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name (Malayalam)</label>
                  <input type="text" name="name_malayalam" value={formData.name_malayalam} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Name</label>
                  <input type="text" name="guardian_name" value={formData.guardian_name} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                  <select name="relationship" value={formData.relationship} onChange={handleChange} className="select-field">
                    <option value="">Select</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Husband">Husband</option>
                    <option value="Wife">Wife</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">House No</label>
                  <input type="text" name="house_no" value={formData.house_no} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">House Name</label>
                  <input type="text" name="house_name" value={formData.house_name} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="select-field" required>
                    <option value="">Select</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input type="number" name="age" value={formData.age} onChange={handleChange} className="input-field" min="18" max="120" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">EPIC No</label>
                  <input type="text" name="epic_no" value={formData.epic_no} onChange={handleChange} className="input-field" />
                </div>
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Mobile</label>
                  <input type="tel" name="mobile_primary" value={formData.mobile_primary} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Mobile</label>
                  <input type="tel" name="mobile_secondary" value={formData.mobile_secondary} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                  <input type="tel" name="whatsapp_number" value={formData.whatsapp_number} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea name="address" value={formData.address} onChange={handleChange} rows="3" className="input-field" />
                </div>
              </div>
            )}

            {/* Demographic Tab */}
            {activeTab === 'demographic' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Religion</label>
                  <select name="religion_id" value={formData.religion_id} onChange={handleChange} className="select-field">
                    <option value="">Select</option>
                    {masterData.religions.map(r => (
                      <option key={r.id} value={r.id}>{r.religion_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Caste/Community</label>
                  <input type="text" name="caste_id" value={formData.caste_id} onChange={handleChange} className="input-field" placeholder="Enter caste" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                  <select name="occupation_id" value={formData.occupation_id} onChange={handleChange} className="select-field">
                    <option value="">Select</option>
                    {masterData.occupations.map(o => (
                      <option key={o.id} value={o.id}>{o.occupation_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                  <select name="education_id" value={formData.education_id} onChange={handleChange} className="select-field">
                    <option value="">Select</option>
                    {masterData.educationLevels.map(e => (
                      <option key={e.id} value={e.id}>{e.education_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Annual Income</label>
                  <select name="annual_income" value={formData.annual_income} onChange={handleChange} className="select-field">
                    <option value="">Select</option>
                    <option value="Below 1 Lakh">Below 1 Lakh</option>
                    <option value="1-3 Lakhs">1-3 Lakhs</option>
                    <option value="3-5 Lakhs">3-5 Lakhs</option>
                    <option value="5-10 Lakhs">5-10 Lakhs</option>
                    <option value="Above 10 Lakhs">Above 10 Lakhs</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                  <select name="blood_group" value={formData.blood_group} onChange={handleChange} className="select-field">
                    <option value="">Select</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Family ID</label>
                  <input type="text" name="family_id" value={formData.family_id} onChange={handleChange} className="input-field" />
                </div>
                <div className="flex items-center">
                  <input type="checkbox" name="is_family_head" checked={formData.is_family_head} onChange={handleChange} className="h-4 w-4 text-blue-600 rounded" />
                  <label className="ml-2 text-sm text-gray-700">Is Family Head</label>
                </div>
              </div>
            )}

            {/* Political Tab */}
            {activeTab === 'political' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Party Affiliation</label>
                  <select name="party_affiliation_id" value={formData.party_affiliation_id} onChange={handleChange} className="select-field">
                    <option value="">Select</option>
                    {masterData.parties.map(p => (
                      <option key={p.id} value={p.id}>{p.party_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vote Probability</label>
                  <select name="vote_probability_id" value={formData.vote_probability_id} onChange={handleChange} className="select-field">
                    <option value="">Select</option>
                    {masterData.voteProbabilities.map(p => (
                      <option key={p.id} value={p.id}>{p.category_name}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Political Roles</label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center">
                      <input type="checkbox" name="is_party_member" checked={formData.is_party_member} onChange={handleChange} className="h-4 w-4 text-blue-600 rounded" />
                      <span className="ml-2 text-sm text-gray-700">Party Member</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" name="is_party_worker" checked={formData.is_party_worker} onChange={handleChange} className="h-4 w-4 text-blue-600 rounded" />
                      <span className="ml-2 text-sm text-gray-700">Party Worker</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" name="is_booth_agent" checked={formData.is_booth_agent} onChange={handleChange} className="h-4 w-4 text-blue-600 rounded" />
                      <span className="ml-2 text-sm text-gray-700">Booth Agent</span>
                    </label>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                  <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows="3" className="input-field" placeholder="Any additional notes..." />
                </div>
              </div>
            )}

            {/* Special Categories Tab */}
            {activeTab === 'special' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 mb-4">Select applicable categories for this voter:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'is_nri', label: 'NRI (Non-Resident Indian)' },
                    { name: 'is_govt_employee', label: 'Government Employee' },
                    { name: 'is_pensioner', label: 'Pensioner' },
                    { name: 'is_physically_challenged', label: 'Physically Challenged' },
                    { name: 'is_senior_citizen', label: 'Senior Citizen (60+)' },
                    { name: 'needs_transport', label: 'Needs Transport to Booth' },
                    { name: 'needs_assistance', label: 'Needs Voting Assistance' },
                  ].map(item => (
                    <label key={item.name} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        name={item.name}
                        checked={formData[item.name]}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <span className="ml-3 text-sm text-gray-700">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : voter ? 'Update Voter' : 'Add Voter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Sample master data
const sampleReligions = [
  { id: 1, religion_name: 'Hindu' },
  { id: 2, religion_name: 'Muslim' },
  { id: 3, religion_name: 'Christian' },
  { id: 4, religion_name: 'Others' },
]

const sampleParties = [
  { id: 1, party_name: 'LDF' },
  { id: 2, party_name: 'UDF' },
  { id: 3, party_name: 'NDA' },
  { id: 4, party_name: 'Others' },
  { id: 5, party_name: 'Undecided' },
]

const sampleOccupations = [
  { id: 1, occupation_name: 'Government Service' },
  { id: 2, occupation_name: 'Private Service' },
  { id: 3, occupation_name: 'Business' },
  { id: 4, occupation_name: 'Agriculture' },
  { id: 5, occupation_name: 'Student' },
  { id: 6, occupation_name: 'Homemaker' },
  { id: 7, occupation_name: 'Retired' },
  { id: 8, occupation_name: 'Unemployed' },
  { id: 9, occupation_name: 'Others' },
]

const sampleEducation = [
  { id: 1, education_name: 'Below 10th' },
  { id: 2, education_name: '10th Pass' },
  { id: 3, education_name: '12th Pass' },
  { id: 4, education_name: 'Graduate' },
  { id: 5, education_name: 'Post Graduate' },
  { id: 6, education_name: 'Professional Degree' },
  { id: 7, education_name: 'Illiterate' },
]

const sampleProbabilities = [
  { id: 1, category_name: 'Sure Vote (90-100%)' },
  { id: 2, category_name: 'Likely (70-90%)' },
  { id: 3, category_name: 'Possible (50-70%)' },
  { id: 4, category_name: 'Unlikely (30-50%)' },
  { id: 5, category_name: 'Against (<30%)' },
]
