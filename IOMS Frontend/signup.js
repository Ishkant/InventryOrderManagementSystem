// Check if users exist in local storage, if not, initialize an empty array
let users = JSON.parse(localStorage.getItem('users')) || [];

// Signup Functionality
document.getElementById('signupForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Check if the username already exists
    const userExists = users.some(u => u.username === username);

    if (userExists) {
        alert('Username already exists. Please choose a different username.');
    } else {
        // Add the new user to the users array
        users.push({ username, password });
        localStorage.setItem('users', JSON.stringify(users));

        alert('Signup successful! Redirecting to login page...');
        window.location.href = 'login.html'; // Redirect to the login page
    }
});