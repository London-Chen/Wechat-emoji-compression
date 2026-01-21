# 表情包图片压缩器 🍃

微信表情包上传专用压缩工具，精准压缩到 500KB 以下。

## 功能特性

- 📦 **批量压缩** - 一次处理多张图片
- 🎯 **精准控制** - 表情包 < 500KB，封面 < 300KB
- 🔐 **用户认证** - 支持邮箱和 Google 登录
- 💾 **批量下载** - ZIP 打包下载

## 快速开始

### 方式一：直接打开
双击 `index.html` 即可使用（部分功能可能受限）

### 方式二：使用开发服务器

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 方式三：构建生产版本

```bash
npm run build
npm run preview
```

## 配置

1. 复制 `auth-config-template.js` 为 `auth-config.js`
2. 填入您的 Firebase 配置
3. 设置 `ENABLE_EMAIL_VERIFICATION` 开关

## 技术栈

- HTML5 + CSS3 + JavaScript (ES6+)
- Firebase Authentication
- Vite (构建工具)
- JSZip (批量下载)

## 项目结构

```
├── index.html          # 主页面
├── style.css           # 样式
├── app.js              # 压缩逻辑
├── auth.js             # 认证逻辑
├── auth-config.js      # Firebase配置 (gitignore)
├── package.json        # 依赖管理
└── vite.config.js      # 构建配置
```

## License

MIT
