// Legal Calculators for Desenrola Direito

class LegalCalculator {
    constructor() {
        this.initializeCalculators();
    }
    
    initializeCalculators() {
        // Working Hours Calculator
        this.initHoursCalculator();
        
        // Consumer Rights Calculator
        this.initConsumerCalculator();
        
        // Alimony Calculator
        this.initAlimonyCalculator();
    }
    
    initHoursCalculator() {
        const calculator = document.getElementById('hours-calculator');
        if (!calculator) return;
        
        calculator.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const hours = parseFloat(document.getElementById('work-hours').value) || 0;
            const hourlyRate = parseFloat(document.getElementById('hourly-rate').value) || 0;
            const overtime = parseFloat(document.getElementById('overtime').value) || 0;
            
            // Cálculo básico (simplificado para exemplo)
            const regularPay = hours * hourlyRate;
            const overtimePay = overtime * hourlyRate * 1.5;
            const total = regularPay + overtimePay;
            
            document.getElementById('regular-result').textContent = 
                this.formatCurrency(regularPay);
            document.getElementById('overtime-result').textContent = 
                this.formatCurrency(overtimePay);
            document.getElementById('total-result').textContent = 
                this.formatCurrency(total);
            
            document.getElementById('hours-result').classList.remove('hidden');
        });
    }
    
    initConsumerCalculator() {
        const calculator = document.getElementById('consumer-calculator');
        if (!calculator) return;
        
        calculator.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const purchaseValue = parseFloat(document.getElementById('purchase-value').value) || 0;
            const daysLate = parseInt(document.getElementById('days-late').value) || 0;
            const hasMoralDamages = document.getElementById('moral-damages').checked;
            
            // Cálculos conforme CDC (exemplo simplificado)
            const selicRate = 0.01; // 1% ao mês (exemplo)
            const monthlyRate = Math.pow(1 + selicRate, daysLate / 30) - 1;
            const monetaryCorrection = purchaseValue * monthlyRate;
            const fine = purchaseValue * 0.02; // 2% multa
            
            let moralDamages = 0;
            if (hasMoralDamages) {
                moralDamages = purchaseValue * 0.1; // 10% do valor (exemplo)
            }
            
            const total = purchaseValue + monetaryCorrection + fine + moralDamages;
            
            document.getElementById('correction-result').textContent = 
                this.formatCurrency(monetaryCorrection);
            document.getElementById('fine-result').textContent = 
                this.formatCurrency(fine);
            document.getElementById('moral-result').textContent = 
                this.formatCurrency(moralDamages);
            document.getElementById('consumer-total').textContent = 
                this.formatCurrency(total);
            
            document.getElementById('consumer-result').classList.remove('hidden');
        });
    }
    
    initAlimonyCalculator() {
        const calculator = document.getElementById('alimony-calculator');
        if (!calculator) return;
        
        calculator.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const payerIncome = parseFloat(document.getElementById('payer-income').value) || 0;
            const recipientIncome = parseFloat(document.getElementById('recipient-income').value) || 0;
            const numberOfChildren = parseInt(document.getElementById('number-children').value) || 0;
            const needs = document.getElementById('special-needs').value || 'none';
            
            // Cálculo simplificado de pensão
            let baseAmount = payerIncome * 0.3; // 30% da renda
            
            // Ajustes
            if (recipientIncome > 0) {
                baseAmount *= 0.7; // Reduz 30% se receptor tem renda
            }
            
            if (numberOfChildren > 0) {
                baseAmount += (payerIncome * 0.15 * numberOfChildren); // 15% por filho
            }
            
            if (needs === 'high') {
                baseAmount *= 1.5;
            } else if (needs === 'medium') {
                baseAmount *= 1.3;
            }
            
            // Limites (entre 10% e 50% da renda)
            const minAmount = payerIncome * 0.1;
            const maxAmount = payerIncome * 0.5;
            
            let finalAmount = Math.max(minAmount, Math.min(baseAmount, maxAmount));
            
            document.getElementById('alimony-amount').textContent = 
                this.formatCurrency(finalAmount);
            document.getElementById('percentage-income').textContent = 
                `${((finalAmount / payerIncome) * 100).toFixed(1)}%`;
            
            document.getElementById('alimony-result').classList.remove('hidden');
        });
    }
    
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }
    
    calculateSelic(startDate, endDate) {
        // Implementação simplificada da SELIC
        // Em produção, usar API do BC ou tabela atualizada
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        const monthlyRate = 0.01; // 1% ao mês
        return Math.pow(1 + monthlyRate, days / 30) - 1;
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.calculator-section')) {
        window.legalCalculator = new LegalCalculator();
    }
});
