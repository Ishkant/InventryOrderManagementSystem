const MAX_TOTAL_QUANTITY = 1000; // Default maximum limit for total product quantity
const ORDERS_API_URL = 'http://localhost:8080/orders'; // Backend API endpoint for orders
const PRODUCTS_API_URL = 'http://localhost:8080/products'; // Backend API endpoint for products

let productsData = []; // Store products data globally

// Fetch and display product data (initially populate the table with products)
function fetchProducts(url = PRODUCTS_API_URL) {
    fetch(url, {
        mode: 'cors' // Ensure CORS is enabled
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            productsData = data; // Store products data
            displayProducts(data);
            populateProductDropdown(data); // Populate the product dropdown
            updateDashboardMetrics(); // Update dashboard metrics
        })
        .catch(error => console.error('Error fetching product data:', error));
}

// Function to display products in the table
function displayProducts(products) {
    const table = document.getElementById('productTable').getElementsByTagName('tbody')[0];
    table.innerHTML = ''; // Clear current rows

    let totalQuantityForAllProducts = 0;

    products.forEach(product => {
        const row = table.insertRow();
        row.insertCell(0).innerText = product.id; // Display product ID
        row.insertCell(1).innerText = product.name || 'Unnamed'; // Prevent null from displaying
        row.insertCell(2).innerText = product.quantity;
        row.insertCell(3).innerText = product.price;
        row.insertCell(4).innerText = (product.quantity * product.price).toFixed(2);

        // Display Total Quantity Limit
        const totalQuantityCell = row.insertCell(5);
        totalQuantityCell.innerText = product.totalQuantityLimit || MAX_TOTAL_QUANTITY;

        // Calculate Remaining Quantity
        const remainingQuantity = (product.totalQuantityLimit || MAX_TOTAL_QUANTITY) - product.quantity;
        const remainingQuantityCell = row.insertCell(6);
        remainingQuantityCell.innerText = remainingQuantity;

        const actionsCell = row.insertCell(7);
        const updateBtn = document.createElement('button');
        updateBtn.innerText = 'Update';
        updateBtn.addEventListener('click', () => updateProduct(product.id, row));
        actionsCell.appendChild(updateBtn);

        const removeBtn = document.createElement('button');
        removeBtn.innerText = 'Remove';
        removeBtn.addEventListener('click', () => removeProduct(product.id));
        actionsCell.appendChild(removeBtn);

        // Display orderDate
        const orderDateCell = row.insertCell(8);
        orderDateCell.innerText = product.orderDate || 'N/A'; // Fallback if no date is present

        // Add product quantity to the total quantity for all products
        totalQuantityForAllProducts += product.quantity;
    });

    // Display the total quantity for all products
    document.getElementById('totalQuantity').innerText = `Total Quantity for All Products: ${totalQuantityForAllProducts}`;
}

// Function to populate the product dropdown in the "Add Order" form
function populateProductDropdown(products) {
    const productDropdown = document.getElementById('orderProduct');
    productDropdown.innerHTML = ''; // Clear existing options

    // Add a default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a product';
    productDropdown.appendChild(defaultOption);

    // Populate the dropdown with products
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id; // Use product ID as the value
        option.textContent = `${product.name} (ID: ${product.id})`; // Display product name with ID
        option.setAttribute('data-price', product.price); // Store the price as a data attribute
        productDropdown.appendChild(option);
    });
}

// Fetch products initially
fetchProducts();

// Add new product functionality
document.getElementById('addProductForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const productName = document.getElementById('productName').value;
    const productQuantity = parseInt(document.getElementById('productQuantity').value, 10);
    const productPrice = parseFloat(document.getElementById('productPrice').value);
    const productTotalQuantity = parseInt(document.getElementById('productTotalQuantity').value, 10);
    const productCategory = document.getElementById('productCategorySelect').value;
    const orderDate = new Date().toISOString().split('T')[0]; // Add the current date as orderDate

    // Fetch the current total quantity
    fetch(PRODUCTS_API_URL, {
        mode: 'cors' // Ensure CORS is enabled
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(products => {
            const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0);

            // Removed the total quantity limit check
            if (productQuantity > productTotalQuantity) {
                alert(`Cannot add product. Quantity exceeds the total quantity limit of ${productTotalQuantity}.`);
                return;
            }

            // Proceed with adding the product
            fetch(PRODUCTS_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: productName,
                    quantity: productQuantity,
                    price: productPrice,
                    totalQuantityLimit: productTotalQuantity,
                    category: productCategory,
                    orderDate
                }),
                mode: 'cors' // Ensure CORS is enabled
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to add product');
                    }
                    return response.json();
                })
                .then(product => {
                    fetchProducts(); // Refresh the product list
                })
                .catch(error => console.error('Error adding product:', error));

            // Clear the form fields
            document.getElementById('addProductForm').reset();
        });
});

