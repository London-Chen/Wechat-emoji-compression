// ==================== Firebase 配置 ====================
// 配置从外部文件 auth-config.js 加载
// 如果没有配置文件，使用默认空配置（会导致初始化失败）

// 初始化 Firebase
let auth = null;

// 检查配置是否已加载
if (window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey && window.FIREBASE_CONFIG.projectId) {
    try {
        firebase.initializeApp(window.FIREBASE_CONFIG);
        auth = firebase.auth();
        if (window.APP_CONFIG && window.APP_CONFIG.DEBUG) {
            console.log('✅ Firebase 初始化成功');
        }
    } catch (error) {
        console.error('❌ Firebase 初始化失败:', error);
    }
} else {
    console.error('❌ Firebase 配置无效，请检查 auth-config.js 文件');
    console.error('📋 请复制 auth-config-template.js 为 auth-config.js 并填入您的 Firebase 配置');
}

// ==================== 全局状态 ====================
let currentUser = null;

// UI 延迟常量
const CONFIG_UI_DELAY = 1000;

// ==================== DOM 元素 ====================
const authModal = document.getElementById('authModal');
const authModalClose = document.getElementById('authModalClose');
const loginBtn = document.getElementById('loginBtn');
const userSection = document.getElementById('userSection');

// 登录表单相关
const loginForm = document.getElementById('loginForm');
const loginFormElement = document.getElementById('loginFormElement');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const showRegisterForm = document.getElementById('showRegisterForm');

// 注册表单相关
const registerForm = document.getElementById('registerForm');
const registerFormElement = document.getElementById('registerFormElement');
const registerEmail = document.getElementById('registerEmail');
const registerPassword = document.getElementById('registerPassword');
const registerConfirmPassword = document.getElementById('registerConfirmPassword');
const googleRegisterBtn = document.getElementById('googleRegisterBtn');
const showLoginForm = document.getElementById('showLoginForm');

// 消息提示
const authError = document.getElementById('authError');
const authSuccess = document.getElementById('authSuccess');

// ==================== 初始化 ====================
function initAuth() {
    // 检查 auth 是否成功初始化
    if (!auth) {
        console.error('❌ Firebase Auth 未初始化，登录功能不可用');
        // 仍然设置事件监听，显示错误提示
        setupEventListeners();
        return;
    }

    // 监听登录状态变化
    auth.onAuthStateChanged(user => {
        currentUser = user;
        updateUserUI(user);
    });

    // 事件监听器
    setupEventListeners();

    // 检查是否有保存的登录状态
    auth.getRedirectResult().catch(error => {
        console.error('重定向结果错误:', error);
    });

    // 检查 URL 参数,处理邮箱验证回调
    checkEmailVerification();
}

// ==================== 事件监听 ====================
function setupEventListeners() {
    console.log('🔧 设置事件监听器...');

    // 检查必要的 DOM 元素是否存在
    if (!loginBtn) {
        console.error('❌ 登录按钮不存在');
        return;
    }
    if (!authModal) {
        console.error('❌ 认证模态框不存在');
        return;
    }

    // 打开登录模态框
    loginBtn.addEventListener('click', () => {
        console.log('🖱️ 登录按钮被点击');
        openAuthModal();
    });

    // 关闭模态框
    authModalClose.addEventListener('click', closeAuthModal);
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) closeAuthModal();
    });

    // 切换到注册表单
    showRegisterForm.addEventListener('click', (e) => {
        e.preventDefault();
        switchToRegister();
    });

    // 切换到登录表单
    showLoginForm.addEventListener('click', (e) => {
        e.preventDefault();
        switchToLogin();
    });

    // 邮箱密码登录
    loginFormElement.addEventListener('submit', handleEmailLogin);

    // 邮箱密码注册
    registerFormElement.addEventListener('submit', handleEmailRegister);

    // Google 登录
    googleLoginBtn.addEventListener('click', handleGoogleLogin);

    // Google 注册
    googleRegisterBtn.addEventListener('click', handleGoogleLogin);

    // 重新发送验证邮件
    const resendVerificationBtn = document.getElementById('resendVerificationBtn');
    if (resendVerificationBtn) {
        resendVerificationBtn.addEventListener('click', handleResendVerification);
    }
}

// ==================== 邮箱密码认证 ====================

