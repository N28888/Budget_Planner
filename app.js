// 数据存储
let data = {
    primaryCurrency: 'CNY',
    secondaryCurrency: 'USD',
    exchangeRate: 7.2,
    taxRate: 13,
    monthlyBudget: 0,
    expenses: [],
    savings: [],
    wishlist: [],
    lastRateUpdate: null
};

// 从本地存储加载数据
function loadData() {
    const saved = localStorage.getItem('budgetTrackerData');
    if (saved) {
        data = JSON.parse(saved);
    }
}

// 保存数据到本地存储
function saveData() {
    localStorage.setItem('budgetTrackerData', JSON.stringify(data));
}

// 获取汇率
async function fetchExchangeRate() {
    try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${data.primaryCurrency}`);
        const result = await response.json();
        data.exchangeRate = result.rates[data.secondaryCurrency];
        data.lastRateUpdate = Date.now();
        updateRateDisplay();
        saveData();
        updateAllDisplays();
    } catch (error) {
        console.error('获取汇率失败:', error);
        document.getElementById('rateInfo').textContent = '汇率获取失败';
    }
}

// 检查是否需要更新汇率
function checkAndUpdateRate() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000; // 1小时的毫秒数
    
    if (!data.lastRateUpdate || (now - data.lastRateUpdate) >= oneHour) {
        console.log('自动更新汇率...');
        fetchExchangeRate();
    }
}

// 启动自动更新汇率定时器
function startAutoRateUpdate() {
    // 每小时检查并更新一次
    setInterval(checkAndUpdateRate, 60 * 60 * 1000);
    
    // 页面加载时检查一次
    checkAndUpdateRate();
}

// 更新汇率显示
function updateRateDisplay() {
    const rateInfo = document.getElementById('rateInfo');
    let displayText = `1 ${data.primaryCurrency} = ${data.exchangeRate.toFixed(2)} ${data.secondaryCurrency}`;
    
    // 显示上次更新时间
    if (data.lastRateUpdate) {
        const updateTime = new Date(data.lastRateUpdate);
        const now = new Date();
        const diffMinutes = Math.floor((now - updateTime) / (1000 * 60));
        
        if (diffMinutes < 60) {
            displayText += ` (${diffMinutes}分钟前)`;
        } else {
            const diffHours = Math.floor(diffMinutes / 60);
            displayText += ` (${diffHours}小时前)`;
        }
    }
    
    rateInfo.textContent = displayText;
}

// 格式化金额
function formatAmount(amount, currency) {
    const symbols = {
        'CNY': '¥',
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'HKD': 'HK$',
        'CAD': 'C$'
    };
    return `${symbols[currency] || ''}${amount.toFixed(2)}`;
}

// 转换货币
function convertCurrency(amount) {
    return amount * data.exchangeRate;
}

// 更新预算显示
function updateBudgetDisplay() {
    const totalExpenses = data.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remaining = data.monthlyBudget - totalExpenses;
    const wishlistTotal = data.wishlist.reduce((sum, wish) => sum + wish.price, 0);
    const afterWishlist = remaining - wishlistTotal;
    
    document.getElementById('budgetPrimary').textContent = formatAmount(data.monthlyBudget, data.primaryCurrency);
    document.getElementById('budgetSecondary').textContent = formatAmount(convertCurrency(data.monthlyBudget), data.secondaryCurrency);
    
    document.getElementById('spentPrimary').textContent = formatAmount(totalExpenses, data.primaryCurrency);
    document.getElementById('spentSecondary').textContent = formatAmount(convertCurrency(totalExpenses), data.secondaryCurrency);
    
    document.getElementById('remainingPrimary').textContent = formatAmount(remaining, data.primaryCurrency);
    document.getElementById('remainingSecondary').textContent = formatAmount(convertCurrency(remaining), data.secondaryCurrency);
    
    document.getElementById('wishlistTotalPrimary').textContent = formatAmount(wishlistTotal, data.primaryCurrency);
    document.getElementById('wishlistTotalSecondary').textContent = formatAmount(convertCurrency(wishlistTotal), data.secondaryCurrency);
    
    document.getElementById('afterWishlistPrimary').textContent = formatAmount(afterWishlist, data.primaryCurrency);
    document.getElementById('afterWishlistSecondary').textContent = formatAmount(convertCurrency(afterWishlist), data.secondaryCurrency);
}

// 更新支出列表
function updateExpensesList() {
    const list = document.getElementById('expensesList');
    
    if (data.expenses.length === 0) {
        list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📝</div><div class="empty-state-text">还没有支出记录</div></div>';
        return;
    }
    
    list.innerHTML = '';
    data.expenses.forEach((expense, index) => {
        const div = document.createElement('div');
        div.className = 'list-item';
        
        // 使用保存的汇率显示次货币金额
        let secondaryAmount;
        if (expense.amountInSecondary !== undefined) {
            // 新格式：使用保存的次货币金额
            secondaryAmount = expense.amountInSecondary;
        } else {
            // 旧格式：使用当前汇率转换（兼容旧数据）
            secondaryAmount = convertCurrency(expense.amount);
        }
        
        div.innerHTML = `
            <div class="item-info">
                <div class="item-name">${expense.name}</div>
                <div class="item-amount">${formatAmount(expense.amount, data.primaryCurrency)}</div>
                <div class="item-amount-secondary">${formatAmount(secondaryAmount, data.secondaryCurrency)}</div>
            </div>
            <button class="delete-btn" onclick="deleteExpense(${index})">删除</button>
        `;
        list.appendChild(div);
    });
}

// 更新储蓄列表
function updateSavingsList() {
    const list = document.getElementById('savingsList');
    
    if (data.savings.length === 0) {
        list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🎯</div><div class="empty-state-text">还没有储蓄目标</div></div>';
        return;
    }
    
    list.innerHTML = '';
    data.savings.forEach((saving, index) => {
        const progress = (saving.current / saving.target * 100).toFixed(1);
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
            <div class="item-info">
                <div class="item-name">${saving.name}</div>
                <div class="item-amount">${formatAmount(saving.current, data.primaryCurrency)} / ${formatAmount(saving.target, data.primaryCurrency)}</div>
                <div class="item-amount-secondary">${formatAmount(convertCurrency(saving.current), data.secondaryCurrency)} / ${formatAmount(convertCurrency(saving.target), data.secondaryCurrency)}</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
                </div>
                <div class="progress-text">${progress}% 完成</div>
            </div>
            <button class="delete-btn" onclick="deleteSavings(${index})">删除</button>
        `;
        list.appendChild(div);
    });
}

