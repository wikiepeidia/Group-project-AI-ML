let allUsers = [];
let currentFilter = 'all';

async function loadUsers() {
    try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) throw new Error('Failed to load users');

        const data = await response.json();
        allUsers = data.users || [];

        updateStatistics();
        renderUsersTable();
    } catch (error) {
        showAlert('error', 'Lỗi tải danh sách: ' + error.message);
    }
}

function updateStatistics() {
    const adminCount = allUsers.filter((u) => u.role === 'admin').length;
    const managerCount = allUsers.filter((u) => u.role === 'manager').length;
    const userCount = allUsers.filter((u) => u.role === 'user').length;

    document.getElementById('adminCount').textContent = adminCount;
    document.getElementById('managerCount').textContent = managerCount;
    document.getElementById('userCount').textContent = userCount;
}

function filterByRole(role) {
    currentFilter = role;

    document.querySelectorAll('#roleTabs .nav-link').forEach((link) => {
        link.classList.remove('active');
    });
    document.querySelector(`#roleTabs .nav-link[data-role="${role}"]`).classList.add('active');

    renderUsersTable();
}

function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');

    let filteredUsers = allUsers;
    if (currentFilter !== 'all') {
        filteredUsers = allUsers.filter((u) => u.role === currentFilter);
    }

    if (filteredUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Không có tài khoản nào</td></tr>';
        return;
    }

    tbody.innerHTML = filteredUsers
        .map((user) => {
            const badgeClass =
                user.role === 'admin' ? 'bg-danger' : user.role === 'manager' ? 'bg-warning' : 'bg-primary';
            const roleText = user.role.toUpperCase();

            let actionButtons = '';

            if (user.role === 'user') {
                actionButtons = `
                <button class="btn btn-action btn-success btn-sm" onclick="promoteToManager(${user.id}, '${user.email}')">
                    <i class="fas fa-arrow-up"></i> Nâng lên Manager
                </button>
            `;
            } else if (user.role === 'manager') {
                actionButtons = `
                <button class="btn btn-action btn-warning btn-sm" onclick="demoteToUser(${user.id}, '${user.email}')">
                    <i class="fas fa-arrow-down"></i> Hạ xuống User
                </button>
            `;
            } else {
                actionButtons = '<span class="text-muted"><i class="fas fa-lock"></i> Không thể thay đổi</span>';
            }

            return `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span class="badge ${badgeClass}">${roleText}</span></td>
                <td>${new Date(user.created_at).toLocaleDateString('vi-VN')}</td>
                <td>${actionButtons}</td>
            </tr>
        `;
        })
        .join('');
}

async function promoteToManager(userId, email) {
    if (!confirm(`Bạn chắc chắn muốn nâng cấp "${email}" lên Manager?\n\nManager sẽ có quyền cấp phát quyền cho User khác.`)) {
        return;
    }

    try {
        const response = await fetch('/api/admin/users/promote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, role: 'manager' }),
        });

        const data = await response.json();

        if (data.success) {
            showAlert('success', `✅ Đã nâng cấp "${email}" lên Manager thành công!`);
            loadUsers();
        } else {
            showAlert('error', data.message || 'Lỗi nâng cấp');
        }
    } catch (error) {
        showAlert('error', 'Lỗi: ' + error.message);
    }
}

async function demoteToUser(userId, email) {
    if (!confirm(`Bạn chắc chắn muốn hạ cấp "${email}" xuống User?\n\nManager sẽ mất quyền cấp phát quyền cho User khác.`)) {
        return;
    }

    try {
        const response = await fetch('/api/admin/users/demote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, role: 'user' }),
        });

        const data = await response.json();

        if (data.success) {
            showAlert('success', `✅ Đã hạ cấp "${email}" xuống User thành công!`);
            loadUsers();
        } else {
            showAlert('error', data.message || 'Lỗi hạ cấp');
        }
    } catch (error) {
        showAlert('error', 'Lỗi: ' + error.message);
    }
}

function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.minWidth = '300px';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
}

document.addEventListener('DOMContentLoaded', loadUsers);
