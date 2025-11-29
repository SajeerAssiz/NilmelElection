const db = require('./database');

// Add sample wards
const wards = [
  { ward_no: 1, ward_name: 'Nilamel North', ward_name_malayalam: 'നിലമേൽ നോർത്ത്' },
  { ward_no: 2, ward_name: 'Nilamel South', ward_name_malayalam: 'നിലമേൽ സൗത്ത്' },
  { ward_no: 3, ward_name: 'Nilamel East', ward_name_malayalam: 'നിലമേൽ ഈസ്റ്റ്' },
  { ward_no: 4, ward_name: 'Nilamel West', ward_name_malayalam: 'നിലമേൽ വെസ്റ്റ്' },
  { ward_no: 5, ward_name: 'Nilamel Central', ward_name_malayalam: 'നിലമേൽ സെൻട്രൽ' },
];

const wardStmt = db.prepare('INSERT OR IGNORE INTO wards (ward_no, ward_name, ward_name_malayalam) VALUES (?, ?, ?)');
wards.forEach(w => wardStmt.run(w.ward_no, w.ward_name, w.ward_name_malayalam));
console.log('Wards added!');

// Add sample booths
const booths = [
  { booth_no: 1, booth_name: 'Government School', ward_no: 1, polling_station: 'Govt. LP School Nilamel' },
  { booth_no: 2, booth_name: 'Community Hall', ward_no: 1, polling_station: 'Community Hall Nilamel' },
  { booth_no: 3, booth_name: 'Panchayat Office', ward_no: 2, polling_station: 'Panchayat Office Building' },
  { booth_no: 4, booth_name: 'High School', ward_no: 2, polling_station: 'Govt. High School Nilamel' },
  { booth_no: 5, booth_name: 'Library Hall', ward_no: 3, polling_station: 'Public Library Nilamel' },
  { booth_no: 6, booth_name: 'Temple Hall', ward_no: 3, polling_station: 'Temple Community Hall' },
  { booth_no: 7, booth_name: 'Church Hall', ward_no: 4, polling_station: 'Church Parish Hall' },
  { booth_no: 8, booth_name: 'Club Building', ward_no: 4, polling_station: 'Youth Club Building' },
  { booth_no: 9, booth_name: 'Anganwadi', ward_no: 5, polling_station: 'Anganwadi Center' },
  { booth_no: 10, booth_name: 'Co-operative Bank', ward_no: 5, polling_station: 'Co-operative Bank Hall' },
];

const boothStmt = db.prepare('INSERT OR IGNORE INTO booths (booth_no, booth_name, ward_no, polling_station) VALUES (?, ?, ?, ?)');
booths.forEach(b => boothStmt.run(b.booth_no, b.booth_name, b.ward_no, b.polling_station));
console.log('Booths added!');