// 更新愿望清单
function updateWishlist() {
    const list = document.getElementById('wishList');
    
    if (data.wishlist.length === 0) {
        list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🛍️</div><div class="empty-state-text">还没有愿望清单</div></div>';
        return;
    }
    
    list.innerHTML = '';
    data.wishlist.forEach((wish, index) => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
            <div class="item-info">
                <div class="item-name">${wish.name}</div>
                <div class="item-amount">${formatAmount(wish.price, data.primaryCurrency)}</div>
                <div class="item-amount-secondary">${formatAmount(convertCurrency(wish.price), data.secondaryCurrency)}</div>
            </div>
            <button class="delete-btn" onclick="deleteWish(${index})">删除</button>
        `;
        list.appendChild(div);
    });
}

// 更新货币选择器标签
function updateCurrencyLabels() {
    // 更新支出货币选择器
    document.getElementById('expenseCurrencyPrimary').textContent = data.primaryCurrency;
    document.getElementById('expenseCurrencySecondary').textContent = data.secondaryCurrency;
    
    // 更新储蓄货币选择器
    document.getElementById('savingsCurrencyPrimary').textContent = data.primaryCurrency;
    document.getElementById('savingsCurrencySecondary').textContent = data.secondaryCurrency;
    
    // 更新愿望清单货币选择器
    document.getElementById('wishCurrencyPrimary').textContent = data.primaryCurrency;
    document.getElementById('wishCurrencySecondary').textContent = data.secondaryCurrency;
}

// 更新所有显示
function updateAllDisplays() {
    updateBudgetDisplay();
    updateExpensesList();
    updateSavingsList();
    updateWishlist();
    updateCurrencyLabels();
}

// 删除函数
function deleteExpense(index) {
    data.expenses.splice(index, 1);
    saveData();
    updateAllDisplays();
}

function deleteSavings(index) {
    data.savings.splice(index, 1);
    saveData();
    updateSavingsList();
}

function deleteWish(index) {
    data.wishlist.splice(index, 1);
    saveData();
    updateWishlist();
}

// 页面切换
function switchPage(section) {
    // 更新导航
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    // 更新页面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(`${section}-page`).classList.add('active');
    
    // 更新标题
    const titles = {
        'overview': '总览',
        'expenses': '支出管理',
        'savings': '储蓄目标',
        'wishlist': '愿望清单',
        'settings': '设置'
    };
    document.getElementById('pageTitle').textContent = titles[section];
}

// 事件监听器
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        const section = item.getAttribute('data-section');
        switchPage(section);
    });
});

document.getElementById('primaryCurrency').addEventListener('change', (e) => {
    data.primaryCurrency = e.target.value;
    saveData();
    updateCurrencyLabels();
    fetchExchangeRate();
});

document.getElementById('secondaryCurrency').addEventListener('change', (e) => {
    data.secondaryCurrency = e.target.value;
    saveData();
    updateCurrencyLabels();
    fetchExchangeRate();
});

document.getElementById('updateRate').addEventListener('click', fetchExchangeRate);

document.getElementById('setBudget').addEventListener('click', () => {
    const amount = parseFloat(document.getElementById('monthlyBudget').value);
    if (amount && amount > 0) {
        data.monthlyBudget = amount;
        saveData();
        updateBudgetDisplay();
        document.getElementById('monthlyBudget').value = '';
    }
});

document.getElementById('addExpense').addEventListener('click', () => {
    const name = document.getElementById('expenseName').value;
    let amount = parseFloat(document.getElementById('expenseAmount').value);
    const currency = document.getElementById('expenseCurrency').value;
    
    if (name && amount && amount > 0) {
        let amountInSecondary;
        
        // 如果是次货币，转换为主货币
        if (currency === 'secondary') {
            amountInSecondary = amount;
            amount = amount / data.exchangeRate;
        } else {
            amountInSecondary = amount * data.exchangeRate;
        }
        
        // 保存支出时记录当时的汇率和次货币金额
        data.expenses.push({ 
            name, 
            amount, 
            amountInSecondary,
            exchangeRate: data.exchangeRate,
            primaryCurrency: data.primaryCurrency,
            secondaryCurrency: data.secondaryCurrency
        });
        saveData();
        updateAllDisplays();
        document.getElementById('expenseName').value = '';
        document.getElementById('expenseAmount').value = '';
    }
});

document.getElementById('addSavings').addEventListener('click', () => {
    const name = document.getElementById('savingsName').value;
    let target = parseFloat(document.getElementById('savingsTarget').value);
    let current = parseFloat(document.getElementById('savingsCurrent').value) || 0;
    const currency = document.getElementById('savingsCurrency').value;
    
    if (name && target && target > 0) {
        // 如果是次货币，转换为主货币
        if (currency === 'secondary') {
            target = target / data.exchangeRate;
            current = current / data.exchangeRate;
        }
        data.savings.push({ name, target, current });
        saveData();
        updateSavingsList();
        document.getElementById('savingsName').value = '';
        document.getElementById('savingsTarget').value = '';
        document.getElementById('savingsCurrent').value = '';
    }
});

// 税率选项切换
document.getElementById('wishTaxOption').addEventListener('change', (e) => {
    const taxType = document.getElementById('wishTaxType');
    if (e.target.value === 'yes') {
        taxType.disabled = false;
    } else {
        taxType.disabled = true;
    }
});

// 保存税率
document.getElementById('saveTaxRate').addEventListener('click', () => {
    const taxRate = parseFloat(document.getElementById('taxRate').value);
    if (taxRate >= 0) {
        data.taxRate = taxRate;
        saveData();
        alert(`税率已设置为 ${taxRate}%`);
    }
});

document.getElementById('addWish').addEventListener('click', () => {
    const name = document.getElementById('wishName').value;
    let price = parseFloat(document.getElementById('wishPrice').value);
    const currency = document.getElementById('wishCurrency').value;
    const taxOption = document.getElementById('wishTaxOption').value;
    const taxType = document.getElementById('wishTaxType').value;
    
    if (name && price && price > 0) {
        // 如果是次货币，转换为主货币
        if (currency === 'secondary') {
            price = price / data.exchangeRate;
        }
        
        // 处理税费
        if (taxOption === 'yes') {
            if (taxType === 'before') {
                // 税前价：加上税费
                price = price * (1 + data.taxRate / 100);
            }
            // 税后价：不需要处理，直接使用输入的价格
        }
        
        data.wishlist.push({ name, price });
        saveData();
        updateWishlist();
        document.getElementById('wishName').value = '';
        document.getElementById('wishPrice').value = '';
        document.getElementById('wishTaxOption').value = 'no';
        document.getElementById('wishTaxType').disabled = true;
    }
});

// 初始化
loadData();
document.getElementById('primaryCurrency').value = data.primaryCurrency;
document.getElementById('secondaryCurrency').value = data.secondaryCurrency;
document.getElementById('taxRate').value = data.taxRate || 13;
updateCurrencyLabels();
updateRateDisplay();
updateAllDisplays();

// 启动自动汇率更新
startAutoRateUpdate();

// 每分钟更新一次显示的时间
setInterval(updateRateDisplay, 60000);
