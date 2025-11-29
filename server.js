const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ============ VOTERS API ============

// Get all voters with pagination and search
app.get('/api/voters', (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', ward = '', booth = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM voters WHERE is_active = 1';
    let countQuery = 'SELECT COUNT(*) as total FROM voters WHERE is_active = 1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR voter_id LIKE ? OR house_name LIKE ? OR mobile LIKE ?)';
      countQuery += ' AND (name LIKE ? OR voter_id LIKE ? OR house_name LIKE ? OR mobile LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }

    if (ward) {
      query += ' AND ward_no = ?';
      countQuery += ' AND ward_no = ?';
      params.push(ward);
    }

    if (booth) {
      query += ' AND booth_no = ?';
      countQuery += ' AND booth_no = ?';
      params.push(booth);
    }

    query += ' ORDER BY sl_no ASC, id ASC LIMIT ? OFFSET ?';

    const total = db.prepare(countQuery).get(...params).total;
    const voters = db.prepare(query).all(...params, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: voters,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single voter
app.get('/api/voters/:id', (req, res) => {
  try {
    const voter = db.prepare('SELECT * FROM voters WHERE id = ?').get(req.params.id);
    if (!voter) {
      return res.status(404).json({ success: false, error: 'Voter not found' });
    }
    res.json({ success: true, data: voter });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create voter
app.post('/api/voters', (req, res) => {
  try {
    const {
      sl_no, voter_id, name, name_malayalam, guardian_name, guardian_name_malayalam,
      relationship, house_name, house_name_malayalam, house_number, age, gender,
      ward_no, booth_no, booth_name, polling_station, epic_no, mobile, email, remarks
    } = req.body;

    const stmt = db.prepare(`
      INSERT INTO voters (
        sl_no, voter_id, name, name_malayalam, guardian_name, guardian_name_malayalam,
        relationship, house_name, house_name_malayalam, house_number, age, gender,
        ward_no, booth_no, booth_name, polling_station, epic_no, mobile, email, remarks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      sl_no, voter_id, name, name_malayalam, guardian_name, guardian_name_malayalam,
      relationship, house_name, house_name_malayalam, house_number, age, gender,
      ward_no, booth_no, booth_name, polling_station, epic_no, mobile, email, remarks
    );

    res.json({ success: true, data: { id: result.lastInsertRowid } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update voter
app.put('/api/voters/:id', (req, res) => {
  try {
    const {
      sl_no, voter_id, name, name_malayalam, guardian_name, guardian_name_malayalam,
      relationship, house_name, house_name_malayalam, house_number, age, gender,
      ward_no, booth_no, booth_name, polling_station, epic_no, mobile, email, remarks
    } = req.body;

    const stmt = db.prepare(`
      UPDATE voters SET
        sl_no = ?, voter_id = ?, name = ?, name_malayalam = ?, guardian_name = ?,
        guardian_name_malayalam = ?, relationship = ?, house_name = ?, house_name_malayalam = ?,
        house_number = ?, age = ?, gender = ?, ward_no = ?, booth_no = ?, booth_name = ?,
        polling_station = ?, epic_no = ?, mobile = ?, email = ?, remarks = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      sl_no, voter_id, name, name_malayalam, guardian_name, guardian_name_malayalam,
      relationship, house_name, house_name_malayalam, house_number, age, gender,
      ward_no, booth_no, booth_name, polling_station, epic_no, mobile, email, remarks,
      req.params.id
    );

    res.json({ success: true, message: 'Voter updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete voter (soft delete)
app.delete('/api/voters/:id', (req, res) => {
  try {
    db.prepare('UPDATE voters SET is_active = 0 WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Voter deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ WARDS API ============

// Get all wards
app.get('/api/wards', (req, res) => {
  try {
    const wards = db.prepare('SELECT * FROM wards ORDER BY ward_no').all();
    res.json({ success: true, data: wards });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create ward
app.post('/api/wards', (req, res) => {
  try {
    const { ward_no, ward_name, ward_name_malayalam } = req.body;
    const stmt = db.prepare('INSERT INTO wards (ward_no, ward_name, ward_name_malayalam) VALUES (?, ?, ?)');
    const result = stmt.run(ward_no, ward_name, ward_name_malayalam);
    res.json({ success: true, data: { id: result.lastInsertRowid } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ BOOTHS API ============

// Get all booths
app.get('/api/booths', (req, res) => {
  try {
    const { ward } = req.query;
    let query = 'SELECT * FROM booths';
    const params = [];

    if (ward) {
      query += ' WHERE ward_no = ?';
      params.push(ward);
    }

    query += ' ORDER BY booth_no';
    const booths = db.prepare(query).all(...params);
    res.json({ success: true, data: booths });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create booth
app.post('/api/booths', (req, res) => {
  try {
    const { booth_no, booth_name, booth_name_malayalam, ward_no, polling_station, address } = req.body;
    const stmt = db.prepare(`
      INSERT INTO booths (booth_no, booth_name, booth_name_malayalam, ward_no, polling_station, address)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(booth_no, booth_name, booth_name_malayalam, ward_no, polling_station, address);
    res.json({ success: true, data: { id: result.lastInsertRowid } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ STATISTICS API ============

app.get('/api/stats', (req, res) => {
  try {
    const totalVoters = db.prepare('SELECT COUNT(*) as count FROM voters WHERE is_active = 1').get().count;
    const maleVoters = db.prepare("SELECT COUNT(*) as count FROM voters WHERE is_active = 1 AND gender = 'Male'").get().count;
    const femaleVoters = db.prepare("SELECT COUNT(*) as count FROM voters WHERE is_active = 1 AND gender = 'Female'").get().count;
    const otherVoters = db.prepare("SELECT COUNT(*) as count FROM voters WHERE is_active = 1 AND gender NOT IN ('Male', 'Female')").get().count;
    const totalWards = db.prepare('SELECT COUNT(*) as count FROM wards').get().count;
    const totalBooths = db.prepare('SELECT COUNT(*) as count FROM booths').get().count;

    const wardWiseCount = db.prepare(`
      SELECT ward_no, COUNT(*) as count
      FROM voters
      WHERE is_active = 1
      GROUP BY ward_no
      ORDER BY ward_no
    `).all();

    res.json({
      success: true,
      data: {
        totalVoters,
        maleVoters,
        femaleVoters,
        otherVoters,
        totalWards,
        totalBooths,
        wardWiseCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
