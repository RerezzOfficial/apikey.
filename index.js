const express = require('express');
const axios = require('axios');
const fs = require('fs');
const app = express();
const port = 3000;

// File untuk menyimpan API key yang terdaftar
const apiKeysFile = './apikeys.json';

// Fungsi untuk membaca data dari file JSON
function readApiKeys() {
    if (!fs.existsSync(apiKeysFile)) {
        fs.writeFileSync(apiKeysFile, JSON.stringify([]));
    }
    const data = fs.readFileSync(apiKeysFile, 'utf8');
    return JSON.parse(data);
}

// Middleware untuk validasi API key
function validateApiKey(req, res, next) {
    const { apikey } = req.query;  // Mengambil apikey dari query parameter

    console.log(`Request received with API Key: ${apikey}`);

    if (!apikey) {
        return res.status(400).json({
            status: false,
            creator: "IM Rerezz",
            error: "Parameter 'apikey' wajib disertakan dalam query URL."
        });
    }

    const validApiKeys = readApiKeys();

    // Mencari apakah ada entri yang cocok dengan apiKey
    const validEntry = validApiKeys.find(entry => entry.apikey === apikey);
    if (!validEntry) {
        return res.status(403).json({
            status: false,
            creator: "IM Rerezz",
            error: "API Key tidak valid atau tidak terdaftar."
        });
    }

    next();
}

// Endpoint untuk API yang memerlukan validasi API key
app.get('/api/akiyama', validateApiKey, async (req, res) => {
  try {
    const fileUrl = 'https://raw.githubusercontent.com/RerezzOfficial/My.apis/main/media/akiyama.json';
    console.log(`Fetching data from ${fileUrl}`);

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
    res.status(500).json({ error: 'Gagal memproses file cosplay.json', details: error.message });
  }
});

// Menjalankan server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
