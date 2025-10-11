import { db } from "./firebase-config.js";
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    writeBatch
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { protectPage, logout } from "./auth.js";

// =================================================================================
// App Initialization
// =================================================================================
window.addEventListener('DOMContentLoaded', () => {
    // The protectPage function is imported from auth.js.
    // It will check if the user is logged in. If so, it will call initializeApp.
    // If not, it will redirect to login.html.
    protectPage(initializeApp);
});

// =================================================================================
// Global State
// =================================================================================
let products = [];
let clients = [];
let suppliers = [];
let sales = [];
let cart = [];
let categoryChart = null;
let paymentMethodChart = null;

// =================================================================================
// Main App Logic
// =================================================================================

async function initializeApp(user) {
    console.log("Authenticated user:", user.email);
    console.log("Initializing app...");

    // Dynamically add the logout button to the sidebar
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        const logoutButton = document.createElement('a');
        logoutButton.href = "#";
        logoutButton.className = "nav-item";
        logoutButton.id = "nav-logout";
        logoutButton.innerHTML = '<span class="nav-icon">🚪</span>Cerrar Sesión';
        logoutButton.onclick = (e) => {
            e.preventDefault();
            logout();
        };
        // Add it after the last nav-section for better grouping
        sidebar.appendChild(logoutButton);
    }

    // Load all data from Firestore
    await loadAllData();

    // Set up UI event listeners
    setupEventListeners();

    // Initial render of all dynamic content
    renderAll();

    // Show the 'inicio' section by default
    showSection('inicio');
    console.log("App initialized successfully.");
}

async function loadAllData() {
    console.log("Loading all data from Firestore...");
    try {
        const [productsSnapshot, clientsSnapshot, suppliersSnapshot, salesSnapshot] = await Promise.all([
            getDocs(collection(db, "products")),
            getDocs(collection(db, "clients")),
            getDocs(collection(db, "suppliers")),
            getDocs(collection(db, "sales"))
        ]);

        products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        clients = clientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        suppliers = suppliersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        sales = salesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        console.log("Data loaded:", { products, clients, suppliers, sales });
    } catch (error) {
        console.error("Error loading data from Firestore:", error);
        alert("Error al cargar los datos. Por favor, revisa la consola para más detalles.");
    }
}

function setupEventListeners() {
    // Navigation
    document.getElementById('nav-inicio').addEventListener('click', () => showSection('inicio'));
    document.getElementById('nav-cajero').addEventListener('click', () => showSection('cajero'));
    document.getElementById('nav-informes').addEventListener('click', () => showSection('informes'));
    document.getElementById('nav-productos').addEventListener('click', () => showSection('productos'));
    document.getElementById('nav-clientes').addEventListener('click', () => showSection('clientes'));
    document.getElementById('nav-proveedor').addEventListener('click', () => showSection('proveedor'));

    // Forms
    document.getElementById('productForm').addEventListener('submit', saveProduct);
    document.getElementById('clientForm').addEventListener('submit', saveClient);
    document.getElementById('supplierForm').addEventListener('submit', saveSupplier);

    // Search and Barcode
    document.getElementById('productSearch').addEventListener('keyup', searchProducts);
    document.getElementById('barcodeInput').addEventListener('keydown', handleBarcodeInput);

    // Reports
    document.getElementById('time-range-selector').addEventListener('change', updateReports);
}

// =================================================================================
// Rendering Functions
// =================================================================================

function renderAll() {
    renderProductGrid();
    renderProductTable();
    renderClientTable();
    renderSupplierTable();
    updateCart();
    updateDashboard();
    updateReports();
}

function updateDashboard() {
    document.getElementById('totalProducts').textContent = products.length;
    const lowStock = products.filter(p => p.stock < 20).length;
    document.getElementById('lowStockProducts').textContent = lowStock;
    const todaySales = getSalesByTimeRange('today');
    document.getElementById('totalSales').textContent = todaySales.length;
    const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
    document.getElementById('totalRevenue').textContent = `$${todayRevenue.toFixed(2)}`;
}

function renderProductGrid(filteredProducts = products) {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = '<p>No se encontraron productos.</p>';
        return;
    }

    filteredProducts.forEach(product => {
        const productCard = `
            <div class="product-card" onclick="addToCart('${product.id}')">
                <div class="product-name">${product.name}</div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
            </div>
        `;
        productsGrid.innerHTML += productCard;
    });
}

