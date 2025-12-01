(() => {
    const START_TIME = Date.now();

    const SELECTORS = {
        totalUsers: 'totalUsers',
        totalManagers: 'totalManagers',
        totalProducts: 'totalProducts',
        totalCustomers: 'totalCustomers',
        activities: 'recentActivities',
        uptime: 'systemUptime',
    };

    const ACTIVITIES = [
        { icon: 'fas fa-user-plus', title: 'User mới đã đăng ký', time: '5 phút trước' },
        { icon: 'fas fa-shopping-cart', title: 'Đơn hàng mới được tạo', time: '15 phút trước' },
        { icon: 'fas fa-box', title: 'Sản phẩm mới được thêm', time: '30 phút trước' },
        { icon: 'fas fa-user-shield', title: 'Quyền user được cập nhật', time: '1 giờ trước' },
    ];

    const safeSetText = (id, value) => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = value;
        }
    };

    const fetchJson = async (url) => {
        const response = await fetch(url, { credentials: 'same-origin' });
        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }
        return response.json();
    };

    const loadUserStats = async () => {
        try {
            const { users = [] } = await fetchJson('/api/admin/users');
            safeSetText(SELECTORS.totalUsers, users.length);
            safeSetText(
                SELECTORS.totalManagers,
                users.filter((user) => user.role === 'manager').length,
            );
        } catch (error) {
            console.error('Failed to load user stats', error);
        }
    };

    const loadProducts = async () => {
        try {
            const { products = [] } = await fetchJson('/api/products');
            safeSetText(SELECTORS.totalProducts, products.length);
        } catch (error) {
            console.error('Failed to load products', error);
        }
    };

    const loadCustomers = async () => {
        try {
            const { customers = [] } = await fetchJson('/api/customers');
            safeSetText(SELECTORS.totalCustomers, customers.length);
        } catch (error) {
            console.error('Failed to load customers', error);
        }
    };

    const renderActivities = () => {
        const container = document.getElementById(SELECTORS.activities);
        if (!container) {
            return;
        }
        container.innerHTML = ACTIVITIES.map(
            (activity) => `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="${activity.icon}"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">${activity.title}</div>
                        <div class="activity-time">${activity.time}</div>
                    </div>
                </div>
            `,
        ).join('');
    };

    const updateUptime = () => {
        const el = document.getElementById(SELECTORS.uptime);
        if (!el) {
            return;
        }
        const diff = Math.max(0, Math.floor((Date.now() - START_TIME) / 1000));
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        el.textContent = `${hours}h ${minutes}m ${seconds}s`;
    };

    const init = () => {
        loadUserStats();
        loadProducts();
        loadCustomers();
        renderActivities();
        updateUptime();
        setInterval(updateUptime, 1000);
    };

    document.addEventListener('DOMContentLoaded', init);
})();
