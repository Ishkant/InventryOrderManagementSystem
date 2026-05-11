// Fetch and display product data
fetch('http://localhost:8080/products')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        let table = document.getElementById('productTable');
        data.forEach(product => {
            let row = table.insertRow();
            row.insertCell(0).innerHTML = product.name;
            row.insertCell(1).innerHTML = product.quantity;
            row.insertCell(2).innerHTML = product.price;
        });
    })
    .catch(error => console.error('Error fetching product data:', error));

// Add product form submission
document.getElementById('addProductForm').addEventListener('submit', function (e) {
    e.preventDefault();

    let productName = document.getElementById('productName').value;
    let productQuantity = document.getElementById('productQuantity').value;
    let productPrice = document.getElementById('productPrice').value;

    fetch('http://localhost:8080/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: productName,
            quantity: productQuantity,
            price: productPrice
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Product added:', data);
        // Refresh the product list or update the table dynamically
        location.reload();
    })
    .catch(error => console.error('Error adding product:', error));
});
