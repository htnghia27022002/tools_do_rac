const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const PORT = 5000;

// Path to data file - TẤT CẢ DATA LƯU Ở ĐÂY
const DATA_FILE = path.join(__dirname, 'data', 'do_rac_data.json');

// Webhook URL
const WEBHOOK_URL = 'https://open.larksuite.com/open-apis/bot/v2/hook/278e0d3e-42e7-4737-85de-14014f851e8f';

// Default data
const DEFAULT_DATA = {
    members: [
        { id: 1, name: "Người 1" },
        { id: 2, name: "Người 2" },
        { id: 3, name: "Người 3" },
        { id: 4, name: "Người 4" },
        { id: 5, name: "Người 5" }
    ],
    currentRound: 1,
    history: [],
    selectedPerson: null,
    reminderCount: 0,
    isWaitingConfirm: false,
    isRolling: false, // Đang trong quá trình quay
    onlineUsers: [] // Danh sách người đang online
};

// Đọc data từ file
function readData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const content = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(content);
        }
    } catch (error) {
        console.error('Error reading data:', error);
    }
    // Nếu không có file, tạo file mới với default data
    writeData(DEFAULT_DATA);
    return DEFAULT_DATA;
}

// Ghi data vào file
function writeData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error writing data:', error);
        return false;
    }
}

// Tạo message dựa trên số lần nhắc
function getReminderMessage(name, count, round) {
    if (count === 0) {
        return `🗑️ Nhắc đổ rác: ${name} - Đến lượt bạn đổ rác hôm nay! (Vòng ${round})`;
    } else if (count === 1) {
        return `🗑️⏰ NHẮC LẠI: ${name} - Bạn ơi, đổ rác đi! (Vòng ${round}) - Nhắc lần ${count + 1}`;
    } else if (count === 2) {
        return `🗑️🚨 NHẮC GẤP: ${name} - ĐỔ RÁC ĐI BẠN ƠI!!! (Vòng ${round}) - Nhắc lần ${count + 1}`;
    } else if (count === 3) {
        return `🗑️🔥🔥 KHẨN CẤP: ${name} - RÁC SẮP TRÀN RỒI!!! ĐỔ NGAY!!! (Vòng ${round}) - Nhắc lần ${count + 1}`;
    } else {
        const urgency = '🚨'.repeat(Math.min(count, 10));
        return `${urgency} ${name.toUpperCase()} - ĐỔ RÁC NGAY LẬP TỨC!!! KHÔNG CÓ LÝ DO GÌ HẾT!!! (Vòng ${round}) - NHẮC LẦN ${count + 1} ${urgency}`;
    }
}

// Gửi webhook
async function sendWebhook(message) {
    try {
        const postData = JSON.stringify({
            msg_type: 'text',
            content: { text: message }
        });

        const url = new URL(WEBHOOK_URL);
        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        return new Promise((resolve, reject) => {
            const https = require('https');
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(data));
            });
            req.on('error', reject);
            req.write(postData);
            req.end();
        });
    } catch (error) {
        console.error('Webhook error:', error);
        throw error;
    }
}

// Parse JSON body
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                resolve({});
            }
        });
    });
}

// Content types
const CONTENT_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon'
};

