const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database(path.join(__dirname, 'data.db'));

db.serialize(() => {
	db.run(
		`CREATE TABLE IF NOT EXISTS registrations (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			first_name TEXT NOT NULL,
			last_name TEXT NOT NULL,
			email TEXT NOT NULL UNIQUE,
			phone TEXT,
			description TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`
	);
});

function isValidEmail(email) {
	const emailRegex = /^[\w.!#$%&'*+/=?^`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;
	return emailRegex.test(String(email).toLowerCase());
}

function isValidPhone(phone) {
	if (!phone) return true; 
	const digits = phone.replace(/\D/g, '');
	return digits.length >= 7 && digits.length <= 15;
}

app.post('/api/register', (req, res) => {
	const { firstName, lastName, email, phone, description } = req.body;

	if (!firstName || !lastName || !email) {
		return res.status(400).json({ error: 'firstName, lastName and email are required.' });
	}
	if (!isValidEmail(email)) {
		return res.status(400).json({ error: 'Invalid email format.' });
	}
	if (!isValidPhone(phone)) {
		return res.status(400).json({ error: 'Invalid phone number.' });
	}

	const insertSql = `INSERT INTO registrations (first_name, last_name, email, phone, description) VALUES (?, ?, ?, ?, ?)`;
	const params = [firstName.trim(), lastName.trim(), email.trim().toLowerCase(), phone ? phone.trim() : null, description ? description.trim() : null];

	db.run(insertSql, params, function (err) {
		if (err) {
			if (err && err.message && err.message.includes('UNIQUE')) {
				return res.status(409).json({ error: 'Email already registered.' });
			}
			return res.status(500).json({ error: 'Database error.' });
		}
		return res.status(201).json({ id: this.lastID });
	});
});

app.get('/api/registrations', (req, res) => {
	db.all('SELECT id, first_name, last_name, email, phone, description, created_at FROM registrations ORDER BY created_at DESC', [], (err, rows) => {
		if (err) return res.status(500).json({ error: 'Database error.' });
		res.json(rows);
	});
});

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});


