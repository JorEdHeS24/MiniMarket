
// Check for user authentication status
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        // User is signed in, initialize the app
        initializeApp();
    } else {
        // No user is signed in, redirect to login
        window.location.href = 'login.html';
    }
});

function initializeApp() {
    showSection('inicio');
    loadProducts();
    loadClients();
    loadSuppliers();
    updateDashboard();
    updateReports();
}

document.addEventListener('DOMContentLoaded', () => {
    // The app is initialized after auth check
});

// Sample data
let products = [
    { id: 1, name: 'Coca Cola 350ml', category: 'Bebidas', price: 2.50, stock: 100, barcode: '7702010234567' },
    { id: 2, name: 'Pan de molde', category: 'Panadería', price: 3.20, stock: 50, barcode: '7702010234568' },
    { id: 3, name: 'Leche entera 1L', category: 'Lácteos', price: 4.80, stock: 30, barcode: '7702010234569' },
    { id: 4, name: 'Galletas Oreo', category: 'Snacks', price: 3.90, stock: 80, barcode: '7702010234570' },
    { id: 5, name: 'Jugo de naranja 1L', category: 'Bebidas', price: 4.00, stock: 40, barcode: '7702010234571' },
    { id: 6, name: 'Agua mineral 500ml', category: 'Bebidas', price: 1.50, stock: 120, barcode: '7702010234572' },
    { id: 7, name: 'Snacks variados', category: 'Snacks', price: 2.50, stock: 60, barcode: '7702010234573' },
    { id: 8, name: 'Chocolate 100g', category: 'Dulces', price: 2.50, stock: 70, barcode: '7702010234574' },
];

let clients = [
    { id: 1, name: 'Juan Pérez', email: 'juan.perez@example.com', phone: '123456789', address: 'Calle Falsa 123' },
    { id: 2, name: 'María López', email: 'maria.lopez@example.com', phone: '987654321', address: 'Avenida Siempreviva 742' },
];

let suppliers = [
    { id: 1, company: 'Distribuidora ABC', contact: 'Carlos Ruiz', email: 'carlos.ruiz@distribuidora-abc.com', phone: '111222333', address: 'Polígono Industrial 1', products: 'Bebidas, Snacks' },
    { id: 2, company: 'Lácteos del Sur', contact: 'Ana Gómez', email: 'ana.gomez@lacteosdelsur.com', phone: '444555666', address: 'Zona Franca 2', products: 'Lácteos, Jugos' },
];

let cart = [];
let sales = [];
let categoryChart = null;
let paymentMethodChart = null;

// Navigation
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
    document.getElementById(`${sectionId}-section`).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.getElementById(`nav-${sectionId}`).classList.add('active');
}

// Dashboard
function updateDashboard() {
    document.getElementById('totalProducts').textContent = products.length;
    const lowStock = products.filter(p => p.stock < 20).length;
    document.getElementById('lowStockProducts').textContent = lowStock;
    const todaySales = sales.filter(s => new Date(s.date).toDateString() === new Date().toDateString());
    document.getElementById('totalSales').textContent = todaySales.length;
    const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
    document.getElementById('totalRevenue').textContent = `$${todayRevenue.toFixed(2)}`;
}

// Product Management
function loadProducts() {
    const productsTableBody = document.getElementById('productsTableBody');
    const productsGrid = document.getElementById('productsGrid');
    productsTableBody.innerHTML = '';
    productsGrid.innerHTML = '';

    products.forEach(product => {
        const tableRow = `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>${product.stock}</td>
                <td>${product.barcode}</td>
                <td class="actions-cell">
                    <button onclick="editProduct(${product.id})">✏️</button>
                    <button class="delete-btn" onclick="deleteProduct(${product.id})">🗑️</button>
                </td>
            </tr>
        `;
        productsTableBody.innerHTML += tableRow;

        const productCard = `
            <div class="product-card" onclick="addToCart(${product.id})">
                <div class="product-name">${product.name}</div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
            </div>
        `;
        productsGrid.innerHTML += productCard;
    });
}

function openProductModal() {
    document.getElementById('productModal').classList.add('active');
    document.getElementById('productModalTitle').textContent = 'Agregar Producto';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
}

function saveProduct(event) {
    event.preventDefault();
    const id = document.getElementById('productId').value;
    const name = document.getElementById('productName').value;
    const category = document.getElementById('productCategory').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value);
    const barcode = document.getElementById('productBarcode').value;

    if (id) {
        const productIndex = products.findIndex(p => p.id == id);
        products[productIndex] = { id: parseInt(id), name, category, price, stock, barcode };
    } else {
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        products.push({ id: newId, name, category, price, stock, barcode });
    }

    loadProducts();
    updateDashboard();
    closeProductModal();
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        openProductModal();
        document.getElementById('productModalTitle').textContent = 'Editar Producto';
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productBarcode').value = product.barcode;
    }
}

