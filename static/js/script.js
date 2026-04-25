let currentSection = 'dashboard';

// Show different sections
function showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.add('d-none'));
    document.getElementById(section).classList.remove('d-none');
    document.getElementById('pageTitle').textContent = section.charAt(0).toUpperCase() + section.slice(1);
    currentSection = section;
}

// Load all data on start
async function loadAllData() {
    await Promise.all([
        loadProducts(),
        loadCustomers(),
        loadOrders(),
        loadReviews()
    ]);
    renderDashboard();
}

// ====================== PRODUCTS ======================
async function loadProducts() {
    const res = await fetch('/api/products');
    window.allProducts = await res.json();
    renderProducts();
}

function renderProducts() {
    const tbody = document.getElementById('productsTable');
    tbody.innerHTML = `<thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead><tbody></tbody>`;
    const body = tbody.querySelector('tbody');

    window.allProducts.forEach(p => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${p.name}</td>
            <td><span class="badge bg-info">${p.category || 'N/A'}</span></td>
            <td>₹${parseFloat(p.price).toLocaleString('en-IN')}</td>
            <td>${p.stock}</td>
            <td><span class="badge ${p.status === 'In Stock' ? 'status-active' : 'status-cancelled'}">${p.status}</span></td>
            <td>
                <button onclick="editProduct('${p._id}')" class="btn btn-sm btn-outline-primary me-1"><i class="bi bi-pencil"></i></button>
                <button onclick="deleteProduct('${p._id}')" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
            </td>`;
        body.appendChild(row);
    });
}

function openProductModal() {
    document.getElementById('productModalTitle').textContent = 'Add Product';
    document.getElementById('productId').value = '';
    document.getElementById('productModal').querySelectorAll('input, select').forEach(i => i.value = '');
    new bootstrap.Modal(document.getElementById('productModal')).show();
}

async function saveProduct() {
    const id = document.getElementById('productId').value;
    const data = {
        name: document.getElementById('pName').value,
        category: document.getElementById('pCategory').value,
        price: parseFloat(document.getElementById('pPrice').value),
        stock: parseInt(document.getElementById('pStock').value),
        status: document.getElementById('pStatus').value
    };

    const url = id ? `/api/products/${id}` : '/api/products';
    const method = id ? 'PUT' : 'POST';

    await fetch(url, { method, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
    bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
    loadProducts();
    renderDashboard();
}

async function editProduct(id) {
    const res = await fetch(`/api/products/${id}`);
    const p = await res.json();
    document.getElementById('productModalTitle').textContent = 'Edit Product';
    document.getElementById('productId').value = p._id;
    document.getElementById('pName').value = p.name;
    document.getElementById('pCategory').value = p.category || '';
    document.getElementById('pPrice').value = p.price;
    document.getElementById('pStock').value = p.stock;
    document.getElementById('pStatus').value = p.status;
    new bootstrap.Modal(document.getElementById('productModal')).show();
}

async function deleteProduct(id) {
    if (confirm('Delete this product from MongoDB?')) {
        await fetch(`/api/products/${id}`, { method: 'DELETE' });
        loadProducts();
        renderDashboard();
    }
}

// ====================== CUSTOMERS ======================
async function loadCustomers() {
    const res = await fetch('/api/customers');
    window.allCustomers = await res.json();
    renderCustomers();
}

function renderCustomers() {
    const tbody = document.getElementById('customersTable');
    tbody.innerHTML = `<thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Actions</th></tr></thead><tbody></tbody>`;
    const body = tbody.querySelector('tbody');
    window.allCustomers.forEach(c => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${c.name}</td>
            <td>${c.email}</td>
            <td>${c.phone || 'N/A'}</td>
            <td>
                <button onclick="editCustomer('${c._id}')" class="btn btn-sm btn-outline-primary me-1"><i class="bi bi-pencil"></i></button>
                <button onclick="deleteCustomer('${c._id}')" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
            </td>`;
        body.appendChild(row);
    });
}

function openCustomerModal() {
    document.getElementById('customerModalTitle').textContent = 'Add Customer';
    document.getElementById('customerId').value = '';
    document.getElementById('customerModal').querySelectorAll('input').forEach(i => i.value = '');
    new bootstrap.Modal(document.getElementById('customerModal')).show();
}

