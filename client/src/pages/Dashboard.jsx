import { useState, useEffect } from 'react'
import Chart from 'react-apexcharts'
import {
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline'
import * as api from '../services/api'

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="stat-card">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
)

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalVoters: 0,
    voted: 0,
    notVoted: 0,
    maleVoters: 0,
    femaleVoters: 0,
    totalWards: 0,
    totalBooths: 0,
  })
  const [loading, setLoading] = useState(true)

  // Sample data for charts (will be replaced with API data)
  const [wardData, setWardData] = useState({ labels: [], data: [] })
  const [partyData, setPartyData] = useState({ labels: [], data: [] })
  const [religionData, setReligionData] = useState({ labels: [], data: [] })
  const [ageData, setAgeData] = useState({ labels: [], data: [] })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Try to fetch from API, use sample data if fails
      const statsResponse = await api.getDashboardStats().catch(() => null)

      if (statsResponse?.data) {
        setStats(statsResponse.data)
      } else {
        // Sample data for demonstration
        setStats({
          totalVoters: 12450,
          voted: 8234,
          notVoted: 4216,
          maleVoters: 5890,
          femaleVoters: 6560,
          totalWards: 23,
          totalBooths: 45,
        })
      }

      // Sample chart data
      setWardData({
        labels: ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5', 'Ward 6', 'Ward 7', 'Ward 8'],
        data: [540, 620, 480, 590, 510, 680, 420, 550]
      })

      setPartyData({
        labels: ['LDF', 'UDF', 'NDA', 'Others', 'Undecided'],
        data: [35, 30, 15, 8, 12]
      })

      setReligionData({
        labels: ['Hindu', 'Muslim', 'Christian', 'Others'],
        data: [45, 30, 23, 2]
      })

      setAgeData({
        labels: ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'],
        data: [1200, 2800, 3100, 2500, 1800, 1050]
      })

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const votingPercentage = stats.totalVoters > 0
    ? Math.round((stats.voted / stats.totalVoters) * 100)
    : 0

  // Chart configurations
  const wardChartOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 4, horizontal: false } },
    dataLabels: { enabled: false },
    xaxis: { categories: wardData.labels },
    colors: ['#3b82f6'],
    grid: { borderColor: '#f1f1f1' }
  }

  const partyChartOptions = {
    chart: { type: 'donut' },
    labels: partyData.labels,
    colors: ['#ef4444', '#22c55e', '#f97316', '#8b5cf6', '#6b7280'],
    legend: { position: 'bottom' },
    dataLabels: { enabled: true, formatter: (val) => `${val.toFixed(1)}%` }
  }

  const religionChartOptions = {
    chart: { type: 'pie' },
    labels: religionData.labels,
    colors: ['#f97316', '#22c55e', '#3b82f6', '#8b5cf6'],
    legend: { position: 'bottom' },
    dataLabels: { enabled: true, formatter: (val) => `${val.toFixed(1)}%` }
  }

  const ageChartOptions = {
    chart: { type: 'area', toolbar: { show: false } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: { categories: ageData.labels },
    colors: ['#8b5cf6'],
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1 }
    },
    grid: { borderColor: '#f1f1f1' }
  }

  const votingProgressOptions = {
    chart: { type: 'radialBar' },
    plotOptions: {
      radialBar: {
        hollow: { size: '70%' },
        dataLabels: {
          name: { show: true, fontSize: '16px', color: '#6b7280' },
          value: { show: true, fontSize: '30px', fontWeight: 'bold', color: '#111827' }
        }
      }
    },
    labels: ['Voted'],
    colors: ['#22c55e']
  }

  const genderChartOptions = {
    chart: { type: 'donut' },
    labels: ['Male', 'Female'],
    colors: ['#3b82f6', '#ec4899'],
    legend: { position: 'bottom' },
    plotOptions: {
      pie: {
        donut: { size: '60%' }
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={loadDashboardData}
          className="btn-secondary text-sm"
        >
          Refresh Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Voters"
          value={stats.totalVoters.toLocaleString()}
          icon={UsersIcon}
          color="bg-blue-500"
          subtitle={`${stats.maleVoters.toLocaleString()} M / ${stats.femaleVoters.toLocaleString()} F`}
        />
        <StatCard
          title="Voted"
          value={stats.voted.toLocaleString()}
          icon={CheckCircleIcon}
          color="bg-green-500"
          subtitle={`${votingPercentage}% turnout`}
        />
        <StatCard
          title="Yet to Vote"
          value={stats.notVoted.toLocaleString()}
          icon={ClockIcon}
          color="bg-orange-500"
        />
        <StatCard
          title="Polling Stations"
          value={stats.totalBooths}
          icon={MapPinIcon}
          color="bg-purple-500"
          subtitle={`${stats.totalWards} Wards`}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Voting Progress */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Voting Progress</h3>
          <Chart
            options={votingProgressOptions}
            series={[votingPercentage]}
            type="radialBar"
            height={280}
          />
        </div>

        {/* Gender Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Gender Distribution</h3>
          <Chart
            options={genderChartOptions}
            series={[stats.maleVoters, stats.femaleVoters]}
            type="donut"
            height={280}
          />
        </div>

        {/* Party Affiliation */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Party Affiliation</h3>
          <Chart
            options={partyChartOptions}
            series={partyData.data}
            type="donut"
            height={280}
          />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voters by Ward */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Voters by Ward</h3>
          <Chart
            options={wardChartOptions}
            series={[{ name: 'Voters', data: wardData.data }]}
            type="bar"
            height={300}
          />
        </div>

        {/* Age Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Age Distribution</h3>
          <Chart
            options={ageChartOptions}
            series={[{ name: 'Voters', data: ageData.data }]}
            type="area"
            height={300}
          />
        </div>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Religion Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Religion Distribution</h3>
          <Chart
            options={religionChartOptions}
            series={religionData.data}
            type="pie"
            height={300}
          />
        </div>

        {/* Quick Stats Table */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Ward-wise Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="table-header">Ward</th>
                  <th className="table-header">Total</th>
                  <th className="table-header">Voted</th>
                  <th className="table-header">%</th>
                </tr>
              </thead>
              <tbody>
                {wardData.labels.slice(0, 6).map((ward, idx) => (
                  <tr key={ward} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">{ward}</td>
                    <td className="table-cell">{wardData.data[idx]}</td>
                    <td className="table-cell">{Math.round(wardData.data[idx] * 0.65)}</td>
                    <td className="table-cell">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        65%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