function renderProductTable() {
    const tableBody = document.getElementById('productsTableBody');
    tableBody.innerHTML = '';
    products.forEach(product => {
        tableBody.innerHTML += `
            <tr>
                <td>${product.id.substring(0, 6)}...</td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>${product.stock}</td>
                <td>${product.barcode}</td>
                <td class="actions-cell">
                    <button onclick="editProduct('${product.id}')">✏️</button>
                    <button class="delete-btn" onclick="deleteItem('products', '${product.id}')">🗑️</button>
                </td>
            </tr>
        `;
    });
}

function renderClientTable() {
    const tableBody = document.getElementById('clientsTableBody');
    tableBody.innerHTML = '';
    clients.forEach(client => {
        tableBody.innerHTML += `
            <tr>
                <td>${client.id.substring(0, 6)}...</td>
                <td>${client.name}</td>
                <td>${client.email}</td>
                <td>${client.phone}</td>
                <td>${client.address}</td>
                <td class="actions-cell">
                    <button onclick="editClient('${client.id}')">✏️</button>
                    <button class="delete-btn" onclick="deleteItem('clients', '${client.id}')">🗑️</button>
                </td>
            </tr>
        `;
    });
}

function renderSupplierTable() {
    const tableBody = document.getElementById('suppliersTableBody');
    tableBody.innerHTML = '';
    suppliers.forEach(supplier => {
        tableBody.innerHTML += `
            <tr>
                <td>${supplier.id.substring(0, 6)}...</td>
                <td>${supplier.company}</td>
                <td>${supplier.contact}</td>
                <td>${supplier.email}</td>
                <td>${supplier.phone}</td>
                <td>${supplier.address}</td>
                <td>${supplier.products}</td>
                <td class="actions-cell">
                    <button onclick="editSupplier('${supplier.id}')">✏️</button>
                    <button class="delete-btn" onclick="deleteItem('suppliers', '${supplier.id}')">🗑️</button>
                </td>
            </tr>
        `;
    });
}


// =================================================================================
// CRUD (Create, Read, Update, Delete) Operations
// =================================================================================

// --- Product ---
function openProductModal(productId = null) {
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    const modalTitle = document.getElementById('productModalTitle');

    if (productId) {
        modalTitle.textContent = 'Editar Producto';
        const product = products.find(p => p.id === productId);
        if (product) {
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productStock').value = product.stock;
            document.getElementById('productBarcode').value = product.barcode;
        }
    } else {
        modalTitle.textContent = 'Agregar Producto';
    }
    document.getElementById('productModal').classList.add('active');
}

async function saveProduct(event) {
    event.preventDefault();
    const id = document.getElementById('productId').value;
    const data = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        barcode: document.getElementById('productBarcode').value,
    };

    try {
        if (id) {
            await updateDoc(doc(db, "products", id), data);
        } else {
            await addDoc(collection(db, "products"), data);
        }
        closeProductModal();
        await loadAllData();
        renderAll();
    } catch (error) {
        console.error("Error saving product:", error);
        alert("Error al guardar el producto.");
    }
}

function editProduct(id) {
    openProductModal(id);
}


// --- Client ---
function openClientModal(clientId = null) {
    document.getElementById('clientForm').reset();
    document.getElementById('clientId').value = '';
    const modalTitle = document.getElementById('clientModalTitle');

    if (clientId) {
        modalTitle.textContent = 'Editar Cliente';
        const client = clients.find(c => c.id === clientId);
        if (client) {
            document.getElementById('clientId').value = client.id;
            document.getElementById('clientName').value = client.name;
            document.getElementById('clientEmail').value = client.email;
            document.getElementById('clientPhone').value = client.phone;
            document.getElementById('clientAddress').value = client.address;
        }
    } else {
        modalTitle.textContent = 'Agregar Cliente';
    }
    document.getElementById('clientModal').classList.add('active');
}

async function saveClient(event) {
    event.preventDefault();
    const id = document.getElementById('clientId').value;
    const data = {
        name: document.getElementById('clientName').value,
        email: document.getElementById('clientEmail').value,
        phone: document.getElementById('clientPhone').value,
        address: document.getElementById('clientAddress').value,
    };

    try {
        if (id) {
            await updateDoc(doc(db, "clients", id), data);
        } else {
            await addDoc(collection(db, "clients"), data);
        }
        closeClientModal();
        await loadAllData();
        renderClientTable();
    } catch (error) {
        console.error("Error saving client:", error);
        alert("Error al guardar el cliente.");
    }
}

