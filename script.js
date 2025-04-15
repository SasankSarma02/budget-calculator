let currentPage = 1;
const totalPages = 3;

const RATE_CARD = {
    onshore: {
        architect: 140,
        leadDev: 105,
        dev: 76
    },
    hybrid: {
        architect: 140,
        leadDev: 60,
        dev: 30
    },
    offshore: {
        architect: 75,
        leadDev: 60,
        dev: 30
    }
};

const EFFORT_DISTRIBUTION = {
    low: {
        architect: 0.10,
        leadDev: 0.10,
        dev: 0.80
    },
    medium: {
        architect: 0.15,
        leadDev: 0.30,
        dev: 0.45
    },
    high: {
        architect: 0.20,
        leadDev: 0.55,
        dev: 0.25
    }
};

const DEFAULT_RESOURCES = {
    architect: 3,
    leadDev: 10,
    dev: 20
};

const EFFICIENCY_FACTORS = {
    architect: {
        min: 1.5,    // Efficiency loss multiplier when understaffed
        optimal: 1,   // No efficiency loss at optimal staffing
        max: 1.2     // Some efficiency loss due to coordination overhead when overstaffed
    },
    leadDev: {
        min: 1.4,
        optimal: 1,
        max: 1.15
    },
    dev: {
        min: 1.3,
        optimal: 1,
        max: 1.1
    }
};

function updateProgressBar(pageNumber) {
    document.querySelectorAll('.step').forEach((step, index) => {
        if (index + 1 <= pageNumber) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

function updatePageIndicator(pageNumber) {
    const indicator = document.querySelector('.page-indicator');
    if (indicator) {
        indicator.textContent = `${pageNumber}/3`;
    }
}

function validatePage(pageNumber) {
    const page = document.getElementById(`page${pageNumber}`);
    if (!page) return false;

    const requiredInputs = page.querySelectorAll('input[required], select[required]');
    let isValid = true;

    requiredInputs.forEach(input => {
        const formGroup = input.closest('.form-group');
        
        // Handle validation state
        if (input.type === 'checkbox') {
            if (!input.checked) {
                isValid = false;
                if (formGroup) formGroup.classList.add('error');
            } else {
                if (formGroup) formGroup.classList.remove('error');
            }
        } else if (!input.value) {
            isValid = false;
            if (formGroup) formGroup.classList.add('error');
        } else {
            if (formGroup) formGroup.classList.remove('error');
        }
    });

    return isValid;
}

function nextPage(currentPageNumber) {
    if (!validatePage(currentPageNumber)) {
        alert('Please fill in all required fields.');
        return;
    }

    const currentPageElement = document.getElementById(`page${currentPageNumber}`);
    const nextPageElement = document.getElementById(`page${currentPageNumber + 1}`);
    
    if (currentPageElement && nextPageElement) {
        currentPageElement.style.display = 'none';
        nextPageElement.style.display = 'block';
        currentPage = currentPageNumber + 1;
        updateProgressBar(currentPage);
        updatePageIndicator(currentPage);

        if (currentPage === 3) {
            calculateBudget();
        }
    }
}

function previousPage(currentPageNumber) {
    const currentPageElement = document.getElementById(`page${currentPageNumber}`);
    const prevPageElement = document.getElementById(`page${currentPageNumber - 1}`);
    
    if (currentPageElement && prevPageElement) {
        currentPageElement.style.display = 'none';
        prevPageElement.style.display = 'block';
        currentPage = currentPageNumber - 1;
        updateProgressBar(currentPage);
        updatePageIndicator(currentPage);
    }
}

function calculateEfficiencyFactor(currentCount, defaultCount, role) {
    const ratio = currentCount / defaultCount;
    const factors = EFFICIENCY_FACTORS[role];
    
    if (ratio < 1) {
        // Understaffed: Apply higher cost multiplier
        return factors.min;
    } else if (ratio > 1.5) {
        // Overstaffed: Apply overhead multiplier
        return factors.max;
    }
    return factors.optimal;
}

function calculateBudget() {
    // Get form values
    const totalPartners = parseInt(document.getElementById('totalPartners').value);
    const lowComplexity = parseInt(document.getElementById('lowComplexity').value);
    const mediumComplexity = parseInt(document.getElementById('mediumComplexity').value);
    const highComplexity = parseInt(document.getElementById('highComplexity').value);
    const deployment = document.getElementById('deployment').value;

    // Calculate base efforts for each complexity
    const lowEffortDays = (lowComplexity * 0.4) + (totalPartners/3); 
    const mediumEffortDays = (mediumComplexity * 2.5) + (totalPartners/3);
    const highEffortDays = (highComplexity * 5) + (totalPartners/3);

    // Calculate role-wise efforts based on complexity distribution
    const architectEfforts = (lowEffortDays * 0.1) + (mediumEffortDays * 0.15) + (highEffortDays * 0.2);
    const leadDevEfforts = (lowEffortDays * 0.1) + (mediumEffortDays * 0.3) + (highEffortDays * 0.55);
    const devEfforts = (lowEffortDays * 0.8) + (mediumEffortDays * 0.45) + (highEffortDays * 0.25);

    // Calculate costs using default efficiency
    const architectCost = architectEfforts * RATE_CARD[deployment].architect;
    const leadDevCost = leadDevEfforts * RATE_CARD[deployment].leadDev;
    const devCost = devEfforts * RATE_CARD[deployment].dev;

    const totalCost = architectCost + leadDevCost + devCost;

    // Format currency values
    const formatCurrency = (value) => new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
    }).format(value);

    const budgetEstimateDiv = document.getElementById('budgetEstimate');
    
    budgetEstimateDiv.innerHTML = `
        <div class="budget-summary">
            <div class="budget-card">
                <h2>Estimated Project Budget</h2>
                <div class="total-amount">${formatCurrency(totalCost)}</div>
                <div class="deployment-model">
                    ${deployment.charAt(0).toUpperCase() + deployment.slice(1)} Deployment Model
                </div>
                <div class="budget-note">
                    This estimate is based on your specific requirements and includes all development resources.
                </div>
            </div>
        </div>
    `;
}

// Add event listeners for resource sliders
document.addEventListener('DOMContentLoaded', function() {
    const architectSlider = document.getElementById('architectCount');
    const leadDevSlider = document.getElementById('leadDevCount');
    const devSlider = document.getElementById('devCount');
    
    const architectValue = document.getElementById('architectCountValue');
    const leadDevValue = document.getElementById('leadDevCountValue');
    const devValue = document.getElementById('devCountValue');

    architectSlider.addEventListener('input', function() {
        architectValue.textContent = this.value;
        calculateBudget();
    });

    leadDevSlider.addEventListener('input', function() {
        leadDevValue.textContent = this.value;
        calculateBudget();
    });

    devSlider.addEventListener('input', function() {
        devValue.textContent = this.value;
        calculateBudget();
    });
}); 