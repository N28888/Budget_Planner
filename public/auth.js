const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

// 标签切换
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(`${tab}-form`).classList.add('active');
        
        // 清除错误信息
        document.getElementById('login-error').classList.remove('show');
        document.getElementById('register-error').classList.remove('show');
    });
});

// 显示错误信息
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.add('show');
}

// 登录
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            showError('login-error', data.error || '登录失败');
            return;
        }
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        window.location.href = '/index.html';
    } catch (error) {
        showError('login-error', '网络错误，请稍后重试');
    }
});

// 注册
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const passwordConfirm = document.getElementById('register-password-confirm').value;
    
    if (password !== passwordConfirm) {
        showError('register-error', '两次输入的密码不一致');
        return;
    }
    
    if (password.length < 6) {
        showError('register-error', '密码至少需要6个字符');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            showError('register-error', data.error || '注册失败');
            return;
        }
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        window.location.href = '/index.html';
    } catch (error) {
        showError('register-error', '网络错误，请稍后重试');
    }
});

// 检查是否已登录
if (localStorage.getItem('token')) {
    window.location.href = '/index.html';
}
