const express = require('express');
const app = express();
const path = require('path');

app.use(express.json());
app.use(express.static('public'));

// 🔒 Hardened Secure Memory Database
let users = [];
let admins = [{ username: "OWNERSHUBHAM11", password: "8734812286", role: "Owner" }];
let ownerLogs = [];
let standardTickets = [];
let highTickets = []; 
let giftCodes = []; 
let supportTickets = []; // Categorized ticketing system database

// Live Analytics Telemetry Stats Grid
let stats = {
    totalPaymentsToday: 0,
    approvedPaymentsToday: 0,
    totalInvestedFund: 0,
    todayOrdersCounter: 0
};

let standardHistory = { winner: null, status: "Subah 12:01 se Ticket Counter chalu hai!" };
let highWinnerList = []; 

// 👑 Admin Core Authenticator Gate Login
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    const admin = admins.find(a => a.username === username && a.password === password);
    if (admin) return res.json({ success: true, role: admin.role });
    res.status(401).json({ success: false, message: "Security Barrier: Invalid Admin Keys!" });
});

// 👤 User Premium Registration (Mobile Number Login Validation Core)
app.post('/api/user/register', (req, res) => {
    const { name, username, password } = req.body;
    let existing = users.find(u => u.username === username);
    if (existing) return res.json({ success: false, message: "Galti: Yeh mobile number pehle se register hai!" });
    
    users.push({ 
        name, 
        username, // Target Mobile Number acts as unique Login ID
        password, 
        balance: 0, 
        isPremium: false,
        registeredAt: new Date().toLocaleDateString()
    });
    res.json({ success: true, message: "Registration successful! Ab login box mein jao." });
});

// 👤 User Secure Authorization Login (ShreeWin Mobile Matching Core)
app.post('/api/user/login', (req, res) => {
    const { username, password } = req.body;
    let user = users.find(u => u.username === username && u.password === password);
    if (user) return res.json({ success: true, username: user.username, name: user.name });
    res.json({ success: false, message: "Mobile Number ya Password galat hai! Dubara check karein." });
});

// 📥 UTR Secure Cash Deposit Queue Handler (With 50 Rupees Minimum Restriction)
app.post('/api/user/submit-utr', (req, res) => {
    const { username, amount, utr } = req.body;
    
    // 🚨 WALLET SAFETY LIMIT FILTER: Minimum ₹50 wallet deposit lock
    let depositAmount = parseFloat(amount);
    if (depositAmount < 50) {
        return res.json({ success: false, message: "Galti: Website mein minimum deposit limit ₹50 hai!" });
    }

    stats.totalPaymentsToday += 1;
    ownerLogs.unshift({
        action: "DEPOSIT_REQUEST",
        details: `User '${username}' submitted UTR: ${utr} for ₹${amount}. Checking pending.`,
        time: new Date().toLocaleTimeString()
    });
    res.json({ success: true, message: "UTR Grid Transmitted! Sub-Admins verify kar rahe hain." });
});
// 👑 Add Sub-Admin Authority Terminal (Owner Only Command)
app.post('/api/admin/add-sub', (req, res) => {
    const { username, password } = req.body;
    let check = admins.find(a => a.username === username);
    if(check) return res.json({ success: false, message: "Yeh sub-admin pehle se authorized hai!" });
    
    admins.push({ username, password, role: "Sub-Admin" });
    ownerLogs.unshift({ action: "NEW_SUB_ADMIN", details: `Naya Sub-Admin Node '${username}' register ho gaya!`, time: new Date().toLocaleTimeString() });
    res.json({ success: true, message: "Naya Sub-Admin successfully add ho gaya!" });
});

// 💸 Remote Wallet Adjuster Matrix (Add Balance / Debit Management)
app.post('/api/admin/update-balance', (req, res) => {
    const { username, amount, action, adminName } = req.body;
    let user = users.find(u => u.username === username);
    if (!user) return res.json({ success: false, message: "Database Error: User nahi mila!" });
    
    let cash = parseFloat(amount);
    if (action === 'credit') {
        user.balance += cash;
        stats.approvedPaymentsToday += 1;
        stats.totalInvestedFund += cash;
    } else if (action === 'debit') {
        user.balance = Math.max(0, user.balance - cash);
    }
    
    ownerLogs.unshift({ action: action.toUpperCase(), details: `Admin '${adminName}' ${action}ed ₹${amount} for user '${username}'`, time: new Date().toLocaleTimeString() });
    res.json({ success: true, message: "Database wallet synchronized!" });
});

// 🔒 Remote User Password Reset Override Tool (Owner Core Feature)
app.post('/api/admin/reset-password', (req, res) => {
    const { username, newPassword, adminName } = req.body;
    let user = users.find(u => u.username === username);
    if (!user) return res.json({ success: false, message: "Error: Is mobile number se koi user nahi mila!" });
    
    user.password = newPassword;
    ownerLogs.unshift({ action: "MASTER_PASSWORD_RESET", details: `Admin '${adminName}' changed password for user '${username}'`, time: new Date().toLocaleTimeString() });
    res.json({ success: true, message: `Success: User ka naya password lock ho gaya!` });
});

// 🎫 Create Promo Gift Codes Generator (Admin Interface Link)
app.post('/api/admin/create-gift', (req, res) => {
    const { codeName, amount } = req.body;
    giftCodes.push({ code: codeName.toUpperCase(), amount: parseFloat(amount), usedBy: [] });
    res.json({ success: true, message: `Gift Promo Node ${codeName} online!` });
});

