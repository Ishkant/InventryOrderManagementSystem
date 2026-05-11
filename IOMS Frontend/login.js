// Check if users exist in local storage, if not, initialize an empty array
let users = JSON.parse(localStorage.getItem('users')) || [];

// Login Functionality
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Find the user in the users array
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        alert('Login successful! Redirecting to dashboard...');
        window.location.href = 'index.html'; // Redirect to the main page
    } else {
        alert('Invalid username or password. Please try again.');
    }
});