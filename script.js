// --- Configuration & State ---
const CONFIG = {
    maxHistory: 50, // Increased for favorites
    defaultLang: 'ar',
    timeout: 20000, // 20 seconds timeout
    maxRetries: 3
};

const STATE = {
    currentImage: null, // Blob or URL
    currentPrompt: '',
    currentStyle: '',
    history: JSON.parse(localStorage.getItem('thumbnailHistory') || '[]'),
    abortController: null,
    isGenerating: false,
    filterMode: 'all' // 'all' or 'favorites'
};

// Ensure history items have IDs and isFavorite property
STATE.history = STATE.history.map(item => ({
    ...item,
    id: item.id || Date.now() + Math.random().toString(36).substr(2, 9),
    isFavorite: item.isFavorite || false
}));

// --- Translation Data ---
const translations = {
    ar: {
        panelTitle: "إعدادات الصورة",
        descLabel: "وصف الفيديو",
        promptPlaceholder: "مثال: شخص مصدوم ينظر إلى شاشة الكمبيوتر...",
        styleLabel: "نوع المحتوى",
        textLabel: "إضافة نص (اختياري)",
        overlayTextPlaceholder: "اكتب النص هنا...",
        textColorLabel: "لون النص",
        strokeColorLabel: "لون الحدود",
        textSizeOptions: {
            40: "صغير",
            60: "متوسط",
            80: "كبير",
            120: "ضخم"
        },
        genres: {
            gaming: 'ألعاب 🎮',
            vlog: 'فلوق ☀️',
            tech: 'تقنية 💻',
            horror: 'رعب 👻',
            educational: 'تعليمي 📚',
            comedy: 'كوميدي 😂',
            fitness: 'رياضة 💪',
            food: 'طعام 🍔'
        },
        generateBtn: "توليد الصورة",
        welcomeTitle: "مساحة العمل",
        welcomeText: "أدخل الوصف واضغط توليد لتبدأ الإبداع",
        loadingText: "جاري تحليل وتصميم الصورة المصغرة...",
        loadingStage1: "جاري تحليل الوصف...",
        loadingStage2: "جاري تصميم التكوين...",
        loadingStage3: "جاري إنشاء الصورة المصغرة...",
        downloadBtn: "تحميل الصورة (HD)",
        disclaimerText: "* سيتم حذف الرابط تلقائياً بعد 10 دقائق",
        langBtnText: "English",
        langBtnIcon: "English.png",
        historyTitle: "السجل (History)",
        emptyHistory: "لا توجد صور سابقة",
        promoText: "مجاني 100%، بدون علامة مائية، بدون تسجيل.",
        workspaceSectionTitle: "مساحة العمل",
        heroText: "أفضل مُولد مجاني للصور المصغرة لليوتيوب مدعوم بالذكاء الاصطناعي. ما عليك سوى وصف الفيديو الخاص بك، وسيقوم محركنا الذكي فوراً بإنشاء صورة مصغرة مذهلة وعالية الجودة (1280×720)، مُحسنة لزيادة النقرات وتفاعل المشاهدين، وجاهزة للتحميل في ثوانٍ.",
        toastSuccess: "تم توليد الصورة بنجاح!",
        toastError: "فشل توليد الصورة. يرجى المحاولة مرة أخرى.",
        toastTimeout: "انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.",
        toastCancel: "تم إلغاء التوليد.",
        timeEstimation: "الوقت المقدر: 5-10 ثواني",
        cancelBtn: "إلغاء التوليد",
        enhanceBtn: "✨ تحسين الوصف",
        filterAll: "الكل",
        filterFavorites: "المفضلة"
    },
    en: {
        panelTitle: "Image Settings",
        descLabel: "Video Description",
        promptPlaceholder: "Ex: Shocked person looking at computer screen...",
        styleLabel: "Content Type",
        textLabel: "Add Text (Optional)",
        overlayTextPlaceholder: "Type text here...",
        textColorLabel: "Text Color",
        strokeColorLabel: "Contour Color",
        textSizeOptions: {
            40: "Small",
            60: "Medium",
            80: "Large",
            120: "Huge"
        },
        genres: {
            gaming: 'Gaming 🎮',
            vlog: 'Vlog ☀️',
            tech: 'Tech 💻',
            horror: 'Horror 👻',
            educational: 'Educational 📚',
            comedy: 'Comedy 😂',
            fitness: 'Fitness 💪',
            food: 'Food 🍔'
        },
        generateBtn: "Generate Image",
        welcomeTitle: "Workspace",
        welcomeText: "Enter description and click generate to start",
        loadingText: "Analyzing & Designing Thumbnail...",
        loadingStage1: "Analyzing description...",
        loadingStage2: "Designing composition...",
        loadingStage3: "Rendering thumbnail...",
        downloadBtn: "Download Image (HD)",
        disclaimerText: "* Link will be removed automatically after 10 minutes",
        langBtnText: "العربية",
        langBtnIcon: "العربية.png",
        historyTitle: "History",
        emptyHistory: "No previous images",
        promoText: "100% free, no watermark, no registration.",
        workspaceSectionTitle: "Workspace",
        heroText: "The ultimate free AI-powered YouTube thumbnail generator. Simply describe your video, and our intelligent engine will instantly produce a stunning, high-quality thumbnail (1280×720) optimized for clicks and viewer engagement ready to download in seconds.",
        toastSuccess: "Image generated successfully!",
        toastError: "Failed to generate image. Please try again.",
        toastTimeout: "Request timed out. Please try again.",
        toastCancel: "Generation cancelled.",
        timeEstimation: "Estimated time: 5-10 seconds",
        cancelBtn: "Cancel Generation",
        enhanceBtn: "✨ Enhance",
        filterAll: "All",
        filterFavorites: "Favorites"
    }
};

