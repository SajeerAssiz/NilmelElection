import { useState } from 'react'
import Chart from 'react-apexcharts'
import {
  DocumentArrowDownIcon,
  PrinterIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline'

const reportTypes = [
  { id: 'ward-summary', name: 'Ward-wise Summary', description: 'Voter count and voting status by ward' },
  { id: 'booth-summary', name: 'Booth-wise Summary', description: 'Polling station wise voter details' },
  { id: 'party-analysis', name: 'Party Analysis', description: 'Party affiliation distribution' },
  { id: 'demographic', name: 'Demographic Report', description: 'Religion, caste, occupation breakdown' },
  { id: 'age-gender', name: 'Age & Gender Report', description: 'Age group and gender distribution' },
  { id: 'special-voters', name: 'Special Categories', description: 'Senior citizens, NRIs, physically challenged' },
  { id: 'probability', name: 'Vote Probability', description: 'Expected voting behavior analysis' },
  { id: 'family', name: 'Family-wise Report', description: 'Household voting analysis' },
]

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState('ward-summary')
  const [filters, setFilters] = useState({
    wardId: '',
    boothId: '',
    partyId: '',
  })

  const renderReport = () => {
    switch (selectedReport) {
      case 'ward-summary':
        return <WardSummaryReport />
      case 'booth-summary':
        return <BoothSummaryReport />
      case 'party-analysis':
        return <PartyAnalysisReport />
      case 'demographic':
        return <DemographicReport />
      case 'age-gender':
        return <AgeGenderReport />
      case 'special-voters':
        return <SpecialVotersReport />
      case 'probability':
        return <ProbabilityReport />
      case 'family':
        return <FamilyReport />
      default:
        return null
    }
  }

  const handleExport = (format) => {
    // Export logic would go here
    alert(`Exporting as ${format.toUpperCase()}...`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => handleExport('pdf')} className="btn-secondary flex items-center gap-2">
            <DocumentArrowDownIcon className="h-4 w-4" />
            Export PDF
          </button>
          <button onClick={() => handleExport('excel')} className="btn-secondary flex items-center gap-2">
            <DocumentArrowDownIcon className="h-4 w-4" />
            Export Excel
          </button>
          <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2">
            <PrinterIcon className="h-4 w-4" />
            Print
          </button>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {reportTypes.map(report => (
          <button
            key={report.id}
            onClick={() => setSelectedReport(report.id)}
            className={`p-4 rounded-lg border text-left transition-all ${
              selectedReport === report.id
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="font-medium text-gray-900">{report.name}</div>
            <div className="text-sm text-gray-500 mt-1">{report.description}</div>
          </button>
        ))}
      </div>

      {/* Report Content */}
      <div className="card">
        {renderReport()}
      </div>
    </div>
  )
}

function WardSummaryReport() {
  const data = [
    { ward: 1, name: 'Nilamel', total: 540, male: 260, female: 280, voted: 380, pending: 160 },
    { ward: 2, name: 'Pazhayakunnummel', total: 620, male: 300, female: 320, voted: 420, pending: 200 },
    { ward: 3, name: 'Kottamkara', total: 480, male: 230, female: 250, voted: 320, pending: 160 },
    { ward: 4, name: 'Mangalathukonam', total: 590, male: 285, female: 305, voted: 410, pending: 180 },
    { ward: 5, name: 'Kuzhikkal', total: 510, male: 245, female: 265, voted: 350, pending: 160 },
  ]

  const chartOptions = {
    chart: { type: 'bar', stacked: true, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true } },
    xaxis: { categories: data.map(d => `Ward ${d.ward}`) },
    colors: ['#22c55e', '#f97316'],
    legend: { position: 'top' },
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Ward-wise Voter Summary</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Chart
            options={chartOptions}
            series={[
              { name: 'Voted', data: data.map(d => d.voted) },
              { name: 'Pending', data: data.map(d => d.pending) },
            ]}
            type="bar"
            height={300}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="table-header">Ward</th>
                <th className="table-header">Name</th>
                <th className="table-header">Total</th>
                <th className="table-header">Male</th>
                <th className="table-header">Female</th>
                <th className="table-header">Voted</th>
                <th className="table-header">%</th>
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
                <tr key={row.ward} className="hover:bg-gray-50">
                  <td className="table-cell font-medium">{row.ward}</td>
                  <td className="table-cell">{row.name}</td>
                  <td className="table-cell">{row.total}</td>
                  <td className="table-cell text-blue-600">{row.male}</td>
                  <td className="table-cell text-pink-600">{row.female}</td>
                  <td className="table-cell text-green-600">{row.voted}</td>
                  <td className="table-cell">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      {Math.round((row.voted / row.total) * 100)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-semibold">
                <td className="table-cell" colSpan="2">Total</td>
                <td className="table-cell">{data.reduce((s, d) => s + d.total, 0)}</td>
                <td className="table-cell text-blue-600">{data.reduce((s, d) => s + d.male, 0)}</td>
                <td className="table-cell text-pink-600">{data.reduce((s, d) => s + d.female, 0)}</td>
                <td className="table-cell text-green-600">{data.reduce((s, d) => s + d.voted, 0)}</td>
                <td className="table-cell">
                  {Math.round((data.reduce((s, d) => s + d.voted, 0) / data.reduce((s, d) => s + d.total, 0)) * 100)}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

function BoothSummaryReport() {
  const data = [
    { booth: 1, name: 'Nilamel LP School', ward: 1, total: 280, voted: 195, agents: 3 },
    { booth: 2, name: 'Nilamel High School', ward: 1, total: 260, voted: 185, agents: 3 },
    { booth: 3, name: 'Pazhayakunnummel School', ward: 2, total: 320, voted: 220, agents: 4 },
    { booth: 4, name: 'Community Hall', ward: 2, total: 300, voted: 200, agents: 3 },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Booth-wise Summary</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="table-header">Booth No</th>
              <th className="table-header">Name</th>
              <th className="table-header">Ward</th>
              <th className="table-header">Total Voters</th>
              <th className="table-header">Voted</th>
              <th className="table-header">Pending</th>
              <th className="table-header">Turnout %</th>
              <th className="table-header">Agents</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.booth} className="hover:bg-gray-50">
                <td className="table-cell font-medium">{row.booth}</td>
                <td className="table-cell">{row.name}</td>
                <td className="table-cell">Ward {row.ward}</td>
                <td className="table-cell">{row.total}</td>
                <td className="table-cell text-green-600">{row.voted}</td>
                <td className="table-cell text-orange-600">{row.total - row.voted}</td>
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(row.voted / row.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm">{Math.round((row.voted / row.total) * 100)}%</span>
                  </div>
                </td>
                <td className="table-cell">{row.agents}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PartyAnalysisReport() {
  const data = [
    { party: 'LDF', voters: 4350, percentage: 35, color: '#ef4444' },
    { party: 'UDF', voters: 3725, percentage: 30, color: '#22c55e' },
    { party: 'NDA', voters: 1865, percentage: 15, color: '#f97316' },
    { party: 'Others', voters: 990, percentage: 8, color: '#8b5cf6' },
    { party: 'Undecided', voters: 1520, percentage: 12, color: '#6b7280' },
  ]

  const chartOptions = {
    chart: { type: 'donut' },
    labels: data.map(d => d.party),
    colors: data.map(d => d.color),
    legend: { position: 'bottom' },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(1)}%`,
    },
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Party Affiliation Analysis</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Chart
          options={chartOptions}
          series={data.map(d => d.voters)}
          type="donut"
          height={350}
        />
        <div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="table-header">Party</th>
                <th className="table-header">Voters</th>
                <th className="table-header">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
                <tr key={row.party} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: row.color }}></span>
                      {row.party}
                    </div>
                  </td>
                  <td className="table-cell">{row.voters.toLocaleString()}</td>
                  <td className="table-cell">{row.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function DemographicReport() {
  const religionData = [
    { name: 'Hindu', count: 5600, percentage: 45 },
    { name: 'Muslim', count: 3725, percentage: 30 },
    { name: 'Christian', count: 2862, percentage: 23 },
    { name: 'Others', count: 263, percentage: 2 },
  ]

  const occupationData = [
    { name: 'Government Service', count: 1870 },
    { name: 'Private Service', count: 3110 },
    { name: 'Business', count: 1620 },
    { name: 'Agriculture', count: 2240 },
    { name: 'Homemaker', count: 2480 },
    { name: 'Retired', count: 1130 },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Demographic Analysis</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium mb-4">Religion Distribution</h4>
          <Chart
            options={{
              chart: { type: 'pie' },
              labels: religionData.map(d => d.name),
              colors: ['#f97316', '#22c55e', '#3b82f6', '#8b5cf6'],
            }}
            series={religionData.map(d => d.count)}
            type="pie"
            height={300}
          />
        </div>
        <div>
          <h4 className="font-medium mb-4">Occupation Distribution</h4>
          <Chart
            options={{
              chart: { type: 'bar', toolbar: { show: false } },
              plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
              xaxis: { categories: occupationData.map(d => d.name) },
              colors: ['#3b82f6'],
            }}
            series={[{ data: occupationData.map(d => d.count) }]}
            type="bar"
            height={300}
          />
        </div>
      </div>
    </div>
  )
}

function AgeGenderReport() {
  const ageData = [
    { group: '18-25', male: 620, female: 580 },
    { group: '26-35', male: 1350, female: 1450 },
    { group: '36-45', male: 1520, female: 1580 },
    { group: '46-55', male: 1180, female: 1320 },
    { group: '56-65', male: 850, female: 950 },
    { group: '65+', male: 480, female: 570 },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Age & Gender Distribution</h3>
      <Chart
        options={{
          chart: { type: 'bar', stacked: false, toolbar: { show: false } },
          plotOptions: { bar: { horizontal: false, columnWidth: '55%' } },
          xaxis: { categories: ageData.map(d => d.group) },
          colors: ['#3b82f6', '#ec4899'],
          legend: { position: 'top' },
        }}
        series={[
          { name: 'Male', data: ageData.map(d => d.male) },
          { name: 'Female', data: ageData.map(d => d.female) },
        ]}
        type="bar"
        height={350}
      />
    </div>
  )
}

function SpecialVotersReport() {
  const data = [
    { category: 'Senior Citizens (60+)', count: 1850, icon: '👴' },
    { category: 'NRI Voters', count: 320, icon: '✈️' },
    { category: 'Physically Challenged', count: 145, icon: '♿' },
    { category: 'Government Employees', count: 890, icon: '🏛️' },
    { category: 'Pensioners', count: 620, icon: '💰' },
    { category: 'Needs Transport', count: 280, icon: '🚗' },
    { category: 'Needs Assistance', count: 95, icon: '🤝' },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Special Category Voters</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.map(item => (
          <div key={item.category} className="stat-card text-center">
            <div className="text-3xl mb-2">{item.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{item.count}</div>
            <div className="text-sm text-gray-500">{item.category}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProbabilityReport() {
  const data = [
    { category: 'Sure Vote (90-100%)', count: 4200, color: '#22c55e' },
    { category: 'Likely (70-90%)', count: 3100, color: '#84cc16' },
    { category: 'Possible (50-70%)', count: 2400, color: '#eab308' },
    { category: 'Unlikely (30-50%)', count: 1800, color: '#f97316' },
    { category: 'Against (<30%)', count: 950, color: '#ef4444' },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Vote Probability Analysis</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Chart
          options={{
            chart: { type: 'donut' },
            labels: data.map(d => d.category),
            colors: data.map(d => d.color),
            legend: { position: 'bottom' },
          }}
          series={data.map(d => d.count)}
          type="donut"
          height={350}
        />
        <div className="space-y-4">
          {data.map(item => (
            <div key={item.category} className="flex items-center gap-4">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{item.category}</span>
                  <span className="text-sm text-gray-500">{item.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${(item.count / 12450) * 100}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FamilyReport() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Family-wise Voting Report</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card text-center">
          <div className="text-3xl font-bold text-gray-900">3,420</div>
          <div className="text-sm text-gray-500">Total Families</div>
        </div>
        <div className="stat-card text-center bg-green-50">
          <div className="text-3xl font-bold text-green-700">2,180</div>
          <div className="text-sm text-green-600">All Members Voted</div>
        </div>
        <div className="stat-card text-center bg-orange-50">
          <div className="text-3xl font-bold text-orange-700">1,240</div>
          <div className="text-sm text-orange-600">Partially Voted</div>
        </div>
      </div>
      <p className="text-gray-500 text-sm">
        This report shows family-wise voting patterns to help with door-to-door campaigns
        and identify households where follow-up may be needed.
      </p>
    </div>
  )
}
