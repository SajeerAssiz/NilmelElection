import { useState } from 'react'
import {
  Cog6ToothIcon,
  UserGroupIcon,
  CloudArrowUpIcon,
  ShieldCheckIcon,
  BellIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const tabs = [
  { id: 'general', name: 'General', icon: Cog6ToothIcon },
  { id: 'users', name: 'Users', icon: UserGroupIcon },
  { id: 'import', name: 'Data Import', icon: CloudArrowUpIcon },
  { id: 'backup', name: 'Backup', icon: ShieldCheckIcon },
  { id: 'notifications', name: 'Notifications', icon: BellIcon },
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general')

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />
      case 'users':
        return <UsersSettings />
      case 'import':
        return <ImportSettings />
      case 'backup':
        return <BackupSettings />
      case 'notifications':
        return <NotificationSettings />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="card">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

function GeneralSettings() {
  const [settings, setSettings] = useState({
    panchayatName: 'Nilamel Grama Panchayat',
    panchayatNameMalayalam: 'നിലമേൽ ഗ്രാമ പഞ്ചായത്ത്',
    district: 'Kollam',
    state: 'Kerala',
    electionName: 'Local Body Election 2025',
    electionDate: '2025-12-15',
  })

  const handleSave = () => {
    toast.success('Settings saved successfully')
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">General Settings</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Panchayat Name</label>
          <input
            type="text"
            value={settings.panchayatName}
            onChange={(e) => setSettings({ ...settings, panchayatName: e.target.value })}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Panchayat Name (Malayalam)</label>
          <input
            type="text"
            value={settings.panchayatNameMalayalam}
            onChange={(e) => setSettings({ ...settings, panchayatNameMalayalam: e.target.value })}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
          <input
            type="text"
            value={settings.district}
            onChange={(e) => setSettings({ ...settings, district: e.target.value })}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <input
            type="text"
            value={settings.state}
            onChange={(e) => setSettings({ ...settings, state: e.target.value })}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Election Name</label>
          <input
            type="text"
            value={settings.electionName}
            onChange={(e) => setSettings({ ...settings, electionName: e.target.value })}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Election Date</label>
          <input
            type="date"
            value={settings.electionDate}
            onChange={(e) => setSettings({ ...settings, electionDate: e.target.value })}
            className="input-field"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} className="btn-primary">Save Settings</button>
      </div>
    </div>
  )
}

function UsersSettings() {
  const [users] = useState([
    { id: 1, username: 'admin', fullName: 'Administrator', role: 'admin', lastLogin: '2025-11-30 10:00' },
    { id: 2, username: 'operator1', fullName: 'Booth Operator 1', role: 'operator', lastLogin: '2025-11-30 09:30' },
    { id: 3, username: 'viewer1', fullName: 'Ward Member', role: 'viewer', lastLogin: '2025-11-29 18:00' },
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">User Management</h3>
        <button className="btn-primary">Add User</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="table-header">Username</th>
              <th className="table-header">Full Name</th>
              <th className="table-header">Role</th>
              <th className="table-header">Last Login</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="table-cell font-medium">{user.username}</td>
                <td className="table-cell">{user.fullName}</td>
                <td className="table-cell">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'operator' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="table-cell text-gray-500">{user.lastLogin}</td>
                <td className="table-cell">
                  <button className="text-blue-600 hover:text-blue-800 mr-2">Edit</button>
                  <button className="text-red-600 hover:text-red-800">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium mb-2">Role Permissions</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li><strong>Admin:</strong> Full access to all features including settings and user management</li>
          <li><strong>Operator:</strong> Can mark votes, edit voter details, view reports</li>
          <li><strong>Viewer:</strong> Read-only access to voter list and reports</li>
        </ul>
      </div>
    </div>
  )
}

function ImportSettings() {
  const [file, setFile] = useState(null)
  const [importing, setImporting] = useState(false)

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file')
      return
    }
    setImporting(true)
    // Simulate import
    setTimeout(() => {
      toast.success('Data imported successfully')
      setImporting(false)
      setFile(null)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Data Import</h3>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Import Instructions</h4>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Upload an Excel (.xlsx) or CSV file</li>
          <li>File should contain columns: Serial No, Name, Guardian's Name, House No, House Name, Gender/Age, SEC ID</li>
          <li>First row should be headers</li>
          <li>Duplicate SEC IDs will be skipped</li>
        </ul>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <div className="mb-4">
          <label className="btn-primary cursor-pointer">
            Select File
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </label>
        </div>
        {file && (
          <p className="text-sm text-gray-600">
            Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleImport}
          disabled={!file || importing}
          className="btn-primary"
        >
          {importing ? 'Importing...' : 'Import Data'}
        </button>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h4 className="font-medium mb-4">Sample File Format</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2 text-left">Serial No.</th>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Guardian's Name</th>
                <th className="px-3 py-2 text-left">OldWard No/ House No.</th>
                <th className="px-3 py-2 text-left">House Name</th>
                <th className="px-3 py-2 text-left">Gender / Age</th>
                <th className="px-3 py-2 text-left">New SEC ID No.</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-3 py-2">1</td>
                <td className="px-3 py-2">ALFIYA T</td>
                <td className="px-3 py-2">ANANTHU V N</td>
                <td className="px-3 py-2">/228</td>
                <td className="px-3 py-2">Sohanantham</td>
                <td className="px-3 py-2">F / 23</td>
                <td className="px-3 py-2">SEC043631150</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function BackupSettings() {
  const [backups] = useState([
    { id: 1, date: '2025-11-30 08:00', size: '2.4 MB', type: 'Auto' },
    { id: 2, date: '2025-11-29 08:00', size: '2.3 MB', type: 'Auto' },
    { id: 3, date: '2025-11-28 15:30', size: '2.3 MB', type: 'Manual' },
  ])

  const handleBackup = () => {
    toast.success('Backup created successfully')
  }

  const handleRestore = (backup) => {
    if (confirm(`Are you sure you want to restore backup from ${backup.date}?`)) {
      toast.success('Backup restored successfully')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Backup & Restore</h3>
        <button onClick={handleBackup} className="btn-primary">Create Backup Now</button>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-800 mb-2">Auto Backup Enabled</h4>
        <p className="text-sm text-green-700">Database is automatically backed up every day at 8:00 AM</p>
      </div>

      <div>
        <h4 className="font-medium mb-4">Recent Backups</h4>
        <div className="space-y-2">
          {backups.map(backup => (
            <div key={backup.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{backup.date}</p>
                <p className="text-sm text-gray-500">{backup.size} • {backup.type} backup</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn-secondary text-sm">Download</button>
                <button onClick={() => handleRestore(backup)} className="btn-secondary text-sm">Restore</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function NotificationSettings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    votingAlerts: true,
    dailyReport: true,
    hourlyUpdate: false,
  })

  const handleSave = () => {
    toast.success('Notification settings saved')
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Notification Settings</h3>

      <div className="space-y-4">
        {[
          { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
          { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive notifications via SMS' },
          { key: 'votingAlerts', label: 'Voting Milestone Alerts', description: 'Get notified when voting reaches milestones (25%, 50%, 75%)' },
          { key: 'dailyReport', label: 'Daily Report', description: 'Receive daily summary report at end of day' },
          { key: 'hourlyUpdate', label: 'Hourly Updates', description: 'Receive hourly voting progress updates on polling day' },
        ].map(item => (
          <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">{item.label}</p>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings[item.key]}
                onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} className="btn-primary">Save Settings</button>
      </div>
    </div>
  )
}
