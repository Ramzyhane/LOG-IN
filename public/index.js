const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const port = 3019;

const app = express();

// Static files
app.use(express.static(__dirname, { index: false }));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/stusers");
const db = mongoose.connection;
db.on('error', (err) => {
  console.error('mongoose connection error:', err);
});
db.once('open', () => {
  console.log('mongoose connected');
});

// Schema + Model
const userSchema = new mongoose.Schema({
  email: String,
  name: String,
  password: String
});

// FIX: use the SAME model name everywhere:
const User = mongoose.model("User", userSchema);

// Route to load home/sign page
app.get("/home.html", (req, res) => {
  res.sendFile(path.join(__dirname, "sign.html"));
});

app.post('/post', async (req, res) => {
  const { email, name, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: 'Email already exists' });
    }

    const newUser = new User({ email, name, password });
    await newUser.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Server error' });
  }
});

app.post('/login', async (req, res) => {

  console.log("BODY RECEIVED:", req.body);

  const { email, password } = req.body;

  const user = await User.findOne({ email: email });

  if (!user)
    return res.json({ success: false, message: 'Invalid email or password' });

  if (user.password !== password)
    return res.json({ success: false, message: 'Invalid email or password' });

  return res.json({ success: true, message: 'Login successful' });
});



// Run server
app.listen(port, () => {
  console.log("Server started on port", port);
});
