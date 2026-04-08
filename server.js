const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      handler(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Attach Socket.IO to the HTTP server
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Basic matchmaking queue for MVP
  let matchmakingQueue = [];

  // Supabase Client for backend tracking
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  io.on('connection', (socket) => {
    console.log('A client connected:', socket.id);

    socket.on('queue:join', async (userProfile) => {
      console.log(`User ${userProfile?.username || 'Guest'} joined queue`);
      matchmakingQueue.push({ socket, profile: userProfile });
      
      // Try to match if enough players!
      if (matchmakingQueue.length >= 2) {
        const player1 = matchmakingQueue.shift();
        const player2 = matchmakingQueue.shift();
        
        const roomId = `room_${Math.random().toString(36).substring(7)}`;
        
        // Persist to Supabase
        try {
          await supabase.from('duel_rooms').insert([{
            id: undefined, // Let DB generate UUID
            room_code: roomId,
            status: 'active',
            started_at: new Date().toISOString()
          }]);
        } catch (err) {
          console.error('Failed to persist duel room:', err);
        }

        // Have them join the socket room
        player1.socket.join(roomId);
        player2.socket.join(roomId);

        // Notify both players they matched
        const duelData = {
          roomId,
          players: [player1.profile, player2.profile]
        };

        io.to(roomId).emit('queue:matched', duelData);
        console.log(`Matched players in room ${roomId}`);
      }
    });

    socket.on('queue:leave', () => {
      matchmakingQueue = matchmakingQueue.filter(p => p.socket.id !== socket.id);
    });

    socket.on('room:join', (data) => {
      const { roomId, profile } = data;
      socket.join(roomId);
      console.log(`User ${profile?.username || 'Guest'} joined room: ${roomId}`);

      // Check how many people are in the room
      const clients = io.sockets.adapter.rooms.get(roomId);
      const numClients = clients ? clients.size : 0;

      if (numClients === 2) {
        // Room is ready! Send match data to both
        // We'll broadcast to the room so both get the players list
        // Note: In a real app, we'd store the profiles in a room object
        io.to(roomId).emit('room:matched', {
          roomId,
          players: [profile], // The joining player. Client will merge with their own
          isStarting: true
        });
      }
    });

    socket.on('room:ready', (data) => {
      // Broadcast ready state to the specific room
      io.to(data.roomId).emit('room:ready', { ...data, socketId: socket.id });
    });

    socket.on('duel:progress', (data) => {
      // Send progress to opponent without sending full code
      socket.broadcast.to(data.roomId).emit('duel:progress', {
        socketId: socket.id,
        status: data.status, // e.g., 'typing', 'running', 'submitted'
        completionEstimate: data.completionEstimate
      });
    });

    socket.on('disconnect', () => {
      matchmakingQueue = matchmakingQueue.filter(p => p.socket.id !== socket.id);
      console.log('User disconnected:', socket.id);
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
