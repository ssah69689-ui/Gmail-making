const express = require('express');
const app = express();
const path = require('path');

app.use(express.json());
app.use(express.static('public'));

// Mock Database (Shuruat ke liye Free memory storage)
let users = [
    { id: 1, username: "rahul_dev", balance: 100, telegram: "@rahul" },
    { id: 2, username: "amit_sharma", balance: 50, telegram: "@amit" }
];

let admins = [
    { id: 1, username: "shubham_owner", role: "Owner" }
];

let ownerLogs = []; // Aapke liye saari notifications yahan save hongi
let supportTickets = [];

// 1. Add New Admin API
app.post('/api/admin/add', (req, { username }) => {
    const newAdmin = { id: admins.length + 1, username, role: "Sub-Admin" };
    admins.push(newAdmin);
    
    // Notification for Owner
    ownerLogs.unshift({
        action: "NEW_ADMIN_ADDED",
        details: `New admin '${username}' was added by Owner.`,
        time: new Date().toLocaleTimeString()
    });
    
    return res.json({ success: true, message: "Admin added successfully!" });
});

// 2. Add / Debit Balance API with Notification tracking
app.post('/api/admin/update-balance', (req, { userId, amount, action, adminName }) => {
    let user = users.find(u => u.id === parseInt(userId));
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (action === 'credit') {
        user.balance += parseFloat(amount);
    } else if (action === 'debit') {
        user.balance = Math.max(0, user.balance - parseFloat(amount));
    }

    // Aapke liye system automatic notification info generate karega
    ownerLogs.unshift({
        action: action.toUpperCase(),
        admin: adminName,
        details: `Admin '${adminName}' ${action === 'credit' ? 'added' : 'debited'} ₹${amount} for user '${user.username}'`,
        time: new Date().toLocaleTimeString()
    });

    res.json({ success: true, newBalance: user.balance });
});

// 3. Get Owner Logs/Notifications
app.get('/api/owner/notifications', (req, res) => {
    res.json(ownerLogs);
});

// APIs for fetching lists
app.get('/api/users', (req, res) => res.json(users));

// Dashboard route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(3000, () => console.log('Gmail Creator Work platform running on port 3000'));

