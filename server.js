const express = require('express');
const app = express();
const path = require('path');

app.use(express.json());
app.use(express.static('public'));

// 🔒 CLEAN DATABASE ARRAY SYSTEM (WITHDRAWAL COMPLETELY REMOVED)
let users = [];
let admins = [{ username: "OWNERSHUBHAM11", password: "8734812286", role: "Owner" }];
let ownerLogs = [];
let standardTickets = [];
let highTickets = []; 
let giftCodes = []; 
let supportTickets = []; 

// 📦 5वाँ नया डिब्बा: Master Gmail Bulk/Single Orders Database Array
let gmailOrders = []; 
// 💳 UTR Pending Processing Verification Storage Container
let pendingPayments = []; 

// 📊 TOTAL LIFETIME TELEMETRY METERS (TODAY SYSTEM REMOVED AS PER SKETCH)
let stats = {
    totalInvestedFund: 0,    // My All Network (कुल आज तक की लाइफटाइम कमाई का मीटर)
    totalPaymentsToday: 0,   // Live UTR Submissions Counter
    approvedPaymentsToday: 0 // Successfully Confirmed Credits Counter
};

let standardHistory = { winner: null, status: "Subah 12:01 se Ticket Counter chalu hai!" };
let highWinnerList = []; 

// 👑 Admin Core Authenticator Login Matrix
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    const admin = admins.find(a => a.username === username && a.password === password);
    if (admin) return res.json({ success: true, role: admin.role });
    res.status(401).json({ success: false, message: "Access Mismatch!" });
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

// 👤 User Secure Authorization Login
app.post('/api/user/login', (req, res) => {
    const { username, password } = req.body;
    let user = users.find(u => u.username === username && u.password === password);
    if (user) return res.json({ success: true, username: user.username, name: user.name });
    res.json({ success: false, message: "Mobile Number ya Password galat hai! Dubara check karein." });
});

