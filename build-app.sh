#!/bin/bash

echo "======================================"
echo "预算追踪器 - 移动应用打包"
echo "======================================"
echo ""

# 检查平台
read -p "选择平台 (1=iOS, 2=Android, 3=Both): " PLATFORM

case $PLATFORM in
    1)
        echo "📱 构建iOS应用..."
        npx cap add ios 2>/dev/null || echo "iOS平台已存在"
        npx cap sync ios
        npx cap open ios
        echo "✅ Xcode已打开，请在Xcode中构建应用"
        ;;
    2)
        echo "🤖 构建Android应用..."
        npx cap add android 2>/dev/null || echo "Android平台已存在"
        npx cap sync android
        npx cap open android
        echo "✅ Android Studio已打开，请在Android Studio中构建应用"
        ;;
    3)
        echo "📱🤖 构建iOS和Android应用..."
        npx cap add ios 2>/dev/null || echo "iOS平台已存在"
        npx cap add android 2>/dev/null || echo "Android平台已存在"
        npx cap sync
        echo "✅ 同步完成！"
        echo ""
        read -p "打开哪个IDE? (1=Xcode, 2=Android Studio, 3=Both): " IDE
        case $IDE in
            1) npx cap open ios ;;
            2) npx cap open android ;;
            3) npx cap open ios && npx cap open android ;;
        esac
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

echo ""
echo "======================================"
echo "提示："
echo "1. iOS需要Mac和Xcode"
echo "2. Android需要Android Studio"
echo "3. 上架需要开发者账号"
echo "======================================"