// --- YouTube Genre Prompts ---
const YOUTUBE_GENRES = {
    gaming: 'neon lighting, cyberpunk aesthetic, intense action blur, electric blue and purple glow, esports energy, fortnite/valorant style, explosive effects, high adrenaline, gaming beast mode',
    vlog: 'bright sunny atmosphere, natural bokeh background, wide angle shot, cheerful warm tones, relatable friendly vibe, instagram aesthetic, soft golden hour lighting, lifestyle content',
    tech: 'clean modern studio setup, sharp product focus, professional blurred background, minimalist composition, mkbhd style, crisp details, futuristic sleek design, tech review aesthetic',
    horror: 'dark moody atmosphere, red and black color scheme, heavy vignette, mysterious fog, dramatic shadows, cinematic horror, suspenseful lighting, psychological thriller vibes',
    educational: 'clean organized layout, bright professional lighting, infographic elements, clear subject focus, trustworthy academic vibe, whiteboard aesthetic, educational content style',
    comedy: 'exaggerated facial expressions, bold saturated colors, chaotic fun energy, meme-worthy composition, vibrant eye-popping palette, comedic timing, funny reaction style',
    fitness: 'dynamic action shot, explosive energy, motivational powerful vibe, athletic movement, bold dramatic lighting, strength and determination, workout intensity',
    food: 'appetizing close-up, vibrant fresh colors, steam rising, action shot, warm inviting tones, professional food photography, mouth-watering presentation, culinary excellence'
};

const NEGATIVE_DEFAULTS = 'low quality, blurry, pixelated, deformed, watermark, text overlay, signature, bad anatomy, ugly, distorted';

