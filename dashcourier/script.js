// PWA Service Worker Registration
document.addEventListener('DOMContentLoaded', function() {
    // Register service worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered successfully:', registration.scope);
                    
                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // Show update notification
                                showUpdateNotification();
                            }
                        });
                    });
                })
                .catch(error => {
                    console.error('Service Worker registration failed:', error);
                });
        });
    }
    
    // Handle service worker messages
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', event => {
            if (event.data && event.data.type === 'CACHE_UPDATED') {
                console.log('Service Worker: Cache updated');
            }
        });
    }
});

// Show update notification
function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <p>🚀 A new version of DashCourier is available!</p>
            <div class="notification-actions">
                <button class="btn btn-primary" onclick="updateApp()">Update Now</button>
                <button class="btn btn-secondary" onclick="dismissUpdate()">Later</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Add styles
    const styles = `
        <style>
        .update-notification {
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: var(--gradient-primary);
            color: white;
            padding: 1rem;
            border-radius: var(--border-radius-lg);
            box-shadow: var(--shadow-xl);
            z-index: 10000;
            animation: slideUp 0.3s ease;
        }
        
        .notification-content p {
            margin: 0 0 1rem 0;
            font-weight: 600;
        }
        
        .notification-actions {
            display: flex;
            gap: 0.5rem;
        }
        
        .notification-actions .btn {
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
        }
        
        .notification-actions .btn-secondary {
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
}

// Update app
function updateApp() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
    }
}

// Dismiss update notification
function dismissUpdate() {
    const notification = document.querySelector('.update-notification');
    if (notification) {
        notification.remove();
    }
}

// Install prompt for PWA
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show install button (optional)
    showInstallButton();
});

function showInstallButton() {
    const installButton = document.createElement('button');
    installButton.className = 'install-pwa-btn';
    installButton.innerHTML = '📱 Install App';
    installButton.onclick = installPWA;
    
    const header = document.querySelector('.header .nav-container');
    if (header) {
        header.appendChild(installButton);
    }
    
    // Add styles
    const styles = `
        <style>
        .install-pwa-btn {
            background: var(--gradient-primary);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: var(--border-radius);
            font-weight: 600;
            cursor: pointer;
            margin-left: auto;
            transition: var(--transition);
        }
        
        .install-pwa-btn:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
        }
        
        @media (max-width: 768px) {
            .install-pwa-btn {
                display: none;
            }
        }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
}

async function installPWA() {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
    } else {
        console.log('User dismissed the install prompt');
    }
    
    deferredPrompt = null;
    
    // Remove install button
    const installButton = document.querySelector('.install-pwa-btn');
    if (installButton) {
        installButton.remove();
    }
}

// Handle app installed event
window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    
    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'install-success';
    successMessage.innerHTML = '✅ DashCourier installed successfully!';
    successMessage.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem;
        border-radius: var(--border-radius);
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(successMessage);
    
    setTimeout(() => {
        successMessage.remove();
    }, 3000);
});

// Live Counter Animation
document.addEventListener('DOMContentLoaded', function() {
    const counters = document.querySelectorAll('.stat-number[data-target]');
    const speed = 200; // Animation speed
    
    const animateCounter = (counter) => {
        const target = +counter.getAttribute('data-target');
        const increment = target / speed;
        
        const updateCount = () => {
            const count = +counter.innerText;
            
            if (count < target) {
                counter.innerText = Math.ceil(count + increment);
                setTimeout(updateCount, 1);
            } else {
                counter.innerText = target;
                // Add decimal for percentages
                if (target === 99.8) {
                    counter.innerText = target.toFixed(1);
                }
            }
        };
        
        updateCount();
    };
    
    // Intersection Observer for counter animation
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
    
    // Simulate live updates
    setInterval(() => {
        const activeDeliveries = document.querySelector('.stat-number[data-target="1247"]');
        if (activeDeliveries && activeDeliveries.innerText === '1247') {
            const variation = Math.floor(Math.random() * 21) - 10; // ±10 variation
            const newValue = 1247 + variation;
            activeDeliveries.innerText = newValue;
            
            // Add pulse animation
            activeDeliveries.style.animation = 'pulse 0.5s ease';
            setTimeout(() => {
                activeDeliveries.style.animation = '';
            }, 500);
        }
    }, 5000); // Update every 5 seconds
});

