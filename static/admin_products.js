let productsData = [];
let editingId = null;

async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const data = await response.json();

        if (data.success) {
            productsData = data.products;
            renderProductsTable();
        } else {
            showAlert('error', 'Lỗi tải dữ liệu');
        }
    } catch (error) {
        showAlert('error', 'Lỗi: ' + error.message);
    }
}

function renderProductsTable() {
    const tbody = document.getElementById('productsTableBody');

    if (productsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">Chưa có sản phẩm nào</td></tr>';
        return;
    }

    tbody.innerHTML = productsData
        .map(
            product => `
        <tr>
            <td><strong>${product.code}</strong></td>
            <td>${product.name}</td>
            <td>${product.category || '-'}</td>
            <td>${product.unit}</td>
            <td>${Number(product.price).toLocaleString('vi-VN')}đ</td>
            <td><span class="badge bg-${product.stock_quantity > 0 ? 'success' : 'danger'}">${product.stock_quantity}</span></td>
            <td>${product.description || '-'}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editProduct(${product.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id}, '${product.code}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `
        )
        .join('');
}

function openAddProductModal() {
    editingId = null;
    document.getElementById('productModalTitle').textContent = 'Thêm Sản phẩm';
    document.getElementById('productId').value = '';
    document.getElementById('productCode').value = '';
    document.getElementById('productCode').disabled = false;
    document.getElementById('productName').value = '';
    document.getElementById('productCategory').value = '';
    document.getElementById('productUnit').value = 'cái';
    document.getElementById('productPrice').value = '0';
    document.getElementById('productStock').value = '0';
    document.getElementById('productDescription').value = '';
    new bootstrap.Modal(document.getElementById('productModal')).show();
}

function editProduct(id) {
    const product = productsData.find(p => p.id === id);
    if (!product) return;

    editingId = id;
    document.getElementById('productModalTitle').textContent = 'Sửa Sản phẩm';
    document.getElementById('productId').value = product.id;
    document.getElementById('productCode').value = product.code;
    document.getElementById('productCode').disabled = true;
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category || '';
    document.getElementById('productUnit').value = product.unit;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock_quantity;
    document.getElementById('productDescription').value = product.description || '';
    new bootstrap.Modal(document.getElementById('productModal')).show();
}

async function saveProduct() {
    const code = document.getElementById('productCode').value.trim();
    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value.trim();
    const unit = document.getElementById('productUnit').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock_quantity = parseInt(document.getElementById('productStock').value, 10);
    const description = document.getElementById('productDescription').value.trim();

    if (!code || !name) {
        showAlert('error', 'Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
    }

    const payload = { code, name, category, unit, price, stock_quantity, description };

    try {
        let response;
        if (editingId) {
            response = await fetch(`/api/products/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

        const data = await response.json();

        if (data.success) {
            showAlert('success', editingId ? 'Cập nhật thành công!' : 'Thêm sản phẩm thành công!');
            bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
            loadProducts();
        } else {
            showAlert('error', data.message);
        }
    } catch (error) {
        showAlert('error', 'Lỗi: ' + error.message);
    }
}

async function deleteProduct(id, code) {
    if (!confirm(`Bạn chắc chắn muốn xóa sản phẩm "${code}"?`)) return;

    try {
        const response = await fetch(`/api/products/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            showAlert('success', 'Xóa thành công!');
            loadProducts();
        } else {
            showAlert('error', data.message);
        }
    } catch (error) {
        showAlert('error', 'Lỗi: ' + error.message);
    }
}

function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('main').insertBefore(alertDiv, document.querySelector('main').firstChild);
    setTimeout(() => alertDiv.remove(), 5000);
}

document.addEventListener('DOMContentLoaded', loadProducts);
