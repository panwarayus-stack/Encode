const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { token } = req.body;

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        if (!JWT_SECRET) {
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        res.status(200).json({ 
            valid: true, 
            user: decoded 
        });

    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
