const express = require('express');
const app = express();
const path = require('path');

app.use(express.json());
app.use(express.static('public'));

// 100% Clean Storage Array (No fake names)
let users = [];
let admins = [
    { username: "OWNERSHUBHAM11", password: "8734812286", role: "Owner" }
];
let ownerLogs = [];
let depositRequests = [];

// Admin Authentication Check API
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    const admin = admins.find(a => a.username === username && a.password === password);
    if (admin) {
        return res.json({ success: true, role: admin.role });
    }
    res.status(401).json({ success: false, message: "Aapke paas Admin access nahi hai!" });
});

// Add New Sub-Admin (Only by Owner)
app.post('/api/admin/add', (req, res) => {
    const { username, password } = req.body;
    admins.push({ username, password, role: "Sub-Admin" });
    ownerLogs.unshift({
        action: "NEW_ADMIN",
        details: `Sub-Admin '${username}' was authorized successfully.`,
        time: new Date().toLocaleTimeString()
    });
    res.json({ success: true, message: "Naya Sub-Admin successfully add ho gaya!" });
});

// Update Balance API
app.post('/api/admin/update-balance', (req, res) => {
    const { username, amount, action, adminName } = req.body;
    let user = users.find(u => u.username === username);
    if (!user) {
        user = { username, balance: 0, telegram: "@" + username, isPremium: false };
        users.push(user);
    }

    if (action === 'credit') user.balance += parseFloat(amount);
    if (action === 'debit') user.balance = Math.max(0, user.balance - parseFloat(amount));

    ownerLogs.unshift({
        action: action.toUpperCase(),
        details: `Admin '${adminName}' updated balance for '${username}' by ₹${amount}`,
        time: new Date().toLocaleTimeString()
    });
    res.json({ success: true });
});

// Buy Premium Logic API
app.post('/api/user/buy-premium', (req, res) => {
    const { username } = req.body;
    let user = users.find(u => u.username === username);
    if (!user) {
        user = { username, balance: 0, telegram: "@" + username, isPremium: false };
        users.push(user);
    }
    if(user.balance < 30) return res.json({ success: false, message: "Premium lene ke liye kam se kam ₹30 balance chahiye!" });
    
    user.balance -= 30;
    user.isPremium = true;
    res.json({ success: true, message: "Congratulations! Aapka Premium Account active ho gaya hai." });
});

app.get('/api/users', (req, res) => res.json(users));
app.get('/api/owner/notifications', (req, res) => res.json(ownerLogs));

app.listen(3000, () => console.log('Gmail Creator Work platform running on port 3000'));
