// 全局状态
const state = {
    images: [], // 存储所有图片对象
    maxSizeKB: 450, // 内部压缩目标为 450KB，确保小于 500KB
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

// 处理文件
async function processFiles(files) {
    console.log('开始处理', files.length, '个文件');
    actionBar.style.display = 'flex';
    updateProgress();

    for (const file of files) {
        const imageObj = {
            id: Date.now() + Math.random(),
            file: file,
            originalSize: file.size,
            originalUrl: URL.createObjectURL(file),
            compressedBlob: null,
            compressedUrl: null,
            compressedSize: null,
            status: 'processing', // processing, success, error
            error: null,
        };

        console.log('添加图片:', file.name, '大小:', formatSize(file.size));
        state.images.push(imageObj);
        renderImageCard(imageObj);

        // 开始压缩
        compressImage(imageObj);
    }

    updateProgress();
}

// 处理封面文件
async function processCoverFile(file) {
    console.log('开始处理封面:', file.name, '大小:', formatSize(file.size));

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

// 压缩封面图片
async function compressCoverImage(coverObj) {
    const maxSize = 280 * 1024; // 280KB 目标，确保小于 300KB

    try {
        const img = await loadImage(coverObj.file);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        let width = img.width;
        let height = img.height;
        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        // 如果原图已经小于目标大小，直接使用
        if (coverObj.file.size <= maxSize) {
            coverObj.compressedBlob = coverObj.file;
            coverObj.compressedSize = coverObj.file.size;
            coverObj.compressedUrl = coverObj.originalUrl;
            coverObj.status = 'success';
            updateCoverInfo();
            return;
        }

        // 二分查找最优质量参数
        let quality = 0.9;
        let minQuality = 0.1;
        let maxQuality = 1.0;
        let blob = null;
        let iterations = 0;
        const maxIterations = 15; // 封面允许更多迭代

        while (iterations < maxIterations) {
            blob = await canvasToBlob(canvas, quality);

            if (blob.size <= maxSize) {
                minQuality = quality;
                quality = Math.min(maxQuality, (quality + maxQuality) / 2);

                if (maxQuality - quality < 0.01) {
                    break;
                }
            } else {
                maxQuality = quality;
                quality = Math.max(minQuality, (quality + minQuality) / 2);

                if (quality - minQuality < 0.01) {
                    break;
                }
            }

            iterations++;
        }

        // 如果调整质量仍不够，缩小尺寸
        if (blob.size > maxSize) {
            const scaleFactors = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.25];

            for (const scale of scaleFactors) {
                const scaledWidth = Math.round(img.width * scale);
                const scaledHeight = Math.round(img.height * scale);

                canvas.width = scaledWidth;
                canvas.height = scaledHeight;
                ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

                blob = await canvasToBlob(canvas, 0.92);

                if (blob.size <= maxSize) {
                    break;
                }
            }
        }

        // 最终检查
        if (blob.size > maxSize) {
            blob = await canvasToBlob(canvas, 0.6);
        }

        coverObj.compressedBlob = blob;
        coverObj.compressedSize = blob.size;
        coverObj.compressedUrl = URL.createObjectURL(blob);
        coverObj.status = blob.size <= maxSize ? 'success' : 'error';

        if (coverObj.status === 'error') {
            coverObj.error = `压缩后仍超过目标大小 (${formatSize(blob.size)})`;
        }

        updateCoverInfo();

    } catch (error) {
        console.error('封面压缩失败:', error);
        coverObj.status = 'error';
        coverObj.error = '压缩失败: ' + error.message;
        updateCoverInfo();
    }
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

// 核心压缩算法
async function compressImage(imageObj) {
    const maxSize = state.maxSizeKB * 1024;

    try {
        const img = await loadImage(imageObj.file);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        let width = img.width;
        let height = img.height;
        canvas.width = width;
        canvas.height = height;

        // 绘制图片
        ctx.drawImage(img, 0, 0, width, height);

        // 如果原图已经小于目标大小,直接使用
        if (imageObj.file.size <= maxSize) {
            imageObj.compressedBlob = imageObj.file;
            imageObj.compressedSize = imageObj.file.size;
            imageObj.compressedUrl = imageObj.originalUrl;
            imageObj.status = 'success';
            updateImageCard(imageObj);
            updateProgress();
            return;
        }

        // 二分查找最优质量参数
        let quality = 0.9;
        let minQuality = 0.1;
        let maxQuality = 1.0;
        let blob = null;
        let iterations = 0;
        const maxIterations = state.autoOptimize ? 10 : 3;

        while (iterations < maxIterations) {
            blob = await canvasToBlob(canvas, quality);

            if (blob.size <= maxSize) {
                // 找到合适的大小,尝试提高质量
                minQuality = quality;
                quality = Math.min(maxQuality, (quality + maxQuality) / 2);

                if (maxQuality - quality < 0.01) {
                    // 已经很接近最优值
                    break;
                }
            } else {
                // 文件太大,降低质量
                maxQuality = quality;
                quality = Math.max(minQuality, (quality + minQuality) / 2);

                if (quality - minQuality < 0.01) {
                    // 质量已经很低了,尝试缩小尺寸
                    break;
                }
            }

            iterations++;
        }

        // 如果调整质量仍不够,缩小尺寸
        if (blob.size > maxSize && state.autoOptimize) {
            const scaleFactors = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4];

            for (const scale of scaleFactors) {
                const scaledWidth = Math.round(img.width * scale);
                const scaledHeight = Math.round(img.height * scale);

                canvas.width = scaledWidth;
                canvas.height = scaledHeight;
                ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

                blob = await canvasToBlob(canvas, 0.92);

                if (blob.size <= maxSize) {
                    break;
                }
            }
        }

        // 最终检查
        if (blob.size > maxSize) {
            // 尝试最后一次低质量压缩
            blob = await canvasToBlob(canvas, 0.7);
        }

        imageObj.compressedBlob = blob;
        imageObj.compressedSize = blob.size;
        imageObj.compressedUrl = URL.createObjectURL(blob);
        imageObj.status = blob.size <= maxSize ? 'success' : 'error';

        if (imageObj.status === 'error') {
            imageObj.error = `压缩后仍超过目标大小 (${formatSize(blob.size)})`;
        }

        updateImageCard(imageObj);
        updateProgress();

    } catch (error) {
        console.error('压缩失败:', error);
        imageObj.status = 'error';
        imageObj.error = '压缩失败: ' + error.message;
        updateImageCard(imageObj);
        updateProgress();
    }
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
window.previewImage = function(id) {
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
window.downloadImage = function(id) {
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

// 初始化
init();
