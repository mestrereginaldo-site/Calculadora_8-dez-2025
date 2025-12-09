/**
 * Sistema de Analytics para Desenrola Direito
 * Google Analytics 4 + Analytics próprio
 */

class AnalyticsSystem {
    constructor() {
        this.gaMeasurementId = 'G-XXXXXXXXXX';
        this.init();
    }
    
    init() {
        this.loadGoogleAnalytics();
        this.trackPageView();
        this.setupEventTracking();
        this.setupScrollTracking();
        this.setupTimeTracking();
    }
    
    loadGoogleAnalytics() {
        // Verificar consentimento de cookies
        if (this.hasConsent()) {
            // Google Analytics 4
            const script1 = document.createElement('script');
            script1.async = true;
            script1.src = `https://www.googletagmanager.com/gtag/js?id=${this.gaMeasurementId}`;
            document.head.appendChild(script1);
            
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', this.gaMeasurementId, {
                'anonymize_ip': true,
                'allow_google_signals': false,
                'allow_ad_personalization_signals': false
            });
            
            // Google Tag Manager (opcional)
            const script2 = document.createElement('script');
            script2.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','GTM-XXXXXXX');`;
            document.head.appendChild(script2);
        }
    }
    
    trackPageView() {
        const pagePath = window.location.pathname;
        const pageTitle = document.title;
        
        // Enviar para Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_path: pagePath,
                page_title: pageTitle,
                page_location: window.location.href
            });
        }
        
        // Salvar no localStorage para analytics próprio
        this.savePageView(pagePath, pageTitle);
    }
    
    savePageView(path, title) {
        const today = new Date().toISOString().split('T')[0];
        const key = `pageviews_${today}`;
        const views = JSON.parse(localStorage.getItem(key) || '[]');
        
        views.push({
            path: path,
            title: title,
            timestamp: new Date().toISOString(),
            referrer: document.referrer || 'direct'
        });
        
        localStorage.setItem(key, JSON.stringify(views));
        
        // Limitar a 1000 entradas por dia
        if (views.length > 1000) {
            localStorage.setItem(key, JSON.stringify(views.slice(-1000)));
        }
    }
    
    setupEventTracking() {
        // Rastrear cliques em artigos
        document.addEventListener('click', (e) => {
            const articleLink = e.target.closest('.article-link, .article-title a');
            if (articleLink) {
                this.trackEvent('click', 'article', articleLink.href);
            }
            
            // Rastrear cliques em calculadoras
            const calculatorLink = e.target.closest('.calculator-card a, .calc-tab');
            if (calculatorLink) {
                this.trackEvent('click', 'calculator', calculatorLink.textContent.trim());
            }
            
            // Rastrear cliques externos
            if (e.target.tagName === 'A' && e.target.hostname !== window.location.hostname) {
                this.trackEvent('click', 'external_link', e.target.href);
            }
        });
        
        // Rastrear envio de formulários
        document.addEventListener('submit', (e) => {
            if (e.target.matches('.newsletter-form, .contact-form')) {
                this.trackEvent('submit', 'form', e.target.className);
            }
        });
    }
    
    setupScrollTracking() {
        let scrollPosition = 0;
        const scrollThresholds = [25, 50, 75, 90];
        const reportedThresholds = new Set();
        
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );
            
            scrollThresholds.forEach(threshold => {
                if (scrollPercent >= threshold && !reportedThresholds.has(threshold)) {
                    this.trackEvent('scroll', 'page', `scroll_${threshold}%`);
                    reportedThresholds.add(threshold);
                }
            });
        }, { passive: true });
    }
    
    setupTimeTracking() {
        let startTime = Date.now();
        let isBackground = false;
        
        // Tempo na página
        window.addEventListener('beforeunload', () => {
            const timeSpent = Date.now() - startTime;
            this.trackEvent('timing', 'page', 'time_on_page', Math.round(timeSpent / 1000));
        });
        
        // Detectar quando a página fica em segundo plano
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                isBackground = true;
            } else if (isBackground) {
                // Página voltou ao foco
                startTime = Date.now();
                isBackground = false;
            }
        });
    }
    
    trackEvent(action, category, label, value = null) {
        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: category,
                event_label: label,
                value: value
            });
        }
        
        // Analytics próprio
        const event = {
            action: action,
            category: category,
            label: label,
            value: value,
            timestamp: new Date().toISOString(),
            path: window.location.pathname
        };
        
        this.saveEvent(event);
    }
    
    saveEvent(event) {
        const today = new Date().toISOString().split('T')[0];
        const key = `events_${today}`;
        const events = JSON.parse(localStorage.getItem(key) || '[]');
        
        events.push(event);
        localStorage.setItem(key, JSON.stringify(events));
        
        // Limitar a 5000 eventos por dia
        if (events.length > 5000) {
            localStorage.setItem(key, JSON.stringify(events.slice(-5000)));
        }
    }
    
    hasConsent() {
        const consent = this.getCookie('cookie_consent');
        const analytics = this.getCookie('analytics_cookies');
        return consent === 'accepted' && analytics === 'true';
    }
    
    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }
    
    // Método para exportar dados de analytics
    exportAnalyticsData() {
        const data = {
            pageviews: {},
            events: {}
        };
        
        // Coletar todos os dados do localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            
            if (key.startsWith('pageviews_')) {
                const date = key.replace('pageviews_', '');
                data.pageviews[date] = JSON.parse(localStorage.getItem(key));
            }
            
            if (key.startsWith('events_')) {
                const date = key.replace('events_', '');
                data.events[date] = JSON.parse(localStorage.getItem(key));
            }
        }
        
        // Converter para JSON
        const json = JSON.stringify(data, null, 2);
        
        // Criar download
        const blob = new Blob([json], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        return data;
    }
    
    // Método para gerar relatório
    generateReport() {
        const data = this.exportAnalyticsData();
        
        // Calcular métricas
        const report = {
            totalPageviews: 0,
            totalEvents: 0,
            popularPages: {},
            eventSummary: {},
            dateRange: {}
        };
        
        // Processar pageviews
        Object.entries(data.pageviews).forEach(([date, views]) => {
            report.totalPageviews += views.length;
            report.dateRange[date] = views.length;
            
            views.forEach(view => {
                report.popularPages[view.path] = (report.popularPages[view.path] || 0) + 1;
            });
        });
        
        // Processar eventos
        Object.entries(data.events).forEach(([date, events]) => {
            report.totalEvents += events.length;
            
            events.forEach(event => {
                const key = `${event.category}:${event.action}`;
                report.eventSummary[key] = (report.eventSummary[key] || 0) + 1;
            });
        });
        
        console.log('Relatório de Analytics:', report);
        return report;
    }
}

// Inicializar Analytics
document.addEventListener('DOMContentLoaded', () => {
    window.analytics = new AnalyticsSystem();
    
    // Expor métodos para desenvolvimento
    if (window.location.hostname === 'localhost') {
        console.log('Analytics System carregado. Use window.analytics.exportAnalyticsData() para exportar dados.');
    }
});
