// ==================== Firebase 配置示例 ====================
//
// 使用说明:
// 1. 访问 Firebase 控制台: https://console.firebase.google.com/
// 2. 创建项目或选择现有项目
// 3. 点击齿轮图标 → 项目设置 → 您的应用
// 4. 点击 </> 图标添加 Web 应用
// 5. 复制配置信息,替换下面的占位符
//
// ==================== 你的 Firebase 配置 ====================
//
// 从 Firebase 控制台复制的配置应该类似这样:

const firebaseConfigExample = {
    apiKey: "AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    authDomain: "my-project.firebaseapp.com",
    projectId: "my-project",
    storageBucket: "my-project.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456"
};

// ==================== 字段说明 ====================
//
// apiKey: API 密钥,用于识别你的项目
//   - 格式: "AIzaSyD" + 39个字符
//   - 在项目设置中可以找到
//
// authDomain: 认证域名
//   - 格式: "项目ID.firebaseapp.com"
//   - 自动生成,通常不需要修改
//
// projectId: 项目 ID
//   - 创建项目时设置的 ID
//   - 在项目设置中可以找到
//
// storageBucket: 存储 bucket 名称
//   - 格式: "项目ID.appspot.com"
//   - 用于存储文件(如图片)
//
// messagingSenderId: 发送者 ID
//   - 数字字符串
//   - 用于云消息推送
//
// appId: 应用 ID
//   - Web 应用的唯一标识
//   - 格式: "1:数字:web:字符串"
//
// ==================== 配置步骤 ====================
//
// 第一步: 获取配置
//   1. 打开 Firebase 控制台
//   2. 选择你的项目
//   3. 点击齿轮图标 ⚙️ → "项目设置"
//   4. 滚动到"您的应用"部分
//   5. 点击 </> 图标(Web 应用)
//   6. 如果已注册应用,选择现有应用;否则点击"添加应用"
//   7. 复制 firebaseConfig 对象的所有内容
//
// 第二步: 更新配置文件
//   1. 打开 auth.js 文件
//   2. 找到第 6-13 行的 firebaseConfig 对象
//   3. 将占位符替换为从 Firebase 控制台复制的实际值
//
// 第三步: 启用认证方式
//   1. 在 Firebase 控制台,左侧菜单点击 "Authentication"
//   2. 点击"开始使用"(如果还没设置)
//   3. 点击"登录方法"标签
//   4. 启用需要的登录方式:
//      - 邮箱/密码: 点击 → 启用 → 保存
//      - Google: 点击 → 启用 → 选择支持的项目 → 保存
//
// 第四步: 配置授权域名
//   1. 在 Authentication 中,点击"设置"标签
//   2. 在"授权域名"部分,添加:
//      - localhost (用于本地开发)
//      - 你的生产域名(如果已部署)
//
// ==================== 配置检查清单 ====================
//
// 开发环境检查:
// □ Firebase 项目已创建
// □ Authentication 已启用
// □ 邮箱/密码登录已启用
// □ Google 登录已启用
// □ localhost 已添加到授权域名
// □ firebaseConfig 已正确配置
//
// 生产环境检查:
// □ 生产域名已添加到授权域名
// □ OAuth 同意屏幕已配置(Google 登录)
// □ 测试登录功能正常工作
// □ 错误提示正常显示
//
// ==================== 常见错误 ====================
//
// 错误 1: "Firebase 初始化失败"
// 原因: firebaseConfig 配置错误
// 解决: 检查所有字段是否正确填写
//
// 错误 2: "unauthorized-domain"
// 原因: 当前域名未添加到授权域名
// 解决: 在 Firebase 控制台添加域名
//
// 错误 3: "popup-closed-by-user"
// 原因: 用户关闭了登录弹窗
// 解决: 这是正常的,不需要处理
//
// 错误 4: "account-exists-with-different-credential"
// 原因: 同一个邮箱使用了不同的登录方式
// 解决: 提示用户使用之前的登录方式
//
// ==================== 测试配置 ====================
//
// 测试代码(在浏览器控制台运行):
//
// // 测试 Firebase 初始化
// console.log('Firebase Config:', firebaseConfig);
//
// // 测试认证服务
// firebase.auth().onAuthStateChanged(user => {
//     if (user) {
//         console.log('已登录:', user.email);
//     } else {
//         console.log('未登录');
//     }
// });
//
// ==================== 安全提示 ====================
//
// ⚠️ 重要安全注意事项:
//
// 1. 不要将包含真实密钥的 auth.js 提交到公开的代码仓库
// 2. Firebase Config 中的信息是公开的,这不是安全问题
// 3. 真正的安全由 Firebase 安全规则保障
// 4. 不要在代码中硬编码服务账号密钥
// 5. 定期审查 Firebase 安全规则
//
// ==================== 需要帮助? ====================
//
// 如果遇到问题:
// 1. 检查浏览器控制台的错误信息
// 2. 查看 Firebase 控制台的日志
// 3. 参考 Firebase 官方文档
// 4. 查看"使用说明.md"文件
//
// ==================== 完成! ====================
//
// 配置完成后,删除或重命名此文件
// 然后在浏览器中打开 index.html 测试登录功能