// Sample voter data
const sampleVoters = [
  { sl_no: 1, voter_id: 'NLM001', name: 'Rajesh Kumar', name_malayalam: 'രാജേഷ് കുമാർ', guardian_name: 'Mohan Kumar', relationship: 'Father', house_name: 'Lakshmi Nivas', house_number: '12/A', age: 45, gender: 'Male', ward_no: 1, booth_no: 1, mobile: '9876543210' },
  { sl_no: 2, voter_id: 'NLM002', name: 'Priya Nair', name_malayalam: 'പ്രിയ നായർ', guardian_name: 'Suresh Nair', relationship: 'Husband', house_name: 'Sree Bhavan', house_number: '15', age: 38, gender: 'Female', ward_no: 1, booth_no: 1, mobile: '9876543211' },
  { sl_no: 3, voter_id: 'NLM003', name: 'Anil Pillai', name_malayalam: 'അനിൽ പിള്ള', guardian_name: 'Gopalan Pillai', relationship: 'Father', house_name: 'Ambadi', house_number: '23', age: 52, gender: 'Male', ward_no: 1, booth_no: 2, mobile: '9876543212' },
  { sl_no: 4, voter_id: 'NLM004', name: 'Lakshmi Devi', name_malayalam: 'ലക്ഷ്മി ദേവി', guardian_name: 'Krishnan', relationship: 'Husband', house_name: 'Krishna Vilasom', house_number: '7', age: 48, gender: 'Female', ward_no: 1, booth_no: 2, mobile: '9876543213' },
  { sl_no: 5, voter_id: 'NLM005', name: 'Suresh Menon', name_malayalam: 'സുരേഷ് മേനോൻ', guardian_name: 'Ramachandran Menon', relationship: 'Father', house_name: 'Menon House', house_number: '45/B', age: 35, gender: 'Male', ward_no: 2, booth_no: 3, mobile: '9876543214' },
  { sl_no: 6, voter_id: 'NLM006', name: 'Geetha Kumari', name_malayalam: 'ഗീത കുമാരി', guardian_name: 'Rajan', relationship: 'Father', house_name: 'Puthenveedu', house_number: '18', age: 28, gender: 'Female', ward_no: 2, booth_no: 3, mobile: '9876543215' },
  { sl_no: 7, voter_id: 'NLM007', name: 'Vijayan Nair', name_malayalam: 'വിജയൻ നായർ', guardian_name: 'Narayanan Nair', relationship: 'Father', house_name: 'Nair Cottage', house_number: '33', age: 62, gender: 'Male', ward_no: 2, booth_no: 4, mobile: '9876543216' },
  { sl_no: 8, voter_id: 'NLM008', name: 'Saraswathi Amma', name_malayalam: 'സരസ്വതി അമ്മ', guardian_name: 'Vijayan Nair', relationship: 'Husband', house_name: 'Nair Cottage', house_number: '33', age: 58, gender: 'Female', ward_no: 2, booth_no: 4, mobile: '9876543217' },
  { sl_no: 9, voter_id: 'NLM009', name: 'Manoj Kumar', name_malayalam: 'മനോജ് കുമാർ', guardian_name: 'Ravi Kumar', relationship: 'Father', house_name: 'Chandana', house_number: '56', age: 32, gender: 'Male', ward_no: 3, booth_no: 5, mobile: '9876543218' },
  { sl_no: 10, voter_id: 'NLM010', name: 'Deepa Mohan', name_malayalam: 'ദീപ മോഹൻ', guardian_name: 'Manoj Kumar', relationship: 'Husband', house_name: 'Chandana', house_number: '56', age: 29, gender: 'Female', ward_no: 3, booth_no: 5, mobile: '9876543219' },
  { sl_no: 11, voter_id: 'NLM011', name: 'Sreekumar R', name_malayalam: 'ശ്രീകുമാർ ആർ', guardian_name: 'Raghavan', relationship: 'Father', house_name: 'Ragam', house_number: '78', age: 44, gender: 'Male', ward_no: 3, booth_no: 6, mobile: '9876543220' },
  { sl_no: 12, voter_id: 'NLM012', name: 'Bindu S', name_malayalam: 'ബിന്ദു എസ്', guardian_name: 'Sreekumar R', relationship: 'Husband', house_name: 'Ragam', house_number: '78', age: 40, gender: 'Female', ward_no: 3, booth_no: 6, mobile: '9876543221' },
  { sl_no: 13, voter_id: 'NLM013', name: 'Thomas Varghese', name_malayalam: 'തോമസ് വർഗീസ്', guardian_name: 'Varghese', relationship: 'Father', house_name: 'Bethel', house_number: '90', age: 55, gender: 'Male', ward_no: 4, booth_no: 7, mobile: '9876543222' },
  { sl_no: 14, voter_id: 'NLM014', name: 'Mary Thomas', name_malayalam: 'മേരി തോമസ്', guardian_name: 'Thomas Varghese', relationship: 'Husband', house_name: 'Bethel', house_number: '90', age: 50, gender: 'Female', ward_no: 4, booth_no: 7, mobile: '9876543223' },
  { sl_no: 15, voter_id: 'NLM015', name: 'Abdul Rahman', name_malayalam: 'അബ്ദുൽ റഹ്മാൻ', guardian_name: 'Mohammed', relationship: 'Father', house_name: 'Jasmine Villa', house_number: '102', age: 42, gender: 'Male', ward_no: 4, booth_no: 8, mobile: '9876543224' },
  { sl_no: 16, voter_id: 'NLM016', name: 'Fathima Beevi', name_malayalam: 'ഫാത്തിമ ബീവി', guardian_name: 'Abdul Rahman', relationship: 'Husband', house_name: 'Jasmine Villa', house_number: '102', age: 38, gender: 'Female', ward_no: 4, booth_no: 8, mobile: '9876543225' },
  { sl_no: 17, voter_id: 'NLM017', name: 'Gopalakrishnan', name_malayalam: 'ഗോപാലകൃഷ്ണൻ', guardian_name: 'Krishnan Nair', relationship: 'Father', house_name: 'Gopuram', house_number: '115', age: 60, gender: 'Male', ward_no: 5, booth_no: 9, mobile: '9876543226' },
  { sl_no: 18, voter_id: 'NLM018', name: 'Radha Gopalakrishnan', name_malayalam: 'രാധ ഗോപാലകൃഷ്ണൻ', guardian_name: 'Gopalakrishnan', relationship: 'Husband', house_name: 'Gopuram', house_number: '115', age: 55, gender: 'Female', ward_no: 5, booth_no: 9, mobile: '9876543227' },
  { sl_no: 19, voter_id: 'NLM019', name: 'Santhosh Kumar', name_malayalam: 'സന്തോഷ് കുമാർ', guardian_name: 'Balan', relationship: 'Father', house_name: 'Santhosh Bhavan', house_number: '128', age: 36, gender: 'Male', ward_no: 5, booth_no: 10, mobile: '9876543228' },
  { sl_no: 20, voter_id: 'NLM020', name: 'Anjali Santhosh', name_malayalam: 'അഞ്ജലി സന്തോഷ്', guardian_name: 'Santhosh Kumar', relationship: 'Husband', house_name: 'Santhosh Bhavan', house_number: '128', age: 32, gender: 'Female', ward_no: 5, booth_no: 10, mobile: '9876543229' },
];

const voterStmt = db.prepare(`
  INSERT OR IGNORE INTO voters (sl_no, voter_id, name, name_malayalam, guardian_name, relationship, house_name, house_number, age, gender, ward_no, booth_no, mobile)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

sampleVoters.forEach(v => {
  voterStmt.run(v.sl_no, v.voter_id, v.name, v.name_malayalam, v.guardian_name, v.relationship, v.house_name, v.house_number, v.age, v.gender, v.ward_no, v.booth_no, v.mobile);
});

console.log('Sample voters added!');
console.log('Database seeded successfully!');
