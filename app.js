// ==================== 配置常量 ====================
const CONFIG = {
    // 文件验证限制
    LIMITS: {
        MAX_FILE_SIZE: 50 * 1024 * 1024,  // 50MB 单文件大小限制
        MAX_FILES_COUNT: 50,               // 最多同时处理文件数
        MAX_TOTAL_FILES: 100,              // 队列中最大文件总数
        SUPPORTED_FORMATS: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    },
    // 压缩设置
    COMPRESSION: {
        EMOJI_MAX_SIZE_KB: 450,   // 表情包目标大小（确保小于 500KB）
        COVER_MAX_SIZE_KB: 280,   // 封面目标大小（确保小于 300KB）
        MAX_ITERATIONS: 10,        // 最大压缩迭代次数
        COVER_MAX_ITERATIONS: 15,  // 封面最大迭代次数
        SCALE_FACTORS: [0.9, 0.8, 0.7, 0.6, 0.5, 0.4]
    },
    // UI 设置
    UI: {
        AUTO_CLOSE_DELAY: 1000
    }
};

// 全局状态
const state = {
    images: [], // 存储所有图片对象
    maxSizeKB: CONFIG.COMPRESSION.EMOJI_MAX_SIZE_KB,
    autoOptimize: true, // 自动迭代优化
    coverImage: null, // 封面对象
};

// DOM 元素
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const actionBar = document.getElementById('actionBar');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const completedCount = document.getElementById('completedCount');
const totalCount = document.getElementById('totalCount');
const imageGrid = document.getElementById('imageGrid');
const previewModal = document.getElementById('previewModal');
const modalClose = document.getElementById('modalClose');
const modalImage = document.getElementById('modalImage');
const modalInfo = document.getElementById('modalInfo');

// 封面相关 DOM 元素
const coverUploadZone = document.getElementById('coverUploadZone');
const coverFileInput = document.getElementById('coverFileInput');
const coverPreview = document.getElementById('coverPreview');
const coverImage = document.getElementById('coverImage');
const coverInfo = document.getElementById('coverInfo');
const coverPreviewBtn = document.getElementById('coverPreviewBtn');
const coverDownloadBtn = document.getElementById('coverDownloadBtn');
const coverRemoveBtn = document.getElementById('coverRemoveBtn');

// 初始化事件监听
function init() {
    // 上传相关
    uploadZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('click', (e) => {
        // 阻止 input 上的点击事件冒泡到 uploadZone
        e.stopPropagation();
    });

    fileInput.addEventListener('change', handleFileSelect);
    uploadZone.addEventListener('dragover', handleDragOver);
    uploadZone.addEventListener('dragleave', handleDragLeave);
    uploadZone.addEventListener('drop', handleDrop);

    // 封面上传相关
    coverUploadZone.addEventListener('click', () => {
        coverFileInput.click();
    });

    coverFileInput.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    coverFileInput.addEventListener('change', handleCoverFileSelect);
    coverUploadZone.addEventListener('dragover', handleCoverDragOver);
    coverUploadZone.addEventListener('dragleave', handleCoverDragLeave);
    coverUploadZone.addEventListener('drop', handleCoverDrop);

    // 封面操作按钮
    coverPreviewBtn.addEventListener('click', () => previewCoverImage());
    coverDownloadBtn.addEventListener('click', downloadCoverImage);
    coverRemoveBtn.addEventListener('click', removeCoverImage);

    // 下载按钮
    downloadAllBtn.addEventListener('click', downloadAll);

    // 预览弹窗
    modalClose.addEventListener('click', closeModal);
    previewModal.addEventListener('click', (e) => {
        if (e.target === previewModal) closeModal();
    });

    // 添加全局错误处理
    setupGlobalErrorHandlers();
}

// ==================== 全局错误处理 ====================

function setupGlobalErrorHandlers() {
    // 处理未捕获的 Promise 错误
    window.addEventListener('unhandledrejection', (event) => {
        console.error('未处理的 Promise 错误:', event.reason);
        // 可以在这里添加用户提示
    });

    // 处理一般错误
    window.addEventListener('error', (event) => {
        console.error('JavaScript 错误:', event.error);
        // 防止页面崩溃
        event.preventDefault();
    });
}