// 📥 UTR Secure Cash Deposit Queue Handler (With 50 Rupees Minimum Restriction)
app.post('/api/user/submit-utr', (req, res) => {
    const { username, amount, utr } = req.body;
    
    // 🚨 STRENGTHENED SAFETY FILTER: Minimum ₹50 wallet deposit condition
    let depositAmount = parseFloat(amount);
    if (depositAmount < 50) {
        return res.json({ success: false, message: "Galti: Website mein minimum deposit limit ₹50 hai!" });
    }

    // Push into Live Pending Queue for Admin Review
    let paymentId = "PAY-" + Math.floor(1000 + Math.random() * 9000);
    pendingPayments.push({
        id: paymentId,
        username,
        amount: depositAmount,
        utr,
        status: "Pending"
    });

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

// 💸 Remote Wallet Adjuster Matrix (Manual Management Add/Debit Balance)
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

// 💳 LIVE PENDING UTR CONTROL MATRIX (Success / Reject Core Action Framework)
app.post('/api/admin/verify-payment', (req, res) => {
    const { paymentId, action, adminName } = req.body;
    let payIndex = pendingPayments.findIndex(p => p.id === paymentId);
    if (payIndex === -1) return res.json({ success: false, message: "Request ID invalid!" });
    
    let targetPayment = pendingPayments[payIndex];
    let user = users.find(u => u.username === targetPayment.username);
    
    if (action === 'success') {
        if (user) {
            user.balance += targetPayment.amount;
            stats.totalInvestedFund += targetPayment.amount; // Live lifetime अर्निंग addition
            stats.approvedPaymentsToday += 1;
        }
        ownerLogs.unshift({ action: "PAYMENT_APPROVED", details: `Admin '${adminName}' approved ₹${targetPayment.amount} for user ${targetPayment.username}`, time: new Date().toLocaleTimeString() });
    } else if (action === 'reject') {
        ownerLogs.unshift({ action: "PAYMENT_REJECTED", details: `Admin '${adminName}' rejected fraudulent UTR ${targetPayment.utr} from ${targetPayment.username}`, time: new Date().toLocaleTimeString() });
    }
    
    pendingPayments.splice(payIndex, 1); // Flush from active processing layout lists
    res.json({ success: true, message: `Action [${action.toUpperCase()}] locked into memory stack!` });
});
// 📦 UNIQUE GMAIL AUTOMATIC MACHINE LOGIC ENGINE (Single Mode & Bulk Mode Router)
app.post('/api/user/order-gmail', (req, res) => {
    const { username, mode, password, name, dob, preferredAddress, bulkUsernamesList } = req.body;
    let user = users.find(u => u.username === username);
    if (!user) return res.json({ success: false, message: "Session Dead! Login edubara karein." });

    let orderId = "ORD-" + Math.floor(10000 + Math.random() * 90000);
    
    if (mode === 'single') {
        // Single Account Creation Mode Logic Block
        let cost = 15; // Setup standard base cost node per single active mail account
        if (user.balance  {
    const { username, newPassword, adminName } = req.body;
    let user = users.find(u => u.username === username);
    if (!user) return res.json({ success: false, message: "Error: Is mobile number se koi user nahi mila!" });
    
    user.password = newPassword;
    ownerLogs.unshift({ action: "MASTER_PASSWORD_RESET", details: `Admin '${adminName}' changed password for user '${username}'`, time: new Date().toLocaleTimeString() });
    res.json({ success: true, message: `Success: User ka naya password lock ho gaya!` });
});

// 🎫 CREATE PROMO GIFT CODES GENERATOR (Admin Hub Matrix Link)
app.post('/api/admin/create-gift', (req, res) => {
    const { codeName, amount } = req.body;
    giftCodes.push({ code: codeName.toUpperCase(), amount: parseFloat(amount), usedBy: [] });
    res.json({ success: true, message: `Gift Promo Node ${codeName} online!` });
});

// 🎁 REDEEM GIFT CODE PIPELINE (User Dashboard Link Matrix)
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
// 🎫 BUY LOTTERY PROCESSING ENDPOINT
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

// 🎯 MANUAL HIGH TIER WINNER RIGGING CORE API (Owner Exclusive Control)
app.post('/api/admin/set-high-winner', (req, res) => {
    const { winnerUsername } = req.body;
    highWinnerList.unshift({ username: winnerUsername, prize: "20 Premium Gmail Accounts", time: new Date().toLocaleTimeString() });
    
    ownerLogs.unshift({ action: "LOTTERY_HIGH_RIGGED", details: `Owner manually proclaimed @${winnerUsername} as 20 Gmail Winner!`, time: new Date().toLocaleTimeString() });
    highTickets = []; // Flush pool for clean reset
    res.json({ success: true, message: `Database Lock: @${winnerUsername} official high winner ban gaya!` });
});

// 💬 CUSTOMER SUPPORT TICKET CREATION FRAMEWORK (User Form Link)
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

// 💬 CUSTOMER SUPPORT CHAT REPLY DISPATCH TERMINAL (Admin Side)
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

// ✅ TICKET SUCCESS RESOLUTION DYNAMIC LOCK API (Drawing Closing Rule)
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

// ⏱️ AUTO-LOOP ENGINE FOR NIGHT 10:00 PM STANDARD DRAW CHECK
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

// GLOBAL INTERCEPT SYSTEM DATA STREAM ROUTERS
app.get('/api/admin/stats', (req, res) => res.json({ ...stats, usersCount: users.length, vipCount: users.filter(u=>u.isPremium).length, pendingPayCount: pendingPayments.length, totalGmailOrdersCount: gmailOrders.length }));
app.get('/api/admin/pending-payments', (req, res) => res.json(pendingPayments));
app.get('/api/admin/gmail-orders', (req, res) => res.json(gmailOrders));
app.get('/api/lottery/status', (req, res) => res.json({ standard: standardHistory, highWinners: highWinnerList, stdCount: standardTickets.length, highCount: highTickets.length, highPool: highTickets }));
app.get('/api/users', (req, res) => res.json(users));
app.get('/api/tickets/all', (req, res) => res.json(supportTickets));
app.get('/api/owner/notifications', (req, res) => res.json(ownerLogs));

app.listen(3000, () => console.log('Gmail Maker SMM Core Engine Active'));
