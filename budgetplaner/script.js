document.addEventListener('DOMContentLoaded', function () {
    const incomeBtn = document.getElementById('income-btn');
    const expenseBtn = document.getElementById('expense-btn');
    const incomeForm = document.getElementById('income-form');
    const expenseForm = document.getElementById('expense-form');
    const incomeTransactionsContainer = document.getElementById('income-transactions-container');
    const expenseTransactionsContainer = document.getElementById('expense-transactions-container');
    const showAllBtn = document.getElementById('show-all-btn');
    const incomeToggle = document.getElementById('income-toggle');
    const expenseToggle = document.getElementById('expense-toggle');
    const totalSection = document.getElementById('total-section');

    let incomeTransactions = [];
    let expenseTransactions = [];

    incomeBtn.addEventListener('click', function () {
        document.getElementById('income-section').style.display = 'block';
        document.getElementById('expense-section').style.display = 'none';
    });

    expenseBtn.addEventListener('click', function () {
        document.getElementById('income-section').style.display = 'none';
        document.getElementById('expense-section').style.display = 'block';
    });

    showAllBtn.addEventListener('click', function () {
        document.getElementById('income-section').style.display = 'block';
        document.getElementById('expense-section').style.display = 'block';
    });

    incomeForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const description = document.getElementById('income-description').value;
        const amount = parseFloat(document.getElementById('income-amount').value);
        const category = document.getElementById('income-category').value;

        if (description && amount && category) {
            const transaction = {
                description,
                amount,
                category
            };

            incomeTransactions.push(transaction);
            renderTransactions(incomeTransactions, incomeTransactionsContainer);
            updateTotal();
            incomeForm.reset();
            showNotification('Einnahme hinzugefügt. Klicken Sie auf den Pfeil, um sie anzuzeigen.');
        } else {
            alert('Bitte geben Sie eine Beschreibung, einen Betrag und wählen Sie eine Kategorie aus.');
        }
    });

    expenseForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const description = document.getElementById('expense-description').value;
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const category = document.getElementById('expense-category').value;

        if (description && amount && category) {
            const transaction = {
                description,
                amount,
                category
            };

            expenseTransactions.push(transaction);
            renderTransactions(expenseTransactions, expenseTransactionsContainer);
            updateTotal();
            expenseForm.reset();
            showNotification('Ausgabe hinzugefügt. Klicken Sie auf den Pfeil, um sie anzuzeigen.');
        } else {
            alert('Bitte geben Sie eine Beschreibung, einen Betrag und wählen Sie eine Kategorie aus.');
        }
    });

    function renderTransactions(transactions, container) {
        container.innerHTML = '';
        transactions.forEach(function (transaction, index) {
            const transactionElement = document.createElement('div');
            transactionElement.classList.add('transaction');
            transactionElement.innerHTML = `
                <span>${transaction.description} - ${transaction.amount}€ - Kategorie: ${transaction.category}</span>
                <button class="delete-btn" data-index="${index}"><i class="fas fa-trash"></i></button>
            `;
            container.appendChild(transactionElement);
        });

        const deleteButtons = container.querySelectorAll('.delete-btn');
        deleteButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                const index = parseInt(button.getAttribute('data-index'));
                transactions.splice(index, 1);
                renderTransactions(transactions, container);
                updateTotal();
            });
        });
    }

    if (localStorage.getItem('incomeTransactions')) {
        incomeTransactions = JSON.parse(localStorage.getItem('incomeTransactions'));
        renderTransactions(incomeTransactions, incomeTransactionsContainer);
    }

    if (localStorage.getItem('expenseTransactions')) {
        expenseTransactions = JSON.parse(localStorage.getItem('expenseTransactions'));
        renderTransactions(expenseTransactions, expenseTransactionsContainer);
    }

    window.addEventListener('unload', function () {
        localStorage.setItem('incomeTransactions', JSON.stringify(incomeTransactions));
        localStorage.setItem('expenseTransactions', JSON.stringify(expenseTransactions));
    });

    function showNotification(message) {
        alert(message);
    }

    incomeToggle.addEventListener('click', function () {
        toggleTransactionsDisplay(incomeTransactionsContainer, incomeToggle);
    });

    expenseToggle.addEventListener('click', function () {
        toggleTransactionsDisplay(expenseTransactionsContainer, expenseToggle);
    });

    function toggleTransactionsDisplay(container, toggle) {
        if (container.style.display === 'none' || container.style.display === '') {
            container.style.display = 'block';
            toggle.classList.remove('fa-chevron-down');
            toggle.classList.add('fa-chevron-up');
        } else {
            container.style.display = 'none';
            toggle.classList.remove('fa-chevron-up');
            toggle.classList.add('fa-chevron-down');
        }
    }

    incomeTransactionsContainer.style.display = 'block';
    incomeToggle.classList.remove('fa-chevron-down');
    incomeToggle.classList.add('fa-chevron-up');

    expenseTransactionsContainer.style.display = 'block';
    expenseToggle.classList.remove('fa-chevron-down');
    expenseToggle.classList.add('fa-chevron-up');

    function updateTotal() {
        const totalAmount = calculateTotalAmount();
        const totalSpan = totalSection.querySelector('span');
        totalSpan.textContent = `${totalAmount}€`;

        if (totalAmount < 0) {
            totalSpan.style.color = 'red';
            totalSection.classList.add('flash');
        } else {
            totalSpan.style.color = 'green';
            totalSection.classList.remove('flash');
        }
    }

    function calculateTotalAmount() {
        const incomeTotal = incomeTransactions.reduce((total, transaction) => total + transaction.amount, 0);
        const expenseTotal = expenseTransactions.reduce((total, transaction) => total + transaction.amount, 0);
        return incomeTotal - expenseTotal;
    }

    document.getElementById('clear-search-btn').addEventListener('click', function () {
        document.getElementById('transaction-search').value = '';
        renderTransactions(incomeTransactions, incomeTransactionsContainer);
        renderTransactions(expenseTransactions, expenseTransactionsContainer);
        updateTotal();
    });
    
    document.getElementById('search-btn').addEventListener('click', function () {
        const searchQuery = document.getElementById('transaction-search').value.toLowerCase();
    
        const foundIncomes = incomeTransactions.filter(transaction =>
            transaction.description.toLowerCase().includes(searchQuery) ||
            transaction.amount.toString().includes(searchQuery) ||
            transaction.category.toLowerCase().includes(searchQuery)
        );
    
        const foundExpenses = expenseTransactions.filter(transaction =>
            transaction.description.toLowerCase().includes(searchQuery) ||
            transaction.amount.toString().includes(searchQuery) ||
            transaction.category.toLowerCase().includes(searchQuery)
        );
    
        if (foundIncomes.length > 0) {
            incomeTransactionsContainer.scrollIntoView({ behavior: 'smooth' });
            renderTransactions(foundIncomes, incomeTransactionsContainer);
            highlightElement(incomeTransactionsContainer);
        } else {
            alert('Keine passenden Einnahmen gefunden.');
        }
    
        if (foundExpenses.length > 0) {
            expenseTransactionsContainer.scrollIntoView({ behavior: 'smooth' });
            renderTransactions(foundExpenses, expenseTransactionsContainer);
            highlightElement(expenseTransactionsContainer);
        } else {
            alert('Keine passenden Ausgaben gefunden.');
        }
    });
    
    function highlightElement(element) {
        const originalBackgroundColor = element.style.backgroundColor;
        element.style.backgroundColor = '#cce5ff'; 
        element.style.borderRadius = '10px'; 
    
        setTimeout(function () {
            element.style.backgroundColor = originalBackgroundColor;
            element.style.borderRadius = '';
            element.style.height = '';
        }, 3000);
    }
});