// 拖拽处理
function handleDragOver(e) {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');

    const files = Array.from(e.dataTransfer.files).filter(file =>
        file.type.startsWith('image/')
    );

    if (files.length > 0) {
        processFiles(files);
    }
}

// 封面拖拽处理
function handleCoverDragOver(e) {
    e.preventDefault();
    coverUploadZone.classList.add('drag-over');
}

function handleCoverDragLeave(e) {
    e.preventDefault();
    coverUploadZone.classList.remove('drag-over');
}

function handleCoverDrop(e) {
    e.preventDefault();
    coverUploadZone.classList.remove('drag-over');

    const files = Array.from(e.dataTransfer.files).filter(file =>
        file.type.startsWith('image/')
    );

    if (files.length > 0) {
        processCoverFile(files[0]);
    }
}

// 文件选择处理
function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    console.log('选中的文件数量:', files.length);
    console.log('文件列表:', files.map(f => f.name));

    // 重置 input，但要在处理完文件之后
    if (files.length > 0) {
        processFiles(files);
    }

    // 延迟重置 input
    setTimeout(() => {
        fileInput.value = '';
    }, 100);
}

// 封面文件选择处理
function handleCoverFileSelect(e) {
    const files = Array.from(e.target.files);

    if (files.length > 0) {
        processCoverFile(files[0]);
    }

    setTimeout(() => {
        coverFileInput.value = '';
    }, 100);
}

// ==================== 文件验证 ====================

// 验证单个文件
function validateFile(file) {
    const errors = [];

    // 检查文件类型
    if (!CONFIG.LIMITS.SUPPORTED_FORMATS.includes(file.type)) {
        errors.push(`不支持的文件格式: ${file.type || '未知'}`);
    }

    // 检查文件大小
    if (file.size > CONFIG.LIMITS.MAX_FILE_SIZE) {
        errors.push(`文件过大: ${formatSize(file.size)}，最大允许 ${formatSize(CONFIG.LIMITS.MAX_FILE_SIZE)}`);
    }

    return {
        valid: errors.length === 0,
        errors: errors
    };
}

// 验证文件批量
function validateFiles(files) {
    const result = {
        validFiles: [],
        invalidFiles: [],
        errors: []
    };

    // 检查文件数量
    if (files.length > CONFIG.LIMITS.MAX_FILES_COUNT) {
        result.errors.push(`一次最多处理 ${CONFIG.LIMITS.MAX_FILES_COUNT} 个文件，您选择了 ${files.length} 个`);
    }

    // 检查队列总数
    const totalAfterAdd = state.images.length + files.length;
    if (totalAfterAdd > CONFIG.LIMITS.MAX_TOTAL_FILES) {
        const remaining = CONFIG.LIMITS.MAX_TOTAL_FILES - state.images.length;
        result.errors.push(`队列已满，最多可再添加 ${remaining} 个文件`);
    }

    // 验证每个文件
    for (const file of files) {
        const validation = validateFile(file);
        if (validation.valid) {
            result.validFiles.push(file);
        } else {
            result.invalidFiles.push({
                file: file,
                errors: validation.errors
            });
        }
    }

    return result;
}

// 显示验证错误提示
function showValidationErrors(errors, invalidFiles) {
    let message = '';

    if (errors.length > 0) {
        message += errors.join('\n') + '\n';
    }

    if (invalidFiles.length > 0) {
        const fileErrors = invalidFiles.slice(0, 3).map(item =>
            `• ${item.file.name}: ${item.errors.join(', ')}`
        ).join('\n');

        message += fileErrors;

        if (invalidFiles.length > 3) {
            message += `\n... 还有 ${invalidFiles.length - 3} 个文件有问题`;
        }
    }

    if (message) {
        alert('⚠️ 部分文件无法处理:\n\n' + message);
    }
}

