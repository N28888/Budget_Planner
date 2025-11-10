const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 生产环境检查
if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'your-secret-key-change-in-production') {
    console.error('警告: 生产环境必须设置 JWT_SECRET 环境变量！');
    process.exit(1);
}
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 确保数据目录存在
async function ensureDataDir() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        try {
            await fs.access(USERS_FILE);
        } catch {
            await fs.writeFile(USERS_FILE, JSON.stringify([]));
        }
    } catch (error) {
        console.error('创建数据目录失败:', error);
    }
}

// 读取用户数据
async function readUsers() {
    try {
        const data = await fs.readFile(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

// 写入用户数据
async function writeUsers(users) {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

// 验证 token 中间件
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: '未授权访问' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token 无效' });
        }
        req.user = user;
        next();
    });
}

// 注册
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: '用户名和密码不能为空' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: '密码至少需要6个字符' });
        }

        const users = await readUsers();
        
        if (users.find(u => u.username === username)) {
            return res.status(400).json({ error: '用户名已存在' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: Date.now().toString(),
            username,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
            data: {
                primaryCurrency: 'CNY',
                secondaryCurrency: 'USD',
                exchangeRate: 7.2,
                taxRate: 13,
                monthlyBudget: 0,
                expenses: [],
                wishlist: [],
                lastRateUpdate: null
            }
        };

        users.push(newUser);
        await writeUsers(users);

        const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET);
        res.json({ token, username: newUser.username });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ error: '注册失败' });
    }
});

// 登录
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: '用户名和密码不能为空' });
        }

        const users = await readUsers();
        const user = users.find(u => u.username === username);

        if (!user) {
            return res.status(400).json({ error: '用户名或密码错误' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: '用户名或密码错误' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
        res.json({ token, username: user.username });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ error: '登录失败' });
    }
});

// 获取用户数据
app.get('/api/data', authenticateToken, async (req, res) => {
    try {
        const users = await readUsers();
        const user = users.find(u => u.id === req.user.id);

        if (!user) {
            return res.status(404).json({ error: '用户不存在' });
        }

        res.json(user.data);
    } catch (error) {
        console.error('获取数据错误:', error);
        res.status(500).json({ error: '获取数据失败' });
    }
});

// 保存用户数据
app.post('/api/data', authenticateToken, async (req, res) => {
    try {
        const users = await readUsers();
        const userIndex = users.findIndex(u => u.id === req.user.id);

        if (userIndex === -1) {
            return res.status(404).json({ error: '用户不存在' });
        }

        users[userIndex].data = req.body;
        users[userIndex].updatedAt = new Date().toISOString();
        await writeUsers(users);

        res.json({ success: true });
    } catch (error) {
        console.error('保存数据错误:', error);
        res.status(500).json({ error: '保存数据失败' });
    }
});

// 启动服务器
ensureDataDir().then(() => {
    app.listen(PORT, () => {
        console.log(`服务器运行在 http://localhost:${PORT}`);
    });
});
