require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

/** =============== 1. User Authentication =============== */
// Sign Up
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Sign In
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

/** =============== 2. Save User Interest as Vector =============== */
app.post('/save-interest', async (req, res) => {
  const { user_id, interest_vector } = req.body;
  const { data, error } = await supabase
    .from('users')
    .update({ interest_vector })
    .eq('id', user_id);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Interest saved successfully!' });
});

/** =============== 3. Find Closest Match =============== */
app.post('/find-match', async (req, res) => {
  const { user_id, interest_vector } = req.body;
  const { data, error } = await supabase.rpc('find_closest_match', {
    user_vector: interest_vector,
  });

  if (error) return res.status(400).json({ error: error.message });

  if (data.length > 0) {
    res.json({ match: data[0], message: 'Closest' });
  } else {
    res.json({ message: 'Not Connected' });
  }
});

/** =============== 4. Real-Time Chat =============== */
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join-room', (room) => {
    socket.join(room);
  });

  socket.on('send-message', ({ room, message }) => {
    io.to(room).emit('receive-message', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

/** =============== Start Server =============== */
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


app.get('/', (req, res) => {
    res.send('SoulMegle Backend is Running!');
  });
  