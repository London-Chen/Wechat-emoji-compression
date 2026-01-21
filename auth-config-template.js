// ==================== Firebase 配置模板 ====================
// 📋 使用说明：
// 1. 复制此文件并重命名为 auth-config.js
// 2. 填入您自己的 Firebase 配置信息
// 3. auth-config.js 已添加到 .gitignore，不会被提交

const firebaseConfig = {
    // 从 Firebase 控制台 → 项目设置 → 您的应用 中获取以下配置
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"  // 可选
};

// ==================== 应用配置 ====================
const appConfig = {
    // 是否启用邮箱验证
    // - 生产环境：设为 true（强制验证）
    // - 开发环境：设为 false（跳过验证，方便测试）
    ENABLE_EMAIL_VERIFICATION: true,

    // 是否为开发模式
    DEV_MODE: false,

    // 是否启用调试日志
    DEBUG: false
};

// 导出配置（供其他模块使用）
if (typeof window !== 'undefined') {
    window.FIREBASE_CONFIG = firebaseConfig;
    window.APP_CONFIG = appConfig;
}

/*
 * ==================== 获取 Firebase 配置步骤 ====================
 * 
 * 1. 访问 Firebase 控制台：https://console.firebase.google.com/
 * 2. 创建新项目或选择现有项目
 * 3. 点击左侧齿轮图标 → "项目设置"
 * 4. 滚动到 "您的应用" 部分
 * 5. 点击 Web 图标 (</>) 添加 Web 应用
 * 6. 复制显示的配置对象到上方
 * 
 * ==================== 启用身份验证 ====================
 * 
 * 1. 在 Firebase 控制台，点击 "Authentication"
 * 2. 点击 "开始使用"
 * 3. 在 "登录方法" 标签下启用：
 *    - 电子邮件/密码
 *    - Google（可选）
 * 4. 在 "设置" → "授权域名" 中添加您的域名
 */
