# 移动应用打包指南

本指南介绍如何将预算追踪器 PWA 打包成 iOS 和 Android 原生应用。

## 前置要求

### iOS (需要 Mac 电脑)

- macOS 系统
- Xcode 14+
- Apple Developer 账号 ($99/年)
- CocoaPods: `sudo gem install cocoapods`

### Android

- Android Studio
- Java JDK 11+
- Android SDK

## 方法 1: Capacitor (推荐)

### 1. 安装依赖

```bash
npm install @capacitor/cli @capacitor/core @capacitor/ios @capacitor/android
```

### 2. 添加平台

#### iOS

```bash
npx cap add ios
npx cap sync
npx cap open ios
```

在 Xcode 中：

1. 选择你的开发团队
2. 修改 Bundle Identifier 为你的唯一 ID
3. 配置签名证书
4. 点击运行或 Archive 打包

#### Android

```bash
npx cap add android
npx cap sync
npx cap open android
```

在 Android Studio 中：

1. Build > Generate Signed Bundle / APK
2. 创建或选择密钥库
3. 选择 release 构建类型
4. 生成 AAB 文件用于上传 Google Play

### 3. 更新应用

每次修改代码后：

```bash
npx cap sync
```

### 4. 配置文件说明

`capacitor.config.json` - 主配置文件

```json
{
  "appId": "com.yfanj.budget",
  "appName": "预算追踪器",
  "webDir": "public",
  "server": {
    "url": "https://budget.yfanj.ca",
    "cleartext": true
  }
}
```

## 方法 2: PWA Builder (最简单，但功能有限)

1. 访问 https://www.pwabuilder.com/
2. 输入你的网站 URL: https://budget.yfanj.ca
3. 点击"Build My PWA"
4. 下载 iOS 和 Android 包
5. 按照说明上传到 App Store 和 Google Play

## 方法 3: Cordova (传统方案)

```bash
npm install -g cordova
cordova create budgetApp com.yfanj.budget 预算追踪器
cd budgetApp
cordova platform add ios android
cordova build
```

## App Store 上架流程

### iOS App Store

1. 注册 Apple Developer 账号
2. 在 App Store Connect 创建应用
3. 准备材料：
   - 应用图标 (1024x1024)
   - 截图 (多种尺寸)
   - 隐私政策 URL
   - 应用描述
4. 使用 Xcode Archive 并上传
5. 提交审核 (通常 1-3 天)

### Google Play Store

1. 注册 Google Play 开发者账号 ($25 一次性)
2. 创建应用
3. 准备材料：
   - 应用图标 (512x512)
   - 功能图片
   - 截图
   - 隐私政策
4. 上传 AAB 文件
5. 提交审核 (通常几小时到 1 天)

## 推荐配置

### 优化 manifest.json

确保 PWA 配置完善：

- ✅ 所有尺寸的图标
- ✅ Service Worker
- ✅ 离线支持
- ✅ 合适的 display 模式

### 添加原生功能

如果需要原生功能，可以使用 Capacitor 插件：

```bash
npm install @capacitor/camera
npm install @capacitor/filesystem
npm install @capacitor/share
```

## 注意事项

1. **域名要求**: 确保使用 HTTPS
2. **API 配置**: 应用内访问的是线上 URL，不是 localhost
3. **图标准备**: 需要多种尺寸的图标
4. **隐私政策**: App Store 和 Google Play 都要求
5. **测试**: 在真机上充分测试

## 快速开始 (推荐流程)

1. 使用 PWA Builder 快速生成包
2. 如果需要更多控制，使用 Capacitor
3. 准备好所有上架材料
4. 先上架 Google Play (审核快)
5. 再上架 App Store

## 成本估算

- Apple Developer: $99/年
- Google Play: $25 (一次性)
- 总计: $124 第一年，之后每年$99

## 联系方式

如有问题，请访问：

- Capacitor 文档: https://capacitorjs.com/
- PWA Builder: https://www.pwabuilder.com/