// 处理文件
async function processFiles(files) {
    // 验证文件
    const validation = validateFiles(files);

    // 显示验证错误
    if (validation.errors.length > 0 || validation.invalidFiles.length > 0) {
        showValidationErrors(validation.errors, validation.invalidFiles);
    }

    // 如果没有有效文件，直接返回
    if (validation.validFiles.length === 0) {
        console.log('没有有效的文件可处理');
        return;
    }

    // 限制处理数量
    const filesToProcess = validation.validFiles.slice(0, CONFIG.LIMITS.MAX_FILES_COUNT);

    console.log('开始处理', filesToProcess.length, '个文件');
    actionBar.style.display = 'flex';
    updateProgress();

    // 创建所有图片对象
    const imageObjects = filesToProcess.map(file => ({
        id: Date.now() + Math.random(),
        file: file,
        originalSize: file.size,
        originalUrl: URL.createObjectURL(file),
        compressedBlob: null,
        compressedUrl: null,
        compressedSize: null,
        status: 'processing',
        error: null,
    }));

    // 添加到状态并渲染卡片
    imageObjects.forEach(imageObj => {
        console.log('添加图片:', imageObj.file.name, '大小:', formatSize(imageObj.originalSize));
        state.images.push(imageObj);
        renderImageCard(imageObj);
    });

    updateProgress();

    // 并发压缩（限制并发数）
    const CONCURRENT_LIMIT = 3;
    await processWithConcurrency(imageObjects, compressImage, CONCURRENT_LIMIT);
}

/**
 * 并发处理函数，限制同时进行的任务数量
 * @param {Array} items - 要处理的项目数组
 * @param {Function} processor - 处理函数
 * @param {number} limit - 最大并发数
 */
async function processWithConcurrency(items, processor, limit) {
    const results = [];
    const executing = new Set();

    for (const item of items) {
        const promise = processor(item).then(result => {
            executing.delete(promise);
            return result;
        });

        executing.add(promise);
        results.push(promise);

        if (executing.size >= limit) {
            await Promise.race(executing);
        }
    }

    return Promise.all(results);
}

// 处理封面文件
async function processCoverFile(file) {
    // 验证封面文件
    const validation = validateFile(file);
    if (!validation.valid) {
        alert('⚠️ 封面文件无法处理:\n\n' + validation.errors.join('\n'));
        return;
    }

    console.log('开始处理封面:', file.name, '大小:', formatSize(file.size));

    // 如果已有封面，先清理
    if (state.coverImage) {
        cleanupCoverImage();
    }

    state.coverImage = {
        file: file,
        originalSize: file.size,
        originalUrl: URL.createObjectURL(file),
        compressedBlob: null,
        compressedUrl: null,
        compressedSize: null,
        status: 'processing',
        error: null,
    };

    // 显示预览区域
    coverUploadZone.style.display = 'none';
    coverPreview.style.display = 'flex';
    coverImage.src = state.coverImage.originalUrl;

    updateCoverInfo();

    // 压缩封面（目标 280KB，确保小于 300KB）
    await compressCoverImage(state.coverImage);
}

// ==================== 核心压缩算法 ====================

/**
 * 通用图片压缩核心函数
 * @param {File} file - 要压缩的文件
 * @param {Object} options - 压缩选项
 * @param {number} options.maxSizeBytes - 目标最大大小（字节）
 * @param {number} options.maxIterations - 最大迭代次数
 * @param {number[]} options.scaleFactors - 缩放因子数组
 * @param {number} options.minQuality - 最终最低质量
 * @returns {Promise<{blob: Blob, success: boolean, error: string|null}>}
 */
