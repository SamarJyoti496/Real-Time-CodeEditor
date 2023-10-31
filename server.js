const express = require('express');
const app = express();
const http = require('http')
const server = http.createServer(app);
const {Server} = require('socket.io');
const ACTIONS = require('./src/Actions');
const path = require('path');

const io = new Server(server);

app.use(express.static('/build'));
app.use((req, res, next) =>{
      res.sendFile(path.join(__dirname, '/build/index.html'));
})

const userSocketMap = {};
function getAllConnectedClients(roomId) {
    // Map
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                userName: userSocketMap[socketId],
            };
        }
    );
}


// Socket.IO setup
io.on('connection', (socket) => {
     socket.on(ACTIONS.JOIN, ({roomId, userName}) => {
          console.log(userName, 'joined')
          userSocketMap[socket.id] = userName;
          socket.join(roomId);
          const clients = getAllConnectedClients(roomId);
          clients.forEach(({socketId}) => {
               io.to(socketId).emit(ACTIONS.JOINED, {
                    clients,
                    userName,
                    socketId: socket.id,
               })
          })
      })
     
      socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });


      socket.on(ACTIONS.SYNC_CODE, ({socketId, code}) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
      });


      socket.on('disconnecting', () =>{
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) =>{
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                userName: userSocketMap[socket.id],
            })
        })

        delete userSocketMap[socket.id];
        socket.leave();
      })
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
     console.log(`Server listening on port ${PORT}`);
});
