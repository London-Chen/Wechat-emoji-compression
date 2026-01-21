# Firebase 集成指南

## 第一步:创建 Firebase 项目

### 1. 访问 Firebase 控制台
打开浏览器访问: https://console.firebase.google.com/

### 2. 创建新项目
- 点击"添加项目"或"创建项目"
- 输入项目名称,例如: "emoji-compressor"
- 选择是否启用 Google Analytics (可选)
- 点击"创建项目"
- 等待项目初始化完成

### 3. 启用身份验证 (Authentication)
- 在左侧菜单中找到"构建" → "Authentication"
- 点击"开始使用"
- 在"登录方法"标签页中,启用以下登录方式:
  - ✅ **邮箱/密码** - 启用并保存
  - ✅ **Google** - 启用并保存
  - (可选) GitHub、Facebook 等

### 4. 获取 Firebase 配置信息
- 点击左上角的齿轮图标 ⚙️ → "项目设置"
- 向下滚动到"您的应用"部分
- 点击网页图标 `</>` (Web 应用)
- 输入应用名称,例如: "emoji-compressor-web"
- **不要勾选** "Firebase Hosting"
- 点击"注册应用"
- 复制 `firebaseConfig` 对象的配置信息,格式如下:

```javascript
const firebaseConfig = {
  apiKey: "你的API密钥",
  authDomain: "你的项目ID.firebaseapp.com",
  projectId: "你的项目ID",
  storageBucket: "你的项目ID.appspot.com",
  messagingSenderId: "发送者ID",
  appId: "应用ID"
};
```

⚠️ **重要**: 保存这些配置信息,稍后需要在代码中使用!

### 5. (可选) 配置授权域名
- 在 Firebase 控制台的 Authentication 中
- 点击"设置"标签页
- 在"授权域名"中添加:
  - `localhost` (用于本地开发)
  - 你的生产域名(如果已部署)

---

## Firebase 配置说明

### 邮箱密码登录
- 用户可以注册新账号
- 需要邮箱验证(可选,默认关闭)
- 可以设置密码强度要求

### Google 登录
- 用户可以使用 Google 账号一键登录
- 需要在 Google Cloud Console 中配置 OAuth 同意屏幕
- Firebase 会自动处理大部分配置

### 安全规则
默认情况下,Firebase Authentication 已经配置好基本的安全规则。
如果使用 Firestore 或 Storage,需要额外配置安全规则。

---

## 下一步

配置完成后,回到项目目录,我们将:
1. 更新 HTML 添加登录界面
2. 集成 Firebase SDK
3. 实现登录/注册逻辑