async function compressImageCore(file, options = {}) {
    const {
        maxSizeBytes = CONFIG.COMPRESSION.EMOJI_MAX_SIZE_KB * 1024,
        maxIterations = CONFIG.COMPRESSION.MAX_ITERATIONS,
        scaleFactors = CONFIG.COMPRESSION.SCALE_FACTORS,
        minQuality = 0.6
    } = options;

    try {
        const img = await loadImage(file);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        let width = img.width;
        let height = img.height;
        canvas.width = width;
        canvas.height = height;

        // 绘制原始图片
        ctx.drawImage(img, 0, 0, width, height);

        // 如果原图已经小于目标大小，直接返回
        if (file.size <= maxSizeBytes) {
            return {
                blob: file,
                success: true,
                error: null
            };
        }

        // 二分查找最优质量参数
        let quality = 0.9;
        let minQ = 0.1;
        let maxQ = 1.0;
        let blob = null;
        let iterations = 0;

        while (iterations < maxIterations) {
            blob = await canvasToBlob(canvas, quality);

            if (blob.size <= maxSizeBytes) {
                // 找到合适的大小，尝试提高质量
                minQ = quality;
                quality = Math.min(maxQ, (quality + maxQ) / 2);

                if (maxQ - quality < 0.01) {
                    break;
                }
            } else {
                // 文件太大，降低质量
                maxQ = quality;
                quality = Math.max(minQ, (quality + minQ) / 2);

                if (quality - minQ < 0.01) {
                    break;
                }
            }

            iterations++;
        }

        // 如果调整质量仍不够，缩小尺寸
        if (blob.size > maxSizeBytes && scaleFactors.length > 0) {
            for (const scale of scaleFactors) {
                const scaledWidth = Math.round(img.width * scale);
                const scaledHeight = Math.round(img.height * scale);

                canvas.width = scaledWidth;
                canvas.height = scaledHeight;
                ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

                blob = await canvasToBlob(canvas, 0.92);

                if (blob.size <= maxSizeBytes) {
                    break;
                }
            }
        }

        // 最终尝试低质量压缩
        if (blob.size > maxSizeBytes) {
            blob = await canvasToBlob(canvas, minQuality);
        }

        return {
            blob: blob,
            success: blob.size <= maxSizeBytes,
            error: blob.size > maxSizeBytes ? `压缩后仍超过目标大小 (${formatSize(blob.size)})` : null
        };

    } catch (error) {
        console.error('压缩核心错误:', error);
        return {
            blob: null,
            success: false,
            error: '压缩失败: ' + error.message
        };
    }
}

// 压缩封面图片（使用核心压缩函数）
async function compressCoverImage(coverObj) {
    const coverScaleFactors = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.25];

    const result = await compressImageCore(coverObj.file, {
        maxSizeBytes: CONFIG.COMPRESSION.COVER_MAX_SIZE_KB * 1024,
        maxIterations: CONFIG.COMPRESSION.COVER_MAX_ITERATIONS,
        scaleFactors: coverScaleFactors,
        minQuality: 0.5
    });

    if (result.blob) {
        coverObj.compressedBlob = result.blob;
        coverObj.compressedSize = result.blob.size;
        // 如果返回的是原文件，使用原始 URL；否则创建新 URL
        coverObj.compressedUrl = result.blob === coverObj.file
            ? coverObj.originalUrl
            : URL.createObjectURL(result.blob);
        coverObj.status = result.success ? 'success' : 'error';
        coverObj.error = result.error;
    } else {
        coverObj.status = 'error';
        coverObj.error = result.error;
    }

    updateCoverInfo();
}

// 更新封面信息显示
function updateCoverInfo() {
    const coverObj = state.coverImage;
    if (!coverObj) return;

    if (coverObj.status === 'processing') {
        coverInfo.innerHTML = `
            <div class="cover-info-item">📁 ${coverObj.file.name}</div>
            <div class="cover-info-item">原大小: ${formatSize(coverObj.originalSize)}</div>
            <div class="cover-info-item"><span class="stat-badge processing">压缩中...</span></div>
        `;
        coverDownloadBtn.disabled = true;
    } else if (coverObj.status === 'success') {
        const ratio = ((1 - coverObj.compressedSize / coverObj.originalSize) * 100).toFixed(1);
        coverInfo.innerHTML = `
            <div class="cover-info-item">📁 ${coverObj.file.name}</div>
            <div class="cover-info-item">原大小: ${formatSize(coverObj.originalSize)}</div>
            <div class="cover-info-item">压缩后: ${formatSize(coverObj.compressedSize)}</div>
            <div class="cover-info-item"><span class="stat-badge success">✓ 压缩 ${ratio}%</span></div>
        `;
        coverDownloadBtn.disabled = false;
    } else if (coverObj.status === 'error') {
        coverInfo.innerHTML = `
            <div class="cover-info-item">📁 ${coverObj.file.name}</div>
            <div class="cover-info-item">原大小: ${formatSize(coverObj.originalSize)}</div>
            <div class="cover-info-item"><span class="stat-badge error">✕ ${coverObj.error || '失败'}</span></div>
        `;
        coverDownloadBtn.disabled = true;
    }
}

