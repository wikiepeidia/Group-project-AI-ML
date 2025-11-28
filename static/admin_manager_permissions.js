let usersData = [];

async function loadUsers() {
    try {
        const response = await fetch('/api/manager/users-permissions');
        const data = await response.json();

        if (data.success) {
            usersData = data.users;
            renderUsersTable();
        } else {
            showAlert('error', data.message);
        }
    } catch (error) {
        showAlert('error', 'Lỗi tải danh sách user: ' + error.message);
    }
}

function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');

    if (usersData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Không có user nào</td></tr>';
        return;
    }

    tbody.innerHTML = usersData
        .map(
            user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="badge bg-${user.role === 'admin' ? 'danger' : user.role === 'manager' ? 'warning' : 'info'}">${user.role}</span></td>
            <td>
                ${
                    user.permissions.filter(p => p).map(
                        p => `
                    <span class="badge bg-success badge-permission">
                        ${p}
                        <button class="btn-close btn-close-white" style="font-size: 0.5rem;" onclick="revokePermission(${user.id}, '${p}')" title="Revoke"></button>
                    </span>
                `
                    ).join('') || '<em class="text-muted">Chưa có quyền</em>'
                }
            </td>
            <td>
                ${
                    user.role === 'user'
                        ? `
                    <button class="btn btn-sm btn-primary" onclick="openGrantModal(${user.id}, '${user.name}')">
                        <i class="fas fa-plus"></i> Cấp quyền
                    </button>
                `
                        : '<span class="text-muted">N/A</span>'
                }
            </td>
        </tr>
    `
        )
        .join('');
}

function openGrantModal(userId, userName) {
    document.getElementById('grantUserId').value = userId;
    document.getElementById('grantUserName').textContent = userName;
    new bootstrap.Modal(document.getElementById('grantPermissionModal')).show();
}

async function grantPermission() {
    const userId = parseInt(document.getElementById('grantUserId').value, 10);
    const permissionType = document.getElementById('permissionTypeSelect').value;

    try {
        const response = await fetch('/api/manager/permissions/grant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, permission_type: permissionType })
        });

        const data = await response.json();

        if (data.success) {
            showAlert('success', 'Cấp quyền thành công!');
            bootstrap.Modal.getInstance(document.getElementById('grantPermissionModal')).hide();
            loadUsers();
        } else {
            showAlert('error', data.message);
        }
    } catch (error) {
        showAlert('error', 'Lỗi: ' + error.message);
    }
}

async function revokePermission(userId, permissionType) {
    if (!confirm(`Bạn chắc chắn muốn thu hồi quyền "${permissionType}"?`)) return;

    try {
        const response = await fetch('/api/manager/permissions/revoke', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, permission_type: permissionType })
        });

        const data = await response.json();

        if (data.success) {
            showAlert('success', 'Thu hồi quyền thành công!');
            loadUsers();
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

document.addEventListener('DOMContentLoaded', loadUsers);
