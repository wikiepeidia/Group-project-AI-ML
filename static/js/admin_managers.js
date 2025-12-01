let managersData = [];

async function loadManagers() {
    try {
        const response = await fetch('/api/admin/users');
        const users = await response.json();
        managersData = users.filter((u) => u.role === 'manager' || u.role === 'admin');
        renderManagersTable();
    } catch (error) {
        showAlert('error', 'Lỗi tải danh sách: ' + error.message);
    }
}

function renderManagersTable() {
    const tbody = document.getElementById('managersTableBody');

    if (managersData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Chưa có Manager nào</td></tr>';
        return;
    }

    tbody.innerHTML = managersData
        .map(
            (manager) => `
        <tr>
            <td>${manager.id}</td>
            <td>${manager.name}</td>
            <td>${manager.email}</td>
            <td><span class="badge bg-${manager.role === 'admin' ? 'danger' : 'warning'}">${manager.role.toUpperCase()}</span></td>
            <td>${new Date(manager.created_at).toLocaleDateString('vi-VN')}</td>
            <td>
                ${
                    manager.role !== 'admin'
                        ? `
                    <button class="btn btn-sm btn-danger" onclick="removeManager(${manager.id}, '${manager.email}')">
                        <i class="fas fa-trash"></i> Xóa
                    </button>
                `
                        : '<span class="text-muted">Admin gốc</span>'
                }
            </td>
        </tr>
    `
        )
        .join('');
}

function openAddManagerModal() {
    document.getElementById('managerModalTitle').textContent = 'Thêm Manager';
    document.getElementById('managerId').value = '';
    document.getElementById('managerEmail').value = '';
    document.getElementById('managerName').value = '';
    document.getElementById('managerPassword').value = '';
    document.getElementById('passwordGroup').style.display = 'block';
    new bootstrap.Modal(document.getElementById('managerModal')).show();
}

async function saveManager() {
    const email = document.getElementById('managerEmail').value.trim();
    const name = document.getElementById('managerName').value.trim();
    const password = document.getElementById('managerPassword').value;

    if (!email || !name) {
        showAlert('error', 'Vui lòng điền đầy đủ thông tin');
        return;
    }

    if (!password) {
        showAlert('error', 'Vui lòng nhập mật khẩu');
        return;
    }

    try {
        const response = await fetch('/api/admin/create-manager', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name, password }),
        });

        const data = await response.json();

        if (data.success) {
            showAlert('success', 'Tạo Manager thành công!');
            bootstrap.Modal.getInstance(document.getElementById('managerModal')).hide();
            loadManagers();
        } else {
            showAlert('error', data.message);
        }
    } catch (error) {
        showAlert('error', 'Lỗi: ' + error.message);
    }
}

async function removeManager(managerId, email) {
    if (!confirm(`Bạn chắc chắn muốn xóa Manager "${email}"?`)) return;

    try {
        const response = await fetch(`/api/admin/users/${managerId}`, {
            method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
            showAlert('success', 'Xóa Manager thành công!');
            loadManagers();
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

document.addEventListener('DOMContentLoaded', loadManagers);
