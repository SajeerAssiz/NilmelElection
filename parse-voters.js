const fs = require('fs');
const db = require('./database');

// Read the raw data file
const rawData = fs.readFileSync('./voters-raw.txt', 'utf-8');

// Clear existing data (order matters for foreign keys)
db.exec('DELETE FROM voters');
db.exec('DELETE FROM booths');
db.exec('DELETE FROM wards');

console.log('Cleared existing data...');

// Add ward
db.prepare('INSERT INTO wards (ward_no, ward_name, ward_name_malayalam) VALUES (?, ?, ?)').run(11, 'BANGLAMKUNNU', 'ബംഗ്ലംകുന്ന്');
console.log('Added ward...');

// Add booth
db.prepare('INSERT INTO booths (booth_no, booth_name, ward_no, polling_station) VALUES (?, ?, ?, ?)').run(1, 'L.M.U.P.S BANGLAMKUNNU', 11, 'L.M.U.P.S BANGLAMKUNNU, NORTH PORTION OF THE MAIN BUILDING');
console.log('Added booth...');

// Parse the data
const lines = rawData.trim().split('\n');
const insertStmt = db.prepare(`
  INSERT INTO voters (sl_no, voter_id, name, guardian_name, house_number, house_name, gender, age, ward_no, booth_no, epic_no, is_active)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
`);

let count = 0;
let skipped = 0;

const insertMany = db.transaction(() => {
  for (const line of lines) {
    // Skip empty lines
    if (!line.trim()) continue;

    // Parse tab-separated values
    const parts = line.split('\t');

    // Need at least 7 columns
    if (parts.length < 7) continue;

    const sl_no = parseInt(parts[0]);
    if (isNaN(sl_no)) continue;

    let name = parts[1].trim();

    // Skip deleted entries
    if (name.startsWith('DELETED')) {
      skipped++;
      continue;
    }

    const guardian_name = parts[2].trim();
    const house_number = parts[3].trim();
    const house_name = parts[4].trim();

    // Parse gender and age
    const genderAge = parts[5].split('/');
    if (genderAge.length < 2) continue;

    const genderCode = genderAge[0].trim();
    const gender = genderCode === 'M' ? 'Male' : genderCode === 'F' ? 'Female' : 'Other';
    const age = parseInt(genderAge[1].trim());

    const epic_no = parts[6].trim();

    try {
      insertStmt.run(sl_no, epic_no, name, guardian_name, house_number, house_name, gender, age, 11, 1, epic_no);
      count++;
    } catch (err) {
      console.log(`Error inserting voter ${sl_no}: ${err.message}`);
    }
  }
});

insertMany();

console.log(`\nImported ${count} voters`);
console.log(`Skipped ${skipped} deleted entries`);
console.log('Import completed!');