function editClient(id) {
    openClientModal(id);
}

// --- Supplier ---
function openSupplierModal(supplierId = null) {
    document.getElementById('supplierForm').reset();
    document.getElementById('supplierId').value = '';
    const modalTitle = document.getElementById('supplierModalTitle');

    if (supplierId) {
        modalTitle.textContent = 'Editar Proveedor';
        const supplier = suppliers.find(s => s.id === supplierId);
        if (supplier) {
            document.getElementById('supplierId').value = supplier.id;
            document.getElementById('supplierCompany').value = supplier.company;
            document.getElementById('supplierContact').value = supplier.contact;
            document.getElementById('supplierEmail').value = supplier.email;
            document.getElementById('supplierPhone').value = supplier.phone;
            document.getElementById('supplierAddress').value = supplier.address;
            document.getElementById('supplierProducts').value = supplier.products;
        }
    } else {
        modalTitle.textContent = 'Agregar Proveedor';
    }
    document.getElementById('supplierModal').classList.add('active');
}

async function saveSupplier(event) {
    event.preventDefault();
    const id = document.getElementById('supplierId').value;
    const data = {
        company: document.getElementById('supplierCompany').value,
        contact: document.getElementById('supplierContact').value,
        email: document.getElementById('supplierEmail').value,
        phone: document.getElementById('supplierPhone').value,
        address: document.getElementById('supplierAddress').value,
        products: document.getElementById('supplierProducts').value,
    };

    try {
        if (id) {
            await updateDoc(doc(db, "suppliers", id), data);
        } else {
            await addDoc(collection(db, "suppliers"), data);
        }
        closeSupplierModal();
        await loadAllData();
        renderSupplierTable();
    } catch (error) {
        console.error("Error saving supplier:", error);
        alert("Error al guardar el proveedor.");
    }
}

function editSupplier(id) {
    openSupplierModal(id);
}

// --- Generic Delete ---
async function deleteItem(collectionName, id) {
    if (confirm(`¿Estás seguro de que quieres eliminar este elemento?`)) {
        try {
            await deleteDoc(doc(db, collectionName, id));
            console.log(`${collectionName} item ${id} deleted.`);
            await loadAllData();
            renderAll();
        } catch (error) {
            console.error(`Error deleting item from ${collectionName}:`, error);
            alert("Error al eliminar el elemento.");
        }
    }
}


// =================================================================================
// Point of Sale (POS) & Cart Logic
// =================================================================================

function searchProducts() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm) || (p.barcode && p.barcode.includes(searchTerm)));
    renderProductGrid(filtered);
}

function handleBarcodeInput(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
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
        alert('Producto no encontrado con ese código de barras.');
    }
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (product.stock <= 0) {
        alert("Producto sin stock.");
        return;
    }

    const cartItem = cart.find(item => item.id === productId);
    if (cartItem) {
        if (cartItem.quantity < product.stock) {
            cartItem.quantity++;
        } else {
            alert("Stock insuficiente.");
        }
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCart();
}

function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const completeBtn = document.getElementById('completeBtn');

    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart"><p>No hay productos en el carrito</p></div>';
        cartTotal.style.display = 'none';
        completeBtn.disabled = true;
    } else {
        cartItems.innerHTML = '';
        let subtotal = 0;
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            cartItems.innerHTML += `
                <div class="cart-item">
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">$${item.price.toFixed(2)} x ${item.quantity} = $${itemTotal.toFixed(2)}</div>
                    </div>
                    <div class="cart-item-actions">
                        <button class="quantity-btn" onclick="changeQuantity('${item.id}', -1)">-</button>
                        <span class="cart-item-quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="changeQuantity('${item.id}', 1)">+</button>
                        <button class="remove-btn" onclick="removeFromCart('${item.id}')">🗑️</button>
                    </div>
                </div>
            `;
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
    if (!cartItem) return;

    const product = products.find(p => p.id === productId);
    
    if (amount > 0 && cartItem.quantity < product.stock) {
        cartItem.quantity++;
    } else if (amount < 0) {
        cartItem.quantity--;
        if (cartItem.quantity <= 0) {
            cart = cart.filter(item => item.id !== productId);
        }
    } else if (amount > 0) {
        alert("Stock insuficiente");
    }

    updateCart();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

function clearCart() {
    cart = [];
    updateCart();
}

async function completeSale() {
    if (cart.length === 0) return;

    const total = parseFloat(document.getElementById('total').textContent.replace('$', ''));
    const paymentMethod = document.querySelector('.payment-method.selected input').value;

    const batch = writeBatch(db);

    const sale = {
        date: new Date().toISOString(),
        items: cart.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price, category: item.category })),
        total,
        paymentMethod
    };
    
    // 1. Update stock for each product in the cart
    for (const item of cart) {
        const productRef = doc(db, "products", item.id);
        const newStock = item.stock - item.quantity;
        batch.update(productRef, { stock: newStock });
    }
    
    // 2. Add the new sale document
    const salesRef = doc(collection(db, "sales"));
    batch.set(salesRef, sale);

    try {
        await batch.commit();
        alert('¡Venta completada con éxito!');
        clearCart();
        await loadAllData(); // Reload data to reflect stock changes
        renderAll();
    } catch (error) {
        console.error("Error completing sale:", error);
        alert("Error al completar la venta. El stock puede no estar actualizado. Por favor, refresca la página.");
    }
}


