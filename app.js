// app.js

// 1. PROJECT CONFIGURATION (Team Task)
// Use the config object you retrieved
const firebaseConfig = {
    apiKey: "AIzaSyAJIiR_Rl09z2uBBXaS1lM69iRIbYa0dr8",
    authDomain: "it3-firebase-42212.firebaseapp.com",
    projectId: "it3-firebase-42212",
    storageBucket: "it3-firebase-42212.firebasestorage.app",
    messagingSenderId: "519396670924",
    appId: "1:519396670924:web:35267cc6744dd48e85f169",
    measurementId: "G-XXDNTNQLYC"
};

// Initialize Firebase App
firebase.initializeApp(firebaseConfig);

// Initialize Services
const auth = firebase.auth(); 
const db = firebase.firestore(); 

const messagesCollection = db.collection("messages"); // Name your collection "messages" [cite: 1038]

function handleSignUp() {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    if (!email || !password) return alert('Please enter both email and password.');

    auth.createUserWithEmailAndPassword(email, password) // Implement sign-up [cite: 1025]
        .then(() => alert('Sign up successful!'))
        .catch(error => alert(`Sign up failed: ${error.message}`));
}

function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    if (!email || !password) return alert('Please enter both email and password.');

    auth.signInWithEmailAndPassword(email, password) // Implement login [cite: 1026]
        .catch(error => alert(`Login failed: ${error.message}`));
}

window.handleLogout = function() { // Attach to window for easy HTML access
    auth.signOut() // Handle logout [cite: 1027]
        .catch(error => console.error("Logout failed:", error.message));
}

// Dynamically update UI based on authentication state [cite: 1028, 1029]
auth.onAuthStateChanged((user) => {
    const authArea = document.getElementById('auth-area');
    const postArea = document.getElementById('post-area');
    
    if (user) {
        // User is signed in
        authArea.innerHTML = `
            <p>Logged in as: <strong>${user.email}</strong></p>
            <button onclick="handleLogout()">Logout</button>
        `;
        postArea.style.display = 'block'; // Show posting section [cite: 1029]
    } else {
        // User is signed out
        authArea.innerHTML = `
            <div>
                <h4>Login / Sign Up</h4>
                <input type="email" id="login-email" placeholder="Email">
                <input type="password" id="login-password" placeholder="Password">
                <button onclick="handleLogin()">Login</button>
                <br><br>
                <input type="email" id="signup-email" placeholder="Email (New Account)">
                <input type="password" id="signup-password" placeholder="Password (New Account)">
                <button onclick="handleSignUp()">Sign Up</button>
            </div>
        `;
        postArea.style.display = 'none'; // Hide posting section [cite: 1029]
    }
});


const messageForm = document.getElementById('message-form');

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const user = auth.currentUser;
    const messageInput = document.getElementById('message-input');
    const messageContent = messageInput.value.trim();

    if (user && messageContent) {
        // Save message details to Firestore [cite: 1038]
        messagesCollection.add({
            message: messageContent,
            userId: user.uid, // Retrieve user ID [cite: 1036]
            authorEmail: user.email, // Retrieve email [cite: 1036]
            timestamp: firebase.firestore.FieldValue.serverTimestamp() // Add timestamp [cite: 1037]
        })
        .then(() => {
            messageInput.value = ''; // Clear input
        })
        .catch((error) => {
            console.error("Error writing document: ", error);
        });
    }
});


const messagesList = document.getElementById('messages-list');

// Helper function to render a single message document
function renderMessage(doc) {
    const data = doc.data();
    const div = document.createElement('div');
    div.className = 'message-item';
    
    // Convert timestamp or show pending status
    const time = data.timestamp ? 
        data.timestamp.toDate().toLocaleString() : 
        'Posting...';

    div.innerHTML = `
        <p><strong>${data.message}</strong></p>
        <small>Posted by: ${data.authorEmail} at ${time}</small>
    `;
    return div;
}

// Real-time Message Listener using onSnapshot [cite: 1047]
messagesCollection
    .orderBy("timestamp", "desc") // Order messages by timestamp (most recent first) [cite: 1045]
    .onSnapshot((snapshot) => {
        // Clear the list area
        messagesList.innerHTML = '<h3>Recent Messages</h3>'; 
        
        // Dynamically create HTML elements for each message [cite: 1046]
        snapshot.forEach((doc) => {
            messagesList.appendChild(renderMessage(doc));
        });
    }, (error) => {
        console.error("Error listening to messages:", error);
    });
