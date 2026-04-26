const axios = require('axios');
const fs = require('fs');
const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });
let log = "";
function L(str) { console.log(str); log += str + "\n"; }

async function test() {
    try {
        const uid = Math.random().toString(36).substring(7);
        const email = `owner_${uid}@test.com`;

        L(`[1] Registering ${email} as Owner...`);
        let res = await axios.post('https://localhost:7249/api/Auth/register', {
            name: "Test Owner",
            email: email,
            password: "password123",
            role: "Owner"
        }, { httpsAgent: agent });
        L("Register OK");

        L("\n[2] Logging in...");
        res = await axios.post('https://localhost:7249/api/Auth/login', {
            email: email,
            password: "password123"
        }, { httpsAgent: agent });

        const token = res.data.token;
        L(`Token: ${token.substring(0, 40)}...`);

        // decode token
        const p = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        L(`Token Payload: ${JSON.stringify(p)}`);

        L("\n[3] Testing Admin/users endpoint...");
        try {
            res = await axios.get('https://localhost:7249/api/Admin/users', {
                headers: { Authorization: `Bearer ${token}` },
                httpsAgent: agent
            });
            L(`SUCCESS! Got users length: ${res.data.length}`);
        } catch (e) {
            L(`ERROR on GET /Admin/users: ${e.response ? e.response.status : e.message} ${e.response ? JSON.stringify(e.response.data) : ''}`);
        }

        L("\n[4] Testing Admin/properties endpoint...");
        try {
            res = await axios.get('https://localhost:7249/api/Admin/properties', {
                headers: { Authorization: `Bearer ${token}` },
                httpsAgent: agent
            });
            L(`SUCCESS! Got props length: ${res.data.length}`);
        } catch (e) {
            L(`ERROR on GET /Admin/properties: ${e.response ? e.response.status : e.message}`);
        }
    } catch (e) {
        L(`FATAL ERROR: ${e.response ? JSON.stringify(e.response.data) : e.message}`);
    }
    fs.writeFileSync('output_test.txt', log);
}
test();
