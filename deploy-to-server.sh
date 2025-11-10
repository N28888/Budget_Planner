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
    
    # 停止旧服务
    pm2 stop budget-tracker 2>/dev/null || true
    pm2 delete budget-tracker 2>/dev/null || true
    
    # 启动服务
    pm2 start ecosystem.config.js
    pm2 save
    
    echo "✅ 部署完成！"
ENDSSH

# 4. 清理本地临时文件
rm budget-tracker.tar.gz

echo "======================================"
echo "✅ 部署完成！"
echo "======================================"
echo "访问地址: http://$SERVER:3000"
echo ""
echo "常用命令:"
echo "  查看日志: ssh $USER@$SERVER 'pm2 logs budget-tracker'"
echo "  重启服务: ssh $USER@$SERVER 'pm2 restart budget-tracker'"
echo "  查看状态: ssh $USER@$SERVER 'pm2 status'"
echo ""
echo "💡 提示: 下次部署时可以直接运行 ./deploy-to-server.sh"