function deleteProduct(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        products = products.filter(p => p.id !== id);
        loadProducts();
        updateDashboard();
    }
}

// Client Management
function loadClients() {
    const clientsTableBody = document.getElementById('clientsTableBody');
    clientsTableBody.innerHTML = '';
    clients.forEach(client => {
        const row = `
            <tr>
                <td>${client.id}</td>
                <td>${client.name}</td>
                <td>${client.email}</td>
                <td>${client.phone}</td>
                <td>${client.address}</td>
                <td class="actions-cell">
                    <button onclick="editClient(${client.id})">✏️</button>
                    <button class="delete-btn" onclick="deleteClient(${client.id})">🗑️</button>
                </td>
            </tr>
        `;
        clientsTableBody.innerHTML += row;
    });
}

function openClientModal() {
    document.getElementById('clientModal').classList.add('active');
    document.getElementById('clientModalTitle').textContent = 'Agregar Cliente';
    document.getElementById('clientForm').reset();
    document.getElementById('clientId').value = '';
}

function closeClientModal() {
    document.getElementById('clientModal').classList.remove('active');
}

function saveClient(event) {
    event.preventDefault();
    const id = document.getElementById('clientId').value;
    const name = document.getElementById('clientName').value;
    const email = document.getElementById('clientEmail').value;
    const phone = document.getElementById('clientPhone').value;
    const address = document.getElementById('clientAddress').value;

    if (id) {
        const clientIndex = clients.findIndex(c => c.id == id);
        clients[clientIndex] = { id: parseInt(id), name, email, phone, address };
    } else {
        const newId = clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1;
        clients.push({ id: newId, name, email, phone, address });
    }

    loadClients();
    closeClientModal();
}

function editClient(id) {
    const client = clients.find(c => c.id === id);
    if (client) {
        openClientModal();
        document.getElementById('clientModalTitle').textContent = 'Editar Cliente';
        document.getElementById('clientId').value = client.id;
        document.getElementById('clientName').value = client.name;
        document.getElementById('clientEmail').value = client.email;
        document.getElementById('clientPhone').value = client.phone;
        document.getElementById('clientAddress').value = client.address;
    }
}

function deleteClient(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
        clients = clients.filter(c => c.id !== id);
        loadClients();
    }
}

// Supplier Management
function loadSuppliers() {
    const suppliersTableBody = document.getElementById('suppliersTableBody');
    suppliersTableBody.innerHTML = '';
    suppliers.forEach(supplier => {
        const row = `
            <tr>
                <td>${supplier.id}</td>
                <td>${supplier.company}</td>
                <td>${supplier.contact}</td>
                <td>${supplier.email}</td>
                <td>${supplier.phone}</td>
                <td>${supplier.address}</td>
                <td>${supplier.products}</td>
                <td class="actions-cell">
                    <button onclick="editSupplier(${supplier.id})">✏️</button>
                    <button class="delete-btn" onclick="deleteSupplier(${supplier.id})">🗑️</button>
                </td>
            </tr>
        `;
        suppliersTableBody.innerHTML += row;
    });
}

function openSupplierModal() {
    document.getElementById('supplierModal').classList.add('active');
    document.getElementById('supplierModalTitle').textContent = 'Agregar Proveedor';
    document.getElementById('supplierForm').reset();
    document.getElementById('supplierId').value = '';
}

function closeSupplierModal() {
    document.getElementById('supplierModal').classList.remove('active');
}

function saveSupplier(event) {
    event.preventDefault();
    const id = document.getElementById('supplierId').value;
    const company = document.getElementById('supplierCompany').value;
    const contact = document.getElementById('supplierContact').value;
    const email = document.getElementById('supplierEmail').value;
    const phone = document.getElementById('supplierPhone').value;
    const address = document.getElementById('supplierAddress').value;
    const products = document.getElementById('supplierProducts').value;

    if (id) {
        const supplierIndex = suppliers.findIndex(s => s.id == id);
        suppliers[supplierIndex] = { id: parseInt(id), company, contact, email, phone, address, products };
    } else {
        const newId = suppliers.length > 0 ? Math.max(...suppliers.map(s => s.id)) + 1 : 1;
        suppliers.push({ id: newId, company, contact, email, phone, address, products });
    }

    loadSuppliers();
    closeSupplierModal();
}

