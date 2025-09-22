// Admin functionality for confirmation management
class AdminPanel {
    constructor() {
        this.confirmations = this.loadConfirmations();
        this.init();
    }

    loadConfirmations() {
        try {
            const stored = localStorage.getItem('confirmations');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading confirmations:', error);
            return [];
        }
    }

    saveConfirmations() {
        try {
            localStorage.setItem('confirmations', JSON.stringify(this.confirmations));
        } catch (error) {
            console.error('Error saving confirmations:', error);
        }
    }

    init() {
        this.updateStats();
        this.displayConfirmations();
        this.loadWebhookSettings();
        this.updateLinkTracking();
        this.displayWebhookLogs();
    }

    updateStats() {
        const total = this.confirmations.length;
        const today = this.confirmations.filter(conf => {
            const confDate = new Date(conf.confirmedAt);
            const today = new Date();
            return confDate.toDateString() === today.toDateString();
        }).length;

        document.getElementById('total-confirmations').textContent = total;
        document.getElementById('today-confirmations').textContent = today;
        
        // Update link tracking stats
        this.updateLinkTrackingStats();
    }

    updateLinkTrackingStats() {
        try {
            const linkDatabase = JSON.parse(localStorage.getItem('linkDatabase') || '[]');
            const totalLinks = linkDatabase.length;
            const totalClicks = linkDatabase.filter(link => link.clicked).length;
            const totalConfirmations = linkDatabase.filter(link => link.confirmed).length;
            const conversionRate = totalClicks > 0 ? Math.round((totalConfirmations / totalClicks) * 100) : 0;

            document.getElementById('total-links-generated').textContent = totalLinks;
            document.getElementById('total-clicks').textContent = totalClicks;
            document.getElementById('conversion-rate').textContent = `${conversionRate}%`;
        } catch (error) {
            console.error('Error updating link tracking stats:', error);
        }
    }

