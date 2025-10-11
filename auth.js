
import { auth } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

const
  loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Handle login
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log('User signed in:', user);
        window.location.href = 'index.html';
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(`Error al iniciar sesión: ${errorMessage}`);
      });
  });
}

// Handle registration
if (registerForm) {
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log('User registered:', user);
        alert('¡Registro exitoso! Serás redirigido a la página principal.');
        window.location.href = 'index.html';
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(`Error al registrarse: ${errorMessage}`);
      });
  });
}

// Check auth state for pages that require login
function protectPage(callback) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, proceed to initialize the app
      console.log('Auth state: User is signed in.');
      if (callback) callback(user);
    } else {
      // No user is signed in, redirect to login page
      console.log('Auth state: No user signed in. Redirecting to login.html');
      window.location.href = 'login.html';
    }
  });
}

// Handle logout
function logout() {
  signOut(auth).then(() => {
    console.log('User signed out.');
    window.location.href = 'login.html';
  }).catch((error) => {
    console.error('Sign out error:', error);
  });
}

// Export functions to be used in other modules
export { protectPage, logout };
