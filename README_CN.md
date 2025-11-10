<div align="center">
  <img src="public/icons/icon-192x192.svg" alt="预算追踪器 Logo" width="120" height="120">
  
  # 预算追踪器
  
  [English](README.md) | [中文](README_CN.md)
</div>

一个功能完整的个人预算管理应用，支持多设备同步、双货币转换、PWA 安装等功能。

## ✨ 功能特点

- 💰 **月度预算管理** - 设置和追踪每月预算，实时查看剩余金额
- 💱 **双货币支持** - 支持 7 种货币，实时汇率转换（每小时自动更新）
- 📊 **支出记录** - 记录日常支出，保存添加时的汇率，支持编辑
- 🛍️ **愿望清单** - 记录想买的东西，支持税费计算，自动货币转换
- 👤 **用户系统** - 注册登录，数据云端存储，多设备同步
- 📱 **PWA 支持** - 可安装为 App，全屏体验，无地址栏
- 🎨 **现代 UI** - 深色主题，玻璃态效果，流畅动画
- 🔄 **离线缓存** - Service Worker 支持，部分功能可离线使用

## 📱 安装为 App (PWA)

### iOS (iPhone/iPad)

1. 用 Safari 打开网页
2. 点击底部"分享"按钮
3. 选择"添加到主屏幕"
4. 完成！从主屏幕打开，无地址栏

### Android

1. 用 Chrome 打开网页
2. 点击弹出的"安装"提示
3. 或点击菜单 → "安装应用"
4. 完成！应用出现在应用列表

### 电脑 (Chrome/Edge)

1. 打开网页
2. 点击地址栏右侧的"安装"图标 ⊕
3. 点击"安装"确认
4. 完成！独立窗口运行

## 💻 技术栈

### 前端

- HTML5 / CSS3 / JavaScript
- PWA (Progressive Web App)
- Service Worker (离线缓存)
- 响应式设计

### 后端

- Node.js + Express
- JWT 身份验证
- JSON 文件存储

## 🛠️ 本地开发

```bash
# 安装依赖
npm install

# 启动服务器
npm start

# 访问应用
http://localhost:3000/auth.html
```

## 🌐 部署到服务器

```bash
# 运行部署脚本
./deploy-to-server.sh
```

脚本会自动：

- 打包项目
- 上传到服务器
- 安装依赖
- 启动 PM2 进程
- 配置自动重启

## 💱 支持的货币

- 🇨🇳 CNY (人民币)
- 🇺🇸 USD (美元)
- 🇪🇺 EUR (欧元)
- 🇬🇧 GBP (英镑)
- 🇯🇵 JPY (日元)
- 🇭🇰 HKD (港币)
- 🇨🇦 CAD (加币)

如果有更多所需的货币欢迎创建[Issues](https://github.com/N28888/Budget_Planner/issues)

## ⚙️ 环境变量

创建 `.env` 文件：

```env
PORT=3000
JWT_SECRET=your-secret-key-here
NODE_ENV=production
```

## 📂 项目结构

```
Budget_Planner/
├── public/              # 前端文件
│   ├── auth.html       # 登录/注册页面
│   ├── index.html      # 主应用页面
│   ├── auth.css        # 登录页面样式
│   ├── style.css       # 主应用样式
│   ├── auth.js         # 登录逻辑
│   ├── app.js          # 主应用逻辑
│   ├── manifest.json   # PWA 配置
│   ├── service-worker.js  # 离线缓存
│   └── icons/          # 应用图标
├── server.js           # 后端服务器
├── package.json        # 项目配置
├── ecosystem.config.js # PM2 配置
└── deploy-to-server.sh # 部署脚本
```

## 🎯 使用指南

1. **注册账号** - 首次访问需要注册
2. **设置预算** - 在总览页面设置月度预算
3. **记录支出** - 在支出页面添加日常开销
4. **管理愿望** - 在愿望清单添加想买的东西
5. **多设备同步** - 在任何设备登录，数据自动同步

## 🔒 安全特性

- 密码使用 bcrypt 加密存储
- JWT Token 身份验证
- 生产环境强制设置密钥
- 数据隔离（每个用户独立）

## 📊 常用命令

```bash
# 查看服务状态
ssh users@server 'pm2 status'

# 查看日志
ssh users@server 'pm2 logs budget-tracker'

# 重启服务
ssh users@server 'pm2 restart budget-tracker'

# 更新代码
./deploy-to-server.sh
```

## 🐛 故障排查

### 服务无法启动

```bash
# 检查日志
pm2 logs budget-tracker --lines 50

# 检查端口占用
lsof -i :3000
```

### PWA 无法安装

- 确保使用 HTTPS（或 localhost）
- 检查 manifest.json 是否正确
- 清除浏览器缓存后重试

## 📝 更新日志

### v1.0.1 (2025-11-10)

- ✅ 用户注册登录系统
- ✅ 月度预算管理
- ✅ 支出记录（支持编辑）
- ✅ 愿望清单（支持税费计算）
- ✅ 双货币实时转换
- ✅ PWA 支持
- ✅ 多设备数据同步
- ✅ 响应式设计

## 👨‍💻 作者: [N28888](https://github.com/N28888)

预算追踪器 - 让财务管理更简单

---

**⭐ 如果觉得有用，欢迎 Star！**
