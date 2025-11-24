// --- Configuration & State ---
const CONFIG = {
    maxHistory: 10,
    defaultLang: 'ar'
};

const STATE = {
    currentImage: null, // Blob or URL
    currentPrompt: '',
    currentStyle: '',
    history: JSON.parse(localStorage.getItem('thumbnailHistory') || '[]')
};

// --- Translation Data ---
const translations = {
    ar: {
        panelTitle: "إعدادات الصورة",
        descLabel: "وصف الفيديو",
        promptPlaceholder: "مثال: شخص مصدوم ينظر إلى شاشة الكمبيوتر...",
        styleLabel: "النمط الفني",
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
        styles: {
            realistic: 'واقعي 📸',
            cartoon: 'كرتون 🎨',
            caricature: 'كاريكاتير 🤪',
            '3d': 'ثلاثي الأبعاد 🧊',
            anime: 'أنمي 🌸',
            gaming: 'ألعاب 🎮',
            horror: 'رعب 👻',
            tech: 'تقنية 💻'
        },
        generateBtn: "توليد الصورة",
        welcomeTitle: "مساحة العمل",
        welcomeText: "أدخل الوصف واضغط توليد لتبدأ الإبداع",
        loadingText: "جاري تصميم الصورة بالذكاء الاصطناعي...",
        downloadBtn: "تحميل الصورة (HD)",
        disclaimerText: "* سيتم حذف الرابط تلقائياً بعد 10 دقائق",
        langBtnText: "English",
        langBtnIcon: "English.png",
        historyTitle: "السجل (History)",
        emptyHistory: "لا توجد صور سابقة",
        promoText: "مجاني 100%، بدون علامة مائية، بدون تسجيل.",
        workspaceSectionTitle: "مساحة العمل",
        heroText: "أفضل مُولد مجاني للصور المصغرة لليوتيوب مدعوم بالذكاء الاصطناعي. ما عليك سوى وصف الفيديو الخاص بك، وسيقوم محركنا الذكي فوراً بإنشاء صورة مصغرة مذهلة وعالية الجودة (1280×720)، مُحسنة لزيادة النقرات وتفاعل المشاهدين، وجاهزة للتحميل في ثوانٍ."
    },
    en: {
        panelTitle: "Image Settings",
        descLabel: "Video Description",
        promptPlaceholder: "Ex: Shocked person looking at computer screen...",
        styleLabel: "Art Style",
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
        styles: {
            realistic: 'Realistic 📸',
            cartoon: 'Cartoon 🎨',
            caricature: 'Caricature 🤪',
            '3d': '3D Render 🧊',
            anime: 'Anime 🌸',
            gaming: 'Gaming 🎮',
            horror: 'Horror 👻',
            tech: 'Tech 💻'
        },
        generateBtn: "Generate Image",
        welcomeTitle: "Workspace",
        welcomeText: "Enter description and click generate to start",
        loadingText: "AI is designing your image...",
        downloadBtn: "Download Image (HD)",
        disclaimerText: "* Link will be removed automatically after 10 minutes",
        langBtnText: "العربية",
        langBtnIcon: "العربية.png",
        historyTitle: "History",
        emptyHistory: "No previous images",
        promoText: "100% free, no watermark, no registration.",
        workspaceSectionTitle: "Workspace",
        heroText: "The ultimate free AI-powered YouTube thumbnail generator. Simply describe your video, and our intelligent engine will instantly produce a stunning, high-quality thumbnail (1280×720) optimized for clicks and viewer engagement ready to download in seconds."
    }
};

// --- Style Prompts ---
const STYLES = {
    realistic: 'ultra realistic, professional photography, cinematic studio lighting, sharp focus, detailed skin texture, realistic eyes, natural skin tones, 8K, DSLR quality, high detail, canon ef 50mm f/1.4 look',
    cartoon: 'bold cartoon style, thick outlines, vibrant saturated colors, playful composition, Pixar/Disney inspired, expressive characters, simplified shapes, high contrast',
    caricature: 'exaggerated caricature portrait, strong facial features, playful exaggeration, high character expression, bold linework, stylized proportions, vibrant palette, editorial illustration',
    '3d': 'photorealistic 3D render, octane render, unreal engine 5, ray tracing reflections, PBR materials, volumetric lighting, cinematic camera, hyper realistic 3D',
    anime: 'anime art style, vibrant colors, clean linework, cel shading, studio quality animation, highly detailed character, dramatic rim lighting',
    gaming: 'youtube gaming thumbnail style, intense action, neon lighting, esports atmosphere, dynamic angle, glowing effects, high contrast, 4k, fortnite/cod style vibes',
    horror: 'horror theme, dark atmosphere, spooky lighting, fog, mysterious, scary, cinematic horror movie look, high detail, shadow play',
    tech: 'tech review style, clean modern desk setup, gadgets, bokeh background, bright studio lighting, mkbhd style, crisp details, futuristic vibes'
};