// 处理邮箱密码登录
async function handleEmailLogin(e) {
    e.preventDefault();

    // 检查 auth 是否可用
    if (!auth) {
        showAuthError('登录服务未初始化，请检查 Firebase 配置');
        return;
    }

    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    if (!email || !password) {
        showAuthError('请填写完整的邮箱和密码');
        return;
    }

    clearAuthMessages();
    showAuthLoading('登录中...');

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // 根据配置决定是否检查邮箱验证
        if ((window.APP_CONFIG?.ENABLE_EMAIL_VERIFICATION) && !user.emailVerified) {
            // 未验证，退出登录并提示
            await auth.signOut();
            showAuthError('登录失败: 请先验证您的邮箱。我们已发送验证邮件到 ' + email);
            return;
        }

        showAuthSuccess('登录成功!');

        // 延迟关闭模态框，让用户看到成功提示
        setTimeout(() => {
            closeAuthModal();
            clearAuthMessages();
        }, CONFIG_UI_DELAY);

    } catch (error) {
        console.error('登录失败:', error);
        showAuthError(getErrorMessage(error.code));
    }
}

// 处理邮箱密码注册
async function handleEmailRegister(e) {
    e.preventDefault();

    // 检查 auth 是否可用
    if (!auth) {
        showAuthError('注册服务未初始化，请检查 Firebase 配置');
        return;
    }

    const email = registerEmail.value.trim();
    const password = registerPassword.value;
    const confirmPassword = registerConfirmPassword.value;

    if (!email || !password || !confirmPassword) {
        showAuthError('请填写完整的注册信息');
        return;
    }

    if (password !== confirmPassword) {
        showAuthError('两次输入的密码不一致');
        return;
    }

    if (password.length < 6) {
        showAuthError('密码长度至少为 6 位');
        return;
    }

    clearAuthMessages();
    showAuthLoading('注册中...');

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);

        // 根据配置决定是否需要邮箱验证
        if ((window.APP_CONFIG?.ENABLE_EMAIL_VERIFICATION)) {
            // 获取当前页面 URL 作为验证后的跳转地址
            const continueUrl = window.location.href.split('?')[0];

            // 发送验证邮件，并设置验证后的跳转 URL
            const actionCodeSettings = {
                url: continueUrl + '?mode=verifyEmail',
                handleCodeInApp: true
            };

            try {
                await userCredential.user.sendEmailVerification(actionCodeSettings);
            } catch (emailError) {
                console.warn('发送验证邮件失败:', emailError);
                // 即使邮件发送失败，也继续流程
            }

            // 注册后立即退出登录，强制用户验证邮箱
            await auth.signOut();

            // 显示等待验证界面
            showVerificationPendingUI(email);
        } else {
            // 开发模式：注册后直接登录
            showAuthSuccess('注册成功!');

            setTimeout(() => {
                closeAuthModal();
                clearAuthMessages();
            }, CONFIG_UI_DELAY);
        }

    } catch (error) {
        console.error('注册失败:', error);
        showAuthError(getErrorMessage(error.code));
    }
}

// ==================== Google 认证 ====================

async function handleGoogleLogin() {
    // 检查 auth 是否可用
    if (!auth) {
        showAuthError('Google 登录服务未初始化，请检查 Firebase 配置');
        return;
    }

    const provider = new firebase.auth.GoogleAuthProvider();

    // 设置额外的权限请求(可选)
    provider.addScope('profile');
    provider.addScope('email');

    try {
        clearAuthMessages();
        showAuthLoading('正在连接 Google...');

        console.log('开始 Google 登录流程...');

        // 使用 popup 方式登录
        const result = await auth.signInWithPopup(provider);

        console.log('Google 登录成功:', result.user);

        // 获取用户的 Google 账号信息
        const user = result.user;
        console.log('用户信息:', {
            displayName: user.displayName,
            email: user.email,
            emailVerified: user.emailVerified,
            photoURL: user.photoURL,
            uid: user.uid
        });

        showAuthSuccess('登录成功! 欢迎, ' + user.displayName);

        setTimeout(() => {
            closeAuthModal();
            clearAuthMessages();
        }, 1500);

    } catch (error) {
        console.error('Google 登录失败,错误详情:', error);
        console.error('错误代码:', error.code);
        console.error('错误消息:', error.message);
        console.error('完整错误对象:', JSON.stringify(error, null, 2));

        // 显示更详细的错误信息
        let errorMsg = 'Google 登录失败';

        if (error.code === 'auth/popup-closed-by-user') {
            errorMsg = '取消了 Google 登录';
        } else if (error.code === 'auth/popup-blocked') {
            errorMsg = '登录弹窗被拦截,请允许弹出窗口';
        } else if (error.code === 'auth/unauthorized-domain') {
            errorMsg = '当前域名未授权。请在 Firebase 控制台添加此域名到授权列表';
        } else if (error.code === 'auth/account-exists-with-different-credential') {
            errorMsg = '该邮箱已通过其他方式注册,请使用邮箱密码登录';
        } else if (error.message) {
            errorMsg = error.message;
        }

        showAuthError(errorMsg);
    }
}

// ==================== 登出功能 ====================

async function handleLogout() {
    try {
        await auth.signOut();
        showAuthSuccess('已退出登录');
    } catch (error) {
        console.error('退出登录失败:', error);
        showAuthError('退出登录失败,请重试');
    }
}