function editSupplier(id) {
    const supplier = suppliers.find(s => s.id === id);
    if (supplier) {
        openSupplierModal();
        document.getElementById('supplierModalTitle').textContent = 'Editar Proveedor';
        document.getElementById('supplierId').value = supplier.id;
        document.getElementById('supplierCompany').value = supplier.company;
        document.getElementById('supplierContact').value = supplier.contact;
        document.getElementById('supplierEmail').value = supplier.email;
        document.getElementById('supplierPhone').value = supplier.phone;
        document.getElementById('supplierAddress').value = supplier.address;
        document.getElementById('supplierProducts').value = supplier.products;
    }
}

function deleteSupplier(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este proveedor?')) {
        suppliers = suppliers.filter(s => s.id !== id);
        loadSuppliers();
    }
}

// Cashier
function searchProducts() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase();
    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm));
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';
    filteredProducts.forEach(product => {
        const productCard = `
            <div class="product-card" onclick="addToCart(${product.id})">
                <div class="product-name">${product.name}</div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
            </div>
        `;
        productsGrid.innerHTML += productCard;
    });
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product && product.stock > 0) {
        const cartItem = cart.find(item => item.id === productId);
        if (cartItem) {
            cartItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        product.stock--;
        updateCart();
        loadProducts();
    }
}

function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const completeBtn = document.getElementById('completeBtn');

    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart"><p>No hay productos en el carrito</p><p style="font-size: 14px; margin-top: 8px;">Busca y agrega productos para comenzar</p></div>';
        cartTotal.style.display = 'none';
        completeBtn.disabled = true;
    } else {
        cartItems.innerHTML = '';
        let subtotal = 0;
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            const cartItemHTML = `
                <div class="cart-item">
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">$${item.price.toFixed(2)} x ${item.quantity} = $${itemTotal.toFixed(2)}</div>
                    </div>
                    <div class="cart-item-actions">
                        <button class="quantity-btn" onclick="changeQuantity(${item.id}, -1)">-</button>
                        <span class="cart-item-quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="changeQuantity(${item.id}, 1)">+</button>
                        <button class="remove-btn" onclick="removeFromCart(${item.id})">🗑️</button>
                    </div>
                </div>
            `;
            cartItems.innerHTML += cartItemHTML;
        });

        const tax = subtotal * 0.19;
        const total = subtotal + tax;

        document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
        document.getElementById('total').textContent = `$${total.toFixed(2)}`;
        cartTotal.style.display = 'block';
        completeBtn.disabled = false;
    }
}

function changeQuantity(productId, amount) {
    const cartItem = cart.find(item => item.id === productId);
    const product = products.find(p => p.id === productId);

    if (cartItem) {
        if (amount > 0 && product.stock > 0) {
            cartItem.quantity += amount;
            product.stock -= amount;
        } else if (amount < 0) {
            cartItem.quantity += amount;
            product.stock -= amount;
            if (cartItem.quantity <= 0) {
                cart = cart.filter(item => item.id !== productId);
            }
        }
        updateCart();
        loadProducts();
    }
}

function removeFromCart(productId) {
    const cartItemIndex = cart.findIndex(item => item.id === productId);
    if (cartItemIndex > -1) {
        const cartItem = cart[cartItemIndex];
        const product = products.find(p => p.id === productId);
        product.stock += cartItem.quantity;
        cart.splice(cartItemIndex, 1);
        updateCart();
        loadProducts();
    }
}

function clearCart() {
    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        product.stock += item.quantity;
    });
    cart = [];
    updateCart();
    loadProducts();
}

function selectPayment(method) {
    document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
    document.querySelector(`.payment-method[onclick*="${method}"]`).classList.add('selected');
    document.getElementById('cashPayment').style.display = method === 'efectivo' ? 'block' : 'none';
}

function calculateChange() {
    const total = parseFloat(document.getElementById('total').textContent.replace('$', ''));
    const received = parseFloat(document.getElementById('receivedAmount').value);
    const changeInfo = document.getElementById('changeInfo');
    if (received >= total) {
        const change = received - total;
        document.getElementById('changeAmount').textContent = `$${change.toFixed(2)}`;
        changeInfo.style.display = 'block';
    } else {
        changeInfo.style.display = 'none';
    }
}

