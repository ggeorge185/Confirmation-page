// Confirmation page functionality
class ConfirmationPage {
    constructor() {
        this.confirmations = this.loadConfirmations();
        this.init();
    }

    init() {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const uniqueId = urlParams.get('id');
        const name = urlParams.get('name');
        const email = urlParams.get('email');

        // Track link click
        if (uniqueId) {
            ConfirmationLinkGenerator.updateLinkClick(uniqueId);
            this.sendClickTrackingWebhook(uniqueId, token, name, email);
        }

        // Validate required parameters
        if (!token || !name || !email) {
            this.showError('Invalid confirmation link. Please contact your administrator.');
            return;
        }

        // Check if already confirmed
        const existingConfirmation = this.findConfirmation(token);
        if (existingConfirmation) {
            this.showAlreadyConfirmed(existingConfirmation);
            return;
        }

        // Show confirmation form
        this.showConfirmationForm(token, name, email, uniqueId);
    }

    async sendClickTrackingWebhook(uniqueId, token, name, email) {
        try {
            const webhookSettings = this.getWebhookSettings();
            if (!webhookSettings.enabled || !webhookSettings.url) {
                return;
            }

            const payload = {
                event: 'link_clicked',
                timestamp: new Date().toISOString(),
                data: {
                    uniqueId: uniqueId,
                    token: token,
                    name: decodeURIComponent(name || ''),
                    email: decodeURIComponent(email || ''),
                    userAgent: navigator.userAgent,
                    referrer: document.referrer,
                    ipAddress: this.getClientIP()
                }
            };

            await fetch(webhookSettings.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(webhookSettings.secret && {
                        'X-Webhook-Secret': webhookSettings.secret
                    })
                },
                body: JSON.stringify(payload)
            });

            this.logWebhookAttempt(webhookSettings.url, 'click-tracked', payload);
        } catch (error) {
            console.warn('Click tracking webhook failed:', error);
        }
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

    findConfirmation(token) {
        return this.confirmations.find(conf => conf.token === token);
    }

    showError(message) {
        this.hideAll();
        document.getElementById('error-text').textContent = message;
        document.getElementById('error-message').classList.remove('hidden');
    }

    showAlreadyConfirmed(confirmation) {
        this.hideAll();
        document.getElementById('confirmed-name').textContent = confirmation.name;
        document.getElementById('confirmation-date').textContent = 
            new Date(confirmation.confirmedAt).toLocaleString();
        document.getElementById('already-confirmed').classList.remove('hidden');
    }

    showConfirmationForm(token, name, email, uniqueId) {
        this.hideAll();
        
        // Populate form with student info
        document.getElementById('student-name').textContent = decodeURIComponent(name);
        document.getElementById('student-email').textContent = decodeURIComponent(email);
        
        // Set up confirm button
        const confirmBtn = document.getElementById('confirm-btn');
        confirmBtn.onclick = () => this.confirmParticipation(token, name, email, uniqueId);
        
        document.getElementById('confirmation-form').classList.remove('hidden');
    }

    confirmParticipation(token, name, email, uniqueId) {
        const confirmBtn = document.getElementById('confirm-btn');
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Confirming...';

        try {
            // Create confirmation record
            const confirmation = {
                token: token,
                uniqueId: uniqueId,
                name: decodeURIComponent(name),
                email: decodeURIComponent(email),
                confirmedAt: new Date().toISOString(),
                participationConsent: true,
                photoConsent: true,
                ipAddress: this.getClientIP(),
                userAgent: navigator.userAgent,
                clickedAt: new Date().toISOString()
            };

            // Save confirmation
            this.confirmations.push(confirmation);
            this.saveConfirmations();

            // Update link tracking
            if (uniqueId) {
                ConfirmationLinkGenerator.updateLinkConfirmation(uniqueId);
            }

            // Send webhook notification
            this.sendWebhookNotification(confirmation);

            // Show success message
            this.showSuccess(confirmation);
        } catch (error) {
            console.error('Error confirming participation:', error);
            this.showError('An error occurred while confirming. Please try again.');
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirm Participation & Photo Consent';
        }
    }

    async sendWebhookNotification(confirmation) {
        try {
            const webhookSettings = this.getWebhookSettings();
            if (!webhookSettings.enabled || !webhookSettings.url) {
                return;
            }

            const payload = {
                event: 'confirmation_received',
                timestamp: confirmation.confirmedAt,
                data: {
                    token: confirmation.token,
                    name: confirmation.name,
                    email: confirmation.email,
                    confirmedAt: confirmation.confirmedAt,
                    participationConsent: confirmation.participationConsent,
                    photoConsent: confirmation.photoConsent,
                    ipAddress: confirmation.ipAddress,
                    userAgent: confirmation.userAgent
                }
            };

            // Attempt to send webhook
            const response = await fetch(webhookSettings.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(webhookSettings.secret && {
                        'X-Webhook-Secret': webhookSettings.secret
                    })
                },
                body: JSON.stringify(payload)
            });

            // Log webhook attempt
            this.logWebhookAttempt(webhookSettings.url, response.status, payload);
            
        } catch (error) {
            console.warn('Webhook notification failed:', error);
            this.logWebhookAttempt(webhookSettings.url, 'failed', { error: error.message });
        }
    }

    getClientIP() {
        // This is a placeholder - in a real implementation you'd get this from the server
        return 'client-ip-unavailable';
    }

    getWebhookSettings() {
        try {
            const settings = localStorage.getItem('webhookSettings');
            return settings ? JSON.parse(settings) : { enabled: false, url: '', secret: '' };
        } catch (error) {
            console.error('Error loading webhook settings:', error);
            return { enabled: false, url: '', secret: '' };
        }
    }

    logWebhookAttempt(url, status, payload) {
        try {
            const logs = JSON.parse(localStorage.getItem('webhookLogs') || '[]');
            logs.push({
                timestamp: new Date().toISOString(),
                url,
                status,
                payload
            });
            
            // Keep only last 100 logs
            if (logs.length > 100) {
                logs.splice(0, logs.length - 100);
            }
            
            localStorage.setItem('webhookLogs', JSON.stringify(logs));
        } catch (error) {
            console.error('Error logging webhook attempt:', error);
        }
    }

    showSuccess(confirmation) {
        this.hideAll();
        document.getElementById('success-name').textContent = confirmation.name;
        document.getElementById('success-date').textContent = 
            new Date(confirmation.confirmedAt).toLocaleString();
        document.getElementById('success-message').classList.remove('hidden');
    }

    hideAll() {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('confirmation-form').classList.add('hidden');
        document.getElementById('already-confirmed').classList.add('hidden');
        document.getElementById('success-message').classList.add('hidden');
        document.getElementById('error-message').classList.add('hidden');
    }
}