// 预览封面
function previewCoverImage() {
    if (!state.coverImage) return;

    modalImage.src = state.coverImage.compressedUrl || state.coverImage.originalUrl;
    modalInfo.innerHTML = `
        <strong>封面预览</strong><br>
        📁 ${state.coverImage.file.name}<br>
        原大小: ${formatSize(state.coverImage.originalSize)}<br>
        ${state.coverImage.compressedSize ? `压缩后: ${formatSize(state.coverImage.compressedSize)}` : ''}
    `;

    previewModal.classList.add('active');
}

// 下载封面
function downloadCoverImage() {
    if (!state.coverImage || !state.coverImage.compressedBlob) return;

    const url = state.coverImage.compressedUrl;
    const a = document.createElement('a');
    a.href = url;
    a.download = addSuffix(state.coverImage.file.name, '_cover');
    a.click();
}

// 移除封面
function removeCoverImage() {
    if (!state.coverImage) return;

    // 释放 URL 对象
    if (state.coverImage.originalUrl) {
        URL.revokeObjectURL(state.coverImage.originalUrl);
    }
    if (state.coverImage.compressedUrl) {
        URL.revokeObjectURL(state.coverImage.compressedUrl);
    }

    state.coverImage = null;

    // 隐藏预览，显示上传区域
    coverPreview.style.display = 'none';
    coverUploadZone.style.display = 'block';
    coverInfo.innerHTML = '';
}

// 压缩表情包图片（使用核心压缩函数）
async function compressImage(imageObj) {
    const iterations = state.autoOptimize ? CONFIG.COMPRESSION.MAX_ITERATIONS : 3;
    const scaleFactors = state.autoOptimize ? CONFIG.COMPRESSION.SCALE_FACTORS : [];

    const result = await compressImageCore(imageObj.file, {
        maxSizeBytes: state.maxSizeKB * 1024,
        maxIterations: iterations,
        scaleFactors: scaleFactors,
        minQuality: 0.7
    });

    if (result.blob) {
        imageObj.compressedBlob = result.blob;
        imageObj.compressedSize = result.blob.size;
        // 如果返回的是原文件，使用原始 URL；否则创建新 URL
        imageObj.compressedUrl = result.blob === imageObj.file
            ? imageObj.originalUrl
            : URL.createObjectURL(result.blob);
        imageObj.status = result.success ? 'success' : 'error';
        imageObj.error = result.error;
    } else {
        imageObj.status = 'error';
        imageObj.error = result.error;
    }

    updateImageCard(imageObj);
    updateProgress();
}

// 加载图片
function loadImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

// Canvas 转 Blob
function canvasToBlob(canvas, quality) {
    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve(blob);
        }, 'image/jpeg', quality);
    });
}

// 渲染图片卡片
function renderImageCard(imageObj) {
    const card = document.createElement('div');
    card.className = 'image-card';
    card.id = `card-${imageObj.id}`;

    card.innerHTML = `
        <img src="${imageObj.originalUrl}" alt="${imageObj.file.name}" class="image-thumbnail">
        <div class="image-info">
            <div class="image-name" title="${imageObj.file.name}">${imageObj.file.name}</div>
            <div class="image-stats" id="stats-${imageObj.id}">
                <span class="stat-badge processing">压缩中...</span>
            </div>
            <div class="image-actions">
                <button class="btn btn-sm btn-outline" onclick="previewImage(${imageObj.id})">预览</button>
                <button class="btn btn-sm btn-outline" onclick="downloadImage(${imageObj.id})" id="download-${imageObj.id}" disabled>下载</button>
            </div>
        </div>
    `;

    imageGrid.appendChild(card);
}

// 更新图片卡片
function updateImageCard(imageObj) {
    const statsEl = document.getElementById(`stats-${imageObj.id}`);
    const downloadBtn = document.getElementById(`download-${imageObj.id}`);

    if (imageObj.status === 'success') {
        const ratio = ((1 - imageObj.compressedSize / imageObj.originalSize) * 100).toFixed(1);
        statsEl.innerHTML = `
            <span>${formatSize(imageObj.originalSize)} → ${formatSize(imageObj.compressedSize)}</span>
            <span class="stat-badge success">✓ ${ratio}%</span>
        `;
        downloadBtn.disabled = false;
    } else if (imageObj.status === 'error') {
        statsEl.innerHTML = `
            <span>${formatSize(imageObj.originalSize)}</span>
            <span class="stat-badge error">✕ ${imageObj.error || '失败'}</span>
        `;
    } else {
        statsEl.innerHTML = `<span class="stat-badge processing">压缩中...</span>`;
    }
}

