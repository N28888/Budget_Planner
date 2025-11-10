#!/bin/bash

# 自动部署到服务器脚本
SERVER="sj.yfanj.ca"
USER="root"  # 如果不是 root，请修改
REMOTE_DIR="/var/www/budget-tracker"

echo "======================================"
echo "部署预算追踪器到 $SERVER"
echo "======================================"

# 1. 打包项目
echo "📦 打包项目..."
tar -czf budget-tracker.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='data' \
    --exclude='*.tar.gz' \
    --exclude='.DS_Store' \
    .

# 2. 上传到服务器
echo "📤 上传到服务器..."
scp budget-tracker.tar.gz $USER@$SERVER:/tmp/

# 3. 在服务器上执行部署
echo "🚀 在服务器上部署..."
ssh $USER@$SERVER << 'ENDSSH'
    # 创建目录
    mkdir -p /var/www/budget-tracker
    cd /var/www/budget-tracker
    
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
    
    # 停止旧服务
    pm2 stop budget-tracker 2>/dev/null || true
    pm2 delete budget-tracker 2>/dev/null || true
    
    # 启动服务
    pm2 start ecosystem.config.js
    pm2 save
    
    echo "✅ 部署完成！"
    echo "访问: http://sj.yfanj.ca:3000"
ENDSSH

# 4. 清理本地临时文件
rm budget-tracker.tar.gz

echo "======================================"
echo "✅ 部署完成！"
echo "======================================"
echo "访问地址: http://sj.yfanj.ca:3000"
echo ""
echo "常用命令:"
echo "  查看日志: ssh $USER@$SERVER 'pm2 logs budget-tracker'"
echo "  重启服务: ssh $USER@$SERVER 'pm2 restart budget-tracker'"
echo "  查看状态: ssh $USER@$SERVER 'pm2 status'"
