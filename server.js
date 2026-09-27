const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// تقديم الملفات الثابتة من مجلد public
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('[+] New encrypted channel connection:', socket.id);

    // الانضمام لغرفة محددة
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        socket.to(roomId).emit('sys-message', `[SYSTEM] New user joined operational channel: ${roomId}`);
    });

    // استقبال الرسالة المشفرة وتمريرها لأعضاء الغرفة
    socket.on('encrypted-message', (data) => {
        // data تحتوي على { roomId, encryptedPayload, sender }
        io.to(data.roomId).emit('receive-message', data);
    });

    socket.on('disconnect', () => {
        console.log('[-] Channel disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`[SYS_OK] Encrypted Node Server running on port ${PORT}`);
});