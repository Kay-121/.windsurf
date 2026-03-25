// Package Tracking Functionality
document.addEventListener('DOMContentLoaded', function() {
    const trackingForm = document.getElementById('trackingForm');
    const trackingResult = document.getElementById('trackingResult');
    const trackingNumber = document.getElementById('trackingNumber');
    const trackingId = document.getElementById('trackingId');
    
    if (trackingForm) {
        trackingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const trackingNum = trackingNumber.value.trim();
            
            if (!trackingNum) {
                showTrackingError('Please enter a tracking number');
                return;
            }
            
            // Validate tracking number format (basic validation)
            if (!/^[A-Z]{4}-\d{6}$/.test(trackingNum.toUpperCase())) {
                showTrackingError('Invalid tracking number format. Use format: DASH-123456');
                return;
            }
            
            // Show loading state
            const submitBtn = trackingForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Tracking...';
            submitBtn.disabled = true;
            
            // Simulate tracking lookup
            setTimeout(() => {
                showTrackingResult(trackingNum.toUpperCase());
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 1500);
        });
    }
    
    function showTrackingResult(trackingNum) {
        trackingId.textContent = trackingNum;
        trackingResult.style.display = 'block';
        
        // Scroll to results
        trackingResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Add entrance animation
        trackingResult.style.opacity = '0';
        trackingResult.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            trackingResult.style.transition = 'all 0.5s ease';
            trackingResult.style.opacity = '1';
            trackingResult.style.transform = 'translateY(0)';
        }, 100);
    }
    
    function showTrackingError(message) {
        // Remove existing error messages
        const existingError = trackingForm.querySelector('.tracking-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Create error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'tracking-error';
        errorDiv.innerHTML = `
            <div class="error-content">
                <h4>❌ Tracking Error</h4>
                <p>${message}</p>
            </div>
        `;
        
        trackingForm.appendChild(errorDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
        
        // Scroll to error
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
});

// Add tracking error styles
const trackingErrorStyles = `
<style>
.tracking-error {
    margin-top: 1rem;
    padding: 1rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: var(--border-radius);
    animation: slideIn 0.3s ease;
}

.error-content h4 {
    color: #dc2626;
    margin-bottom: 0.5rem;
    font-size: 1rem;
}

.error-content p {
    color: #991b1b;
    margin: 0;
    font-size: 0.9rem;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', trackingErrorStyles);

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Contact Form Handling
document.addEventListener('DOMContentLoaded', function() {
    const quoteForm = document.getElementById('quoteForm');
    
    if (quoteForm) {
        quoteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(quoteForm);
            const data = {};
            
            formData.forEach((value, key) => {
                data[key] = value;
            });
            
            // Validate form
            if (!validateForm(data)) {
                return;
            }
            
            // Show loading state
            const submitBtn = quoteForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            // Simulate form submission (replace with actual API call)
            setTimeout(() => {
                showSuccessMessage();
                quoteForm.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 2000);
        });
    }
});

// Form Validation
function validateForm(data) {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'serviceType', 'pickupAddress', 'deliveryAddress', 'packageDescription'];
    
    for (const field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            showErrorMessage(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
            return false;
        }
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showErrorMessage('Please enter a valid email address.');
        return false;
    }
    
    // Phone validation (simple)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(data.phone) || data.phone.length < 10) {
        showErrorMessage('Please enter a valid phone number.');
        return false;
    }
    
    return true;
}

// Show success message
function showSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'form-message success';
    message.innerHTML = `
        <div class="message-content">
            <h3>✅ Quote Request Submitted!</h3>
            <p>Thank you for contacting DashCourier. We'll get back to you within 2 hours with your quote.</p>
        </div>
    `;
    
    insertMessage(message);
}

// Show error message
function showErrorMessage(text) {
    const message = document.createElement('div');
    message.className = 'form-message error';
    message.innerHTML = `
        <div class="message-content">
            <h3>❌ Error</h3>
            <p>${text}</p>
        </div>
    `;
    
    insertMessage(message);
}

// Insert message into DOM
function insertMessage(message) {
    const form = document.getElementById('quoteForm');
    if (form) {
        // Remove any existing messages
        const existingMessages = form.querySelectorAll('.form-message');
        existingMessages.forEach(msg => msg.remove());
        
        // Insert new message at the top of the form
        form.insertBefore(message, form.firstChild);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            message.remove();
        }, 5000);
        
        // Scroll to top of form
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Add form message styles
const formMessageStyles = `
<style>
.form-message {
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    animation: slideIn 0.3s ease;
}

.form-message.success {
    background: #d1fae5;
    border: 1px solid #10b981;
    color: #065f46;
}

.form-message.error {
    background: #fee2e2;
    border: 1px solid #ef4444;
    color: #991b1b;
}

.message-content h3 {
    margin-bottom: 0.5rem;
    font-size: 1.125rem;
}

.message-content p {
    margin: 0;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', formMessageStyles);

// Scroll animations for elements
function animateOnScroll() {
    const elements = document.querySelectorAll('.feature-card, .service-card, .stat-item, .step, .faq-item');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('animate');
        }
    });
}