// ZIP Code Checker
document.addEventListener('DOMContentLoaded', function() {
    const zipForm = document.getElementById('zipForm');
    const zipCode = document.getElementById('zipCode');
    const zipResult = document.getElementById('zipResult');
    const resultTitle = document.getElementById('resultTitle');
    const resultMessage = document.getElementById('resultMessage');
    
    if (zipForm) {
        zipForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const zip = zipCode.value.trim();
            
            if (!zip) {
                showZipError('Please enter a ZIP code');
                return;
            }
            
            if (!/^\d{5}(-\d{4})?$/.test(zip)) {
                showZipError('Please enter a valid ZIP code (e.g., 12345 or 12345-6789)');
                return;
            }
            
            // Show loading state
            resultTitle.textContent = 'Checking availability...';
            resultMessage.textContent = 'Please wait while we check your area.';
            zipResult.style.display = 'block';
            zipResult.className = 'zip-result loading';
            
            // Simulate API call
            setTimeout(() => {
                checkZipAvailability(zip);
            }, 1500);
        });
    }
    
    function checkZipAvailability(zip) {
        // Simulate different results based on ZIP code
        const firstDigit = parseInt(zip[0]);
        let result;
        
        if (firstDigit <= 3) {
            // East Coast - Same day available
            result = {
                title: '✅ Same-Day Delivery Available!',
                message: `Great news! ZIP code ${zip} is in our same-day delivery zone. Orders placed before 2 PM will be delivered today.`,
                type: 'success'
            };
        } else if (firstDigit <= 6) {
            // Central - Next day available
            result = {
                title: '✅ Next-Day Delivery Available',
                message: `ZIP code ${zip} is covered by our next-day delivery service. Delivery by 5 PM tomorrow.`,
                type: 'info'
            };
        } else {
            // West Coast - 2-day delivery
            result = {
                title: '✅ 2-Day Delivery Available',
                message: `ZIP code ${zip} is in our 2-day delivery zone. Fast, reliable service guaranteed.`,
                type: 'warning'
            };
        }
        
        showZipResult(result);
    }
    
    function showZipResult(result) {
        resultTitle.textContent = result.title;
        resultMessage.textContent = result.message;
        zipResult.style.display = 'block';
        zipResult.className = `zip-result ${result.type}`;
        
        // Scroll to result
        zipResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    function showZipError(message) {
        resultTitle.textContent = '❌ Error';
        resultMessage.textContent = message;
        zipResult.style.display = 'block';
        zipResult.className = 'zip-result error';
        
        zipResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
});

// Testimonial Carousel
document.addEventListener('DOMContentLoaded', function() {
    const testimonials = document.querySelectorAll('.testimonial-card');
    let currentIndex = 0;
    
    // Add navigation dots if there are more than 3 testimonials
    if (testimonials.length > 3) {
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'testimonial-dots';
        
        for (let i = 0; i < testimonials.length; i++) {
            const dot = document.createElement('button');
            dot.className = 'dot';
            dot.setAttribute('data-index', i);
            dot.addEventListener('click', () => showTestimonial(i));
            dotsContainer.appendChild(dot);
        }
        
        const testimonialsSection = document.querySelector('.testimonials');
        testimonialsSection.appendChild(dotsContainer);
        
        // Auto-rotate testimonials
        setInterval(() => {
            currentIndex = (currentIndex + 1) % testimonials.length;
            showTestimonial(currentIndex);
        }, 8000);
    }
    
    function showTestimonial(index) {
        testimonials.forEach((testimonial, i) => {
            testimonial.style.display = i === index ? 'block' : 'none';
        });
        
        // Update dots
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        
        currentIndex = index;
    }
});

