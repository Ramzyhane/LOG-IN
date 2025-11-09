const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// התחברות למסד הנתונים
mongoose.connect('mongodb://localhost:27017/quiz', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

// סכימה של שאלות
const questionSchema = new mongoose.Schema({
  question: String,
  answers: [String],
  correct: Number
});
const Question = mongoose.model('Question', questionSchema);

// סכימה למשתמשים
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});
const User = mongoose.model('User', userSchema);

// נתיב הוספת שאלות
app.post('/questions', async (req, res) => {
  try {
    const data = req.body;
    const result = await Question.insertMany(data);
    res.status(201).json({ message: 'Questions added!', result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// נתיב קבלת כל השאלות
app.get('/questions', async (req, res) => {
  const questions = await Question.find();
  res.json(questions);
});

// נתיב רישום משתמש
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.json({ success: false, message: 'User already exists' });

    const newUser = new User({ email, password });
    await newUser.save();
    res.json({ success: true, message: 'User registered successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// נתיב התחברות משתמש
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (user) {
      res.json({ success: true, message: 'Login successful!' });
    } else {
      res.json({ success: false, message: 'Invalid email or password.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// הגדרת תיקיית public לשרת קבצי סטטיק (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

app.listen(3019, () => console.log('Server running on http://localhost:3019'));
