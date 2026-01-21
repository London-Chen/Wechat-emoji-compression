# 表情包图片压缩器 - 带 Firebase 登录功能

> 一个用于微信表情包上传的图片压缩工具,现已集成 Firebase 用户认证系统!

## ✨ 新功能

### 🔐 用户认证系统
- **邮箱密码注册/登录** - 传统且安全的登录方式
- **Google 一键登录** - 快速便捷的第三方登录
- **自动登录保持** - 刷新页面后依然保持登录状态
- **用户信息显示** - 显示用户头像和用户名

### 🎨 精美的用户界面
- 优雅的登录/注册模态框
- 流畅的动画和过渡效果
- 完全响应式设计,支持移动端
- 友好的错误提示和验证

---

## 🚀 快速开始

### 1️⃣ 配置 Firebase

#### 步骤 1: 创建 Firebase 项目
访问 [Firebase 控制台](https://console.firebase.google.com/) 并创建新项目

#### 步骤 2: 启用认证
- 在 Firebase 控制台中,进入 **Authentication** → **登录方法**
- 启用 **邮箱/密码** 登录
- 启用 **Google** 登录

#### 步骤 3: 获取配置信息
- 点击 **齿轮图标** → **项目设置** → **您的应用**
- 添加 Web 应用并复制 `firebaseConfig` 配置

### 2️⃣ 更新配置文件

打开 `auth.js` 文件,将第 6-13 行的占位符替换为你的 Firebase 配置:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",  // 替换这里
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",  // 替换这里
    projectId: "YOUR_PROJECT_ID",  // 替换这里
    storageBucket: "YOUR_PROJECT_ID.appspot.com",  // 替换这里
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",  // 替换这里
    appId: "YOUR_APP_ID"  // 替换这里
};
```

### 3️⃣ 测试功能

在浏览器中打开 `index.html`,然后:
1. 点击右上角的"登录 / 注册"按钮
2. 尝试注册新账号或使用 Google 登录
3. 登录后查看用户信息显示
4. 测试退出登录功能

---

## 📁 项目文件

### 新增文件

| 文件 | 说明 |
|------|------|
| [auth.js](auth.js) | Firebase 认证逻辑和用户管理 |
| [Firebase集成指南.md](Firebase集成指南.md) | 详细的 Firebase 配置指南 |
| [使用说明.md](使用说明.md) | 完整的使用说明文档 |
| [auth-config-example.js](auth-config-example.js) | 配置示例和说明 |

### 修改文件

| 文件 | 修改内容 |
|------|----------|
| [index.html](index.html) | 添加登录界面和 Firebase SDK |
| [style.css](style.css) | 添加认证相关样式 |

---

## 🎯 功能特性

### 邮箱密码认证 ✉️
- 注册新账号(密码最少 6 位)
- 邮箱和密码登录
- 密码确认验证
- 自动发送邮箱验证(可选)

### Google 第三方登录 🔍
- 一键登录/注册
- 自动获取用户头像
- 自动获取用户名称
- 与邮箱密码账号共存

### 用户状态管理 👤
- 自动检测登录状态
- 页面刷新保持登录
- 实时更新用户信息
- 优雅的状态切换

### UI/UX 设计 🎨
- 现代化模态框设计
- 清晰的表单验证
- 友好的错误提示
- 流畅的动画效果
- 完全响应式

---

## 📱 浏览器支持

- ✅ Chrome (推荐)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ 移动端浏览器

---

## 🔧 配置选项

### 只保留邮箱密码登录

删除 HTML 中的 Google 登录按钮:
```html
<!-- 删除这两行 -->
<button class="btn btn-google btn-block" id="googleLoginBtn">...</button>
<button class="btn btn-google btn-block" id="googleRegisterBtn">...</button>
```

### 只保留 Google 登录

删除 HTML 中的邮箱密码表单,只保留 Google 登录按钮

### 自定义样式

所有认证相关的样式都在 `style.css` 的第 765-1030 行,可以根据需要修改:
- 颜色主题
- 按钮样式
- 模态框大小
- 字体大小等

---

## 🐛 常见问题

### Q: Firebase 初始化失败?
**A**: 检查 `auth.js` 中的 `firebaseConfig` 是否正确配置

### Q: Google 登录不工作?
**A**:
1. 确认 Firebase 控制台已启用 Google 登录
2. 确认 `localhost` 已添加到授权域名
3. 使用 `http://localhost` 而不是 `file://` 协议

### Q: 刷新页面后登录状态丢失?
**A**: Firebase 默认会保持登录状态,如果丢失:
1. 检查浏览器是否禁用了 Cookie
2. 查看浏览器控制台的错误信息

---

## 🚀 下一步扩展

### 1. 保存压缩历史
使用 Firestore 保存:
- 压缩的图片数量
- 压缩时间
- 压缩前后大小对比

### 2. 用户设置
- 默认压缩质量
- 默认文件大小限制
- 界面主题选择

### 3. 云存储功能
使用 Firebase Storage:
- 上传压缩后的图片
- 生成分享链接
- 图床功能

### 4. 更多登录方式
- GitHub 登录
- Facebook 登录
- 手机号登录

---

## 📚 相关文档

- [Firebase 官方文档](https://firebase.google.com/docs)
- [Firebase Authentication 文档](https://firebase.google.com/docs/auth)
- [使用说明.md](使用说明.md) - 详细使用说明
- [Firebase集成指南.md](Firebase集成指南.md) - 配置指南

---

## 🎓 学习资源

### Firebase 基础
- [Firebase 快速入门](https://firebase.google.com/docs/web/setup)
- [Authentication 指南](https://firebase.google.com/docs/auth/web/start)

### 认证相关
- [邮箱密码认证](https://firebase.google.com/docs/auth/web/password-auth)
- [Google 登录](https://firebase.google.com/docs/auth/web/google-signin)
- [管理用户](https://firebase.google.com/docs/auth/web/manage-users)

### 进阶功能
- [Firestore 数据库](https://firebase.google.com/docs/firestore)
- [Storage 存储](https://firebase.google.com/docs/storage)
- [安全规则](https://firebase.google.com/docs/storage/security)

---

## ✅ 检查清单

### 开发前
- [ ] 创建 Firebase 项目
- [ ] 启用 Authentication
- [ ] 配置登录方式
- [ ] 获取配置信息
- [ ] 更新 `auth.js` 配置

### 开发中
- [ ] 本地测试登录功能
- [ ] 测试注册功能
- [ ] 测试 Google 登录
- [ ] 测试错误处理
- [ ] 测试响应式设计

### 部署前
- [ ] 添加生产域名到 Firebase
- [ ] 配置 OAuth 同意屏幕
- [ ] 测试生产环境登录
- [ ] 检查安全规则

---

## 💡 提示

1. **开发环境**: 建议使用本地服务器(如 VS Code 的 Live Server 插件)
2. **配置安全**: Firebase 配置信息是公开的,这不是安全问题
3. **安全规则**: 记得在 Firebase 控制台配置适当的安全规则
4. **监控**: 定期查看 Firebase 控制台的使用情况和错误日志

---

## 📄 许可证

本项目采用 MIT 许可证

---

## 🙏 致谢

感谢使用表情包图片压缩器!

如有问题或建议,欢迎反馈。

---

**祝使用愉快!** 🎉
