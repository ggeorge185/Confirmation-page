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
    }

    clearAll() {
        if (confirm('Are you sure you want to clear all confirmation data? This cannot be undone.')) {
            localStorage.removeItem('confirmations');
            this.confirmations = [];
            this.updateStats();
            this.displayConfirmations();
            alert('All confirmation data has been cleared.');
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

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
});