// 🎁 Redeem Gift Code Pipeline (User Dashboard Link)
app.post('/api/user/redeem-gift', (req, res) => {
    const { username, code } = req.body;
    let target = giftCodes.find(g => g.code === code.toUpperCase());
    if(!target) return res.json({ success: false, message: "Galti: Yeh Gift Code galat hai!" });
    if(target.usedBy.includes(username)) return res.json({ success: false, message: "Aap pehle hi yeh code use kar chuke ho!" });
    
    let user = users.find(u => u.username === username);
    if(!user) return res.json({ success: false, message: "User session dead!" });
    
    user.balance += target.amount;
    target.usedBy.push(username);
    res.json({ success: true, message: `Success! ₹${target.amount} aapke account mein add ho gaye.` });
});

// 🎫 Buy Lottery Processing Endpoint
app.post('/api/lottery/buy', (req, res) => {
    const { username, count, tier } = req.body;
    let user = users.find(u => u.username === username);
    if (!user) return res.json({ success: false, message: "Session login dead!" });
    
    let price = tier === 'high' ? 100 : 31;
    let cost = price * parseInt(count);
    if (user.balance < cost) return res.json({ success: false, message: "Wallet balance kam hai! Pehle recharge karein." });
    
    user.balance -= cost;
    for(let i=0; i<count; i++) {
        let tkt = { username, ticketId: "TK-" + Math.floor(1000 + Math.random() * 9000) };
        if (tier === 'high') highTickets.push(tkt);
        else standardTickets.push(tkt);
    }
    res.json({ success: true, message: `Mubarak ho! ${count} ticket successfully pool mein lag gaye.` });
});

// 🎯 Manual High Tier Winner Rigging Core API (Owner Exclusive Control)
app.post('/api/admin/set-high-winner', (req, res) => {
    const { winnerUsername } = req.body;
    highWinnerList.unshift({ username: winnerUsername, prize: "20 Premium Gmail Accounts", time: new Date().toLocaleTimeString() });
    
    ownerLogs.unshift({ action: "LOTTERY_HIGH_RIGGED", details: `Owner manually proclaimed @${winnerUsername} as 20 Gmail Winner!`, time: new Date().toLocaleTimeString() });
    highTickets = []; // Flush pool for clean reset
    res.json({ success: true, message: `Database Lock: @${winnerUsername} official high winner ban gaya!` });
});

// 💬 Customer Support Ticket Creation Framework (User Form Link)
app.post('/api/user/create-ticket', (req, res) => {
    const { username, category, description } = req.body;
    let ticketId = "TKT-" + Math.floor(1000 + Math.random() * 9000);
    supportTickets.unshift({
        id: ticketId,
        username, // User mobile identity string
        category,
        description,
        reply: "Awaiting review from Gmail Maker SMM sub-admins...",
        status: "Process Query"
    });
    res.json({ success: true, message: "Problem Form transmitted! Live verification status pending." });
});

// 💬 Customer Support Chat Reply Dispatch Terminal (Admin Side)
app.post('/api/admin/reply-ticket', (req, res) => {
    const { ticketId, replyMsg } = req.body;
    let ticket = supportTickets.find(t => t.id === ticketId);
    if(ticket) {
        ticket.reply = replyMsg;
        res.json({ success: true, message: "Response successfully dispatched!" });
    } else {
        res.json({ success: false, message: "Ticket ID invalid!" });
    }
});

// ✅ Ticket Success Resolution Dynamic Lock API (Drawing Closing Rule)
app.post('/api/admin/resolve-ticket', (req, res) => {
    const { ticketId } = req.body;
    let ticket = supportTickets.find(t => t.id === ticketId);
    if(ticket) {
        ticket.status = "My All Doubts"; // Shifts category automatically
        res.json({ success: true, message: "Ticket resolution completed! Chat permanently closed." });
    } else {
        res.json({ success: false, message: "Target node failed." });
    }
});

// ⏱️ Auto-Loop Engine for Night 10:00 PM Standard Draw Check
setInterval(() => {
    let now = new Date();
    let istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    if (istTime.getHours() === 22 && istTime.getMinutes() === 0) {
        if (standardTickets.length >= 5) {
            let winIdx = Math.floor(Math.random() * standardTickets.length);
            let winTkt = standardTickets[winIdx];
            standardHistory = { winner: winTkt.username, status: `🎉 Live Draw: @${winTkt.username} automatic 10 Gmail won!` };
        } else {
            standardTickets.forEach(t => { let u = users.find(usr => usr.username === t.username); if(u) u.balance += 31; });
            standardHistory = { winner: "REFUNDED", status: "Anti-Loss Triggered: Low entries (<5). Wallet cash refunded!" };
        }
        standardTickets = [];
    }
}, 60000);

// Global Intercept System Data Stream Routers
app.get('/api/admin/stats', (req, res) => res.json({ ...stats, usersCount: users.length, vipCount: users.filter(u=>u.isPremium).length }));
app.get('/api/lottery/status', (req, res) => res.json({ standard: standardHistory, highWinners: highWinnerList, stdCount: standardTickets.length, highCount: highTickets.length, highPool: highTickets }));
app.get('/api/users', (req, res) => res.json(users));
app.get('/api/tickets/all', (req, res) => res.json(supportTickets));
app.get('/api/owner/notifications', (req, res) => res.json(ownerLogs));

app.listen(3000, () => console.log('Gmail Maker SMM Core Engine Active'));