// Main server
const server = http.createServer(async (req, res) => {
    const url = req.url;
    const method = req.method;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // ========== API ROUTES ==========
    
    // GET /api/data - Lấy toàn bộ data
    if (url === '/api/data' && method === 'GET') {
        const data = readData();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
        return;
    }

    // POST /api/data - Cập nhật toàn bộ data
    if (url === '/api/data' && method === 'POST') {
        const body = await parseBody(req);
        writeData(body);
        broadcast({ type: 'dataUpdate', data: body });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
        return;
    }

    // POST /api/remind - Gửi nhắc nhở
    if (url === '/api/remind' && method === 'POST') {
        try {
            const data = readData();
            if (!data.selectedPerson) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Chưa chọn người' }));
                return;
            }

            const message = getReminderMessage(data.selectedPerson.name, data.reminderCount || 0, data.currentRound);

            // Gửi webhook
            await sendWebhook(message);

            // Tăng số lần nhắc
            data.reminderCount = (data.reminderCount || 0) + 1;
            writeData(data);
            broadcast({ type: 'dataUpdate', data: data });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true, 
                message: `Đã gửi nhắc nhở lần ${data.reminderCount} cho ${data.selectedPerson.name}`,
                data: data
            }));
        } catch (error) {
            // Vẫn update data dù webhook fail
            const data = readData();
            data.reminderCount = (data.reminderCount || 0) + 1;
            writeData(data);
            broadcast({ type: 'dataUpdate', data: data });
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true, 
                message: 'Đã ghi nhận (webhook có thể lỗi)',
                data: data
            }));
        }
        return;
    }

    // POST /api/confirm - Xác nhận đã đổ rác
    if (url === '/api/confirm' && method === 'POST') {
        const data = readData();
        if (!data.selectedPerson) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Chưa chọn người' }));
            return;
        }

        const currentPerson = data.selectedPerson;

        // Add to history
        data.history.push({
            memberId: currentPerson.id,
            memberName: currentPerson.name,
            round: data.currentRound,
            reminderCount: data.reminderCount || 0,
            timestamp: new Date().toISOString()
        });

        // Check if completed a round (mỗi người đổ 1 lần = 1 vòng)
        const peopleInCurrentRound = data.history.filter(h => h.round === data.currentRound).length;
        if (peopleInCurrentRound >= data.members.length) {
            data.currentRound++;
        }

        // Reset state
        data.selectedPerson = null;
        data.reminderCount = 0;
        data.isWaitingConfirm = false;
        data.isRolling = false;

        writeData(data);
        broadcast({ type: 'dataUpdate', data: data });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            success: true, 
            message: `${currentPerson.name} đã hoàn thành!`,
            data: data
        }));
        broadcast({ type: 'completed', person: currentPerson.name });
        return;
    }

    // POST /api/reset - Reset data
    if (url === '/api/reset' && method === 'POST') {
        const data = readData();
        data.currentRound = 1;
        data.history = [];
        data.selectedPerson = null;
        data.reminderCount = 0;
        data.isWaitingConfirm = false;
        data.isRolling = false;
        writeData(data);
        broadcast({ type: 'dataUpdate', data: data });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: data }));
        return;
    }

    // POST /api/roll - Quay người (với loại trừ người đang xem)
    if (url === '/api/roll' && method === 'POST') {
        const body = await parseBody(req);
        const currentViewer = body.viewer; // Người đang xem
        const data = readData();

        if (!data.members || data.members.length === 0) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Chưa có thành viên' }));
            return;
        }

        if (data.isWaitingConfirm) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Phải xác nhận người hiện tại trước' }));
            return;
        }

        // Kiểm tra có ai đang quay không
        if (data.isRolling) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Có người đang quay, vui lòng đợi!' }));
            return;
        }

        // Set isRolling = true và broadcast
        data.isRolling = true;
        writeData(data);
        broadcast({ type: 'dataUpdate', data: data });

        // Lọc ra danh sách có thể bị quay (loại trừ người đang xem)
        let eligibleMembers = data.members;
        if (currentViewer) {
            eligibleMembers = data.members.filter(m => m.name !== currentViewer);
        }

        if (eligibleMembers.length === 0) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Không có thành viên nào khác để quay' }));
            return;
        }

        // Random chọn người
        const randomIndex = Math.floor(Math.random() * eligibleMembers.length);
        const selectedPerson = eligibleMembers[randomIndex];

        // Cập nhật data
        data.selectedPerson = selectedPerson;
        data.isWaitingConfirm = true;
        data.reminderCount = 0;
        writeData(data);

        // Broadcast rolling animation
        broadcast({ type: 'rolling', eligibleMembers: eligibleMembers, selectedPerson: selectedPerson });

        // Sau 3 giây broadcast kết quả và reset isRolling
        setTimeout(() => {
            const currentData = readData();
            currentData.isRolling = false;
            writeData(currentData);
            broadcast({ type: 'rollResult', data: currentData, selectedPerson: selectedPerson });
        }, 3000);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: data, selectedPerson: selectedPerson }));
        return;
    }

    // ========== STATIC FILES ==========
    // Redirect root to login if not authenticated (this will be handled by client-side)
    let filePath;
    if (url === '/') {
        filePath = path.join(__dirname, 'public', 'index.html');
    } else {
        filePath = path.join(__dirname, 'public', url);
    }
    
    const ext = path.extname(filePath);
    const contentType = CONTENT_TYPES[ext] || 'text/plain';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

// ========== WEBSOCKET ==========
const wss = new WebSocket.Server({ server });

// Lưu kết nối WebSocket với thông tin user
const clients = new Map(); // Map<ws, {username: string, id: string}>

wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    
    ws.on('message', (message) => {
        try {
            const msg = JSON.parse(message);
            
            if (msg.type === 'login') {
                // User đăng nhập
                const userId = generateId();
                clients.set(ws, { username: msg.username, id: userId });
                
                // Cập nhật online users
                const data = readData();
                data.onlineUsers = Array.from(clients.values()).map(c => c.username);
                writeData(data);
                
                // Gửi data đầu tiên cho user
                ws.send(JSON.stringify({ type: 'init', data: data, userId: userId }));
                
                // Broadcast online users
                broadcast({ type: 'onlineUsers', users: data.onlineUsers });
                
                console.log(`User logged in: ${msg.username}`);
            }
        } catch (error) {
            console.error('WebSocket message error:', error);
        }
    });
    
    ws.on('close', () => {
        // User disconnect
        const user = clients.get(ws);
        if (user) {
            console.log(`User disconnected: ${user.username}`);
            clients.delete(ws);
            
            // Cập nhật online users
            const data = readData();
            data.onlineUsers = Array.from(clients.values()).map(c => c.username);
            writeData(data);
            
            // Broadcast online users
            broadcast({ type: 'onlineUsers', users: data.onlineUsers });
        }
    });
    
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

// Broadcast message to all clients
function broadcast(message) {
    const messageStr = JSON.stringify(message);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(messageStr);
        }
    });
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

server.listen(PORT, '0.0.0.0', () => {
    const os = require('os');
    const interfaces = os.networkInterfaces();
    let localIP = 'localhost';

    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                localIP = iface.address;
                break;
            }
        }
    }

    console.log('');
    console.log('🗑️  Đổ Rác Reminder Server đang chạy!');
    console.log('');
    console.log('📍 Truy cập từ máy này:');
    console.log(`   http://localhost:${PORT}`);
    console.log('');
    console.log('📍 Truy cập từ các máy khác trong mạng:');
    console.log(`   http://${localIP}:${PORT}`);
    console.log('');
    console.log('📁 Data lưu tại: ' + DATA_FILE);
    console.log('');
    console.log('💡 Nhấn Ctrl+C để dừng server');
    console.log('🔌 WebSocket enabled for real-time updates');
    console.log('');
});
