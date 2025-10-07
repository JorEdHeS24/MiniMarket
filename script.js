// Base de datos simulada
let products = [
  {
    id: 1,
    name: "Coca Cola 350ml",
    price: 2.5,
    barcode: "7501234567890",
    stock: 50,
  },
  {
    id: 2,
    name: "Pan de molde",
    price: 3.2,
    barcode: "7502234567891",
    stock: 25,
  },
  {
    id: 3,
    name: "Leche entera 1L",
    price: 4.8,
    barcode: "7503234567892",
    stock: 30,
  },
  { id: 4, name: "Arroz 1kg", price: 5.5, barcode: "7504234567893", stock: 40 },
  {
    id: 5,
    name: "Aceite girasol 500ml",
    price: 6.75,
    barcode: "7505234567894",
    stock: 20,
  },
  {
    id: 6,
    name: "Huevos docena",
    price: 4.2,
    barcode: "7506234567895",
    stock: 35,
  },
  {
    id: 7,
    name: "Papel higiénico 4 rollos",
    price: 8.9,
    barcode: "7507234567896",
    stock: 15,
  },
  {
    id: 8,
    name: "Jabón de manos",
    price: 3.45,
    barcode: "7508234567897",
    stock: 25,
  },
  {
    id: 9,
    name: "Pasta dental",
    price: 4.6,
    barcode: "7509234567898",
    stock: 18,
  },
  {
    id: 10,
    name: "Shampoo 400ml",
    price: 7.8,
    barcode: "7510234567899",
    stock: 22,
  },
  {
    id: 11,
    name: "Galletas Oreo",
    price: 3.9,
    barcode: "7511234567890",
    stock: 45,
  },
  {
    id: 12,
    name: "Yogurt natural",
    price: 2.8,
    barcode: "7512234567891",
    stock: 28,
  },
  {
    id: 13,
    name: "Café molido 250g",
    price: 6.2,
    barcode: "7513234567892",
    stock: 32,
  },
  {
    id: 14,
    name: "Azúcar 1kg",
    price: 3.75,
    barcode: "7514234567893",
    stock: 38,
  },
  { id: 15, name: "Sal 500g", price: 1.2, barcode: "7515234567894", stock: 55 },
  {
    id: 16,
    name: "Atún enlatado",
    price: 2.95,
    barcode: "7516234567895",
    stock: 42,
  },
  {
    id: 17,
    name: "Detergente líquido",
    price: 9.5,
    barcode: "7517234567896",
    stock: 12,
  },
  {
    id: 18,
    name: "Cerveza 6 pack",
    price: 12.8,
    barcode: "7518234567897",
    stock: 16,
  },
  {
    id: 19,
    name: "Queso fresco 250g",
    price: 5.4,
    barcode: "7519234567898",
    stock: 24,
  },
  {
    id: 20,
    name: "Mantequilla 200g",
    price: 4.85,
    barcode: "7520234567899",
    stock: 29,
  },
];

let cart = [];
let sales = [];
let saleCounter = 1;

// Inicializar la aplicación
function init() {
  displayProducts(); // Mostrar productos en la sección de cajero
  updateCartDisplay(); // Actualizar el carrito
  updateDashboardStats(); // Actualizar estadísticas del dashboard
}

// Mostrar productos en la sección de cajero
function displayProducts(filteredProducts = products) {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = ""; // Limpiar el contenedor de productos

  filteredProducts.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    productCard.onclick = () => addToCart(product); // Agregar producto al carrito
    productCard.innerHTML = `
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">$${product.price.toFixed(
                      2
                    )}</div>
                    <div class="product-stock">Stock: ${product.stock}</div>
                `;
    grid.appendChild(productCard);
  });
}

// Buscar productos por nombre
function searchProducts() {
  const searchTerm = document
    .getElementById("productSearch")
    .value.toLowerCase();
  const filtered = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm)
  );
  displayProducts(filtered); // Mostrar productos filtrados
}

// Agregar producto al carrito
function addToCart(product) {
  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    if (existingItem.quantity < product.stock) {
      existingItem.quantity += 1; // Incrementar cantidad si hay stock
    } else {
      alert("Stock insuficiente");
      return;
    }
  } else {
    cart.push({ ...product, quantity: 1 }); // Agregar nuevo producto al carrito
  }

  updateCartDisplay(); // Actualizar vista del carrito
}

// Actualizar vista del carrito
function updateCartDisplay() {
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  const completeBtn = document.getElementById("completeBtn");

  if (cart.length === 0) {
    cartItems.innerHTML = `
                    <div class="empty-cart">
                        <p>No hay productos en el carrito</p>
                        <p style="font-size: 14px; margin-top: 8px;">Busca y agrega productos para comenzar</p>
                    </div>
                `;
    cartTotal.style.display = "none";
    completeBtn.disabled = true;
    return;
  }

  cartItems.innerHTML = "";
  let subtotal = 0;

  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";
    cartItem.innerHTML = `
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">$${item.price.toFixed(
                          2
                        )} c/u</div>
                    </div>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity(${
                          item.id
                        }, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${
                          item.id
                        }, 1)">+</button>
                    </div>
                    <div style="font-weight: 600;">$${itemTotal.toFixed(
                      2
                    )}</div>
                `;
    cartItems.appendChild(cartItem);
  });

  const tax = subtotal * 0.19;
  const total = subtotal + tax;

  document.getElementById("subtotal").textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById("tax").textContent = `$${tax.toFixed(2)}`;
  document.getElementById("total").textContent = `$${total.toFixed(2)}`;

  cartTotal.style.display = "block";
  completeBtn.disabled = false;
}

