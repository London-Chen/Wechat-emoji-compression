# Vercel 部署指南

本项目已配置好 Vercel 部署，按照以下步骤即可快速部署。

## 前置条件

1. 一个 [GitHub](https://github.com) 账号
2. 一个 [Vercel](https://vercel.com) 账号（可以使用 GitHub 账号登录）
3. 一个 [Firebase](https://firebase.google.com) 项目

## 部署步骤

### 1. 准备 Firebase 项目

如果还没有 Firebase 项目：

1. 访问 [Firebase 控制台](https://console.firebase.google.com/)
2. 创建新项目或选择现有项目
3. 启用 **Email/Password** 登录方式：
   - 进入 **Authentication** > **Sign-in method**
   - 启用 **Email/Password**
4. 启用 **Google** 登录方式（可选）：
   - 进入 **Authentication** > **Sign-in method**
   - 启用 **Google**
5. 获取 Firebase 配置信息：
   - 进入 **项目设置** > **常规**
   - 滚动到 **您的应用** 部分
   - 选择 **Web** 图标
   - 复制配置信息

### 2. 部署到 Vercel

1. 访问 [Vercel](https://vercel.com)
2. 点击 **"Add New..."** > **"Project"**
3. 导入您的 GitHub 仓库：`Wechat-emoji-compress`
4. 配置项目：

   **框架预设**: Other

   **构建命令**: 留空

   **输出目录**: `.` (根目录)

### 3. 配置环境变量

在 Vercel 项目设置中，添加以下环境变量：

#### Firebase 配置（必需）

在 **Settings** > **Environment Variables** 中添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `VITE_FIREBASE_API_KEY` | 您的 Firebase API Key | 从 Firebase 控制台获取 |
| `VITE_FIREBASE_AUTH_DOMAIN` | `fir-f0c9e.firebaseapp.com` | 您的 Firebase 域名 |
| `VITE_FIREBASE_PROJECT_ID` | `fir-f0c9e` | 您的项目 ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | `fir-f0c9e.firebasestorage.app` | 存储 Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `747870142367` | 发送者 ID |
| `VITE_FIREBASE_APP_ID` | `1:747870142367:web:6c4b5f99b4796ec4b447aa` | 应用 ID |

#### 应用配置（可选）

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `VITE_ENABLE_EMAIL_VERIFICATION` | `false` | 是否强制邮箱验证（生产环境建议 `true`）|
| `VITE_DEV_MODE` | `false` | 开发模式 |
| `VITE_DEBUG` | `false` | 调试日志 |

> **注意**：环境变量的值需要替换为您自己的 Firebase 配置。

### 4. 创建 `auth-config.js` 文件

由于 `.env` 文件在 Vercel 上无法直接被前端访问，需要创建一个 `auth-config.js` 文件。

**重要**：此文件已添加到 `.gitignore`，不会被提交到 Git。

1. 复制 `auth-config-template.js` 为 `auth-config.js`：
   ```bash
   cp auth-config-template.js auth-config.js
   ```

2. 编辑 `auth-config.js`，填入您的 Firebase 配置：
   ```javascript
   const firebaseConfig = {
       apiKey: "您的_API_KEY",
       authDomain: "您的_AUTH_DOMAIN",
       projectId: "您的_PROJECT_ID",
       storageBucket: "您的_STORAGE_BUCKET",
       messagingSenderId: "您的_MESSAGING_SENDER_ID",
       appId: "您的_APP_ID"
   };
   ```

3. 将 `auth-config.js` 上传到 Vercel：
   - 方法 1：通过 Vercel 的 "Files" 标签页上传
   - 方法 2：使用 Vercel CLI: `vercel --prod`
   - 方法 3：暂时移除 `.gitignore` 中的 `auth-config.js`，提交后重新添加

### 5. 授权域名

在 Firebase 控制台中授权 Vercel 域名：

1. 进入 Firebase 控制台 > **Authentication** > **Settings**
2. 在 **Authorized domains** 中添加：
   - `localhost` (本地开发)
   - `your-project.vercel.app` (您的 Vercel 域名)
   - 您的自定义域名（如果有）

### 6. 部署

1. 点击 **"Deploy"** 按钮
2. 等待部署完成（通常 1-2 分钟）
3. 访问您的 Vercel 域名：`https://your-project-name.vercel.app`

## 更新部署

每次推送代码到 `main` 分支，Vercel 会自动部署新版本。

## 本地开发

1. 安装依赖：
   ```bash
   npm install
   ```

2. 启动开发服务器：
   ```bash
   npm run dev
   ```

3. 访问：`http://localhost:5173`

## 常见问题

### 1. 登录功能不工作

**检查**：
- Firebase SDK 是否正确加载（打开浏览器控制台检查错误）
- `auth-config.js` 是否存在且配置正确
- 域名是否已在 Firebase 控制台授权

### 2. 环境变量未生效

**检查**：
- 环境变量名称是否以 `VITE_` 开头
- 是否重新部署了项目
- 环境变量是否在正确的环境（Production/Preview/Development）中设置

### 3. Google 登录失败

**检查**：
- Firebase 控制台是否启用了 Google 登录
- 域名是否已授权
- 浏览器是否阻止了弹窗

## 项目结构

```
表情包图片压缩器/
├── index.html              # 主页面
├── style.css              # 样式文件
├── app.js                 # 核心功能
├── auth.js                # 认证功能
├── auth-config.js         # Firebase 配置（不提交到 Git）
├── auth-config-template.js # 配置模板
├── .env                   # 环境变量（不提交到 Git）
├── .env.example           # 环境变量模板
├── vercel.json            # Vercel 配置
└── package.json           # 项目配置
```

## 安全建议

1. **永远不要**将包含敏感信息的 `auth-config.js` 提交到 Git
2. 使用环境变量管理敏感配置
3. 定期更新依赖包
4. 在生产环境启用邮箱验证

## 支持

如果遇到问题，请检查：
1. 浏览器控制台的错误信息
2. Vercel 部署日志
3. Firebase 控制台的 Authentication 日志

---

**祝部署顺利！** 🚀
