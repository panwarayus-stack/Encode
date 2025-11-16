const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

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
        const { username, email, password, inviteCode } = req.body;

        // Validation
        if (!username || !email || !password || !inviteCode) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        if (inviteCode !== 'OSINT2024') {
            return res.status(400).json({ error: 'Invalid invite code' });
        }

        if (!MONGODB_URI) {
            return res.status(500).json({ error: 'Database configuration error' });
        }

        const client = await MongoClient.connect(MONGODB_URI);
        const db = client.db('osint_tool');
        
        // Check if user already exists
        const existingUser = await db.collection('users').findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            await client.close();
            return res.status(400).json({ 
                error: existingUser.email === email ? 'Email already registered' : 'Username already taken'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = {
            username,
            email,
            password: hashedPassword,
            role: 'user',
            isActive: true,
            createdAt: new Date(),
            lastLogin: null,
            loginCount: 0
        };

        const result = await db.collection('users').insertOne(user);
        await client.close();

        res.status(201).json({ 
            success: true, 
            message: 'Registration successful! Redirecting to login...',
            userId: result.insertedId 
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