// Update product functionality
function updateProduct(productId, row) {
    const newName = prompt("Enter the new product name:", row.cells[1].innerText);
    const newQuantity = parseInt(prompt("Enter the new quantity:", row.cells[2].innerText), 10);
    const newPrice = parseFloat(prompt("Enter the new price:", row.cells[3].innerText));
    const newTotalQuantityLimit = parseInt(prompt("Enter the new total quantity limit:", row.cells[5].innerText), 10);
    const newCategory = prompt("Enter the new product category:", 'General');

    if (newName && newQuantity && newPrice && newTotalQuantityLimit && newCategory) {
        fetch(PRODUCTS_API_URL, {
            mode: 'cors' // Ensure CORS is enabled
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(products => {
                const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0);
                const currentProductQuantity = parseInt(row.cells[2].innerText, 10);

                // Removed the total quantity limit check
                if (newQuantity > newTotalQuantityLimit) {
                    alert(`Cannot update product. Quantity exceeds the total quantity limit of ${newTotalQuantityLimit}.`);
                    return;
                }

                // Update the product
                fetch(`${PRODUCTS_API_URL}/${productId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: newName,
                        quantity: newQuantity,
                        price: newPrice,
                        totalQuantityLimit: newTotalQuantityLimit,
                        category: newCategory
                    }),
                    mode: 'cors' // Ensure CORS is enabled
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Failed to update product');
                        }
                        fetchProducts(); // Refresh the product list
                    })
                    .catch(error => console.error('Error updating product:', error));
            });
    }
}

// Remove product functionality
function removeProduct(productId) {
    if (confirm("Are you sure you want to remove this product?")) {
        fetch(`${PRODUCTS_API_URL}/${productId}`, {
            method: 'DELETE',
            mode: 'cors' // Ensure CORS is enabled
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to remove product');
            }
            fetchProducts(); // Refresh the product list
        })
        .catch(error => console.error('Error removing product:', error));
    }
}

// Search products by name
document.getElementById('searchButton').addEventListener('click', function () {
    const searchQuery = document.getElementById('productSearch').value.toLowerCase();

    fetch(PRODUCTS_API_URL, {
        mode: 'cors' // Ensure CORS is enabled
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(products => {
            const filteredProducts = products.filter(product =>
                product.name.toLowerCase().includes(searchQuery)
            );
            displayProducts(filteredProducts);
        })
        .catch(error => console.error('Error searching products:', error));
});

// Filter products by category
document.getElementById('productCategory').addEventListener('change', function () {
    const selectedCategory = this.value;

    fetch(PRODUCTS_API_URL, {
        mode: 'cors' // Ensure CORS is enabled
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(products => {
            const filteredProducts = selectedCategory === 'all'
                ? products
                : products.filter(product => product.category === selectedCategory);
            displayProducts(filteredProducts);
        })
        .catch(error => console.error('Error filtering products:', error));
});

// ==================== Order Functionality ====================

// Fetch and display orders
function fetchOrders(url = ORDERS_API_URL) {
    fetch(url, {
        mode: 'cors' // Ensure CORS is enabled
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            displayOrders(data);
            updateDashboardMetrics(); // Update dashboard metrics
        })
        .catch(error => console.error('Error fetching order data:', error));
}

// Function to display orders in the table
function displayOrders(orders) {
    const table = document.getElementById('orderTable').getElementsByTagName('tbody')[0];
    table.innerHTML = ''; // Clear current rows

    let totalOrders = 0;

    orders.forEach(order => {
        const product = productsData.find(product => product.id === order.productId);
        const row = table.insertRow();
        row.insertCell(0).innerText = order.id; // Order ID
        row.insertCell(1).innerText = order.customerName || 'N/A'; // Customer Name
        row.insertCell(2).innerText = product ? product.name : 'N/A'; // Product Name
        row.insertCell(3).innerText = order.quantity; // Quantity
        row.insertCell(4).innerText = product ? product.price : 'N/A'; // Price
        row.insertCell(5).innerText = product ? (order.quantity * product.price).toFixed(2) : 'N/A'; // Total Price
        row.insertCell(6).innerText = order.status || 'Pending'; // Status
        row.insertCell(7).innerText = order.orderDate || 'N/A'; // Order Date

        const actionsCell = row.insertCell(8);
        const updateBtn = document.createElement('button');
        updateBtn.innerText = 'Update';
        updateBtn.addEventListener('click', () => updateOrder(order.id, row));
        actionsCell.appendChild(updateBtn);

        const removeBtn = document.createElement('button');
        removeBtn.innerText = 'Remove';
        removeBtn.addEventListener('click', () => removeOrder(order.id));
        actionsCell.appendChild(removeBtn);

        totalOrders++;
    });

    // Display the total number of orders
    document.getElementById('totalOrders').innerText = `Total Orders: ${totalOrders}`;
}

// Add new order functionality
document.getElementById('addOrderForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const customerName = document.getElementById('customerName').value.trim();
    const productId = parseInt(document.getElementById('orderProduct').value, 10);
    const quantity = parseInt(document.getElementById('orderQuantity').value, 10);
    const price = parseFloat(document.getElementById('orderPrice').value);
    const totalPrice = parseFloat(document.getElementById('orderTotalPrice').value);
    const status = document.getElementById('orderStatusSelect').value;
    const orderDate = document.getElementById('orderDateInput').value || new Date().toISOString().split('T')[0]; // Make date optional

    // Validate form inputs
    if (!customerName) {
        alert('Please enter a customer name.');
        return;
    }
    if (isNaN(productId)) {
        alert('Please select a valid product.');
        return;
    }
    if (isNaN(quantity) || quantity <= 0) {
        alert('Please enter a valid quantity (must be greater than 0).');
        return;
    }
    if (isNaN(price) || price <= 0) {
        alert('Please enter a valid price (must be greater than 0).');
        return;
    }
    if (!status) {
        alert('Please select a valid status.');
        return;
    }

    // Log the payload being sent to the backend
    const payload = {
        customerName,
        productId,
        quantity,
        price,
        totalPrice,
        status,
        orderDate
    };
    console.log("Sending payload to backend:", payload);

    // Proceed with adding the order
    fetch(`${ORDERS_API_URL}/place`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        mode: 'cors' // Ensure CORS is enabled
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(errorMessage => {
                    throw new Error(errorMessage || 'Failed to add order');
                });
            }
            return response.json();
        })
        .then(order => {
            console.log("Order placed successfully:", order);
            fetchOrders(); // Refresh the order list
        })
        .catch(error => {
            console.error('Error adding order:', error);
            alert('Failed to place order: ' + error.message);
        });

    // Clear the form fields
    document.getElementById('addOrderForm').reset();
});

// Update order functionality
function updateOrder(orderId, row) {
    const newStatus = prompt("Enter the new status:", row.cells[6].innerText);

    if (newStatus) {
        fetch(`${ORDERS_API_URL}/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: newStatus
            }),
            mode: 'cors' // Ensure CORS is enabled
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update order');
                }
                fetchOrders(); // Refresh the order list
            })
            .catch(error => console.error('Error updating order:', error));
    }
}

