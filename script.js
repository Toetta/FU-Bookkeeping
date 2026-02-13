// Transaction storage key
const STORAGE_KEY = 'bookkeeping_transactions';

// Load transactions from localStorage
function loadTransactions() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

// Save transactions to localStorage
function saveTransactions(transactions) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

// Calculate totals
function calculateTotals(transactions) {
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(transaction => {
        if (transaction.type === 'income') {
            totalIncome += transaction.amount;
        } else {
            totalExpense += transaction.amount;
        }
    });

    return {
        income: totalIncome,
        expense: totalExpense,
        balance: totalIncome - totalExpense
    };
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Update display
function updateDisplay() {
    const transactions = loadTransactions();
    const totals = calculateTotals(transactions);

    // Update balance card
    document.getElementById('balance').textContent = formatCurrency(totals.balance);
    document.getElementById('total-income').textContent = formatCurrency(totals.income);
    document.getElementById('total-expense').textContent = formatCurrency(totals.expense);

    // Update transactions list
    const transactionsList = document.getElementById('transactions-list');
    
    if (transactions.length === 0) {
        transactionsList.innerHTML = '<p class="no-transactions">No transactions yet. Add your first transaction above!</p>';
        return;
    }

    // Sort transactions by date (newest first)
    const sortedTransactions = [...transactions].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });

    transactionsList.innerHTML = sortedTransactions.map((transaction, index) => {
        const actualIndex = transactions.findIndex(t => t.id === transaction.id);
        return `
            <div class="transaction-item ${transaction.type}-item">
                <div class="transaction-info">
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-date">${formatDate(transaction.date)}</div>
                </div>
                <span class="transaction-amount">${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}</span>
                <button class="btn-delete" onclick="deleteTransaction(${actualIndex})">Delete</button>
            </div>
        `;
    }).join('');
}

// Add transaction
function addTransaction(description, amount, type, date) {
    const transactions = loadTransactions();
    
    const newTransaction = {
        id: Date.now(),
        description,
        amount: parseFloat(amount),
        type,
        date
    };

    transactions.push(newTransaction);
    saveTransactions(transactions);
    updateDisplay();
}

// Delete transaction
function deleteTransaction(index) {
    const transactions = loadTransactions();
    transactions.splice(index, 1);
    saveTransactions(transactions);
    updateDisplay();
}

// Clear all transactions
function clearAllTransactions() {
    if (confirm('Are you sure you want to delete all transactions? This action cannot be undone.')) {
        localStorage.removeItem(STORAGE_KEY);
        updateDisplay();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    const dateInput = document.getElementById('date');
    dateInput.value = new Date().toISOString().split('T')[0];

    // Form submission
    document.getElementById('transaction-form').addEventListener('submit', function(e) {
        e.preventDefault();

        const description = document.getElementById('description').value.trim();
        const amount = document.getElementById('amount').value;
        const type = document.getElementById('type').value;
        const date = document.getElementById('date').value;

        if (description && amount && date) {
            addTransaction(description, amount, type, date);
            
            // Reset form
            this.reset();
            dateInput.value = new Date().toISOString().split('T')[0];
            
            // Focus on description field
            document.getElementById('description').focus();
        }
    });

    // Clear all button
    document.getElementById('clear-all').addEventListener('click', clearAllTransactions);

    // Initial display update
    updateDisplay();
});