// ==================== 重新发送验证邮件 ====================

async function handleResendVerification() {
    const email = loginEmail.value.trim();

    if (!email) {
        showAuthError('请先输入您的邮箱地址');
        return;
    }

    clearAuthMessages();
    showAuthLoading('正在发送验证邮件...');

    try {
        // 首先尝试登录用户以获取 user 对象
        // 注意:这里需要用户的密码,但我们没有密码
        // 所以我们采用另一种方式:让用户输入密码后登录,然后发送验证邮件

        // 更好的方式:直接提示用户检查邮件
        showAuthSuccess('请检查您的邮箱(包括垃圾邮件文件夹)。如果仍未收到,请稍后再试。');

        // 可选:这里可以添加一个临时登录来发送验证邮件
        // 但需要用户输入密码,比较复杂

    } catch (error) {
        console.error('发送验证邮件失败:', error);
        showAuthError('发送失败: ' + error.message);
    }
}

// 另一种方式:提供一个输入邮箱的弹窗来重新发送验证邮件
async function resendVerificationEmail(email, password) {
    try {
        // 登录用户
        const userCredential = await auth.signInWithEmailAndPassword(email, password);

        if (userCredential.user.emailVerified) {
            await auth.signOut();
            return { success: false, message: '您的邮箱已经验证过了,可以直接登录' };
        }

        // 重新发送验证邮件
        await userCredential.user.sendEmailVerification();

        // 退出登录
        await auth.signOut();

        return { success: true, message: '验证邮件已重新发送,请查收' };
    } catch (error) {
        console.error('重新发送验证邮件失败:', error);
        return { success: false, message: getErrorMessage(error.code) };
    }
}

// ==================== UI 更新 ====================

// 更新用户界面
function updateUserUI(user) {
    if (user) {
        // 已登录状态
        const displayName = user.displayName || user.email.split('@')[0];
        const photoURL = user.photoURL || null;

        userSection.innerHTML = `
            <div class="user-info">
                ${photoURL ? `<img src="${photoURL}" class="user-avatar" alt="用户头像">` : ''}
                <span class="user-name">${displayName}</span>
                <button class="btn btn-sm btn-outline" id="logoutBtn">退出</button>
            </div>
        `;

        // 绑定退出按钮事件
        document.getElementById('logoutBtn').addEventListener('click', handleLogout);

        console.log('✅ 用户已登录:', user.email);

    } else {
        // 未登录状态
        userSection.innerHTML = `
            <button class="btn btn-outline" id="loginBtn">登录 / 注册</button>
        `;

        // 重新绑定登录按钮事件
        document.getElementById('loginBtn').addEventListener('click', () => {
            openAuthModal();
        });

        console.log('ℹ️ 用户未登录');
    }
}

// 打开认证模态框
function openAuthModal() {
    console.log('🔓 打开认证模态框');
    authModal.classList.add('active');
    switchToLogin(); // 默认显示登录表单
}

// 关闭认证模态框
function closeAuthModal() {
    authModal.classList.remove('active');
    clearAuthMessages();
    clearForms();
}

// 切换到登录表单
function switchToLogin() {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    clearAuthMessages();
    clearForms();
}

// 切换到注册表单
function switchToRegister() {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    clearAuthMessages();
    clearForms();
}

// ==================== 消息提示 ====================

function showAuthError(message) {
    authError.textContent = '❌ ' + message;
    authError.style.display = 'block';
    authSuccess.style.display = 'none';
}

function showAuthSuccess(message) {
    authSuccess.textContent = '✅ ' + message;
    authSuccess.style.display = 'block';
    authError.style.display = 'none';
}

function showAuthLoading(message) {
    authSuccess.textContent = '⏳ ' + message;
    authSuccess.style.display = 'block';
    authError.style.display = 'none';
}

function clearAuthMessages() {
    authError.style.display = 'none';
    authSuccess.style.display = 'none';
    authError.textContent = '';
    authSuccess.textContent = '';
}

function clearForms() {
    loginFormElement.reset();
    registerFormElement.reset();
}

// ==================== 错误信息映射 ====================

function getErrorMessage(code) {
    const errorMessages = {
        // 邮箱相关
        'auth/invalid-email': '邮箱地址格式不正确',
        'auth/email-already-in-use': '该邮箱已被注册',
        'auth/user-not-found': '用户不存在',
        'auth/wrong-password': '密码错误',

        // 密码相关
        'auth/weak-password': '密码强度不够,请使用更复杂的密码',
        'auth/invalid-password': '密码格式不正确',

        // 账号相关
        'auth/account-exists-with-different-credential': '该邮箱已通过其他方式注册',
        'auth/popup-closed-by-user': '登录窗口被关闭',
        'auth/unauthorized-domain': '该域名未授权,请联系管理员',
        'auth/too-many-requests': '请求过于频繁,请稍后再试',

        // 网络相关
        'auth/network-request-failed': '网络连接失败,请检查网络',
        'auth/timeout': '请求超时,请重试',
    };

    return errorMessages[code] || '操作失败: ' + code;
}