// Add animation styles
const animationStyles = `
<style>
.feature-card, .service-card, .stat-item, .step, .faq-item {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s ease, transform 0.6s ease;
}

.feature-card.animate, .service-card.animate, .stat-item.animate, .step.animate, .faq-item.animate {
    opacity: 1;
    transform: translateY(0);
}

/* Stagger animation delays */
.service-card:nth-child(1) { transition-delay: 0.1s; }
.service-card:nth-child(2) { transition-delay: 0.2s; }
.service-card:nth-child(3) { transition-delay: 0.3s; }
.service-card:nth-child(4) { transition-delay: 0.4s; }
.service-card:nth-child(5) { transition-delay: 0.5s; }
.service-card:nth-child(6) { transition-delay: 0.6s; }

.feature-card:nth-child(1) { transition-delay: 0.1s; }
.feature-card:nth-child(2) { transition-delay: 0.2s; }
.feature-card:nth-child(3) { transition-delay: 0.3s; }
.feature-card:nth-child(4) { transition-delay: 0.4s; }

.stat-item:nth-child(1) { transition-delay: 0.1s; }
.stat-item:nth-child(2) { transition-delay: 0.2s; }
.stat-item:nth-child(3) { transition-delay: 0.3s; }
.stat-item:nth-child(4) { transition-delay: 0.4s; }

.step:nth-child(1) { transition-delay: 0.1s; }
.step:nth-child(2) { transition-delay: 0.2s; }
.step:nth-child(3) { transition-delay: 0.3s; }
.step:nth-child(4) { transition-delay: 0.4s; }

.faq-item:nth-child(1) { transition-delay: 0.1s; }
.faq-item:nth-child(2) { transition-delay: 0.2s; }
.faq-item:nth-child(3) { transition-delay: 0.3s; }
.faq-item:nth-child(4) { transition-delay: 0.4s; }
</style>
`;

document.head.insertAdjacentHTML('beforeend', animationStyles);

// Run scroll animations on page load and scroll
window.addEventListener('load', animateOnScroll);
window.addEventListener('scroll', animateOnScroll);

// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (header) {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.background = '#fff';
            header.style.backdropFilter = 'none';
        }
    }
});

// Service type price estimation
document.addEventListener('DOMContentLoaded', function() {
    const serviceTypeSelect = document.getElementById('serviceType');
    const urgentCheckbox = document.getElementById('urgent');
    
    if (serviceTypeSelect && urgentCheckbox) {
        function updatePriceEstimate() {
            const basePrices = {
                'same-day': 15.99,
                'standard': 8.99,
                'express': 29.99,
                'business': 0,
                'international': 45.99,
                'bulk': 0
            };
            
            const serviceType = serviceTypeSelect.value;
            const isUrgent = urgentCheckbox.checked;
            
            if (serviceType && basePrices[serviceType] > 0) {
                let estimatedPrice = basePrices[serviceType];
                if (isUrgent) {
                    estimatedPrice *= 1.5; // 50% surcharge for urgent
                }
                
                // Update or create price display
                let priceDisplay = document.getElementById('priceEstimate');
                if (!priceDisplay) {
                    priceDisplay = document.createElement('div');
                    priceDisplay.id = 'priceEstimate';
                    priceDisplay.className = 'price-estimate';
                    serviceTypeSelect.parentNode.appendChild(priceDisplay);
                }
                
                priceDisplay.innerHTML = `<strong>Estimated starting price: $${estimatedPrice.toFixed(2)}</strong>`;
            } else {
                const priceDisplay = document.getElementById('priceEstimate');
                if (priceDisplay) {
                    priceDisplay.remove();
                }
            }
        }
        
        serviceTypeSelect.addEventListener('change', updatePriceEstimate);
        urgentCheckbox.addEventListener('change', updatePriceEstimate);
    }
});

// Add price estimate styles
const priceEstimateStyles = `
<style>
.price-estimate {
    margin-top: 0.5rem;
    padding: 0.5rem;
    background: #f0f9ff;
    border: 1px solid #0ea5e9;
    border-radius: 4px;
    color: #0369a1;
    font-size: 0.875rem;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', priceEstimateStyles);

// Phone number formatting
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('phone');
    
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            // Format as (XXX) XXX-XXXX for US numbers
            if (value.length >= 6) {
                value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6, 10);
            } else if (value.length >= 3) {
                value = value.slice(0, 3) + '-' + value.slice(3);
            }
            
            e.target.value = value;
        });
    }
});

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Add loading animation removal
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});
