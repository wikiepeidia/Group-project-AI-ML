function setReportMetric(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

window.openScheduleReportModal = function openScheduleReportModal() {
    const modalElement = document.getElementById('scheduleReportModal');
    if (!modalElement) {
        return;
    }

    const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
    modalInstance.show();
};

// Populate default mock statistics until backend data is wired up
window.addEventListener('DOMContentLoaded', () => {
    setReportMetric('monthRevenue', '0đ');
    setReportMetric('monthExpense', '0đ');
    setReportMetric('monthProfit', '0đ');
    setReportMetric('reportsSent', '0');
});