// Remove order functionality
function removeOrder(orderId) {
    if (confirm("Are you sure you want to remove this order?")) {
        fetch(`${ORDERS_API_URL}/${orderId}`, {
            method: 'DELETE',
            mode: 'cors' // Ensure CORS is enabled
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to remove order');
            }
            fetchOrders(); // Refresh the order list
        })
        .catch(error => console.error('Error removing order:', error));
    }
}

// Fetch orders initially
fetchOrders();

// Calculate total price when quantity or price changes
document.getElementById('orderQuantity').addEventListener('input', calculateTotalPrice);
document.getElementById('orderPrice').addEventListener('input', calculateTotalPrice);
document.getElementById('orderProduct').addEventListener('change', updatePriceAndCalculateTotal);

function updatePriceAndCalculateTotal() {
    const selectedProduct = document.getElementById('orderProduct');
    const selectedOption = selectedProduct.options[selectedProduct.selectedIndex];
    const price = selectedOption.getAttribute('data-price');
    document.getElementById('orderPrice').value = price;
    calculateTotalPrice();
}

function calculateTotalPrice() {
    const quantity = parseFloat(document.getElementById('orderQuantity').value) || 0;
    const price = parseFloat(document.getElementById('orderPrice').value) || 0;
    const totalPrice = quantity * price;
    document.getElementById('orderTotalPrice').value = totalPrice.toFixed(2);
}

// Update dashboard metrics
function updateDashboardMetrics() {
    const totalInventoryValue = productsData.reduce((sum, product) => sum + (product.quantity * product.price), 0);
    document.getElementById('totalInventoryValue').innerText = `$${totalInventoryValue.toFixed(2)}`;

    const totalOrdersCount = document.getElementById('orderTable').getElementsByTagName('tbody')[0].rows.length;
    document.getElementById('totalOrdersCount').innerText = totalOrdersCount;
}

// Search orders by customer name
document.getElementById('orderSearchButton').addEventListener('click', function () {
    const searchQuery = document.getElementById('orderSearch').value.toLowerCase();

    fetch(ORDERS_API_URL, {
        mode: 'cors' // Ensure CORS is enabled
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(orders => {
            const filteredOrders = orders.filter(order =>
                order.customerName.toLowerCase().includes(searchQuery)
            );
            displayOrders(filteredOrders);
        })
        .catch(error => console.error('Error searching orders:', error));
});

// Filter orders by status
document.getElementById('orderStatus').addEventListener('change', function () {
    const selectedStatus = this.value;

    fetch(ORDERS_API_URL, {
        mode: 'cors' // Ensure CORS is enabled
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(orders => {
            const filteredOrders = selectedStatus === 'all'
                ? orders
                : orders.filter(order => order.status === selectedStatus);
            displayOrders(filteredOrders);
        })
        .catch(error => console.error('Error filtering orders:', error));
});