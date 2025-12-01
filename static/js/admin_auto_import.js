function openAddAutomationModal() {
    new bootstrap.Modal(document.getElementById('automationModal')).show();
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('activeAutomations').textContent = '0';
    document.getElementById('completedRuns').textContent = '0';
    document.getElementById('lastRun').textContent = 'Chưa có';
});