function completeSale() {
    if (cart.length > 0) {
        const total = parseFloat(document.getElementById('total').textContent.replace('$', ''));
        const paymentMethod = document.querySelector('.payment-method.selected input').value;

        const sale = {
            id: sales.length + 1,
            date: new Date().toISOString(),
            items: [...cart],
            total: total,
            paymentMethod: paymentMethod
        };

        sales.push(sale);
        alert('¡Venta completada con éxito!');
        
        cart = [];
        updateCart();
        updateDashboard();
        updateReports(); // Update reports after sale
    }
}

function handleBarcodeInput(event) {
    if (event.key === 'Enter') {
        addByBarcode();
    }
}

function addByBarcode() {
    const barcode = document.getElementById('barcodeInput').value;
    const product = products.find(p => p.barcode === barcode);
    if (product) {
        addToCart(product.id);
        document.getElementById('barcodeInput').value = '';
    } else {
        alert('Producto no encontrado.');
    }
}

// Reports
function updateReports() {
    const timeRange = document.getElementById('time-range-selector').value;
    const filteredSales = getSalesByTimeRange(timeRange);

    updateStatsGrid(filteredSales);
    updateCategoryChart(filteredSales);
    updatePaymentMethodChart(filteredSales);
    updateBestSellingProducts(filteredSales);
}

function getSalesByTimeRange(timeRange) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (timeRange === 'today') {
        return sales.filter(s => new Date(s.date).toDateString() === today.toDateString());
    } else if (timeRange === 'week') {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return sales.filter(s => new Date(s.date) >= startOfWeek);
    } else if (timeRange === 'month') {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return sales.filter(s => new Date(s.date) >= startOfMonth);
    } else if (timeRange === 'year') {
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        return sales.filter(s => new Date(s.date) >= startOfYear);
    }
    return sales;
}

function updateStatsGrid(filteredSales) {
    const statsGrid = document.getElementById('reports-stats-grid');
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalSales = filteredSales.length;
    const productsSold = filteredSales.reduce((sum, sale) => sum + sale.items.reduce((s, i) => s + i.quantity, 0), 0);
    const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;

    statsGrid.innerHTML = `
        <div class="stat-card">
            <div class="stat-number">$${totalRevenue.toFixed(2)}</div>
            <div class="stat-label">Ingresos Totales</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${totalSales}</div>
            <div class="stat-label">Ventas Totales</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${productsSold}</div>
            <div class="stat-label">Productos Vendidos</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">$${averageSale.toFixed(2)}</div>
            <div class="stat-label">Venta Promedio</div>
        </div>
    `;
}

function updateCategoryChart(filteredSales) {
    const categoryData = filteredSales.flatMap(s => s.items).reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + (item.price * item.quantity);
        return acc;
    }, {});

    const ctx = document.getElementById('category-chart').getContext('2d');
    if(categoryChart) {
        categoryChart.destroy();
    }
    categoryChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(categoryData),
            datasets: [{
                data: Object.values(categoryData),
                backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ef4444'],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
    });
}

function updatePaymentMethodChart(filteredSales) {
    const paymentData = filteredSales.reduce((acc, sale) => {
        acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + 1;
        return acc;
    }, {});

    const ctx = document.getElementById('payment-method-chart').getContext('2d');
     if(paymentMethodChart) {
        paymentMethodChart.destroy();
    }
    paymentMethodChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(paymentData).map(p => p.charAt(0).toUpperCase() + p.slice(1)),
            datasets: [{
                data: Object.values(paymentData),
                backgroundColor: ['#6366f1', '#10b981', '#f59e0b'],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
    });
}

function updateBestSellingProducts(filteredSales) {
    const productSales = filteredSales.flatMap(sale => sale.items).reduce((acc, item) => {
        if (!acc[item.id]) {
            acc[item.id] = { name: item.name, quantity: 0, revenue: 0 };
        }
        acc[item.id].quantity += item.quantity;
        acc[item.id].revenue += item.price * item.quantity;
        return acc;
    }, {});

    const sortedProducts = Object.values(productSales).sort((a, b) => b.quantity - a.quantity).slice(0, 10);

    const tableBody = document.getElementById('best-selling-products-body');
    tableBody.innerHTML = '';
    sortedProducts.forEach(p => {
        const row = `
            <tr>
                <td>${p.name}</td>
                <td>${p.quantity}</td>
                <td>$${p.revenue.toFixed(2)}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

function exportPDF() {
    alert('La funcionalida de exportar a PDF no está implementada en esta versión');
}


function logout() {
    firebase.auth().signOut().then(() => {
        // Sign-out successful.
        window.location.href = 'login.html';
    }).catch((error) => {
        // An error happened.
        console.error('Logout Error:', error);
    });
}
