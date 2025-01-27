const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

// Fungsi untuk membaca API keys dari file JSON
function readApiKeys() {
  try {
    const data = fs.readFileSync('./apikeys.json', 'utf8'); // Baca file JSON
    return JSON.parse(data); // Mengembalikan data dalam format JSON
  } catch (err) {
    console.error('Error reading apikeys.json:', err);
    return []; // Jika gagal membaca, kembalikan array kosong
  }
}

// Middleware untuk validasi API Key
function validateApiKey(req, res, next) {
  const { apikey } = req.query; // Ambil apikey dari query parameter

  if (!apikey) {
    return res.status(400).json({ status: false, error: 'API key is required in the query parameter.' });
  }

  const apiKeys = readApiKeys();  // Baca API keys dari file

  // Periksa apakah API key ada dalam daftar API keys yang valid
  const validKey = apiKeys.find(key => key.apikey === apikey);
  
  if (!validKey) {
    return res.status(403).json({ status: false, error: 'Invalid or unregistered API key.' });
  }

  // Jika valid, lanjutkan ke endpoint
  next();
}

// Endpoint untuk API yang memerlukan validasi API Key
app.get('/api/akiyama', validateApiKey, (req, res) => {
  const { apikey } = req.query; // Ambil apikey dari query parameter

  // Tampilkan pesan jika API key diterima
  res.json({
    status: true,
    message: `API key '${apikey}' diterima!`,
    description: 'Akses ke API berhasil.'
  });
});

// Menjalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
