async function loadSubscriptions() {
    try {
        const response = await fetch('/api/admin/subscriptions');
        if (!response.ok) throw new Error('Failed to load subscriptions');

        const data = await response.json();
        renderSubscriptionsTable(data.subscriptions || []);
    } catch (error) {
        showAlert('error', 'Lỗi tải danh sách: ' + error.message);
    }
}

async function loadPaymentHistory() {
    try {
        const response = await fetch('/api/admin/subscription-history');
        if (!response.ok) throw new Error('Failed to load history');

        const data = await response.json();
        renderPaymentHistory(data.history || []);
    } catch (error) {
        console.error('Error loading payment history:', error);
    }
}

function renderSubscriptionsTable(subscriptions) {
    const tbody = document.getElementById('subscriptionsTable');

    if (subscriptions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Chưa có Manager nào</td></tr>';
        return;
    }

    tbody.innerHTML = subscriptions
        .map((sub) => {
            const endDate = new Date(sub.end_date);
            const now = new Date();
            const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

            let statusBadge = '';
            if (sub.status === 'expired') {
                statusBadge = '<span class="badge badge-expired">Hết hạn</span>';
            } else if (daysLeft <= 7) {
                statusBadge = `<span class="badge badge-expiring">Còn ${daysLeft} ngày</span>`;
            } else {
                statusBadge = `<span class="badge bg-success">Hoạt động (${daysLeft} ngày)</span>`;
            }

            const planNames = {
                trial: 'Trial',
                monthly: 'Monthly',
                quarterly: 'Quarterly',
                yearly: 'Yearly',
            };

            return `
            <tr>
                <td><strong>${sub.user_name}</strong></td>
                <td>${sub.user_email}</td>
                <td><span class="badge bg-primary">${planNames[sub.subscription_type] || sub.subscription_type}</span></td>
                <td>${new Date(sub.start_date).toLocaleDateString('vi-VN')}</td>
                <td>${endDate.toLocaleDateString('vi-VN')}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn btn-sm btn-success" onclick="openExtendModal(${sub.user_id}, '${sub.user_name.replace(/'/g, "&apos;")}')">
                        <i class="fas fa-plus"></i> Gia hạn
                    </button>
                </td>
            </tr>
        `;
        })
        .join('');
}

function renderPaymentHistory(history) {
    const tbody = document.getElementById('paymentHistoryTable');

    if (history.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Chưa có lịch sử thanh toán</td></tr>';
        return;
    }

    tbody.innerHTML = history
        .slice(0, 10)
        .map((payment) => {
            const planNames = {
                trial: 'Trial',
                monthly: 'Monthly',
                quarterly: 'Quarterly',
                yearly: 'Yearly',
            };

            return `
            <tr>
                <td>${new Date(payment.payment_date).toLocaleDateString('vi-VN')}</td>
                <td>${payment.user_name}</td>
                <td>${planNames[payment.subscription_type] || payment.subscription_type}</td>
                <td><strong>${payment.amount.toLocaleString('vi-VN')}đ</strong></td>
                <td>${payment.payment_method || 'N/A'}</td>
                <td><span class="badge bg-success">${payment.status}</span></td>
            </tr>
        `;
        })
        .join('');
}

function openExtendModal(userId, userName) {
    document.getElementById('extendUserId').value = userId;
    document.getElementById('extendUserName').value = userName;
    new bootstrap.Modal(document.getElementById('extendModal')).show();
}

async function processExtension() {
    const userId = document.getElementById('extendUserId').value;
    const plan = document.getElementById('extendPlan').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const transactionId = document.getElementById('transactionId').value;

    try {
        const response = await fetch('/api/admin/extend-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: parseInt(userId, 10),
                subscription_type: plan,
                payment_method: paymentMethod,
                transaction_id: transactionId,
            }),
        });

        const data = await response.json();

        if (data.success) {
            showAlert('success', '✅ Gia hạn thành công!');
            bootstrap.Modal.getInstance(document.getElementById('extendModal')).hide();
            loadSubscriptions();
            loadPaymentHistory();
        } else {
            showAlert('error', data.message || 'Lỗi gia hạn');
        }
    } catch (error) {
        showAlert('error', 'Lỗi: ' + error.message);
    }
}

async function checkExpiredSubscriptions() {
    if (!confirm('Bạn có chắc muốn kiểm tra và hạ cấp các Manager hết hạn?')) return;

    try {
        const response = await fetch('/api/admin/check-expired-subscriptions', {
            method: 'POST',
        });

        const data = await response.json();

        if (data.success) {
            showAlert('success', `✅ Đã hạ cấp ${data.demoted_count} Manager hết hạn!`);
            loadSubscriptions();
        } else {
            showAlert('error', data.message || 'Lỗi kiểm tra');
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

document.addEventListener('DOMContentLoaded', () => {
    loadSubscriptions();
    loadPaymentHistory();
});
