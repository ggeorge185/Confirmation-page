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
        const name = urlParams.get('name');
        const email = urlParams.get('email');

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
        this.showConfirmationForm(token, name, email);
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

    showConfirmationForm(token, name, email) {
        this.hideAll();
        
        // Populate form with student info
        document.getElementById('student-name').textContent = decodeURIComponent(name);
        document.getElementById('student-email').textContent = decodeURIComponent(email);
        
        // Set up confirm button
        const confirmBtn = document.getElementById('confirm-btn');
        confirmBtn.onclick = () => this.confirmParticipation(token, name, email);
        
        document.getElementById('confirmation-form').classList.remove('hidden');
    }

    confirmParticipation(token, name, email) {
        const confirmBtn = document.getElementById('confirm-btn');
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Confirming...';

        try {
            // Create confirmation record
            const confirmation = {
                token: token,
                name: decodeURIComponent(name),
                email: decodeURIComponent(email),
                confirmedAt: new Date().toISOString(),
                participationConsent: true,
                photoConsent: true
            };

            // Save confirmation
            this.confirmations.push(confirmation);
            this.saveConfirmations();

            // Show success message
            this.showSuccess(confirmation);
        } catch (error) {
            console.error('Error confirming participation:', error);
            this.showError('An error occurred while confirming. Please try again.');
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirm Participation & Photo Consent';
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

    static generateConfirmationLink(name, email, baseUrl = window.location.origin) {
        const token = this.generateToken();
        const params = new URLSearchParams({
            token: token,
            name: encodeURIComponent(name),
            email: encodeURIComponent(email)
        });
        
        return {
            token: token,
            url: `${baseUrl}/?${params.toString()}`
        };
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