const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const port = 3019

const app = express()
// Don't let express.static automatically serve index.html for '/'
// so our app.get('/') can return `sign.html` as intended.
app.use(express.static(__dirname, { index: false }))

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

mongoose.connect("mongodb://localhost:27017/stusers", { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection
db.on('error', (err) => {
  console.error('mongoose connection error:', err)
})
db.once('open', () => {
  console.log('mongoose connected')
})

const userSchema = new mongoose.Schema({
  email: String,
  name: String,
  password: String
})

// Use a conventional model name — Mongoose will create the collection 'users'
const Users = mongoose.model("User", userSchema)

app.get("/home.html", (req, res) => {
  console.log('GET / requested from', req.ip)
  res.sendFile(path.join(__dirname, "sign.html"))
})

app.post("/post", async (req, res) => {
  try {
    const { email, name, password } = req.body
    const user = new Users({ email, name, password })
    await user.save()
    res.json({ success: true, message: "User registered successfully ✅" })
  } catch (err) {
    console.error('Error saving user:', err)
    res.status(500).json({ success: false, message: 'Error saving user' })
  }
})

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await Users.findOne({ email, password })
    if (user) {
      res.json({ success: true, message: 'Login successful ✅' })
    } else {
      res.json({ success: false, message: 'Email or password incorrect ❌' })
    }
  } catch (err) {
    console.error('Server error:', err)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})


app.listen(port, () => {
  console.log("Server started on port", port)
  
})
