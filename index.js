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

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "sign.html"))
})

app.post("/post", async (req, res) => {
  try {
    //console.log('POST /post body:', req.body)
    const { email, name, password } = req.body
    const user = new Users({ email, name, password })
    const saved = await user.save()
    //console.log('saved user:', saved)
    res.send("Form sent")
  } catch (err) {
    console.error('Error saving user:', err)
    res.status(500).send('Error saving user')
  }
  
})

app.listen(port, () => {
  console.log("Server started on port", port)
  
})