// 重新压缩所有图片
function recompressAll() {
    state.images.forEach(imageObj => {
        if (imageObj.status !== 'processing') {
            imageObj.status = 'processing';
            imageObj.compressedBlob = null;
            imageObj.compressedUrl = null;
            imageObj.compressedSize = null;
            updateImageCard(imageObj);
            compressImage(imageObj);
        }
    });
}

// 更新进度
function updateProgress() {
    const completed = state.images.filter(img => img.status === 'success').length;
    completedCount.textContent = completed;
    totalCount.textContent = state.images.length;
}

// 预览图片
window.previewImage = function (id) {
    const imageObj = state.images.find(img => img.id === id);
    if (!imageObj) return;

    modalImage.src = imageObj.compressedUrl || imageObj.originalUrl;
    modalInfo.innerHTML = `
        <strong>${imageObj.file.name}</strong><br>
        原大小: ${formatSize(imageObj.originalSize)}<br>
        ${imageObj.compressedSize ? `压缩后: ${formatSize(imageObj.compressedSize)}` : ''}
    `;

    previewModal.classList.add('active');
};

// 关闭弹窗
function closeModal() {
    previewModal.classList.remove('active');
}

// 下载单张图片
window.downloadImage = function (id) {
    const imageObj = state.images.find(img => img.id === id);
    if (!imageObj || !imageObj.compressedBlob) return;

    const url = imageObj.compressedUrl;
    const a = document.createElement('a');
    a.href = url;
    a.download = addSuffix(imageObj.file.name, '_compressed');
    a.click();
};

// 批量下载所有
async function downloadAll() {
    const successfulImages = state.images.filter(img => img.status === 'success' && img.compressedBlob);

    if (successfulImages.length === 0) {
        alert('没有可下载的图片');
        return;
    }

    if (successfulImages.length === 1) {
        window.downloadImage(successfulImages[0].id);
        return;
    }

    // 使用 JSZip 打包
    const zip = new JSZip();
    successfulImages.forEach(img => {
        const fileName = addSuffix(img.file.name, '_compressed');
        zip.file(fileName, img.compressedBlob);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `表情包_${new Date().getTime()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
}

// 文件名添加后缀
function addSuffix(filename, suffix) {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1) {
        return filename + suffix;
    }
    return filename.substring(0, lastDot) + suffix + filename.substring(lastDot);
}

// 格式化文件大小
function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ==================== 内存管理 ====================

// 清理单个图片对象的 URL
function cleanupImageObject(imageObj) {
    if (imageObj.originalUrl) {
        URL.revokeObjectURL(imageObj.originalUrl);
        imageObj.originalUrl = null;
    }
    if (imageObj.compressedUrl) {
        URL.revokeObjectURL(imageObj.compressedUrl);
        imageObj.compressedUrl = null;
    }
}

// 清理封面图片
function cleanupCoverImage() {
    if (state.coverImage) {
        cleanupImageObject(state.coverImage);
        state.coverImage = null;
    }
}

// 清理所有图片
function cleanupAllImages() {
    state.images.forEach(imageObj => {
        cleanupImageObject(imageObj);
    });
    state.images = [];
}

// 清理所有资源
function cleanup() {
    cleanupAllImages();
    cleanupCoverImage();
    console.log('✅ 所有资源已清理');
}

// 移除单个图片
function removeImage(id) {
    const index = state.images.findIndex(img => img.id === id);
    if (index !== -1) {
        const imageObj = state.images[index];
        cleanupImageObject(imageObj);

        // 移除 DOM 元素
        const card = document.getElementById(`card-${id}`);
        if (card) {
            card.remove();
        }

        // 从数组中移除
        state.images.splice(index, 1);
        updateProgress();

        // 如果没有图片了，隐藏操作栏
        if (state.images.length === 0) {
            actionBar.style.display = 'none';
        }
    }
}

// 页面卸载时清理资源
window.addEventListener('beforeunload', () => {
    cleanup();
});

// 等待 DOM 完全加载后再初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM 已经加载完成
    init();
}

