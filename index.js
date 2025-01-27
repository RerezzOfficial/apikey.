const express = require('express');
const axios = require('axios');
const fs = require('fs');
const app = express();
const port = 3000;

// File untuk menyimpan API key dan IP yang terdaftar
const apiKeysFile = './apikeys.json';

// Fungsi untuk membaca data dari file JSON
function readApiKeys() {
    if (!fs.existsSync(apiKeysFile)) {
        fs.writeFileSync(apiKeysFile, JSON.stringify([]));
    }
    const data = fs.readFileSync(apiKeysFile, 'utf8');
    return JSON.parse(data);
}

// Middleware untuk validasi API key dan IP menggunakan query parameter
function validateApiKey(req, res, next) {
    const { apikey } = req.query;  // Mengambil apikey dari query parameter
    const ipAddress = req.ip;

    if (!apikey) {
        return res.status(400).json({
            status: false,
            creator: "IM Rerezz",
            error: "Parameter 'apikey' wajib disertakan dalam query URL."
        });
    }

    const validApiKeys = readApiKeys();

    // Mencari apakah ada entri yang cocok dengan apiKey dan ip
    const validEntry = validApiKeys.find(entry => entry.apikey === apikey && entry.ip === ipAddress);
    if (!validEntry) {
        if (!validApiKeys.find(entry => entry.apikey === apikey)) {
            return res.status(403).json({
                status: false,
                creator: "IM Rerezz",
                error: "API Key tidak valid atau tidak terdaftar."
            });
        } else {
            return res.status(403).json({
                status: false,
                creator: "IM Rerezz",
                error: "IP tidak terdaftar untuk API Key ini."
            });
        }
    }

    next();
}

// Endpoint untuk API yang memerlukan validasi API key dan IP
app.get('/api/akiyama', validateApiKey, async (req, res) => {
  try {
    const fileUrl = 'https://raw.githubusercontent.com/RerezzOfficial/My.apis/main/media/akiyama.json';
    const response = await axios.get(fileUrl);
    const cosplayData = response.data;
    if (!cosplayData.results || cosplayData.results.length === 0) {
      return res.status(400).json({ error: 'Tidak ada gambar dalam cosplay.json.' });
    }
    const randomIndex = Math.floor(Math.random() * cosplayData.results.length);
    const randomCosplay = cosplayData.results[randomIndex];
    const imageUrl = randomCosplay.url;
    const imageResponse = await axios({
      method: 'get',
      url: imageUrl,
      responseType: 'stream'
    });
    imageResponse.data.pipe(res);  
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Gagal memproses file cosplay.json' });
  }
});

// Menjalankan server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