async function saveCustomer() {
    const id = document.getElementById('customerId').value;
    const data = {
        name: document.getElementById('cName').value,
        email: document.getElementById('cEmail').value,
        phone: document.getElementById('cPhone').value
    };
    const url = id ? `/api/customers/${id}` : '/api/customers';
    const method = id ? 'PUT' : 'POST';
    await fetch(url, { method, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
    bootstrap.Modal.getInstance(document.getElementById('customerModal')).hide();
    loadCustomers();
    renderDashboard();
}

async function editCustomer(id) {
    const res = await fetch(`/api/customers/${id}`);
    const c = await res.json();
    document.getElementById('customerModalTitle').textContent = 'Edit Customer';
    document.getElementById('customerId').value = c._id;
    document.getElementById('cName').value = c.name;
    document.getElementById('cEmail').value = c.email;
    document.getElementById('cPhone').value = c.phone || '';
    new bootstrap.Modal(document.getElementById('customerModal')).show();
}

async function deleteCustomer(id) {
    if (confirm('Delete customer?')) {
        await fetch(`/api/customers/${id}`, { method: 'DELETE' });
        loadCustomers();
        renderDashboard();
    }
}

// ====================== ORDERS ======================
async function loadOrders() {
    const res = await fetch('/api/orders');
    window.allOrders = await res.json();
    renderOrders();
    renderRecentOrders();
}

function renderOrders() {
    const tbody = document.getElementById('ordersTable');
    tbody.innerHTML = `<thead><tr><th>Customer</th><th>Product</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead><tbody></tbody>`;
    const body = tbody.querySelector('tbody');
    window.allOrders.forEach(o => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${o.customer}</td>
            <td>${o.product}</td>
            <td>₹${parseFloat(o.amount).toLocaleString('en-IN')}</td>
            <td><span class="badge ${o.status === 'Delivered' ? 'status-active' : o.status === 'Cancelled' ? 'status-cancelled' : 'status-pending'}">${o.status}</span></td>
            <td>
                <button onclick="editOrder('${o._id}')" class="btn btn-sm btn-outline-primary me-1"><i class="bi bi-pencil"></i></button>
                <button onclick="deleteOrder('${o._id}')" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
            </td>`;
        body.appendChild(row);
    });
}

function renderRecentOrders() {
    const tbody = document.getElementById('recentOrdersTable');
    tbody.innerHTML = `<thead><tr><th>Customer</th><th>Product</th><th>Amount</th><th>Status</th></tr></thead><tbody></tbody>`;
    const body = tbody.querySelector('tbody');
    const recent = window.allOrders.slice(0, 5);
    recent.forEach(o => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${o.customer}</td><td>${o.product}</td><td>₹${parseFloat(o.amount).toLocaleString('en-IN')}</td><td><span class="badge ${o.status === 'Delivered' ? 'status-active' : 'status-pending'}">${o.status}</span></td>`;
        body.appendChild(row);
    });
}

function openOrderModal() {
    document.getElementById('orderModalTitle').textContent = 'Add Order';
    document.getElementById('orderId').value = '';
    document.getElementById('orderModal').querySelectorAll('input, select').forEach(i => i.value = '');
    new bootstrap.Modal(document.getElementById('orderModal')).show();
}

async function saveOrder() {
    const id = document.getElementById('orderId').value;
    const data = {
        customer: document.getElementById('oCustomer').value,
        product: document.getElementById('oProduct').value,
        amount: parseFloat(document.getElementById('oAmount').value),
        status: document.getElementById('oStatus').value
    };
    const url = id ? `/api/orders/${id}` : '/api/orders';
    const method = id ? 'PUT' : 'POST';
    await fetch(url, { method, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
    bootstrap.Modal.getInstance(document.getElementById('orderModal')).hide();
    loadOrders();
    renderDashboard();
}

async function editOrder(id) {
    const res = await fetch(`/api/orders/${id}`);
    const o = await res.json();
    document.getElementById('orderModalTitle').textContent = 'Edit Order';
    document.getElementById('orderId').value = o._id;
    document.getElementById('oCustomer').value = o.customer;
    document.getElementById('oProduct').value = o.product;
    document.getElementById('oAmount').value = o.amount;
    document.getElementById('oStatus').value = o.status;
    new bootstrap.Modal(document.getElementById('orderModal')).show();
}

async function deleteOrder(id) {
    if (confirm('Delete order?')) {
        await fetch(`/api/orders/${id}`, { method: 'DELETE' });
        loadOrders();
        renderDashboard();
    }
}

// ====================== REVIEWS ======================
async function loadReviews() {
    const res = await fetch('/api/reviews');
    window.allReviews = await res.json();
    renderReviews();
}

function renderReviews() {
    const tbody = document.getElementById('reviewsTable');
    tbody.innerHTML = `<thead><tr><th>Customer</th><th>Product</th><th>Rating</th><th>Comment</th><th>Actions</th></tr></thead><tbody></tbody>`;
    const body = tbody.querySelector('tbody');
    window.allReviews.forEach(r => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${r.customer}</td>
            <td>${r.product}</td>
            <td>${'⭐'.repeat(r.rating)}</td>
            <td>${r.comment || 'No comment'}</td>
            <td>
                <button onclick="editReview('${r._id}')" class="btn btn-sm btn-outline-primary me-1"><i class="bi bi-pencil"></i></button>
                <button onclick="deleteReview('${r._id}')" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
            </td>`;
        body.appendChild(row);
    });
}

function openReviewModal() {
    document.getElementById('reviewModalTitle').textContent = 'Add Review';
    document.getElementById('reviewId').value = '';
    document.getElementById('reviewModal').querySelectorAll('input, textarea').forEach(i => i.value = '');
    new bootstrap.Modal(document.getElementById('reviewModal')).show();
}

async function saveReview() {
    const id = document.getElementById('reviewId').value;
    const data = {
        customer: document.getElementById('rCustomer').value,
        product: document.getElementById('rProduct').value,
        rating: parseInt(document.getElementById('rRating').value),
        comment: document.getElementById('rComment').value
    };
    const url = id ? `/api/reviews/${id}` : '/api/reviews';
    const method = id ? 'PUT' : 'POST';
    await fetch(url, { method, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
    bootstrap.Modal.getInstance(document.getElementById('reviewModal')).hide();
    loadReviews();
}

async function editReview(id) {
    const res = await fetch(`/api/reviews/${id}`);
    const r = await res.json();
    document.getElementById('reviewModalTitle').textContent = 'Edit Review';
    document.getElementById('reviewId').value = r._id;
    document.getElementById('rCustomer').value = r.customer;
    document.getElementById('rProduct').value = r.product;
    document.getElementById('rRating').value = r.rating;
    document.getElementById('rComment').value = r.comment || '';
    new bootstrap.Modal(document.getElementById('reviewModal')).show();
}

async function deleteReview(id) {
    if (confirm('Delete review?')) {
        await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
        loadReviews();
    }
}

// ====================== DASHBOARD ======================
function renderDashboard() {
    const totalProducts = window.allProducts ? window.allProducts.length : 0;
    const totalCustomers = window.allCustomers ? window.allCustomers.length : 0;
    const totalOrders = window.allOrders ? window.allOrders.length : 0;
    const totalRevenue = window.allOrders ? window.allOrders.reduce((sum, o) => sum + parseFloat(o.amount || 0), 0) : 0;

    document.getElementById('statsCards').innerHTML = `
        <div class="col-md-3"><div class="card p-4 text-center"><h3 class="text-primary">${totalProducts}</h3><p class="mb-0">Total Products</p></div></div>
        <div class="col-md-3"><div class="card p-4 text-center"><h3 class="text-success">${totalCustomers}</h3><p class="mb-0">Total Customers</p></div></div>
        <div class="col-md-3"><div class="card p-4 text-center"><h3 class="text-warning">${totalOrders}</h3><p class="mb-0">Total Orders</p></div></div>
        <div class="col-md-3"><div class="card p-4 text-center"><h3 class="text-info">₹${totalRevenue.toLocaleString('en-IN')}</h3><p class="mb-0">Total Revenue</p></div></div>`;
}

// Logout (just for fun)
function logout() {
    alert('👋 Logged out! (Demo)');
}

// Initial Load
window.onload = () => {
    loadAllData();
    console.log('%c🚀 Full E-Commerce Management System Ready! MongoDB Live hai bhai!', 'color:#00d4ff;font-size:14px');
};