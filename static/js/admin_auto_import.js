let automations = [];

async function loadAutomations() {
    try {
        const response = await fetch('/api/automations');
        const data = await response.json();
        if (data.success) {
            automations = data.automations;
            renderAutomationsTable();
            updateStats();
        }
    } catch (error) {
        console.error('Error loading automations:', error);
    }
}

function renderAutomationsTable() {
    const tbody = document.getElementById('automationsTableBody');
    if (automations.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    No automations yet. Click "Create automation" to get started.
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = automations.map(auto => `
        <tr>
            <td><strong>${auto.name}</strong></td>
            <td>${formatType(auto.type)}</td>
            <td>
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" 
                        ${auto.status === 'active' ? 'checked' : ''} 
                        onchange="toggleStatus(${auto.id}, this.checked)">
                    <label class="form-check-label">${auto.status}</label>
                </div>
            </td>
            <td>${auto.last_run ? new Date(auto.last_run).toLocaleString() : 'Never'}</td>
            <td><small class="text-muted font-monospace">${truncateConfig(auto.config)}</small></td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteAutomation(${auto.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function updateStats() {
    const activeCount = automations.filter(a => a.status === 'active').length;
    document.getElementById('activeAutomations').textContent = activeCount;
    
    // Mock completed runs for now, or calculate if we had run history
    // document.getElementById('completedRuns').textContent = '0'; 
    
    const lastRun = automations
        .filter(a => a.last_run)
        .sort((a, b) => new Date(b.last_run) - new Date(a.last_run))[0];
        
    document.getElementById('lastRun').textContent = lastRun ? new Date(lastRun.last_run).toLocaleString() : 'None';
}

function formatType(type) {
    const types = {
        'low_stock': '<span class="badge bg-warning text-dark">Low Stock</span>',
        'scheduled': '<span class="badge bg-info">Scheduled</span>',
        'smart_forecast': '<span class="badge bg-primary">AI Forecast</span>'
    };
    return types[type] || type;
}

function truncateConfig(configStr) {
    try {
        // If it's a string, try to parse it to pretty print or just truncate
        if (configStr.length > 30) return configStr.substring(0, 30) + '...';
        return configStr;
    } catch (e) {
        return configStr;
    }
}

window.openAddAutomationModal = function() {
    const modal = new bootstrap.Modal(document.getElementById('automationModal'));
    updateConfigPlaceholder();
    modal.show();
};

window.updateConfigPlaceholder = function() {
    const type = document.getElementById('automationTypeSelect').value;
    const configArea = document.getElementById('automationConfig');
    const helpText = document.getElementById('configHelp');
    
    const templates = {
        'low_stock': '{\n  "product_id": "all",\n  "threshold": 10,\n  "reorder_quantity": 50\n}',
        'scheduled': '{\n  "frequency": "weekly",\n  "day": "monday",\n  "time": "09:00"\n}',
        'smart_forecast': '{\n  "model": "lstm",\n  "look_ahead_days": 30,\n  "auto_approve": false\n}'
    };
    
    configArea.placeholder = templates[type] || '{}';
    
    const helpTexts = {
        'low_stock': 'Trigger when stock falls below threshold.',
        'scheduled': 'Run import generation on a fixed schedule.',
        'smart_forecast': 'Use AI to predict demand and generate orders.'
    };
    helpText.textContent = helpTexts[type] || 'Configuration parameters in JSON format.';
};

window.submitAutomation = async function() {
    const form = document.getElementById('automationForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Validate JSON
    try {
        JSON.parse(data.config);
    } catch (e) {
        alert('Invalid JSON configuration');
        return;
    }

    try {
        const response = await fetch('/api/automations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('meta[name="csrf-token"]')?.content
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.success) {
            bootstrap.Modal.getInstance(document.getElementById('automationModal')).hide();
            form.reset();
            loadAutomations();
            alert('Automation created successfully');
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
};

window.toggleStatus = async function(id, isActive) {
    // In a real app, we would have an endpoint to toggle status
    // For now, we'll just reload to simulate (since we don't have a specific toggle endpoint yet, 
    // but we could add one or just ignore for this demo)
    console.log(`Toggling automation ${id} to ${isActive}`);
    // Ideally: await fetch(`/api/automations/${id}/status`, { method: 'PUT', body: JSON.stringify({status: isActive ? 'active' : 'inactive'}) });
};

window.deleteAutomation = async function(id) {
    if (!confirm('Are you sure you want to delete this automation?')) return;

    try {
        const response = await fetch(`/api/automations/${id}`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': document.querySelector('meta[name="csrf-token"]')?.content
            }
        });

        const result = await response.json();
        if (result.success) {
            loadAutomations();
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    loadAutomations();
});