    updateLinkTracking() {
        try {
            const linkDatabase = JSON.parse(localStorage.getItem('linkDatabase') || '[]');
            const container = document.getElementById('link-tracking-container');
            
            if (linkDatabase.length === 0) {
                container.innerHTML = '<p>No tracking data available.</p>';
                return;
            }

            const table = document.createElement('table');
            table.className = 'tracking-table';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Unique ID</th>
                        <th>Created</th>
                        <th>Status</th>
                        <th>Clicked</th>
                        <th>Confirmed</th>
                    </tr>
                </thead>
                <tbody>
                    ${linkDatabase.map(link => `
                        <tr>
                            <td>${this.escapeHtml(link.name)}</td>
                            <td>${this.escapeHtml(link.email)}</td>
                            <td><code>${link.uniqueId}</code></td>
                            <td>${new Date(link.createdAt).toLocaleDateString()}</td>
                            <td>
                                <span class="status-badge ${this.getStatusClass(link)}">
                                    ${this.getStatusText(link)}
                                </span>
                            </td>
                            <td>${link.clickedAt ? new Date(link.clickedAt).toLocaleString() : '-'}</td>
                            <td>${link.confirmedAt ? new Date(link.confirmedAt).toLocaleString() : '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            `;

            container.innerHTML = '';
            container.appendChild(table);
        } catch (error) {
            console.error('Error updating link tracking:', error);
        }
    }

    getStatusClass(link) {
        if (link.confirmed) return 'status-confirmed';
        if (link.clicked) return 'status-clicked';
        return 'status-pending';
    }

    getStatusText(link) {
        if (link.confirmed) return 'Confirmed';
        if (link.clicked) return 'Clicked';
        return 'Pending';
    }

    loadWebhookSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('webhookSettings') || '{}');
            document.getElementById('webhook-enabled').checked = settings.enabled || false;
            document.getElementById('webhook-url').value = settings.url || '';
            document.getElementById('webhook-secret').value = settings.secret || '';
        } catch (error) {
            console.error('Error loading webhook settings:', error);
        }
    }

    displayWebhookLogs() {
        try {
            const logs = JSON.parse(localStorage.getItem('webhookLogs') || '[]');
            const container = document.getElementById('webhook-logs-container');
            
            if (logs.length === 0) {
                container.innerHTML = '<p>No webhook activity yet.</p>';
                return;
            }

            const logsHtml = logs.slice(-20).reverse().map(log => `
                <div class="webhook-log ${log.status === 'failed' ? 'webhook-error' : 'webhook-success'}">
                    <strong>${new Date(log.timestamp).toLocaleString()}</strong> - ${log.url}<br>
                    Status: ${log.status}<br>
                    ${log.payload ? `Event: ${log.payload.event || 'unknown'}` : ''}
                </div>
            `).join('');

            container.innerHTML = logsHtml;
        } catch (error) {
            console.error('Error displaying webhook logs:', error);
        }
    }

    displayConfirmations() {
        const container = document.getElementById('confirmations-container');
        
        if (this.confirmations.length === 0) {
            container.innerHTML = '<p>No confirmations yet.</p>';
            return;
        }

        const table = document.createElement('table');
        table.className = 'confirmation-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Confirmed At</th>
                    <th>Token</th>
                </tr>
            </thead>
            <tbody>
                ${this.confirmations.map(conf => `
                    <tr>
                        <td>${this.escapeHtml(conf.name)}</td>
                        <td>${this.escapeHtml(conf.email)}</td>
                        <td>${new Date(conf.confirmedAt).toLocaleString()}</td>
                        <td><code>${conf.token}</code></td>
                    </tr>
                `).join('')}
            </tbody>
        `;

        container.innerHTML = '';
        container.appendChild(table);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    refresh() {
        this.confirmations = this.loadConfirmations();
        this.updateStats();
        this.displayConfirmations();
        this.updateLinkTracking();
        this.displayWebhookLogs();
    }

    clearAll() {
        if (confirm('Are you sure you want to clear all confirmation data? This cannot be undone.')) {
            localStorage.removeItem('confirmations');
            localStorage.removeItem('linkDatabase');
            this.confirmations = [];
            this.updateStats();
            this.displayConfirmations();
            this.updateLinkTracking();
            alert('All confirmation and tracking data has been cleared.');
        }
    }
}

// Global functions for the admin interface
let adminPanel;

function generateLink() {
    const name = document.getElementById('student-name').value.trim();
    const email = document.getElementById('student-email').value.trim();
    
    if (!name || !email) {
        alert('Please enter both name and email.');
        return;
    }

    if (!isValidEmail(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    const linkData = ConfirmationLinkGenerator.generateConfirmationLink(name, email);
    
    document.getElementById('generated-link').value = linkData.url;
    document.getElementById('generated-link-group').style.display = 'block';
    
    // Clear form
    document.getElementById('student-name').value = '';
    document.getElementById('student-email').value = '';
}

function copyLink() {
    const linkField = document.getElementById('generated-link');
    linkField.select();
    document.execCommand('copy');
    alert('Link copied to clipboard!');
}

function generateBulkLinks() {
    const studentListText = document.getElementById('student-list').value.trim();
    
    if (!studentListText) {
        alert('Please enter student information.');
        return;
    }

    const lines = studentListText.split('\n').filter(line => line.trim());
    const links = [];
    const errors = [];

    lines.forEach((line, index) => {
        const match = line.match(/^(.+?)\s*<(.+?)>$/);
        if (match) {
            const name = match[1].trim();
            const email = match[2].trim();
            
            if (isValidEmail(email)) {
                const linkData = ConfirmationLinkGenerator.generateConfirmationLink(name, email);
                links.push(`${name} <${email}>: ${linkData.url}`);
            } else {
                errors.push(`Line ${index + 1}: Invalid email format`);
            }
        } else {
            errors.push(`Line ${index + 1}: Invalid format (should be "Name <email@domain.com>")`);
        }
    });

    if (errors.length > 0) {
        alert('Errors found:\n' + errors.join('\n'));
        return;
    }

    document.getElementById('bulk-links').value = links.join('\n\n');
    document.getElementById('bulk-links-group').style.display = 'block';
    
    // Clear form
    document.getElementById('student-list').value = '';
}

function copyBulkLinks() {
    const bulkLinksField = document.getElementById('bulk-links');
    bulkLinksField.select();
    document.execCommand('copy');
    alert('All links copied to clipboard!');
}

function downloadCSV() {
    const bulkLinksText = document.getElementById('bulk-links').value;
    
    if (!bulkLinksText) {
        alert('No links to download. Generate links first.');
        return;
    }

    const lines = bulkLinksText.split('\n\n');
    const csvContent = 'Name,Email,Confirmation Link\n' + 
        lines.map(line => {
            const match = line.match(/^(.+?) <(.+?)>: (.+)$/);
            if (match) {
                return `"${match[1]}","${match[2]}","${match[3]}"`;
            }
            return '';
        }).filter(line => line).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `confirmation-links-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function refreshConfirmations() {
    adminPanel.refresh();
}

function clearAllConfirmations() {
    adminPanel.clearAll();
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function saveWebhookSettings() {
    const settings = {
        enabled: document.getElementById('webhook-enabled').checked,
        url: document.getElementById('webhook-url').value.trim(),
        secret: document.getElementById('webhook-secret').value.trim()
    };

    if (settings.enabled && !settings.url) {
        alert('Please enter a webhook URL.');
        return;
    }

    try {
        localStorage.setItem('webhookSettings', JSON.stringify(settings));
        alert('Webhook settings saved successfully!');
    } catch (error) {
        alert('Error saving webhook settings.');
        console.error(error);
    }
}

async function testWebhook() {
    const settings = {
        enabled: document.getElementById('webhook-enabled').checked,
        url: document.getElementById('webhook-url').value.trim(),
        secret: document.getElementById('webhook-secret').value.trim()
    };

    if (!settings.url) {
        alert('Please enter a webhook URL first.');
        return;
    }

    const testPayload = {
        event: 'webhook_test',
        timestamp: new Date().toISOString(),
        data: {
            message: 'This is a test webhook from your confirmation page system.'
        }
    };

    try {
        const response = await fetch(settings.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(settings.secret && {
                    'X-Webhook-Secret': settings.secret
                })
            },
            body: JSON.stringify(testPayload)
        });

        if (response.ok) {
            alert(`Webhook test successful! Status: ${response.status}`);
        } else {
            alert(`Webhook test failed. Status: ${response.status}`);
        }
    } catch (error) {
        alert(`Webhook test failed: ${error.message}`);
    }
}

function downloadLinkAnalytics() {
    try {
        const linkDatabase = JSON.parse(localStorage.getItem('linkDatabase') || '[]');
        
        if (linkDatabase.length === 0) {
            alert('No tracking data to download.');
            return;
        }

        const csvContent = 'Name,Email,Unique ID,Token,Created,Clicked,Confirmed,Click Time,Confirmation Time\n' + 
            linkDatabase.map(link => {
                return `"${link.name}","${link.email}","${link.uniqueId}","${link.token}","${link.createdAt}","${link.clicked}","${link.confirmed}","${link.clickedAt || ''}","${link.confirmedAt || ''}"`;
            }).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `link-analytics-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        alert('Error downloading analytics data.');
        console.error(error);
    }
}

function refreshLinkTracking() {
    adminPanel.updateLinkTracking();
    adminPanel.updateLinkTrackingStats();
}

function refreshWebhookLogs() {
    adminPanel.displayWebhookLogs();
}

function clearWebhookLogs() {
    if (confirm('Are you sure you want to clear all webhook logs?')) {
        localStorage.removeItem('webhookLogs');
        adminPanel.displayWebhookLogs();
        alert('Webhook logs cleared.');
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
});