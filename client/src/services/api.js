import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dashboard & Analytics
export const getDashboardStats = () => api.get('/dashboard/stats');
export const getVotersByWard = () => api.get('/dashboard/voters-by-ward');
export const getVotersByParty = () => api.get('/dashboard/voters-by-party');
export const getVotersByReligion = () => api.get('/dashboard/voters-by-religion');
export const getVotersByCaste = () => api.get('/dashboard/voters-by-caste');
export const getVotingProgress = () => api.get('/dashboard/voting-progress');
export const getAgeDistribution = () => api.get('/dashboard/age-distribution');
export const getGenderDistribution = () => api.get('/dashboard/gender-distribution');

// Voters
export const getVoters = (params) => api.get('/voters', { params });
export const getVoter = (id) => api.get(`/voters/${id}`);
export const createVoter = (data) => api.post('/voters', data);
export const updateVoter = (id, data) => api.put(`/voters/${id}`, data);
export const deleteVoter = (id) => api.delete(`/voters/${id}`);
export const markVoted = (id, data) => api.post(`/voters/${id}/voted`, data);
export const searchVoters = (params) => api.get('/voters/search', { params });
export const importVoters = (data) => api.post('/voters/import', data);

// States
export const getStates = () => api.get('/states');
export const createState = (data) => api.post('/states', data);
export const updateState = (id, data) => api.put(`/states/${id}`, data);
export const deleteState = (id) => api.delete(`/states/${id}`);

// Districts
export const getDistricts = (stateId) => api.get('/districts', { params: { stateId } });
export const createDistrict = (data) => api.post('/districts', data);
export const updateDistrict = (id, data) => api.put(`/districts/${id}`, data);
export const deleteDistrict = (id) => api.delete(`/districts/${id}`);

// Local Bodies
export const getLocalBodies = (districtId) => api.get('/local-bodies', { params: { districtId } });
export const createLocalBody = (data) => api.post('/local-bodies', data);
export const updateLocalBody = (id, data) => api.put(`/local-bodies/${id}`, data);
export const deleteLocalBody = (id) => api.delete(`/local-bodies/${id}`);

// Wards
export const getWards = (localBodyId) => api.get('/wards', { params: { localBodyId } });
export const createWard = (data) => api.post('/wards', data);
export const updateWard = (id, data) => api.put(`/wards/${id}`, data);
export const deleteWard = (id) => api.delete(`/wards/${id}`);

// Polling Stations
export const getPollingStations = (wardId) => api.get('/polling-stations', { params: { wardId } });
export const createPollingStation = (data) => api.post('/polling-stations', data);
export const updatePollingStation = (id, data) => api.put(`/polling-stations/${id}`, data);
export const deletePollingStation = (id) => api.delete(`/polling-stations/${id}`);

// Political Parties
export const getParties = () => api.get('/parties');
export const createParty = (data) => api.post('/parties', data);
export const updateParty = (id, data) => api.put(`/parties/${id}`, data);
export const deleteParty = (id) => api.delete(`/parties/${id}`);

// Religions
export const getReligions = () => api.get('/religions');
export const createReligion = (data) => api.post('/religions', data);
export const updateReligion = (id, data) => api.put(`/religions/${id}`, data);
export const deleteReligion = (id) => api.delete(`/religions/${id}`);

// Castes
export const getCastes = (religionId) => api.get('/castes', { params: { religionId } });
export const createCaste = (data) => api.post('/castes', data);
export const updateCaste = (id, data) => api.put(`/castes/${id}`, data);
export const deleteCaste = (id) => api.delete(`/castes/${id}`);

// Occupations
export const getOccupations = () => api.get('/occupations');
export const createOccupation = (data) => api.post('/occupations', data);
export const updateOccupation = (id, data) => api.put(`/occupations/${id}`, data);
export const deleteOccupation = (id) => api.delete(`/occupations/${id}`);

// Education Levels
export const getEducationLevels = () => api.get('/education-levels');
export const createEducationLevel = (data) => api.post('/education-levels', data);
export const updateEducationLevel = (id, data) => api.put(`/education-levels/${id}`, data);
export const deleteEducationLevel = (id) => api.delete(`/education-levels/${id}`);

// Vote Probability Categories
export const getVoteProbabilities = () => api.get('/vote-probabilities');
export const createVoteProbability = (data) => api.post('/vote-probabilities', data);
export const updateVoteProbability = (id, data) => api.put(`/vote-probabilities/${id}`, data);
export const deleteVoteProbability = (id) => api.delete(`/vote-probabilities/${id}`);

// Elections
export const getElections = () => api.get('/elections');
export const createElection = (data) => api.post('/elections', data);
export const updateElection = (id, data) => api.put(`/elections/${id}`, data);
export const deleteElection = (id) => api.delete(`/elections/${id}`);

export default api;