// ==================== 等待验证界面 ====================

// 显示等待验证界面
function showVerificationPendingUI(email) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // 隐藏登录和注册表单
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';

    // 创建等待验证界面
    const verifyPendingHTML = `
        <div class="auth-form" id="verifyPendingForm">
            <div class="verify-pending-icon">📧</div>
            <h2>验证您的邮箱</h2>
            <div class="verify-pending-content">
                <p class="verify-email">${email}</p>
                <p class="verify-instruction">我们已向您的邮箱发送了验证链接</p>
                <ul class="verify-steps">
                    <li>📩 检查您的邮箱(包括垃圾邮件文件夹)</li>
                    <li>🔗 点击邮件中的验证链接</li>
                    <li>✅ 验证后您将自动登录</li>
                </ul>
                <div class="verify-tips">
                    <p>💡 <strong>提示:</strong> 验证链接有效期为 24 小时</p>
                </div>
                <div class="verify-actions">
                    <button class="btn btn-outline btn-block" id="backToLoginBtn">返回登录</button>
                    <button class="btn-link" id="resendVerifyBtn">重新发送验证邮件</button>
                </div>
                <div class="verify-checking">
                    <div class="spinner"></div>
                    <p>⏳ 等待验证中...</p>
                </div>
            </div>
        </div>
    `;

    // 插入等待验证界面
    const authModalContent = document.querySelector('.auth-modal-content');
    const existingForm = document.getElementById('verifyPendingForm');
    if (existingForm) {
        existingForm.remove();
    }

    authModalContent.insertAdjacentHTML('beforeend', verifyPendingHTML);

    // 绑定按钮事件
    document.getElementById('backToLoginBtn').addEventListener('click', () => {
        document.getElementById('verifyPendingForm').remove();
        switchToLogin();
    });

    document.getElementById('resendVerifyBtn').addEventListener('click', () => {
        resendVerificationEmailFromPending(email);
    });

    // 开始轮询检查验证状态
    startVerificationCheck(email);
}

// 开始检查验证状态
let verificationCheckInterval = null;

function startVerificationCheck(email) {
    let attempts = 0;
    const maxAttempts = 60; // 最多检查 60 次(约 5 分钟)

    // 清除之前的轮询
    if (verificationCheckInterval) {
        clearInterval(verificationCheckInterval);
    }

    verificationCheckInterval = setInterval(async () => {
        attempts++;

        if (attempts > maxAttempts) {
            clearInterval(verificationCheckInterval);
            showAuthError('验证超时,请重新登录或刷新页面重试');
            return;
        }

        // 尝试登录来检查验证状态
        // 注意:这里无法直接检查,因为需要密码
        // 实际上,验证后的处理通过页面 URL 参数检测

        console.log(`检查验证状态... (${attempts}/${maxAttempts})`);
    }, 5000); // 每 5 秒检查一次
}

// 从等待界面重新发送验证邮件
async function resendVerificationEmailFromPending(email) {
    showAuthLoading('正在重新发送...');

    // 显示提示
    showAuthSuccess('验证邮件已重新发送,请查收');

    // 3秒后清除提示
    setTimeout(() => {
        clearAuthMessages();
    }, 3000);
}

// 检查 URL 参数,处理邮箱验证回调
function checkEmailVerification() {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');

    if (mode === 'verifyEmail') {
        const actionCode = urlParams.get('oobCode');

        if (actionCode) {
            // 用户从验证链接返回
            handleEmailVerificationCallback(actionCode);
        }
    }
}

// 处理邮箱验证回调
async function handleEmailVerificationCallback(actionCode) {
    try {
        // 应用验证码
        await auth.applyActionCode(actionCode);

        // 验证成功,显示成功消息
        showAuthSuccess('🎉 邮箱验证成功! 正在为您登录...');

        // 3秒后关闭弹窗并刷新页面
        setTimeout(() => {
            closeAuthModal();
            // 清除 URL 参数
            window.history.replaceState({}, document.title, window.location.pathname);
            // 刷新页面以更新用户状态
            window.location.reload();
        }, 3000);

    } catch (error) {
        console.error('邮箱验证失败:', error);
        showAuthError('验证链接无效或已过期,请重新获取验证邮件');
    }
}

// ==================== 导出功能 ====================

// 导出当前用户信息(供其他模块使用)
function getCurrentUser() {
    return currentUser;
}

// 导出认证状态
function isAuthenticated() {
    return currentUser !== null;
}

// 等待 DOM 完全加载后再初始化认证系统
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    // DOM 已经加载完成
    initAuth();
}