// =================================================================================
// Reports Logic
// =================================================================================

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
    
    if (timeRange === 'today') {
        const today = now.toISOString().split('T')[0];
        return sales.filter(s => s.date.startsWith(today));
    } 
    
    const startTime = new Date(now);
    if (timeRange === 'week') {
        startTime.setDate(now.getDate() - now.getDay()); // Start of the week (Sunday)
    } else if (timeRange === 'month') {
        startTime.setDate(1); // Start of the month
    } else if (timeRange === 'year') {
        startTime.setMonth(0, 1); // Start of the year
    }
    
    startTime.setHours(0, 0, 0, 0); // Set to beginning of the day

    return sales.filter(s => new Date(s.date) >= startTime);
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
        const category = item.category || 'Sin Categoría';
        acc[category] = (acc[category] || 0) + (item.price * item.quantity);
        return acc;
    }, {});

    const ctx = document.getElementById('category-chart').getContext('2d');
    if(categoryChart) categoryChart.destroy();
    
    categoryChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(categoryData),
            datasets: [{
                data: Object.values(categoryData),
                backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'],
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function updatePaymentMethodChart(filteredSales) {
    const paymentData = filteredSales.reduce((acc, sale) => {
        acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + 1;
        return acc;
    }, {});

    const ctx = document.getElementById('payment-method-chart').getContext('2d');
    if(paymentMethodChart) paymentMethodChart.destroy();
    
    paymentMethodChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(paymentData).map(p => p.charAt(0).toUpperCase() + p.slice(1)),
            datasets: [{
                data: Object.values(paymentData),
                backgroundColor: ['#6366f1', '#10b981', '#f59e0b'],
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
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
        tableBody.innerHTML += `
            <tr>
                <td>${p.name}</td>
                <td>${p.quantity}</td>
                <td>$${p.revenue.toFixed(2)}</td>
            </tr>
        `;
    });
}

function exportPDF() {
    alert('La funcionalidad de exportar a PDF no está implementada en esta versión.');
}


// =================================================================================
// UI & Utility Functions
// =================================================================================

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
    const activeSection = document.getElementById(`${sectionId}-section`);
    if (activeSection) {
      activeSection.classList.add('active');
    }
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const activeNavItem = document.getElementById(`nav-${sectionId}`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
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

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
}

function closeClientModal() {
    document.getElementById('clientModal').classList.remove('active');
}

function closeSupplierModal() {
    document.getElementById('supplierModal').classList.remove('active');
}

// Make functions globally available if they are called directly from HTML onclick attributes
window.showSection = showSection;
window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
window.saveProduct = saveProduct;
window.editProduct = editProduct;
window.openClientModal = openClientModal;
window.closeClientModal = closeClientModal;
window.saveClient = saveClient;
window.editClient = editClient;
window.openSupplierModal = openSupplierModal;
window.closeSupplierModal = closeSupplierModal;
window.saveSupplier = saveSupplier;
window.editSupplier = editSupplier;
window.deleteItem = deleteItem;
window.searchProducts = searchProducts;
window.handleBarcodeInput = handleBarcodeInput;
window.addByBarcode = addByBarcode;
window.addToCart = addToCart;
window.changeQuantity = changeQuantity;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.selectPayment = selectPayment;
window.calculateChange = calculateChange;
window.complete
