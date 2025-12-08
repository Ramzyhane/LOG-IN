const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt  = require('bcrypt');

const app = express();
const port = process.env.PORT || 3019; 

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----------- CONNECT TO MONGODB -----------
mongoose.connect("mongodb://localhost:27017/stusers", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.log("DB ERROR:", err));


// ----------- USER SCHEMA -----------
const userSchema = new mongoose.Schema({
    email: String,
    name: String,
    password: String,
    failedAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null }
});

const User = mongoose.model("User", userSchema);


// ----------- QUIZ SCHEMA -----------
const questionSchema = new mongoose.Schema({
    question: String,
    answers: [String],
    correct: Number
});

const Question = mongoose.model('Question', questionSchema);


// ----------- STATIC FILES (HTML / JS / CSS) -----------
app.use(express.static(path.join(__dirname, 'public')));


// ----------- ROUTES -----------

// DEFAULT PAGE
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// REGISTER
app.post('/post', async (req, res) => {
  const { email, name, password } = req.body;

  const hashedPassword  = await bcrypt.hash(password, 10);

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: 'Email already exists' });
    }

    const newUser = new User({ email, name, password: hashedPassword });
    await newUser.save();

    // 👈 מחזירים את השם
    res.json({ success: true, name: newUser.name });
  } catch (err) {
    res.json({ success: false, message: 'Server error' });
  }
});


app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: 'Invalid email or password' });
    }

    // ----- בדיקה אם החשבון נעול -----
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remaining = Math.ceil((user.lockUntil - Date.now()) / 1000/60);
      return res.json({
        success: false,
        message: `החשבון נעול, נסה שוב בעוד ${remaining} דקות`
      });
    }

    // ----- בדיקת סיסמה -----
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // העלאת מספר ניסיונות כושלים
      user.failedAttempts += 1;

      // אם הגיע ל־3 טעויות → נעילה ל־5 דקות
      if (user.failedAttempts >= 3) {
        user.lockUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 דקות
      }

      await user.save();

      return res.json({
        success: false,
        message: 'Wrong password'
      });
    }

    // ----- הצלחה: איפוס ניסיונות -----
    user.failedAttempts = 0;
    user.lockUntil = null;
    await user.save();

    res.json({
      success: true,
      message: 'Login successful',
      name: user.name
    });

  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Server error' });
  }
});




// ADD QUIZ QUESTIONS
app.post('/questions', async (req, res) => {
    try {
        const data = req.body;
        const result = await Question.insertMany(data);
        res.status(201).json({ message: 'Questions added!', result });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET QUIZ QUESTIONS
app.get('/questions', async (req, res) => {
    const questions = await Question.find();
    res.json(questions);
});


// ----------- START SERVER -----------
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
