const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const { use } = require('react')
const port = 3019


const app = express()
app.use(express.static(__dirname))
app.use(express.urlencoded({extended:true}))
mongoose.connect("mongodb://localhost:27017/stusers")
const db = mongoose.connect
db.once('open',()=>{
  console.log('mongoose connect')
})
const userSchema = new mongoose.Schema({
  email:String,
  name:String,
  password:String
})

const Users = mongoose.model("data",userSchema)


app.get("/",(req,res)=>{
  res.sendFile(path.join(__dirname,("sign.html")))

})

app.post("/post",async (req,res)=>{
  const {email,name,password} = req.body;
  const user = new Users({
    email,
    name,
    password
  })
  await user.save()
  console.log(user)
  res.send("From send ")
})



app.listen(port,()=>{
  console.log("Server start")
})



/*function goToForgotPage() {
  // זה יוביל אותך לעמוד חדש (לדוגמה forgot.html)
  window.location.href = "sign.html";
}
function goToForgotSign(){
  window.location.href = "index.html";
}

const pwd = document.getElementById('password');
const chk = document.getElementById('showPassword');

 chk.addEventListener('change', () => {
 pwd.type = chk.checked ? 'text' : 'password';
 });*/
