const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.json());

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

// Fungsi untuk menulis data ke file JSON
function writeApiKeys(data) {
    fs.writeFileSync(apiKeysFile, JSON.stringify(data, null, 2));
}

// Middleware untuk validasi API key dan IP
function validateApiKey(req, res, next) {
    const apiKey = req.headers['apikey'];
    const ipAddress = req.ip;

    const validApiKeys = readApiKeys();

    const validEntry = validApiKeys.find(entry => entry.apikey === apiKey && entry.ip === ipAddress);
    if (!validEntry) {
        return res.status(403).send('API Key atau IP tidak valid.');
    }

    next();
}

// Endpoint untuk API yang memerlukan validasi
app.get('/data', validateApiKey, (req, res) => {
    res.json({
        message: 'Data berhasil diakses!',
        data: [1, 2, 3, 4, 5],
    });
});

// Endpoint untuk meng-generate API Key baru secara manual
app.post('/generate-apikey', (req, res) => {
    const { ip } = req.body;
    if (!ip) {
        return res.status(400).send('IP harus disertakan.');
    }

    const newApiKey = crypto.randomBytes(16).toString('hex');

    const validApiKeys = readApiKeys();
    validApiKeys.push({ apikey: newApiKey, ip: ip });

    writeApiKeys(validApiKeys);

    res.json({
        message: 'API Key baru berhasil dibuat!',
        apiKey: newApiKey,
    });
});

// Menjalankan server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