const NEGATIVE_DEFAULTS = 'low quality, blurry, pixelated, deformed, watermark, text overlay, signature, bad anatomy, ugly, distorted';

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
        historyList: document.getElementById('historyList')
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
            if (t.styles[opt.value]) opt.textContent = t.styles[opt.value];
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
        if (STATE.history.length === 0) {
            els.historyList.innerHTML = `<div class="placeholder-state" style="font-size: 0.8rem; padding: 20px;">${translations[currentLang].emptyHistory}</div>`;
            return;
        }

        // Show only the last 5 images
        const recentHistory = STATE.history.slice(-5).reverse(); // Get last 5 and reverse for newest first

        recentHistory.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <img src="${item.url}" class="history-thumb" alt="thumb">
                <div class="history-info">
                    <div class="history-prompt">${item.prompt}</div>
                    <div class="history-date">${new Date(item.date).toLocaleTimeString()}</div>
                </div>
            `;
            // Show image in modal instead of restoring to workspace
            div.onclick = () => showImageModal(item.url);
            els.historyList.appendChild(div);
        });
    }

    function addToHistory(url, prompt, style) {
        const newItem = {
            url: url,
            prompt: prompt,
            style: style,
            date: Date.now()
        };
        STATE.history.push(newItem);
        if (STATE.history.length > CONFIG.maxHistory) STATE.history.shift();
        localStorage.setItem('thumbnailHistory', JSON.stringify(STATE.history));
        updateHistoryUI();
    }

    function restoreFromHistory(item) {
        els.imageCanvas.crossOrigin = "Anonymous";
        els.imageCanvas.src = item.url;
        els.imageCanvas.style.display = 'block';
        els.welcomeState.style.display = 'none';
        els.actions.style.display = 'block';
        els.prompt.value = item.prompt;
        els.style.value = item.style;

        els.overlayText.value = '';
        drawOverlay();
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

    // 3. Image Generation
    els.form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const prompt = els.prompt.value.trim();
        const style = els.style.value;

        if (!prompt) return;

        els.welcomeState.style.display = 'none';
        els.imageCanvas.style.display = 'none';
        els.actions.style.display = 'none';
        els.loadingState.style.display = 'flex';
        els.generateBtn.disabled = true;

        try {
            let processingPrompt = prompt;

            // Check if prompt contains Arabic characters
            const isArabic = /[\u0600-\u06FF]/.test(prompt);

            if (isArabic) {
                // Update loading text to indicate optimization
                const originalLoadingText = document.getElementById('loadingText').textContent;
                document.getElementById('loadingText').textContent = currentLang === 'ar' ? "جاري تحسين الوصف..." : "Optimizing prompt...";

                try {
                    // Use Gemini model for ultra-fast translation
                    const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent("You are an expert Prompt Engineer for Flux.1 AI. Your goal is to generate a prompt that creates a YouTube thumbnail with PERFECT text rendering.\n\nINPUT: " + prompt + "\n\nINSTRUCTIONS:\n1. Analyze the input for any specific text requests (e.g., 'written text', 'title', 'sign').\n2. If text is found, you MUST describe it as: \"Huge bold text reading 'TEXT' in [Font Style] font at [Position]\"\n3. Force the model to focus on text by putting the text description AT THE VERY START of the prompt.\n4. Use keywords: 'typographic design', 'render text', 'crisp', 'vector style'.\n5. If no text is requested, focus on 'hyper-detailed', '8k', 'cinematic lighting'.\n\nOUTPUT FORMAT (English Only):\n[TEXT DESCRIPTION] :: [SUBJECT DESCRIPTION] :: [STYLE & LIGHTING]\n\nExample Output:\nHuge 3D gold text reading 'WINNER' in center :: shocked gamer face holding a trophy :: cyberpunk neon lighting, 8k, detailed\n\nGENERATE PROMPT NOW:")}?model=gemini`);
                    if (response.ok) {
                        processingPrompt = await response.text();
                    }
                } catch (err) {
                    console.warn("Translation failed, using original prompt", err);
                }

                // Restore loading text
                document.getElementById('loadingText').textContent = originalLoadingText;
            }

            const fullPrompt = constructPrompt(processingPrompt, style);
            const encodedPrompt = encodeURIComponent(fullPrompt);
            // Use Flux model for best quality/speed balance
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&nologo=true&model=flux&seed=${Math.floor(Math.random() * 10000)}`;

            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => {
                els.imageCanvas.crossOrigin = "Anonymous";
                els.imageCanvas.src = imageUrl;

                els.loadingState.style.display = 'none';
                els.imageCanvas.style.display = 'block';
                els.actions.style.display = 'block';
                els.generateBtn.disabled = false;

                addToHistory(imageUrl, prompt, style);
                drawOverlay();
            };
            img.onerror = () => { throw new Error("Load failed"); };
            img.src = imageUrl;

        } catch (error) {
            console.error(error);
            els.loadingState.style.display = 'none';
            els.generateBtn.disabled = false;
            // Show error in welcome state or a toast (simplified for now)
            alert("Error generating image. Please try again."); // Keeping alert for now but could be improved
        }
    });

    function constructPrompt(userDesc, styleKey) {
        const stylePrompt = STYLES[styleKey] || '';
        // userDesc now comes from the "Flux Expert" prompt which puts text first.
        return `${userDesc}, ${stylePrompt}, professional lighting, 8k resolution, perfect composition, masterpiece, sharp focus, accurate text, correct spelling, avoid: ${NEGATIVE_DEFAULTS}`;
    }

    // 4. Text Overlay Logic
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

    // 5. Download Logic
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

                // Stroke (Outline) - Enhanced for HD
                ctx.lineWidth = 8;
                ctx.strokeStyle = els.strokeColor ? els.strokeColor.value : '#000000';
                ctx.lineJoin = 'round';
                ctx.miterLimit = 2;
                ctx.strokeText(text, canvas.width / 2, canvas.height / 2);

                // Second Stroke for depth (optional, simulated by shadow in fill)

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

            const link = document.createElement('a');
            link.download = `thumbnail-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');

            // Fix for mobile/Firefox: Append to body
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (err) {
            console.error("Canvas export failed:", err);
            // Mobile Fallback: Show image in modal
            showImageModal(els.imageCanvas.src);
            alert(currentLang === 'ar' ? "اضغط مطولاً على الصورة لحفظها" : "Long press image to save");
        }
    });

    applyLanguage(currentLang);
});