// Add testimonial carousel styles
const testimonialStyles = `
<style>
.testimonial-dots {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 2rem;
}

.dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid var(--primary-color);
    background: transparent;
    cursor: pointer;
    transition: var(--transition);
}

.dot.active {
    background: var(--primary-color);
}

.zip-result.loading {
    background: #fef3c7;
    border-left-color: #fbbf24;
}

.zip-result.success {
    background: #d1fae5;
    border-left-color: #10b981;
}

.zip-result.info {
    background: #dbeafe;
    border-left-color: #3b82f6;
}

.zip-result.warning {
    background: #fed7aa;
    border-left-color: #f97316;
}

.zip-result.error {
    background: #fef2f2;
    border-left-color: #ef4444;
}

@media (max-width: 768px) {
    .testimonials-grid {
        grid-template-columns: 1fr;
    }
    
    .testimonial-card {
        display: none;
    }
    
    .testimonial-card:first-child {
        display: block;
    }
    
    .trust-badges-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .live-stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .coverage-stats {
        grid-template-columns: 1fr;
    }
    
    .zip-input-group {
        flex-direction: column;
    }
    
    .map-legend {
        flex-direction: column;
        gap: 1rem;
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', testimonialStyles);

// Chat Widget Functionality
document.addEventListener('DOMContentLoaded', function() {
    const chatButton = document.getElementById('chatButton');
    const chatContainer = document.getElementById('chatContainer');
    const chatClose = document.getElementById('chatClose');
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');
    const chatMessages = document.getElementById('chatMessages');
    const chatBadge = document.getElementById('chatBadge');
    
    let isChatOpen = false;
    let messageCount = 1;
    
    // Toggle chat
    if (chatButton) {
        chatButton.addEventListener('click', function() {
            toggleChat();
        });
    }
    
    if (chatClose) {
        chatClose.addEventListener('click', function() {
            closeChat();
        });
    }
    
    function toggleChat() {
        isChatOpen = !isChatOpen;
        if (isChatOpen) {
            openChat();
        } else {
            closeChat();
        }
    }
    
    function openChat() {
        chatContainer.classList.add('active');
        chatBadge.style.display = 'none';
        isChatOpen = true;
        chatInput.focus();
    }
    
    function closeChat() {
        chatContainer.classList.remove('active');
        isChatOpen = false;
    }
    
    // Send message functionality
    if (chatSend && chatInput) {
        chatSend.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        chatInput.addEventListener('input', function() {
            chatSend.disabled = !chatInput.value.trim();
        });
    }
    
    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;
        
        // Add user message
        addMessage(message, 'user');
        
        // Clear input
        chatInput.value = '';
        chatSend.disabled = true;
        
        // Simulate bot response
        setTimeout(() => {
            const botResponse = generateBotResponse(message);
            addMessage(botResponse, 'bot');
        }, 1000 + Math.random() * 1000);
    }
    
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = sender === 'user' ? '👤' : '🚚';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        const messageText = document.createElement('p');
        messageText.textContent = text;
        
        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = getCurrentTime();
        
        content.appendChild(messageText);
        content.appendChild(time);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Remove quick replies after first user message
        const quickReplies = chatMessages.querySelector('.quick-replies');
        if (quickReplies && sender === 'user') {
            quickReplies.style.display = 'none';
        }
    }
    
    function generateBotResponse(userMessage) {
        const responses = {
            'track': 'I can help you track your package! Please enter your tracking number in the format DASH-123456, or I can redirect you to our tracking page.',
            'quote': 'I\'d be happy to help you get a quote! For the most accurate pricing, please visit our contact page and fill out the quote request form. What type of delivery service are you interested in?',
            'delivery': 'Our delivery times vary by service: Same-Day (2-4 hours), Express (1 hour), Standard (next business day), and International (3-7 days). Which service are you interested in?',
            'business': 'We offer customized business solutions including scheduled pickups, volume discounts, dedicated account managers, and monthly billing. Let me connect you with our business sales team!',
            'help': 'I can help you with package tracking, getting quotes, delivery information, business services, or answer general questions about DashCourier. What would you like to know?',
            'hello': 'Hello! Welcome to DashCourier Support! How can I assist you today?',
            'hi': 'Hi there! I\'m here to help with all your delivery needs. What can I do for you?'
        };
        
        const lowerMessage = userMessage.toLowerCase();
        
        for (const [key, response] of Object.entries(responses)) {
            if (lowerMessage.includes(key)) {
                return response;
            }
        }
        
        return 'Thanks for your message! For specific assistance, I recommend visiting our contact page or calling 1-800-DASH-NOW. Is there anything else I can help you with?';
    }
    
    function getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    }
    
    // Quick reply buttons
    const quickReplies = document.querySelectorAll('.quick-reply');
    quickReplies.forEach(button => {
        button.addEventListener('click', function() {
            const message = this.getAttribute('data-message');
            chatInput.value = message;
            sendMessage();
        });
    });
    
    // Show notification badge after 10 seconds (simulating new message)
    setTimeout(() => {
        if (!isChatOpen) {
            chatBadge.style.display = 'flex';
            chatBadge.textContent = '1';
        }
    }, 10000);
});

// Blog Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Category filtering
    const categoryTabs = document.querySelectorAll('.category-tab');
    const blogPosts = document.querySelectorAll('.blog-post');
    
    if (categoryTabs.length > 0) {
        categoryTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                
                // Update active tab
                categoryTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Filter posts
                blogPosts.forEach(post => {
                    if (category === 'all' || post.getAttribute('data-category') === category) {
                        post.style.display = 'block';
                        // Add animation
                        post.style.opacity = '0';
                        post.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            post.style.transition = 'all 0.5s ease';
                            post.style.opacity = '1';
                            post.style.transform = 'translateY(0)';
                        }, 100);
                    } else {
                        post.style.display = 'none';
                    }
                });
            });
        });
    }
    
    // Newsletter signup
    const newsletterForm = document.getElementById('newsletterForm');
    const newsletterResult = document.getElementById('newsletterResult');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('newsletterEmail').value.trim();
            
            if (!email) {
                showNewsletterResult('Please enter your email address', 'error');
                return;
            }
            
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showNewsletterResult('Please enter a valid email address', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = newsletterForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Subscribing...';
            submitBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                showNewsletterResult(`🎉 Success! You've been subscribed with ${email}`, 'success');
                newsletterForm.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 1500);
        });
    }
    
    function showNewsletterResult(message, type) {
        newsletterResult.textContent = message;
        newsletterResult.className = `newsletter-result ${type}`;
        newsletterResult.style.display = 'block';
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            newsletterResult.style.display = 'none';
        }, 5000);
    }
    
    // Load more functionality
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            // Simulate loading more posts
            this.textContent = 'Loading...';
            this.disabled = true;
            
            setTimeout(() => {
                // In a real implementation, this would load more posts from the server
                this.textContent = 'No more articles available';
                this.classList.add('disabled');
                
                // Show message
                const message = document.createElement('p');
                message.textContent = 'You\'ve reached the end of our blog archive!';
                message.style.textAlign = 'center';
                message.style.color = 'var(--text-light)';
                message.style.marginTop = '1rem';
                
                this.parentNode.appendChild(message);
            }, 1500);
        });
    }
});

