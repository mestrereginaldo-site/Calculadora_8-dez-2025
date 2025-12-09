// Main JavaScript for Desenrola Direito

class MainApp {
    constructor() {
        this.init();
    }
    
    init() {
        this.initMobileMenu();
        this.initDropdowns();
        this.initFAQ();
        this.initSmoothScroll();
        this.initScrollAnimations();
        this.initCurrentYear();
        this.initNewsletter();
    }
    
    initMobileMenu() {
        const mobileBtn = document.getElementById('mobileMenuBtn');
        const mainNav = document.getElementById('mainNav');
        
        if (mobileBtn && mainNav) {
            mobileBtn.addEventListener('click', () => {
                const isExpanded = mobileBtn.getAttribute('aria-expanded') === 'true';
                const icon = mobileBtn.querySelector('i');
                
                mainNav.classList.toggle('active');
                mobileBtn.setAttribute('aria-expanded', !isExpanded);
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.header') && mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    mobileBtn.setAttribute('aria-expanded', 'false');
                    mobileBtn.querySelector('i').classList.add('fa-bars');
                    mobileBtn.querySelector('i').classList.remove('fa-times');
                }
            });
        }
    }
    
    initDropdowns() {
        document.querySelectorAll('.dropdown > a').forEach(dropdown => {
            dropdown.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    const menu = this.nextElementSibling;
                    const isActive = menu.classList.contains('active');
                    
                    // Close all other dropdowns
                    document.querySelectorAll('.dropdown-menu').forEach(otherMenu => {
                        if (otherMenu !== menu) otherMenu.classList.remove('active');
                    });
                    
                    // Toggle current dropdown
                    menu.classList.toggle('active');
                    this.classList.toggle('active', !isActive);
                }
            });
        });
        
        // Close dropdowns on resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                document.querySelectorAll('.dropdown-menu').forEach(menu => {
                    menu.classList.remove('active');
                });
                document.querySelectorAll('.dropdown > a').forEach(link => {
                    link.classList.remove('active');
                });
            }
        });
    }
    
    initFAQ() {
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', function() {
                const answer = this.nextElementSibling;
                const icon = this.querySelector('i');
                const isActive = answer.classList.contains('active');
                
                // Close other answers
                if (!isActive) {
                    document.querySelectorAll('.faq-answer').forEach(otherAnswer => {
                        otherAnswer.classList.remove('active');
                        const otherIcon = otherAnswer.previousElementSibling.querySelector('i');
                        if (otherIcon) {
                            otherIcon.classList.remove('fa-chevron-up');
                            otherIcon.classList.add('fa-chevron-down');
                        }
                    });
                }
                
                // Toggle current answer
                answer.classList.toggle('active');
                if (answer.classList.contains('active')) {
                    icon.classList.remove('fa-chevron-down');
                    icon.classList.add('fa-chevron-up');
                } else {
                    icon.classList.remove('fa-chevron-up');
                    icon.classList.add('fa-chevron-down');
                }
            });
        });
    }
    
    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#' || href === '#!') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update URL without page jump
                    history.pushState(null, null, href);
                    
                    // Close mobile menu if open
                    const mobileMenu = document.getElementById('mainNav');
                    if (mobileMenu && mobileMenu.classList.contains('active')) {
                        this.initMobileMenu();
                    }
                }
            });
        });
    }
    
    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, observerOptions);
        
        // Observe elements with reveal class
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }
    
    initCurrentYear() {
        const yearElements = document.querySelectorAll('[data-current-year]');
        const currentYear = new Date().getFullYear();
        
        yearElements.forEach(el => {
            el.textContent = currentYear;
        });
        
        // Also update copyright text
        const copyright = document.querySelector('.footer-copyright');
        if (copyright && copyright.textContent.includes('2025')) {
            copyright.innerHTML = copyright.innerHTML.replace('2025', currentYear);
        }
    }
    
    initNewsletter() {
        const form = document.getElementById('newsletterForm');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const button = form.querySelector('button[type="submit"]');
            const originalText = button.innerHTML;
            const messageDiv = document.getElementById('newsletterMessage');
            
            // Show loading
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            button.disabled = true;
            
            try {
                const formData = new FormData(form);
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });
                
                if (response.ok) {
                    this.showMessage(messageDiv, 'success', 'Inscrição confirmada! Verifique seu e-mail.');
                    form.reset();
                    
                    // Track conversion
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'conversion', {
                            'send_to': 'G-XXXXXXXXXX/newsletter_signup'
                        });
                    }
                } else {
                    throw new Error('Erro no servidor');
                }
            } catch (error) {
                this.showMessage(messageDiv, 'error', 'Erro ao enviar. Tente novamente.');
            } finally {
                button.innerHTML = originalText;
                button.disabled = false;
            }
        });
    }
    
    showMessage(container, type, message) {
        if (!container) return;
        
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        const className = type === 'success' ? 'success-message' : 'error-message';
        
        container.innerHTML = `
            <div class="${className}">
                <i class="fas ${icon}"></i>
                <span>${message}</span>
            </div>
        `;
        container.style.display = 'block';
        
        setTimeout(() => {
            container.style.display = 'none';
        }, 5000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MainApp();
});
