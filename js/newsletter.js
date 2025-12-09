/**
 * Sistema de Newsletter para Desenrola Direito
 * Integração com API própria ou serviço externo
 */

class NewsletterSystem {
    constructor() {
        this.apiUrl = '/api/newsletter.php';
        this.init();
    }
    
    init() {
        // Inicializar todos os formulários de newsletter
        this.initForms();
        this.initCookieConsent();
    }
    
    initForms() {
        document.querySelectorAll('.newsletter-form, .sidebar-newsletter').forEach(form => {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        });
    }
    
    async handleSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const emailInput = form.querySelector('input[type="email"]');
        const privacyCheckbox = form.querySelector('input[type="checkbox"]');
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        
        // Validações
        if (!this.validateEmail(emailInput.value)) {
            this.showMessage(form, 'Por favor, insira um e-mail válido.', 'error');
            return;
        }
        
        if (privacyCheckbox && !privacyCheckbox.checked) {
            this.showMessage(form, 'É necessário aceitar a política de privacidade.', 'error');
            return;
        }
        
        // Mostrar estado de carregamento
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitButton.disabled = true;
        
        try {
            // Enviar para API
            const response = await this.sendToAPI({
                email: emailInput.value,
                source: form.dataset.source || 'homepage',
                consent: true
            });
            
            if (response.success) {
                this.showMessage(form, 'Inscrição confirmada! Verifique seu e-mail.', 'success');
                form.reset();
                
                // Salvar no localStorage
                this.saveSubscription(emailInput.value);
                
                // Atualizar cookie de consentimento
                this.updateConsentCookie();
            } else {
                throw new Error(response.message || 'Erro ao cadastrar');
            }
            
        } catch (error) {
            console.error('Erro newsletter:', error);
            this.showMessage(form, 'Erro ao realizar inscrição. Tente novamente.', 'error');
        } finally {
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        }
    }
    
    async sendToAPI(data) {
        // Método 1: Usando Formspree (gratuito)
        const formspreeUrl = 'https://formspree.io/f/YOUR_FORM_ID';
        
        const response = await fetch(formspreeUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...data,
                _subject: 'Nova inscrição na newsletter - Desenrola Direito',
                _replyto: data.email
            })
        });
        
        return await response.json();
        
        // Método alternativo: Usando API própria (descomentar se tiver)
        /*
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        return await response.json();
        */
    }
    
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    showMessage(form, message, type = 'info') {
        // Remover mensagens anteriores
        const oldMessage = form.querySelector('.newsletter-message');
        if (oldMessage) oldMessage.remove();
        
        // Criar nova mensagem
        const messageDiv = document.createElement('div');
        messageDiv.className = `newsletter-message ${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        `;
        
        // Estilos dinâmicos
        messageDiv.style.cssText = `
            margin-top: 1rem;
            padding: 0.75rem 1rem;
            border-radius: 6px;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
            color: ${type === 'success' ? '#155724' : '#721c24'};
            border: 1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'};
        `;
        
        form.appendChild(messageDiv);
        
        // Remover após 5 segundos
        setTimeout(() => {
            if (messageDiv.parentNode === form) {
                messageDiv.style.opacity = '0';
                messageDiv.style.transition = 'opacity 0.5s ease';
                setTimeout(() => messageDiv.remove(), 500);
            }
        }, 5000);
    }
    
    saveSubscription(email) {
        const subscriptions = JSON.parse(localStorage.getItem('newsletter_subscriptions') || '[]');
        
        if (!subscriptions.includes(email)) {
            subscriptions.push({
                email: email,
                date: new Date().toISOString(),
                source: window.location.pathname
            });
            
            localStorage.setItem('newsletter_subscriptions', JSON.stringify(subscriptions));
        }
        
        // Enviar evento para Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'newsletter_signup', {
                'event_category': 'Engagement',
                'event_label': 'Newsletter Subscription'
            });
        }
    }
    
    initCookieConsent() {
        // Verificar se já aceitou cookies
        if (!this.getCookie('cookie_consent')) {
            this.showCookieConsent();
        }
    }
    
    showCookieConsent() {
        const consentDiv = document.createElement('div');
        consentDiv.id = 'cookie-consent';
        consentDiv.innerHTML = `
            <div class="cookie-consent-content">
                <p>
                    <i class="fas fa-cookie-bite"></i>
                    Nós usamos cookies para melhorar sua experiência. 
                    Ao continuar navegando, você concorda com nossa 
                    <a href="/pages/privacidade.html">Política de Privacidade</a>.
                </p>
                <div class="cookie-buttons">
                    <button id="accept-cookies" class="btn-small">
                        <i class="fas fa-check"></i> Aceitar todos
                    </button>
                    <button id="reject-cookies" class="btn-small secondary">
                        <i class="fas fa-times"></i> Recusar
                    </button>
                    <button id="customize-cookies" class="btn-small outline">
                        <i class="fas fa-cog"></i> Personalizar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(consentDiv);
        
        // Adicionar eventos
        document.getElementById('accept-cookies').addEventListener('click', () => {
            this.setCookie('cookie_consent', 'accepted', 365);
            this.setCookie('analytics_cookies', 'true', 365);
            this.setCookie('marketing_cookies', 'true', 365);
            consentDiv.remove();
        });
        
        document.getElementById('reject-cookies').addEventListener('click', () => {
            this.setCookie('cookie_consent', 'rejected', 365);
            consentDiv.remove();
        });
        
        document.getElementById('customize-cookies').addEventListener('click', () => {
            this.showCookieSettings();
        });
    }
    
    showCookieSettings() {
        // Implementar modal de configurações de cookies
        console.log('Abrir configurações de cookies');
    }
    
    setCookie(name, value, days) {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
    }
    
    getCookie(name) {
        return document.cookie.split('; ').reduce((r, v) => {
            const parts = v.split('=');
            return parts[0] === name ? decodeURIComponent(parts[1]) : r;
        }, '');
    }
    
    updateConsentCookie() {
        if (this.getCookie('cookie_consent') === 'accepted') {
            this.setCookie('newsletter_consent', 'true', 365);
        }
    }
    
    // Método para enviar newsletter segmentada
    async sendSegment(segment, subject, content) {
        // Integração com Mailchimp ou SendGrid
        const segments = {
            'direito-consumidor': 'Consumidor',
            'direito-trabalhista': 'Trabalhista',
            'all': 'Todos'
        };
        
        // Implementar lógica de envio
        console.log(`Enviando para segmento: ${segments[segment]}`);
    }
    
    // Método para exportar inscritos (admin)
    exportSubscribers() {
        const subscriptions = JSON.parse(localStorage.getItem('newsletter_subscriptions') || '[]');
        
        if (subscriptions.length === 0) {
            alert('Nenhum inscrito encontrado.');
            return;
        }
        
        // Converter para CSV
        const headers = ['Email', 'Data', 'Fonte'];
        const csv = [
            headers.join(','),
            ...subscriptions.map(sub => [
                sub.email,
                sub.date,
                sub.source
            ].join(','))
        ].join('\n');
        
        // Criar download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `newsletter-inscritos-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.newsletterSystem = new NewsletterSystem();
    
    // Expor método de exportação para console (apenas desenvolvimento)
    if (window.location.hostname === 'localhost') {
        console.log('Newsletter System carregado. Use window.newsletterSystem.exportSubscribers() para exportar.');
    }
});