// Pricing Calculator
document.addEventListener('DOMContentLoaded', function() {
    const priceCalculator = document.getElementById('priceCalculator');
    const calculatorResult = document.getElementById('calculatorResult');
    
    if (priceCalculator) {
        priceCalculator.addEventListener('submit', function(e) {
            e.preventDefault();
            calculatePrice();
        });
    }
});

function calculatePrice() {
    const service = document.getElementById('calcService').value;
    const distance = document.getElementById('calcDistance').value;
    const weight = document.getElementById('calcWeight').value;
    const urgency = document.getElementById('calcUrgency').value;
    const packages = parseInt(document.getElementById('calcPackages').value) || 1;
    const insurance = document.getElementById('calcInsurance').checked;
    const signature = document.getElementById('calcSignature').checked;
    
    // Validate required fields
    if (!service || !distance || !weight) {
        showCalculatorError('Please fill in all required fields');
        return;
    }
    
    // Base pricing matrix
    const basePrices = {
        'same-day': {
            'local': { 'light': 15, 'medium': 20, 'heavy': 35, 'extra-heavy': 50 },
            'regional': { 'light': 25, 'medium': 35, 'heavy': 55, 'extra-heavy': 75 },
            'long': { 'light': 45, 'medium': 65, 'heavy': 95, 'extra-heavy': 125 },
            'national': { 'light': 75, 'medium': 105, 'heavy': 145, 'extra-heavy': 195 }
        },
        'standard': {
            'local': { 'light': 8, 'medium': 12, 'heavy': 20, 'extra-heavy': 30 },
            'regional': { 'light': 15, 'medium': 22, 'heavy': 35, 'extra-heavy': 50 },
            'long': { 'light': 25, 'medium': 38, 'heavy': 55, 'extra-heavy': 75 },
            'national': { 'light': 45, 'medium': 65, 'heavy': 85, 'extra-heavy': 115 }
        },
        'express': {
            'local': { 'light': 25, 'medium': 35, 'heavy': 50, 'extra-heavy': 70 },
            'regional': { 'light': 40, 'medium': 55, 'heavy': 75, 'extra-heavy': 100 },
            'long': { 'light': 65, 'medium': 85, 'heavy': 115, 'extra-heavy': 150 },
            'national': { 'light': 95, 'medium': 125, 'heavy': 165, 'extra-heavy': 215 }
        },
        'international': {
            'local': { 'light': 45, 'medium': 65, 'heavy': 95, 'extra-heavy': 135 },
            'regional': { 'light': 55, 'medium': 80, 'heavy': 115, 'extra-heavy': 165 },
            'long': { 'light': 75, 'medium': 105, 'heavy': 145, 'extra-heavy': 195 },
            'national': { 'light': 95, 'medium': 135, 'heavy': 185, 'extra-heavy': 245 }
        },
        'bulk': {
            'local': { 'light': 5, 'medium': 8, 'heavy': 12, 'extra-heavy': 18 },
            'regional': { 'light': 8, 'medium': 12, 'heavy': 18, 'extra-heavy': 25 },
            'long': { 'light': 12, 'medium': 18, 'heavy': 25, 'extra-heavy': 35 },
            'national': { 'light': 18, 'medium': 25, 'heavy': 35, 'extra-heavy': 50 }
        }
    };
    
    // Calculate base price
    let basePrice = basePrices[service][distance][weight];
    
    // Apply urgency surcharge
    let urgencyMultiplier = 1;
    let urgencyPrice = 0;
    if (urgency === 'priority') {
        urgencyMultiplier = 1.25;
        urgencyPrice = basePrice * 0.25;
    } else if (urgency === 'urgent') {
        urgencyMultiplier = 1.5;
        urgencyPrice = basePrice * 0.5;
    }
    
    // Calculate additional services
    let additionalServices = 0;
    if (insurance) additionalServices += 5 * packages;
    if (signature) additionalServices += 3 * packages;
    
    // Calculate total
    let totalPrice = (basePrice * urgencyMultiplier + additionalServices) * packages;
    
    // Apply bulk discount for bulk service
    if (service === 'bulk' && packages >= 10) {
        totalPrice *= 0.9; // 10% discount for 10+ packages
    }
    
    // Display results
    displayPriceResults({
        basePrice,
        urgencyPrice,
        additionalServices,
        packages,
        totalPrice
    });
}

