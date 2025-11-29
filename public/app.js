// API Base URL
const API_URL = '/api';

// State
let currentPage = 1;
let totalPages = 1;
let searchTimeout = null;
let isAdvancedSearch = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadStats();
  loadVoters();
  loadWards();
  loadBooths();

  // Search with debounce
  document.getElementById('searchInput').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentPage = 1;
      isAdvancedSearch = false;
      loadVoters();
    }, 300);
  });

  // Filter change handlers
  document.getElementById('wardFilter').addEventListener('change', () => {
    currentPage = 1;
    isAdvancedSearch = false;
    loadVoters();
    loadBooths();
  });

  document.getElementById('boothFilter').addEventListener('change', () => {
    currentPage = 1;
    isAdvancedSearch = false;
    loadVoters();
  });

  document.getElementById('genderFilter').addEventListener('change', () => {
    currentPage = 1;
    isAdvancedSearch = false;
    loadVoters();
  });
});

// Load Statistics
async function loadStats() {
  try {
    const response = await fetch(`${API_URL}/stats`);
    const result = await response.json();

    if (result.success) {
      document.getElementById('totalVoters').textContent = result.data.totalVoters.toLocaleString();
      document.getElementById('maleVoters').textContent = result.data.maleVoters.toLocaleString();
      document.getElementById('femaleVoters').textContent = result.data.femaleVoters.toLocaleString();
      document.getElementById('totalWards').textContent = result.data.totalWards.toLocaleString();
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Load Voters
async function loadVoters() {
  const tableBody = document.getElementById('votersTableBody');
  tableBody.innerHTML = '<tr><td colspan="11" class="loading">Loading voters...</td></tr>';

  try {
    const search = document.getElementById('searchInput').value;
    const ward = document.getElementById('wardFilter').value;
    const booth = document.getElementById('boothFilter').value;
    const gender = document.getElementById('genderFilter').value;

    const params = new URLSearchParams({
      page: currentPage,
      limit: 50,
      search,
      ward,
      booth,
      gender
    });

    const response = await fetch(`${API_URL}/voters?${params}`);
    const result = await response.json();

    if (result.success) {
      totalPages = result.pagination.totalPages;
      renderVoters(result.data);
      updatePagination(result.pagination);
    }
  } catch (error) {
    console.error('Error loading voters:', error);
    tableBody.innerHTML = '<tr><td colspan="11" class="empty-state">Error loading voters</td></tr>';
  }
}

// Render Voters Table
function renderVoters(voters) {
  const tableBody = document.getElementById('votersTableBody');

  if (voters.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="11" class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <p>No voters found</p>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = voters.map(voter => `
    <tr>
      <td>${voter.sl_no || '-'}</td>
      <td>${voter.voter_id || '-'}</td>
      <td>
        <strong>${voter.name || '-'}</strong>
        ${voter.name_malayalam ? `<br><small>${voter.name_malayalam}</small>` : ''}
      </td>
      <td>${voter.guardian_name || '-'}</td>
      <td>
        ${voter.house_name || '-'}
        ${voter.house_number ? ` (${voter.house_number})` : ''}
      </td>
      <td>${voter.age || '-'}</td>
      <td>${voter.gender || '-'}</td>
      <td>${voter.ward_no || '-'}</td>
      <td>${voter.booth_no || '-'}</td>
      <td>${voter.mobile || '-'}</td>
      <td>
        <div class="action-btns">
          <button class="action-btn view" onclick="viewVoter(${voter.id})" title="View">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
          <button class="action-btn edit" onclick="editVoter(${voter.id})" title="Edit">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="action-btn delete" onclick="deleteVoter(${voter.id})" title="Delete">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Update Pagination
function updatePagination(pagination) {
  document.getElementById('pageInfo').textContent =
    `Page ${pagination.page} of ${pagination.totalPages} (${pagination.total} voters)`;

  document.getElementById('prevBtn').disabled = pagination.page <= 1;
  document.getElementById('nextBtn').disabled = pagination.page >= pagination.totalPages;
}

// Change Page
function changePage(delta) {
  currentPage += delta;
  if (currentPage < 1) currentPage = 1;
  if (currentPage > totalPages) currentPage = totalPages;
  loadVoters();
}

// Load Wards
async function loadWards() {
  try {
    const response = await fetch(`${API_URL}/wards`);
    const result = await response.json();

    if (result.success) {
      const wardFilter = document.getElementById('wardFilter');
      wardFilter.innerHTML = '<option value="">All Wards</option>';
      result.data.forEach(ward => {
        wardFilter.innerHTML += `<option value="${ward.ward_no}">${ward.ward_name} (Ward ${ward.ward_no})</option>`;
      });
    }
  } catch (error) {
    console.error('Error loading wards:', error);
  }
}

// Load Booths
async function loadBooths() {
  try {
    const ward = document.getElementById('wardFilter').value;
    const params = ward ? `?ward=${ward}` : '';

    const response = await fetch(`${API_URL}/booths${params}`);
    const result = await response.json();

    if (result.success) {
      const boothFilter = document.getElementById('boothFilter');
      boothFilter.innerHTML = '<option value="">All Booths</option>';
      result.data.forEach(booth => {
        boothFilter.innerHTML += `<option value="${booth.booth_no}">${booth.booth_name} (Booth ${booth.booth_no})</option>`;
      });
    }
  } catch (error) {
    console.error('Error loading booths:', error);
  }
}

// Open Add Modal
function openModal() {
  document.getElementById('modalTitle').textContent = 'Add New Voter';
  document.getElementById('voterForm').reset();
  document.getElementById('voterId').value = '';
  document.getElementById('voterModal').classList.add('active');
}

// Close Modal
function closeModal() {
  document.getElementById('voterModal').classList.remove('active');
}

// View Voter
async function viewVoter(id) {
  try {
    const response = await fetch(`${API_URL}/voters/${id}`);
    const result = await response.json();

    if (result.success) {
      const voter = result.data;
      const detailsContainer = document.getElementById('voterDetails');

      detailsContainer.innerHTML = `
        <div class="detail-item">
          <span class="detail-label">Sl. No</span>
          <span class="detail-value">${voter.sl_no || '-'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Voter ID</span>
          <span class="detail-value">${voter.voter_id || '-'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Name (English)</span>
          <span class="detail-value">${voter.name || '-'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Name (Malayalam)</span>
          <span class="detail-value">${voter.name_malayalam || '-'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Guardian Name</span>
          <span class="detail-value">${voter.guardian_name || '-'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Relationship</span>
          <span class="detail-value">${voter.relationship || '-'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">House Name</span>
          <span class="detail-value">${voter.house_name || '-'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">House Number</span>
          <span class="detail-value">${voter.house_number || '-'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Age</span>
          <span class="detail-value">${voter.age || '-'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Gender</span>
          <span class="detail-value">${voter.gender || '-'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Ward No</span>
          <span class="detail-value">${voter.ward_no || '-'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Booth No</span>
          <span class="detail-value">${voter.booth_no || '-'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Booth Name</span>
          <span class="detail-value">${voter.booth_name || '-'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Polling Station</span>
          <span class="detail-value">${voter.polling_station || '-'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">EPIC No</span>
          <span class="detail-value">${voter.epic_no || '-'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Mobile</span>
          <span class="detail-value">${voter.mobile || '-'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Email</span>
          <span class="detail-value">${voter.email || '-'}</span>
        </div>
        <div class="detail-item full-width">
          <span class="detail-label">Remarks</span>
          <span class="detail-value">${voter.remarks || '-'}</span>
        </div>
      `;

      document.getElementById('viewModal').classList.add('active');
    }
  } catch (error) {
    console.error('Error viewing voter:', error);
    alert('Error loading voter details');
  }
}

// Close View Modal
function closeViewModal() {
  document.getElementById('viewModal').classList.remove('active');
}

// Edit Voter
async function editVoter(id) {
  try {
    const response = await fetch(`${API_URL}/voters/${id}`);
    const result = await response.json();

    if (result.success) {
      const voter = result.data;
      document.getElementById('modalTitle').textContent = 'Edit Voter';
      document.getElementById('voterId').value = voter.id;

      // Fill form fields
      document.getElementById('sl_no').value = voter.sl_no || '';
      document.getElementById('voter_id').value = voter.voter_id || '';
      document.getElementById('name').value = voter.name || '';
      document.getElementById('name_malayalam').value = voter.name_malayalam || '';
      document.getElementById('guardian_name').value = voter.guardian_name || '';
      document.getElementById('guardian_name_malayalam').value = voter.guardian_name_malayalam || '';
      document.getElementById('relationship').value = voter.relationship || '';
      document.getElementById('house_name').value = voter.house_name || '';
      document.getElementById('house_name_malayalam').value = voter.house_name_malayalam || '';
      document.getElementById('house_number').value = voter.house_number || '';
      document.getElementById('age').value = voter.age || '';
      document.getElementById('gender').value = voter.gender || '';
      document.getElementById('ward_no').value = voter.ward_no || '';
      document.getElementById('booth_no').value = voter.booth_no || '';
      document.getElementById('booth_name').value = voter.booth_name || '';
      document.getElementById('polling_station').value = voter.polling_station || '';
      document.getElementById('epic_no').value = voter.epic_no || '';
      document.getElementById('mobile').value = voter.mobile || '';
      document.getElementById('email').value = voter.email || '';
      document.getElementById('remarks').value = voter.remarks || '';

      document.getElementById('voterModal').classList.add('active');
    }
  } catch (error) {
    console.error('Error editing voter:', error);
    alert('Error loading voter data');
  }
}

// Save Voter
async function saveVoter(event) {
  event.preventDefault();

  const id = document.getElementById('voterId').value;
  const formData = {
    sl_no: document.getElementById('sl_no').value || null,
    voter_id: document.getElementById('voter_id').value,
    name: document.getElementById('name').value,
    name_malayalam: document.getElementById('name_malayalam').value || null,
    guardian_name: document.getElementById('guardian_name').value || null,
    guardian_name_malayalam: document.getElementById('guardian_name_malayalam').value || null,
    relationship: document.getElementById('relationship').value || null,
    house_name: document.getElementById('house_name').value || null,
    house_name_malayalam: document.getElementById('house_name_malayalam').value || null,
    house_number: document.getElementById('house_number').value || null,
    age: document.getElementById('age').value || null,
    gender: document.getElementById('gender').value || null,
    ward_no: document.getElementById('ward_no').value || null,
    booth_no: document.getElementById('booth_no').value || null,
    booth_name: document.getElementById('booth_name').value || null,
    polling_station: document.getElementById('polling_station').value || null,
    epic_no: document.getElementById('epic_no').value || null,
    mobile: document.getElementById('mobile').value || null,
    email: document.getElementById('email').value || null,
    remarks: document.getElementById('remarks').value || null
  };

  try {
    const url = id ? `${API_URL}/voters/${id}` : `${API_URL}/voters`;
    const method = id ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (result.success) {
      closeModal();
      loadVoters();
      loadStats();
      alert(id ? 'Voter updated successfully!' : 'Voter added successfully!');
    } else {
      alert('Error: ' + result.error);
    }
  } catch (error) {
    console.error('Error saving voter:', error);
    alert('Error saving voter');
  }
}

// Delete Voter
async function deleteVoter(id) {
  if (!confirm('Are you sure you want to delete this voter?')) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/voters/${id}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (result.success) {
      loadVoters();
      loadStats();
      alert('Voter deleted successfully!');
    } else {
      alert('Error: ' + result.error);
    }
  } catch (error) {
    console.error('Error deleting voter:', error);
    alert('Error deleting voter');
  }
}

// ============ ADVANCED SEARCH ============

// Toggle Advanced Search Panel
function toggleAdvancedSearch() {
  const panel = document.getElementById('advancedSearch');
  if (panel.style.display === 'none') {
    panel.style.display = 'block';
  } else {
    panel.style.display = 'none';
  }
}

// Apply Advanced Search
async function applyAdvancedSearch() {
  const tableBody = document.getElementById('votersTableBody');
  tableBody.innerHTML = '<tr><td colspan="11" class="loading">Searching...</td></tr>';

  const params = new URLSearchParams();

  const name = document.getElementById('advName').value;
  const guardian = document.getElementById('advGuardian').value;
  const houseName = document.getElementById('advHouseName').value;
  const houseNumber = document.getElementById('advHouseNumber').value;
  const epicNo = document.getElementById('advEpicNo').value;
  const gender = document.getElementById('advGender').value;
  const minAge = document.getElementById('advMinAge').value;
  const maxAge = document.getElementById('advMaxAge').value;

  if (name) params.append('name', name);
  if (guardian) params.append('guardian', guardian);
  if (houseName) params.append('houseName', houseName);
  if (houseNumber) params.append('houseNumber', houseNumber);
  if (epicNo) params.append('epicNo', epicNo);
  if (gender) params.append('gender', gender);
  if (minAge) params.append('minAge', minAge);
  if (maxAge) params.append('maxAge', maxAge);

  try {
    const response = await fetch(`${API_URL}/voters/search/advanced?${params}`);
    const result = await response.json();

    if (result.success) {
      isAdvancedSearch = true;
      renderVoters(result.data);
      document.getElementById('pageInfo').textContent = `Found ${result.count} voters`;
      document.getElementById('prevBtn').disabled = true;
      document.getElementById('nextBtn').disabled = true;
    }
  } catch (error) {
    console.error('Error in advanced search:', error);
    tableBody.innerHTML = '<tr><td colspan="11" class="empty-state">Search error</td></tr>';
  }
}

// Clear Advanced Search
function clearAdvancedSearch() {
  document.getElementById('advName').value = '';
  document.getElementById('advGuardian').value = '';
  document.getElementById('advHouseName').value = '';
  document.getElementById('advHouseNumber').value = '';
  document.getElementById('advEpicNo').value = '';
  document.getElementById('advGender').value = '';
  document.getElementById('advMinAge').value = '';
  document.getElementById('advMaxAge').value = '';

  // Reset main search
  document.getElementById('searchInput').value = '';
  document.getElementById('genderFilter').value = '';
  document.getElementById('wardFilter').value = '';
  document.getElementById('boothFilter').value = '';

  currentPage = 1;
  isAdvancedSearch = false;
  loadVoters();
}
