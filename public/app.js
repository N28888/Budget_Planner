// API 配置
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

// 数据存储
let data = {
    primaryCurrency: 'CNY',
    secondaryCurrency: 'USD',
    exchangeRate: 7.2,
    taxRate: 13,
    monthlyBudget: 0,
    expenses: [],
    wishlist: [],
    lastRateUpdate: null
};

// 检查登录状态
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/auth.html';
        return false;
    }
    return true;
}

// 从服务器加载数据
async function loadData() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${API_URL}/data`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            window.location.href = '/auth.html';
            return;
        }

        if (response.ok) {
            data = await response.json();
        }
    } catch (error) {
        console.error('加载数据失败:', error);
    }
}

// 保存数据到服务器
async function saveData() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        await fetch(`${API_URL}/data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
    } catch (error) {
        console.error('保存数据失败:', error);
    }
}

// 登出
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/auth.html';
}

// 获取汇率
async function fetchExchangeRate() {
    try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${data.primaryCurrency}`);
        const result = await response.json();
        const oldRate = data.exchangeRate;
        data.exchangeRate = result.rates[data.secondaryCurrency];
        data.lastRateUpdate = Date.now();
        
        // 更新愿望清单中以次货币添加的商品价格
        updateWishlistPrices(oldRate, data.exchangeRate);
        
        updateRateDisplay();
        saveData();
        updateAllDisplays();
    } catch (error) {
        console.error('获取汇率失败:', error);
        document.getElementById('rateInfo').textContent = '汇率获取失败';
    }
}

// 更新愿望清单价格（当汇率变化时）
function updateWishlistPrices(oldRate, newRate) {
    data.wishlist.forEach(wish => {
        // 如果商品是以次货币添加的，需要重新计算主货币价格
        if (wish.originalCurrency === 'secondary' && wish.originalPrice !== undefined) {
            // 使用原始次货币价格和新汇率计算主货币价格
            wish.price = wish.originalPrice / newRate;
        }
    });
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
            <div class="item-actions">
                <button class="edit-btn" onclick="editExpense(${index})">编辑</button>
                <button class="delete-btn" onclick="deleteExpense(${index})">删除</button>
            </div>
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
        
        // 显示货币标记
        let currencyBadge = '';
        if (wish.originalCurrency === 'secondary') {
            currencyBadge = `<span class="currency-badge">📍 ${data.secondaryCurrency}</span>`;
        }
        
        div.innerHTML = `
            <div class="item-info">
                <div class="item-name">${wish.name} ${currencyBadge}</div>
                <div class="item-amount">${formatAmount(wish.price, data.primaryCurrency)}</div>
                <div class="item-amount-secondary">${formatAmount(convertCurrency(wish.price), data.secondaryCurrency)}</div>
            </div>
            <div class="item-actions">
                <button class="edit-btn" onclick="editWish(${index})">编辑</button>
                <button class="delete-btn" onclick="deleteWish(${index})">删除</button>
            </div>
        `;
        list.appendChild(div);
    });
}

// 当前编辑的索引
let editingWishIndex = -1;
let editingExpenseIndex = -1;

// 编辑支出项目
function editExpense(index) {
    const expense = data.expenses[index];
    editingExpenseIndex = index;
    
    // 更新模态框中的货币标签
    document.getElementById('editExpenseCurrencyPrimary').textContent = data.primaryCurrency;
    document.getElementById('editExpenseCurrencySecondary').textContent = data.secondaryCurrency;
    
    // 填充表单
    document.getElementById('editExpenseName').value = expense.name;
    
    // 判断原始货币
    if (expense.amountInSecondary !== undefined && expense.exchangeRate !== undefined) {
        // 检查是否是次货币添加的
        const calculatedPrimary = expense.amountInSecondary / expense.exchangeRate;
        if (Math.abs(calculatedPrimary - expense.amount) < 0.01) {
            // 是次货币添加的
            document.getElementById('editExpenseAmount').value = expense.amountInSecondary.toFixed(2);
            document.getElementById('editExpenseCurrency').value = 'secondary';
        } else {
            // 是主货币添加的
            document.getElementById('editExpenseAmount').value = expense.amount.toFixed(2);
            document.getElementById('editExpenseCurrency').value = 'primary';
        }
    } else {
        // 旧数据，默认主货币
        document.getElementById('editExpenseAmount').value = expense.amount.toFixed(2);
        document.getElementById('editExpenseCurrency').value = 'primary';
    }
    
    // 显示模态框
    document.getElementById('editExpenseModal').classList.add('show');
}

// 关闭编辑支出模态框
function closeEditExpenseModal() {
    document.getElementById('editExpenseModal').classList.remove('show');
    editingExpenseIndex = -1;
    
    // 清空表单
    document.getElementById('editExpenseName').value = '';
    document.getElementById('editExpenseAmount').value = '';
}

// 保存编辑的支出
function saveEditExpense() {
    const name = document.getElementById('editExpenseName').value;
    let amount = parseFloat(document.getElementById('editExpenseAmount').value);
    const currency = document.getElementById('editExpenseCurrency').value;
    
    if (!name || !amount || amount <= 0) {
        alert('请填写完整信息');
        return;
    }
    
    let amountInSecondary;
    
    // 如果是次货币，转换为主货币
    if (currency === 'secondary') {
        amountInSecondary = amount;
        amount = amount / data.exchangeRate;
    } else {
        amountInSecondary = amount * data.exchangeRate;
    }
    
    // 更新支出项目
    data.expenses[editingExpenseIndex] = {
        name,
        amount,
        amountInSecondary,
        exchangeRate: data.exchangeRate,
        primaryCurrency: data.primaryCurrency,
        secondaryCurrency: data.secondaryCurrency
    };
    
    saveData();
    updateAllDisplays();
    closeEditExpenseModal();
}

// 编辑愿望清单项目
function editWish(index) {
    const wish = data.wishlist[index];
    editingWishIndex = index;
    
    // 更新模态框中的货币标签
    document.getElementById('editWishCurrencyPrimary').textContent = data.primaryCurrency;
    document.getElementById('editWishCurrencySecondary').textContent = data.secondaryCurrency;
    
    // 填充表单
    document.getElementById('editWishName').value = wish.name;
    
    // 根据原始货币填充价格
    if (wish.originalCurrency === 'secondary' && wish.originalPrice !== undefined) {
        document.getElementById('editWishPrice').value = wish.originalPrice;
        document.getElementById('editWishCurrency').value = 'secondary';
    } else {
        document.getElementById('editWishPrice').value = wish.price.toFixed(2);
        document.getElementById('editWishCurrency').value = 'primary';
    }
    
    // 显示模态框
    document.getElementById('editWishModal').classList.add('show');
}

// 关闭编辑模态框
function closeEditWishModal() {
    document.getElementById('editWishModal').classList.remove('show');
    editingWishIndex = -1;
    
    // 清空表单
    document.getElementById('editWishName').value = '';
    document.getElementById('editWishPrice').value = '';
    document.getElementById('editWishTaxOption').value = 'no';
    document.getElementById('editWishTaxType').disabled = true;
}

// 保存编辑的愿望清单
function saveEditWish() {
    const name = document.getElementById('editWishName').value;
    let price = parseFloat(document.getElementById('editWishPrice').value);
    const currency = document.getElementById('editWishCurrency').value;
    const taxOption = document.getElementById('editWishTaxOption').value;
    const taxType = document.getElementById('editWishTaxType').value;
    
    if (!name || !price || price <= 0) {
        alert('请填写完整信息');
        return;
    }
    
    let originalPrice = price;
    let originalCurrency = currency;
    
    // 处理税费（在货币转换之前）
    if (taxOption === 'yes') {
        if (taxType === 'before') {
            price = price * (1 + data.taxRate / 100);
            originalPrice = price;
        }
    }
    
    // 如果是次货币，转换为主货币
    if (currency === 'secondary') {
        price = price / data.exchangeRate;
    }
    
    // 更新愿望清单项目
    data.wishlist[editingWishIndex] = {
        name,
        price,
        originalPrice: originalCurrency === 'secondary' ? originalPrice : undefined,
        originalCurrency: originalCurrency,
        addedAt: data.wishlist[editingWishIndex].addedAt || Date.now()
    };
    
    saveData();
    updateWishlist();
    updateBudgetDisplay();
    closeEditWishModal();
}

// 更新货币选择器标签
function updateCurrencyLabels() {
    // 更新支出货币选择器
    document.getElementById('expenseCurrencyPrimary').textContent = data.primaryCurrency;
    document.getElementById('expenseCurrencySecondary').textContent = data.secondaryCurrency;
    
    // 更新愿望清单货币选择器
    document.getElementById('wishCurrencyPrimary').textContent = data.primaryCurrency;
    document.getElementById('wishCurrencySecondary').textContent = data.secondaryCurrency;
}

// 更新所有显示
function updateAllDisplays() {
    updateBudgetDisplay();
    updateExpensesList();
    updateWishlist();
    updateCurrencyLabels();
}

// 删除函数
function deleteExpense(index) {
    data.expenses.splice(index, 1);
    saveData();
    updateAllDisplays();
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
        let originalPrice = price;
        let originalCurrency = currency;
        
        // 处理税费（在货币转换之前）
        if (taxOption === 'yes') {
            if (taxType === 'before') {
                // 税前价：加上税费
                price = price * (1 + data.taxRate / 100);
                originalPrice = price;
            }
            // 税后价：不需要处理，直接使用输入的价格
        }
        
        // 如果是次货币，转换为主货币
        if (currency === 'secondary') {
            price = price / data.exchangeRate;
        }
        
        // 保存商品信息，包括原始货币和价格
        data.wishlist.push({ 
            name, 
            price,
            originalPrice: originalCurrency === 'secondary' ? originalPrice : undefined,
            originalCurrency: originalCurrency,
            addedAt: Date.now()
        });
        saveData();
        updateWishlist();
        document.getElementById('wishName').value = '';
        document.getElementById('wishPrice').value = '';
        document.getElementById('wishTaxOption').value = 'no';
        document.getElementById('wishTaxType').disabled = true;
    }
});

// 初始化
async function init() {
    if (!checkAuth()) return;

    // 显示用户名
    const username = localStorage.getItem('username');
    if (username) {
        document.getElementById('userName').textContent = username;
    }

    await loadData();
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
    
    // 编辑支出模态框事件监听
    document.getElementById('saveEditExpense').addEventListener('click', saveEditExpense);
    
    document.getElementById('editExpenseModal').addEventListener('click', (e) => {
        if (e.target.id === 'editExpenseModal') {
            closeEditExpenseModal();
        }
    });
    
    // 编辑愿望清单模态框事件监听
    document.getElementById('saveEditWish').addEventListener('click', saveEditWish);
    
    // 编辑模态框税率选项切换
    document.getElementById('editWishTaxOption').addEventListener('change', (e) => {
        const taxType = document.getElementById('editWishTaxType');
        if (e.target.value === 'yes') {
            taxType.disabled = false;
        } else {
            taxType.disabled = true;
        }
    });
    
    // 点击模态框外部关闭
    document.getElementById('editWishModal').addEventListener('click', (e) => {
        if (e.target.id === 'editWishModal') {
            closeEditWishModal();
        }
    });
}

init();