function displayPriceResults(results) {
    const calculatorResult = document.getElementById('calculatorResult');
    const totalPrice = document.getElementById('totalPrice');
    const basePrice = document.getElementById('basePrice');
    const urgencyPrice = document.getElementById('urgencyPrice');
    const additionalPrice = document.getElementById('additionalPrice');
    const packageMultiplier = document.getElementById('packageMultiplier');
    const breakdownTotal = document.getElementById('breakdownTotal');
    
    // Update display
    totalPrice.textContent = `$${results.totalPrice.toFixed(2)}`;
    basePrice.textContent = `$${(results.basePrice * results.packages).toFixed(2)}`;
    urgencyPrice.textContent = `$${(results.urgencyPrice * results.packages).toFixed(2)}`;
    additionalPrice.textContent = `$${results.additionalServices.toFixed(2)}`;
    packageMultiplier.textContent = `x${results.packages}`;
    breakdownTotal.textContent = `$${results.totalPrice.toFixed(2)}`;
    
    // Show result
    calculatorResult.style.display = 'block';
    
    // Scroll to result
    calculatorResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Add animation
    calculatorResult.style.opacity = '0';
    calculatorResult.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        calculatorResult.style.transition = 'all 0.5s ease';
        calculatorResult.style.opacity = '1';
        calculatorResult.style.transform = 'translateY(0)';
    }, 100);
}

function resetCalculator() {
    const calculatorResult = document.getElementById('calculatorResult');
    const priceCalculator = document.getElementById('priceCalculator');
    
    calculatorResult.style.display = 'none';
    priceCalculator.reset();
    
    // Scroll back to form
    priceCalculator.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showCalculatorError(message) {
    const calculatorResult = document.getElementById('calculatorResult');
    const totalPrice = document.getElementById('totalPrice');
    const basePrice = document.getElementById('basePrice');
    const urgencyPrice = document.getElementById('urgencyPrice');
    const additionalPrice = document.getElementById('additionalPrice');
    const packageMultiplier = document.getElementById('packageMultiplier');
    const breakdownTotal = document.getElementById('breakdownTotal');
    
    // Show error message
    totalPrice.textContent = 'Error';
    basePrice.textContent = message;
    urgencyPrice.textContent = '';
    additionalPrice.textContent = '';
    packageMultiplier.textContent = '';
    breakdownTotal.textContent = '';
    
    calculatorResult.style.display = 'block';
    calculatorResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

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