// Utility functions for generating confirmation links
class ConfirmationLinkGenerator {
    static generateToken() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }

    static generateUniqueId() {
        // Generate a more robust unique ID for tracking
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 10);
        return `${timestamp}${random}`.toUpperCase();
    }

    static generateConfirmationLink(name, email, baseUrl = window.location.origin) {
        const token = this.generateToken();
        const uniqueId = this.generateUniqueId();
        
        const params = new URLSearchParams({
            token: token,
            id: uniqueId,
            name: encodeURIComponent(name),
            email: encodeURIComponent(email)
        });
        
        const linkData = {
            token: token,
            uniqueId: uniqueId,
            url: `${baseUrl}/?${params.toString()}`,
            createdAt: new Date().toISOString(),
            name: name,
            email: email,
            clicked: false,
            confirmed: false
        };

        // Store link tracking data
        this.storeLinkData(linkData);
        
        return linkData;
    }

    static storeLinkData(linkData) {
        try {
            const linkDatabase = JSON.parse(localStorage.getItem('linkDatabase') || '[]');
            linkDatabase.push(linkData);
            localStorage.setItem('linkDatabase', JSON.stringify(linkDatabase));
        } catch (error) {
            console.error('Error storing link data:', error);
        }
    }

    static updateLinkClick(uniqueId) {
        try {
            const linkDatabase = JSON.parse(localStorage.getItem('linkDatabase') || '[]');
            const linkIndex = linkDatabase.findIndex(link => link.uniqueId === uniqueId);
            
            if (linkIndex !== -1) {
                linkDatabase[linkIndex].clicked = true;
                linkDatabase[linkIndex].clickedAt = new Date().toISOString();
                localStorage.setItem('linkDatabase', JSON.stringify(linkDatabase));
            }
        } catch (error) {
            console.error('Error updating link click:', error);
        }
    }

    static updateLinkConfirmation(uniqueId) {
        try {
            const linkDatabase = JSON.parse(localStorage.getItem('linkDatabase') || '[]');
            const linkIndex = linkDatabase.findIndex(link => link.uniqueId === uniqueId);
            
            if (linkIndex !== -1) {
                linkDatabase[linkIndex].confirmed = true;
                linkDatabase[linkIndex].confirmedAt = new Date().toISOString();
                localStorage.setItem('linkDatabase', JSON.stringify(linkDatabase));
            }
        } catch (error) {
            console.error('Error updating link confirmation:', error);
        }
    }
}

// Initialize the confirmation page when DOM is loaded (only on main page)
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize ConfirmationPage if we're on the main confirmation page
    if (document.getElementById('main-content')) {
        new ConfirmationPage();
    }
});

// Make utilities available globally for admin use
window.ConfirmationLinkGenerator = ConfirmationLinkGenerator;