// --- YouTube Thumbnail Prompt Constructor ---
function constructYouTubeThumbnailPrompt(userDesc, genreKey) {
    const baseStyle = "YouTube thumbnail composition, 1280x720, 16:9 aspect ratio, rule of thirds";
    const composition = "main subject positioned on right third, empty space on left for text overlay";
    const visual = "high contrast, saturated vibrant colors, hyper-expressive faces, dramatic lighting";
    const quality = "8k resolution, sharp focus, professional photography, trending on ArtStation";
    const genreKeywords = YOUTUBE_GENRES[genreKey] || '';
    const negativePrompts = "text, letters, typography, watermark, signature, writing, low quality, blurry, pixelated, deformed, bad anatomy, ugly, distorted";

    return `${baseStyle}, ${composition}, ${visual}, ${userDesc}, ${genreKeywords}, ${quality}, negative space for title text, avoid: ${negativePrompts}`;
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {

    // DOM Elements
    const els = {
        form: document.getElementById('generatorForm'),
        prompt: document.getElementById('prompt'),
        style: document.getElementById('style'),
        overlayText: document.getElementById('overlayText'),
        textColor: document.getElementById('textColor'),
        strokeColor: document.getElementById('strokeColor'),
        fontFamily: document.getElementById('fontFamily'),
        textSize: document.getElementById('textSize'),
        generateBtn: document.getElementById('generateBtn'),
        imageCanvas: document.getElementById('imageCanvas'),
        finalCanvas: document.getElementById('finalCanvas'),
        downloadBtn: document.getElementById('downloadBtn'),
        loadingState: document.getElementById('loadingState'),
        welcomeState: document.getElementById('welcomeState'),
        actions: document.getElementById('actions'),
        langBtn: document.getElementById('langBtn'),
        historyList: document.getElementById('historyList'),
        cancelBtn: document.getElementById('cancelBtn'),
        timeEstimation: document.getElementById('timeEstimation'),
        toastContainer: document.getElementById('toastContainer'),
        enhanceBtn: document.getElementById('enhanceBtn'),
        filterAll: document.getElementById('filterAll'),
        filterFavorites: document.getElementById('filterFavorites')
    };

    let currentLang = localStorage.getItem('preferredLanguage') || CONFIG.defaultLang;

    // 1. Language Logic
    function applyLanguage(lang) {
        const t = translations[lang];
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

        // Update Text
        document.getElementById('panelTitle').textContent = t.panelTitle;
        document.getElementById('descLabel').textContent = t.descLabel;
        els.prompt.placeholder = t.promptPlaceholder;
        document.getElementById('styleLabel').textContent = t.styleLabel;
        document.getElementById('textLabel').textContent = t.textLabel;
        els.overlayText.placeholder = t.overlayTextPlaceholder;

        // Update New Labels
        document.getElementById('textColorLabel').textContent = t.textColorLabel;
        document.getElementById('strokeColorLabel').textContent = t.strokeColorLabel;
        document.getElementById('disclaimerText').textContent = t.disclaimerText;

        // Update Promo Text
        const promoEl = document.getElementById('promoText');
        if (promoEl) promoEl.textContent = t.promoText;

        // Update Options
        Array.from(els.style.options).forEach(opt => {
            if (t.genres[opt.value]) opt.textContent = t.genres[opt.value];
        });

        Array.from(els.textSize.options).forEach(opt => {
            if (t.textSizeOptions[opt.value]) opt.textContent = t.textSizeOptions[opt.value];
        });

        els.generateBtn.querySelector('span').textContent = t.generateBtn;
        document.getElementById('welcomeTitle').textContent = t.welcomeTitle;
        document.getElementById('welcomeText').textContent = t.welcomeText;
        document.getElementById('loadingText').textContent = t.loadingText;
        els.downloadBtn.querySelector('span').textContent = t.downloadBtn;
        els.langBtn.querySelector('span').textContent = t.langBtnText;
        els.langBtn.querySelector('img').src = t.langBtnIcon;
        document.getElementById('historyTitle').textContent = t.historyTitle;

        if (els.cancelBtn) els.cancelBtn.querySelector('span').textContent = t.cancelBtn;
        if (els.timeEstimation) els.timeEstimation.textContent = t.timeEstimation;
        if (els.enhanceBtn) els.enhanceBtn.querySelector('span').textContent = t.enhanceBtn;
        if (els.filterAll) els.filterAll.textContent = t.filterAll;
        if (els.filterFavorites) els.filterFavorites.textContent = t.filterFavorites;

        // Update Workspace Section Title
        const wsTitle = document.getElementById('workspaceSectionTitle');
        if (wsTitle) wsTitle.textContent = t.workspaceSectionTitle;

        // Update Hero Text
        const heroTextEl = document.getElementById('heroText');
        if (heroTextEl) heroTextEl.textContent = t.heroText;

        localStorage.setItem('preferredLanguage', lang);
        updateHistoryUI();
    }

    els.langBtn.addEventListener('click', () => {
        currentLang = currentLang === 'ar' ? 'en' : 'ar';
        applyLanguage(currentLang);
    });

    // Refresh on Logo Click
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', () => {
            window.scrollTo(0, 0);
            window.location.reload();
        });
    }

    // 2. History Logic
    function updateHistoryUI() {
        els.historyList.innerHTML = '';

        let displayHistory = STATE.history;

        // Filter Logic
        if (STATE.filterMode === 'favorites') {
            displayHistory = displayHistory.filter(item => item.isFavorite);
        }

        if (displayHistory.length === 0) {
            els.historyList.innerHTML = `<div class="placeholder-state" style="font-size: 0.8rem; padding: 20px;">${translations[currentLang].emptyHistory}</div>`;
            return;
        }

        // Show items (limit to 50 for performance, but show all favorites if filtered)
        const recentHistory = displayHistory.slice().reverse();

        recentHistory.forEach((item) => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <img src="${item.url}" class="history-thumb" alt="thumb">
                <button class="heart-btn ${item.isFavorite ? 'active' : ''}" title="Toggle Favorite">
                    <svg class="heart-icon" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                </button>
                <div class="history-info">
                    <div class="history-prompt">${item.prompt}</div>
                    <div class="history-date">${new Date(item.date).toLocaleTimeString()}</div>
                </div>
            `;

            // Click on item to show modal
            div.onclick = (e) => {
                // Ignore if clicked on heart button
                if (e.target.closest('.heart-btn')) return;
                showImageModal(item.url);
            };

            // Heart Button Click
            const heartBtn = div.querySelector('.heart-btn');
            heartBtn.onclick = (e) => {
                e.stopPropagation();
                toggleFavorite(item.id);
            };

            els.historyList.appendChild(div);
        });
    }

    function addToHistory(url, prompt, style) {
        const newItem = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            url: url,
            prompt: prompt,
            style: style,
            date: Date.now(),
            isFavorite: false
        };
        STATE.history.push(newItem);

        // Remove oldest non-favorite items if limit reached
        if (STATE.history.length > CONFIG.maxHistory) {
            const indexToRemove = STATE.history.findIndex(item => !item.isFavorite);
            if (indexToRemove !== -1) {
                STATE.history.splice(indexToRemove, 1);
            } else {
                STATE.history.shift(); // Remove oldest anyway if all are favorites (rare)
            }
        }

        localStorage.setItem('thumbnailHistory', JSON.stringify(STATE.history));
        updateHistoryUI();
    }

    function toggleFavorite(id) {
        const item = STATE.history.find(i => i.id === id);
        if (item) {
            item.isFavorite = !item.isFavorite;
            localStorage.setItem('thumbnailHistory', JSON.stringify(STATE.history));
            updateHistoryUI();
        }
    }

    // Filter Tabs
    if (els.filterAll && els.filterFavorites) {
        els.filterAll.addEventListener('click', () => {
            STATE.filterMode = 'all';
            els.filterAll.classList.add('active');
            els.filterFavorites.classList.remove('active');
            updateHistoryUI();
        });

        els.filterFavorites.addEventListener('click', () => {
            STATE.filterMode = 'favorites';
            els.filterFavorites.classList.add('active');
            els.filterAll.classList.remove('active');
            updateHistoryUI();
        });
    }

    // Modal Functions
    function showImageModal(imageUrl) {
        const modal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');

        modalImage.src = imageUrl;
        modal.style.display = 'flex';
    }

    function closeImageModal() {
        const modal = document.getElementById('imageModal');
        modal.style.display = 'none';
    }

    // Close modal when clicked
    const imageModal = document.getElementById('imageModal');
    if (imageModal) {
        imageModal.addEventListener('click', closeImageModal);
    }

    // 3. Toast Notification
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        els.toastContainer.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // 4. Magic Prompt Logic
    if (els.enhanceBtn) {
        els.enhanceBtn.addEventListener('click', async () => {
            const prompt = els.prompt.value.trim();
            if (!prompt) return;

            // Loading State
            els.enhanceBtn.classList.add('loading');
            els.enhanceBtn.disabled = true;
            const originalText = els.enhanceBtn.querySelector('span').textContent;
            els.enhanceBtn.innerHTML = `<div class="spinner"></div>`;

            try {
                const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent("Enhance this image prompt to be highly detailed, professional, and descriptive. Keep it under 50 words. Input: " + prompt)}?model=openai`);

                if (response.ok) {
                    const enhancedText = await response.text();
                    els.prompt.value = enhancedText;
                    showToast("Prompt enhanced!", "success");
                } else {
                    throw new Error("Enhancement failed");
                }
            } catch (error) {
                console.error(error);
                showToast("Failed to enhance prompt", "error");
            } finally {
                // Reset Button
                els.enhanceBtn.classList.remove('loading');
                els.enhanceBtn.disabled = false;
                els.enhanceBtn.innerHTML = `<span>${originalText}</span>`;
            }
        });
    }

    // 5. Image Generation Logic
    els.form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Prevent multiple clicks
        if (STATE.isGenerating) return;

        const prompt = els.prompt.value.trim();
        const style = els.style.value;

        if (!prompt) return;

        // Reset UI
        els.welcomeState.style.display = 'none';
        els.imageCanvas.style.display = 'none';
        els.actions.style.display = 'none';
        els.loadingState.style.display = 'flex';
        els.generateBtn.disabled = true;

        STATE.isGenerating = true;
        STATE.abortController = new AbortController();

        try {
            let processingPrompt = prompt;

            // Check if prompt contains Arabic characters
            const isArabic = /[\u0600-\u06FF]/.test(prompt);

            if (isArabic) {
                // Update loading text to indicate optimization
                const originalLoadingText = document.getElementById('loadingText').textContent;
                document.getElementById('loadingText').textContent = currentLang === 'ar' ? "جاري تحسين الوصف..." : "Optimizing prompt...";

                try {
                    // Create a promise for the translation request
                    const translationPromise = fetch(`https://text.pollinations.ai/${encodeURIComponent("Translate to English for Image Gen. Output ONLY the prompt. Input: " + prompt)}?model=openai`, {
                        signal: STATE.abortController.signal
                    });

                    // Create a promise for the timeout (1.5 seconds)
                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error("Translation timeout")), 1500)
                    );

                    // Race them!
                    const response = await Promise.race([translationPromise, timeoutPromise]);

                    if (response.ok) {
                        processingPrompt = await response.text();
                    }
                } catch (err) {
                    if (err.name === 'AbortError') throw err;
                    console.warn("Translation skipped/failed (using original):", err);
                    // Fallback is already set to 'prompt'
                }

                // Restore loading text
                document.getElementById('loadingText').textContent = originalLoadingText;
            }

            // Progressive Loading Stage 2: Designing composition
            setTimeout(() => {
                if (STATE.isGenerating) {
                    document.getElementById('loadingText').textContent = translations[currentLang].loadingStage2;
                }
            }, 2000);

            // Progressive Loading Stage 3: Rendering
            setTimeout(() => {
                if (STATE.isGenerating) {
                    document.getElementById('loadingText').textContent = translations[currentLang].loadingStage3;
                }
            }, 5000);

            const fullPrompt = constructYouTubeThumbnailPrompt(processingPrompt, style);
            const encodedPrompt = encodeURIComponent(fullPrompt);
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&nologo=true&model=flux-schnell&seed=${Math.floor(Math.random() * 10000)}`;

            // Fetch image with retry logic
            const blob = await fetchImageWithRetry(imageUrl, CONFIG.maxRetries, STATE.abortController.signal);
            const objectUrl = URL.createObjectURL(blob);

            // Success
            els.imageCanvas.src = objectUrl;
            els.loadingState.style.display = 'none';
            els.imageCanvas.style.display = 'block';
            els.actions.style.display = 'block';
            els.generateBtn.disabled = false;

            addToHistory(objectUrl, prompt, style);
            drawOverlay();
            showToast(translations[currentLang].toastSuccess, 'success');

        } catch (error) {
            console.error(error);
            els.loadingState.style.display = 'none';
            els.generateBtn.disabled = false;

            if (error.name === 'AbortError') {
                showToast(translations[currentLang].toastCancel, 'info');
                // Restore welcome state if cancelled and no previous image
                if (!els.imageCanvas.src || els.imageCanvas.src === '') {
                    els.welcomeState.style.display = 'flex';
                } else {
                    els.imageCanvas.style.display = 'block';
                    els.actions.style.display = 'block';
                }
            } else if (error.message === 'Timeout') {
                showToast(translations[currentLang].toastTimeout, 'error');
                els.welcomeState.style.display = 'flex';
            } else {
                showToast(translations[currentLang].toastError, 'error');
                els.welcomeState.style.display = 'flex';
            }
        } finally {
            STATE.isGenerating = false;
            STATE.abortController = null;
        }
    });

    // Cancel Button Logic
    if (els.cancelBtn) {
        els.cancelBtn.addEventListener('click', () => {
            if (STATE.abortController) {
                STATE.abortController.abort();
            }
        });
    }

    async function fetchImageWithRetry(url, retries, signal) {
        for (let i = 0; i < retries; i++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);

                // Combine signals
                const combinedSignal = anySignal([signal, controller.signal]);

                const response = await fetch(url, { signal: combinedSignal });
                clearTimeout(timeoutId);

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return await response.blob();

            } catch (err) {
                if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
                if (i === retries - 1) throw err; // Throw on last retry
                console.warn(`Attempt ${i + 1} failed, retrying...`);
                await new Promise(r => setTimeout(r, 1000)); // Wait 1s before retry
            }
        }
    }

    // Helper to combine abort signals
    function anySignal(signals) {
        const controller = new AbortController();
        function onAbort() {
            controller.abort();
            for (const signal of signals) {
                signal.removeEventListener('abort', onAbort);
            }
        }
        for (const signal of signals) {
            if (signal.aborted) {
                onAbort();
                break;
            }
            signal.addEventListener('abort', onAbort);
        }
        return controller.signal;
    }

    function constructPrompt(userDesc, styleKey) {
        const stylePrompt = STYLES[styleKey] || '';
        const negativePrompts = "text, letters, typography, watermark, signature, writing, low quality, blurry, pixelated, deformed, bad anatomy, ugly, distorted";
        return `${userDesc}, ${stylePrompt}, professional lighting, 8k resolution, perfect composition, masterpiece, sharp focus, clean background, negative space for text, avoid: ${negativePrompts}`;
    }

    // 6. Text Overlay Logic
    function drawOverlay() {
        if (!els.imageCanvas.src || els.imageCanvas.style.display === 'none') return;

        const text = els.overlayText.value;
        const stroke = els.strokeColor ? els.strokeColor.value : '#000000'; // Safety check

        let previewOverlay = document.getElementById('previewOverlay');
        if (!previewOverlay) {
            previewOverlay = document.createElement('div');
            previewOverlay.id = 'previewOverlay';
            previewOverlay.style.position = 'absolute';
            previewOverlay.style.top = '50%';
            previewOverlay.style.left = '50%';
            previewOverlay.style.transform = 'translate(-50%, -50%)';
            previewOverlay.style.pointerEvents = 'none';
            previewOverlay.style.textAlign = 'center';
            // Use CSS text-stroke for preview
            previewOverlay.style.fontWeight = '900';
            previewOverlay.style.width = '90%';
            els.imageCanvas.parentElement.appendChild(previewOverlay);
        }

        previewOverlay.textContent = text;
        previewOverlay.style.color = els.textColor.value;
        previewOverlay.style.fontFamily = els.fontFamily.value;
        previewOverlay.style.fontSize = (parseInt(els.textSize.value) / 2) + 'px';
        // Apply Stroke to Preview
        previewOverlay.style.webkitTextStroke = `2px ${stroke}`;
        // Enhanced Shadow for "Professional" look
        previewOverlay.style.textShadow = `
            3px 3px 0px ${stroke},
            -1px -1px 0 ${stroke},  
            1px -1px 0 ${stroke},
            -1px 1px 0 ${stroke},
            1px 1px 0 ${stroke},
            5px 5px 10px rgba(0,0,0,0.5)
        `;
    }

    // Attach listeners if elements exist
    if (els.overlayText) els.overlayText.addEventListener('input', drawOverlay);
    if (els.textColor) els.textColor.addEventListener('input', drawOverlay);
    if (els.strokeColor) els.strokeColor.addEventListener('input', drawOverlay);
    if (els.fontFamily) els.fontFamily.addEventListener('input', drawOverlay);
    if (els.textSize) els.textSize.addEventListener('input', drawOverlay);

    // 7. Download Logic
    els.downloadBtn.addEventListener('click', () => {
        if (!els.imageCanvas.src) return;

        try {
            const canvas = els.finalCanvas;
            const ctx = canvas.getContext('2d');
            const img = els.imageCanvas;

            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            ctx.drawImage(img, 0, 0);

            const text = els.overlayText.value;
            if (text) {
                const fontSize = parseInt(els.textSize.value);
                const fontFamily = els.fontFamily.value;
                // Use selected font
                ctx.font = `900 ${fontSize}px ${fontFamily.split(',')[0].replace(/'/g, "")}`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Fix for Arabic Text Rendering (RTL)
                const isArabic = /[\u0600-\u06FF]/.test(text);
                if (isArabic) {
                    ctx.direction = 'rtl';
                } else {
                    ctx.direction = 'ltr';
                }

                // Stroke (Outline) - Enhanced for HD
                ctx.lineWidth = 8;
                ctx.strokeStyle = els.strokeColor ? els.strokeColor.value : '#000000';
                ctx.lineJoin = 'round';
                ctx.miterLimit = 2;
                ctx.strokeText(text, canvas.width / 2, canvas.height / 2);

                // Fill (Text)
                ctx.fillStyle = els.textColor.value;
                // Add shadow to canvas text
                ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
                ctx.shadowBlur = 15;
                ctx.shadowOffsetX = 5;
                ctx.shadowOffsetY = 5;

                // Fill (Text)
                ctx.fillText(text, canvas.width / 2, canvas.height / 2);
            }

            // Convert Canvas to Blob for robust download
            canvas.toBlob((blob) => {
                if (!blob) {
                    console.error("Blob creation failed");
                    showDownloadFallback();
                    return;
                }

                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `thumbnail-${Date.now()}.png`;
                link.href = url;

                // Fix for mobile/Firefox: Append to body
                document.body.appendChild(link);

                try {
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);

                    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                    if (isMobile) {
                        showDownloadFallback(true); // Show "Done" or "Long press"
                    }

                } catch (err) {
                    console.error("Download click failed:", err);
                    showDownloadFallback();
                }
            }, 'image/png');

        } catch (err) {
            console.error("Canvas export failed:", err);
            showDownloadFallback();
        }
    });

    function showDownloadFallback(isSuccessHint = false) {
        const modal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        const modalInstruction = document.getElementById('modalInstruction');

        // Use the high-res canvas if available, otherwise the preview
        const finalCanvas = document.getElementById('finalCanvas');
        if (finalCanvas && finalCanvas.width > 0) {
            modalImage.src = finalCanvas.toDataURL('image/png');
        } else {
            modalImage.src = els.imageCanvas.src;
        }

        modal.style.display = 'flex';
        modalInstruction.style.display = 'block';

        if (isSuccessHint) {
            modalInstruction.textContent = currentLang === 'ar' ? "تم التحميل! إذا لم تجد الصورة، اضغط مطولاً لحفظها." : "Downloaded! If not found, long press to save.";
            modalInstruction.style.background = "rgba(16, 185, 129, 0.8)"; // Greenish
        } else {
            modalInstruction.textContent = currentLang === 'ar' ? "اضغط مطولاً على الصورة لحفظها" : "Long press image to save";
            modalInstruction.style.background = "rgba(0, 0, 0, 0.7)";
        }
    }

    applyLanguage(currentLang);
});
