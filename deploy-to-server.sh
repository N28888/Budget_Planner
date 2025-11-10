#!/bin/bash

# 自动部署到服务器脚本

echo "======================================"
echo "部署预算追踪器"
echo "======================================"
echo ""

# 询问服务器信息
read -p "请输入服务器地址 (例如: example.com): " SERVER
read -p "请输入用户名 (例如: root): " USER
read -p "请输入远程目录 (默认: /var/www/budget-tracker): " REMOTE_DIR

# 设置默认值
REMOTE_DIR=${REMOTE_DIR:-/var/www/budget-tracker}

echo ""
echo "======================================"
echo "部署配置:"
echo "  服务器: $SERVER"
echo "  用户名: $USER"
echo "  目录: $REMOTE_DIR"
echo "======================================"
echo ""
read -p "确认部署? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "❌ 部署已取消"
    exit 0
fi

echo ""

# 1. 更新Service Worker版本
echo "📝 更新Service Worker版本..."
CURRENT_VERSION=$(grep "CACHE_NAME = 'budget-tracker-v" public/service-worker.js | grep -o 'v[0-9]*' | grep -o '[0-9]*')
NEW_VERSION=$((CURRENT_VERSION + 1))
sed -i.bak "s/budget-tracker-v${CURRENT_VERSION}/budget-tracker-v${NEW_VERSION}/g" public/service-worker.js
rm -f public/service-worker.js.bak
echo "✅ Service Worker版本: v${CURRENT_VERSION} -> v${NEW_VERSION}"
echo ""

# 2. 打包项目
echo "📦 打包项目..."
tar -czf budget-tracker.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='data' \
    --exclude='*.tar.gz' \
    --exclude='.DS_Store' \
    .

# 3. 上传到服务器
echo "📤 上传到服务器..."
scp budget-tracker.tar.gz $USER@$SERVER:/tmp/

# 4. 在服务器上执行部署
echo "🚀 在服务器上部署..."
ssh $USER@$SERVER bash -s << ENDSSH
    # 创建目录
    mkdir -p $REMOTE_DIR
    cd $REMOTE_DIR
    
    # 解压文件
    tar -xzf /tmp/budget-tracker.tar.gz
    rm /tmp/budget-tracker.tar.gz
    
    # 创建 .env 文件（如果不存在）
    if [ ! -f .env ]; then
        echo "PORT=3000" > .env
        echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
        echo "NODE_ENV=production" >> .env
        echo "✅ 创建了 .env 文件"
    fi
    
    # 安装依赖
    npm install --production
    
    # 创建数据目录
    mkdir -p data
    
    # 彻底清理旧进程
    echo "🧹 清理旧进程..."
    pm2 stop budget-tracker 2>/dev/null || true
    pm2 delete budget-tracker 2>/dev/null || true
    
    # 杀死所有占用 3000 端口的进程
    echo "🔫 清理端口 3000..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    fuser -k 3000/tcp 2>/dev/null || true
    
    # 等待端口释放
    sleep 2
    
    # 启动服务（手动设置环境变量）
    echo "🚀 启动服务..."
    JWT_SECRET=\$(grep JWT_SECRET .env | cut -d '=' -f2)
    JWT_SECRET="\$JWT_SECRET" NODE_ENV=production PORT=3000 pm2 start server.js --name budget-tracker
    
    pm2 save
    
    echo "✅ 部署完成！"
ENDSSH

# 5. 清理本地临时文件
rm budget-tracker.tar.gz

echo "======================================"
echo "✅ 部署完成！"
echo "======================================"
echo "访问地址: https://budget.yfanj.ca"
echo ""
echo "⚠️  重要提示："
echo "  新功能已部署，请清除浏览器缓存:"
echo "  - 按 Ctrl+Shift+R (Mac: Cmd+Shift+R)"
echo "  - 或在开发者工具中清除Service Worker"
echo ""
echo "常用命令:"
echo "  查看日志: ssh $USER@$SERVER 'pm2 logs budget-tracker'"
echo "  重启服务: ssh $USER@$SERVER 'pm2 restart budget-tracker'"
echo "  查看状态: ssh $USER@$SERVER 'pm2 status'"