// Completar venta
function completeSale() {
  if (cart.length === 0) return;

  const paymentMethod = document.querySelector(
    'input[name="payment"]:checked'
  ).value;
  const total = parseFloat(
    document.getElementById("total").textContent.replace("$", "")
  );

  if (paymentMethod === "efectivo") {
    const receivedAmount =
      parseFloat(document.getElementById("receivedAmount").value) || 0;
    if (receivedAmount < total) {
      alert("El monto recibido es insuficiente");
      return;
    }
  }

  // Reducir stock
  cart.forEach((cartItem) => {
    const product = products.find((p) => p.id === cartItem.id);
    if (product) {
      product.stock -= cartItem.quantity;
    }
  });

  // Registrar venta
  const sale = {
    id: saleCounter++,
    items: [...cart],
    total: total,
    paymentMethod: paymentMethod,
    date: new Date().toLocaleString("es-ES"),
    customer: "cliente@mail.com",
  };
  sales.push(sale);

  alert(
    `Venta completada exitosamente!\nTotal: $${total.toFixed(
      2
    )}\nMétodo: ${paymentMethod}`
  );
  clearCart(); // Limpiar carrito
  updateDashboardStats(); // Actualizar estadísticas
}

// Limpiar carrito
function clearCart() {
  cart = [];
  updateCartDisplay();
  document.getElementById("receivedAmount").value = "";
}

// Actualizar estadísticas del dashboard
function updateDashboardStats() {
  const totalProducts = products.length;
  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const lowStockProducts = products.filter((p) => p.stock <= 10).length;

  document.getElementById("totalProducts").textContent = totalProducts;
  document.getElementById("totalSales").textContent = totalSales;
  document.getElementById(
    "totalRevenue"
  ).textContent = `$${totalRevenue.toFixed(2)}`;
  document.getElementById("lowStockProducts").textContent = lowStockProducts;
}

// Inicializar la aplicación al cargar la página
window.onload = init;

// Mostrar la sección seleccionada
function showSection(sectionId) {
  // Ocultar todas las secciones
  const sections = document.querySelectorAll(".section");
  sections.forEach((section) => section.classList.remove("active"));

  // Mostrar la sección seleccionada
  const selectedSection = document.getElementById(`${sectionId}-section`);
  if (selectedSection) {
    selectedSection.classList.add("active");
  }

  // Actualizar la clase "active" en los elementos de la barra lateral
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => item.classList.remove("active"));

  const activeNavItem = Array.from(navItems).find(
    (item) => item.getAttribute("onclick") === `showSection('${sectionId}')`
  );
  if (activeNavItem) {
    activeNavItem.classList.add("active");
  }
}

// Abrir el modal de agregar producto
function openAddProductModal() {
  document.getElementById("addProductModal").classList.add("show");
}

// Cerrar el modal de agregar producto
function closeAddProductModal() {
  document.getElementById("addProductModal").classList.remove("show");
  document.getElementById("addProductForm").reset();
}

// Agregar un nuevo producto
function addNewProduct(event) {
  event.preventDefault();

  try {
    const name = document.getElementById("newProductName").value;
    const category = document.getElementById("newProductCategory").value;
    const price = parseFloat(document.getElementById("newProductPrice").value);
    const stock = parseInt(document.getElementById("newProductStock").value);

    if (
      !name ||
      !category ||
      isNaN(price) ||
      isNaN(stock) ||
      price <= 0 ||
      stock <= 0
    ) {
      throw new Error("Por favor, completa todos los campos correctamente.");
    }

    const newProduct = {
      id: products.length + 1,
      name,
      price,
      stock,
      category,
      barcode: generateBarcode(),
    };

    products.push(newProduct);
    displayProducts();
    updateProductTable();
    closeAddProductModal();

    alert("Producto agregado exitosamente!");
  } catch (error) {
    alert(error.message);
  }
}

// Actualizar la tabla de productos en la sección de proveedores
function updateProductTable() {
  const tableBody = document.querySelector(
    "#productos-section .table-content tbody"
  );
  tableBody.innerHTML = ""; // Limpiar la tabla

  products.forEach((product) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.stock}</td>
            <td>
                <button class="action-btn btn-edit" onclick="editProduct(${
                  product.id
                })">✏️ Editar</button>
                <button class="action-btn btn-delete" onclick="deleteProduct(${
                  product.id
                })">🗑️ Eliminar</button>
            </td>
        `;
    tableBody.appendChild(row);
  });
}

// Generar un código de barras simulado
function generateBarcode() {
  return `7520${Math.floor(Math.random() * 1000000000)
    .toString()
    .padStart(9, "0")}`;
}
