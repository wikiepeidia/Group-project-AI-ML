// Tạo tài khoản mới
document.getElementById('createUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = {
        email: formData.get('email'),
        password: formData.get('password'),
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        role: 'user' // Force user role
    };

    try {
        const response = await fetch('/api/create-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            alert('✓ Account created successfully!');
            e.target.reset();
            loadUserList(); // Reload user list
        } else {
            alert('✗ Error: ' + (result.message || 'Unable to create account'));
        }
    } catch (error) {
        alert('✗ Connection error: ' + error.message);
    }
});

// Load danh sách user
async function loadUserList() {
    const tbody = document.getElementById('userListBody');
    tbody.innerHTML = `
    <tr>
        <td colspan="5" style="padding: 40px; text-align: center; color: #6b7280;">
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 10px;"></i>
                            <p>Loading list...</p>
        </td>
    </tr>
`;

    try {
        const response = await fetch('/api/users?role=user');
        const result = await response.json();

        if (response.ok && result.users && result.users.length > 0) {
            tbody.innerHTML = result.users.map(user => `
            <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px;">${user.email}</td>
                <td style="padding: 12px;">${user.first_name || ''} ${user.last_name || ''}</td>
                <td style="padding: 12px; text-align: center;">
                    <span style="background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: 600;">
                        USER
                    </span>
                </td>
                <td style="padding: 12px; text-align: center;">
                    <span style="background: #d1fae5; color: #065f46; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: 600;">
                        <i class="fas fa-check-circle"></i> Active
                    </span>
                </td>
                <td style="padding: 12px; text-align: center;">
                    <button class="btn-action btn-edit" onclick="editUser(${user.id})" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-reset" onclick="resetPassword(${user.id}, '${user.email}')" title="Reset password">
                        <i class="fas fa-key"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteUser(${user.id}, '${user.email}')" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        } else {
            tbody.innerHTML = `
            <tr>
                <td colspan="5" style="padding: 40px; text-align: center; color: #6b7280;">
                    <i class="fas fa-users" style="font-size: 2rem; margin-bottom: 10px; opacity: 0.3;"></i>
                    <p>No users have been created</p>
                </td>
            </tr>
        `;
        }
    } catch (error) {
        tbody.innerHTML = `
        <tr>
            <td colspan="5" style="padding: 40px; text-align: center; color: #ef4444;">
                <i class="fas fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 10px;"></i>
                <p>Error loading data: ${error.message}</p>
            </td>
        </tr>
    `;
    }
}

// Tìm kiếm user
document.getElementById('searchUser').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#userListBody tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
});

// Chỉnh sửa user
function editUser(userId) {
    alert('Edit feature under development. User ID: ' + userId);
    // TODO: Implement edit user functionality
}

// Reset password
async function resetPassword(userId, email) {
    const newPassword = prompt(`Reset password for user: ${email}\n\nEnter new password (at least 8 characters):`);

    if (!newPassword) return;

    if (newPassword.length < 8) {
        alert('Password must be at least 8 characters!');
        return;
    }

    if (!confirm(`Confirm password reset for ${email}?`)) return;

    try {
        const response = await fetch(`/api/users/${userId}/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password: newPassword })
        });

        const result = await response.json();

        if (response.ok) {
            alert('✓ Password reset successfully!');
        } else {
            alert('✗ Error: ' + (result.message || 'Unable to reset password'));
        }
    } catch (error) {
        alert('✗ Lỗi kết nối: ' + error.message);
    }
}

// Xóa user
async function deleteUser(userId, email) {
    if (!confirm(`Confirm delete user: ${email}?\n\nThis action cannot be undone!`)) return;

    try {
        const response = await fetch(`/api/users/${userId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok) {
            alert('✓ User deleted successfully!');
            loadUserList(); // Reload list
        } else {
            alert('✗ Error: ' + (result.message || 'Unable to delete user'));
        }
    } catch (error) {
        alert('✗ Lỗi kết nối: ' + error.message);
    }
}

// Load user list on page load
window.addEventListener('DOMContentLoaded', () => {
    loadUserList();
});
