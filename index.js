function goToForgotPage() {
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
 });