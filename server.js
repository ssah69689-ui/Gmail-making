const express = require('express');
const app = express();
const path = require('path');

app.use(express.json());
app.use(express.static('public'));

// Secure Memory Database Arrays
let users = [];
let admins = [{ username: "OWNERSHUBHAM11", password: "8734812286", role: "Owner" }];
let ownerLogs = [];
let standardTickets = [];
let highTickets = []; 
let giftCodes = []; 

// Payment Counters for Admin Dashboard
let stats = {
    totalPaymentsToday: 0,
    approvedPaymentsToday: 0
};

let standardHistory = { winner: null, status: "24 Hours Ticket Counter Active" };
let highWinnerList = []; 

// Admin Authenticator Check
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    const admin = admins.find(a => a.username === username && a.password === password);
    if (admin) return res.json({ success: true, role: admin.role });
    res.status(401).json({ success: false, message: "Security Check Failed!" });
});

// Submit UTR Deposit Verification Request (User Side)
app.post('/api/user/submit-utr', (req, res) => {
    const { username, amount, utr } = req.body;
    stats.totalPaymentsToday += 1; // Increment total payments counter
    ownerLogs.unshift({
        action: "DEPOSIT_REQUEST",
        details: `User '@${username}' submitted UTR: ${utr} for ₹${amount}. Verification pending.`,
        time: new Date().toLocaleTimeString()
    });
    res.json({ success: true, message: "UTR successfully submitted to admin queue!" });
});

// Create Gift Code Generator (Admin)
app.post('/api/admin/create-gift', (req, res) => {
    const { codeName, amount } = req.body;
    giftCodes.push({ code: codeName.toUpperCase(), amount: parseFloat(amount), usedBy: [] });
    res.json({ success: true, message: `Gift Code ${codeName} of ₹${amount} deployed!` });
});

// Redeem Gift Code (User)
app.post('/api/user/redeem-gift', (req, res) => {
    const { username, code } = req.body;
    let targetCode = giftCodes.find(g => g.code === code.toUpperCase());
    if(!targetCode) return res.json({ success: false, message: "Invalid Gift Code!" });
    if(targetCode.usedBy.includes(username)) return res.json({ success: false, message: "Code Already Redeemed!" });
    
    let user = users.find(u => u.username === username);
    if (!user) { user = { username, balance: 0, telegram: "@"+username, isPremium: false }; users.push(user); }
    
    user.balance += targetCode.amount;
    targetCode.usedBy.push(username);
    res.json({ success: true, message: `Success! ₹${targetCode.amount} credited to wallet.` });
});

// Buy Lottery API
app.post('/api/lottery/buy', (req, res) => {
    const { username, count, tier } = req.body;
    let user = users.find(u => u.username === username);
    if (!user) { user = { username, balance: 0, telegram: "@"+username, isPremium: false }; users.push(user); }
    
    let ticketPrice = tier === 'high' ? 100 : 31;
    let totalCost = ticketPrice * parseInt(count);
    
    if (user.balance < totalCost) return res.json({ success: false, message: "Recharge your account wallet code!" });
    
    user.balance -= totalCost;
    for(let i=0; i<count; i++) {
        let tktObj = { username, ticketId: "TK-" + Math.floor(1000 + Math.random() * 9000) };
        if (tier === 'high') highTickets.push(tktObj);
        else standardTickets.push(tktObj);
    }
    res.json({ success: true, message: `${count} ticket(s) added successfully to pool.` });
});

// Manual High Tier Winner Rigging API (Owner Power)
app.post('/api/admin/set-high-winner', (req, res) => {
    const { winnerUsername } = req.body;
    highWinnerList.unshift({ username: winnerUsername, prize: "20 Premium Gmail Accounts", time: new Date().toLocaleTimeString() });
    
    ownerLogs.unshift({ action: "HIGH_LOTTERY_MANUAL", details: `Owner manually chose @${winnerUsername} as 20 Gmail Winner!`, time: new Date().toLocaleTimeString() });
    highTickets = []; 
    res.json({ success: true, message: `@${winnerUsername} proclaimed as official high lottery winner!` });
});

// Balance Update API (With Approved Payments Tracking)
app.post('/api/admin/update-balance', (req, res) => {
    const { username, amount, action, adminName } = req.body;
    let user = users.find(u => u.username === username);
    if (!user) { user = { username, balance: 0, telegram: "@" + username, isPremium: false }; users.push(user); }
    
    if (action === 'credit') {
        user.balance += parseFloat(amount);
        stats.approvedPaymentsToday += 1; // Increment approved payments counter
    }
    if (action === 'debit') {
        user.balance = Math.max(0, user.balance - parseFloat(amount));
    }
    
    ownerLogs.unshift({ action: action.toUpperCase(), details: `Admin '${adminName}' ${action}ed ₹${amount} for user '${username}'`, time: new Date().toLocaleTimeString() });
    res.json({ success: true });
});

// Automatic Standard Draw (Checks every night 10:00 PM)
setInterval(() => {
    let now = new Date();
    let istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    if (istTime.getHours() === 22 && istTime.getMinutes() === 0) {
        if (standardTickets.length >= 5) {
            let winIdx = Math.floor(Math.random() * standardTickets.length);
            let winTkt = standardTickets[winIdx];
            standardHistory = { winner: winTkt.username, status: `🎉 Winner: @${winTkt.username} won 10 Gmails!` };
        } else {
            standardTickets.forEach(t => { let u = users.find(usr => usr.username === t.username); if(u) u.balance += 31; });
            standardHistory = { winner: "REFUNDED", status: "Low entries (<5). Standard draw funds returned to wallets." };
        }
        standardTickets = [];
        // Reset daily metrics at midnight/draw check if required, else keeps rolling
    }
}, 60000);

// Global Information Stream APIs
app.get('/api/admin/stats', (req, res) => res.json(stats));
app.get('/api/lottery/status', (req, res) => res.json({ standard: standardHistory, highWinners: highWinnerList, stdCount: standardTickets.length, highCount: highTickets.length, highPool: highTickets }));
app.get('/api/users', (req, res) => res.json(users));
app.get('/api/owner/notifications', (req, res) => res.json(ownerLogs));

app.listen(3000, () => console.log('Zunoo SMM Pro Server Dynamic Engine active'));

