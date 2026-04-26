const axios = require('axios');
const https = require('https');

const agent = new https.Agent({
    rejectUnauthorized: false
});

async function test() {
    try {
        const uid = Math.random().toString(36).substring(7);
        const email = `owner_${uid}@test.com`;

        console.log(`[1] Registering ${email} as Owner...`);
        let res = await axios.post('https://localhost:7249/api/Auth/register', {
            name: "Test Owner",
            email: email,
            password: "password123",
            role: "Owner"
        }, { httpsAgent: agent });
        console.log("Register response:", res.data);

        console.log("\n[2] Logging in...");
        res = await axios.post('https://localhost:7249/api/Auth/login', {
            email: email,
            password: "password123"
        }, { httpsAgent: agent });

        const token = res.data.token;
        console.log("Login token received!");

        console.log("\n[3] Testing Admin/properties endpoint...");
        try {
            res = await axios.get('https://localhost:7249/api/Admin/properties', {
                headers: { Authorization: `Bearer ${token}` },
                httpsAgent: agent
            });
            console.log("SUCCESS! Got properties:", res.data.length);
        } catch (e) {
            console.log("ERROR on GET /Admin/properties:", e.response ? e.response.status : e.message);
        }

        console.log("\n[4] Testing Admin/users endpoint...");
        try {
            res = await axios.get('https://localhost:7249/api/Admin/users', {
                headers: { Authorization: `Bearer ${token}` },
                httpsAgent: agent
            });
            console.log("SUCCESS! Got users length:", res.data.length);
        } catch (e) {
            console.log("ERROR on GET /Admin/users:", e.response ? e.response.status : e.message);
        }

    } catch (e) {
        console.error("FATAL ERROR:", e.response ? e.response.data : e.message);
    }
}
test();
