// Theme Builder Elements
        const themeToggleBtn = document.getElementById('themeToggle');
        const html = document.documentElement;
        const icon = themeToggleBtn.querySelector('i');
        const sidebarPanel = document.getElementById('sidebarPanel');
        const sidebarBackdrop = document.getElementById('sidebarBackdrop');
        const openSidebarBtn = document.getElementById('openSidebarBtn');
        const bgInput = document.getElementById('bgInput');
        const bgFileName = document.getElementById('bgFileName');
        const previewBg = document.getElementById('previewBg');
        const logoInput = document.getElementById('logoInput');
        const logoFileName = document.getElementById('logoFileName');
        const previewLogo = document.getElementById('previewLogo');
        const logoSizeInput = document.getElementById('logoSizeInput');
        const logoSizeDisplay = document.getElementById('logoSizeDisplay');
        const btnToggleLogo = document.getElementById('btnToggleLogo'); 
        const themeTextInput = document.getElementById('themeTextInput');
        const neonTextContainer = document.getElementById('neonTextContainer');
        const fontSizeInput = document.getElementById('fontSizeInput');
        const fontSizeDisplay = document.getElementById('fontSizeDisplay');
        const btnToggleText = document.getElementById('btnToggleText');
        const btnPosTop = document.getElementById('btnPosTop');
        const btnPosCenter = document.getElementById('btnPosCenter');
        const btnPosBottom = document.getElementById('btnPosBottom');
        const textOffsetInput = document.getElementById('textOffsetInput');
        const textOffsetDisplay = document.getElementById('textOffsetDisplay');
        const btnStrokeMixed = document.getElementById('btnStrokeMixed');
        const btnStrokeBlue = document.getElementById('btnStrokeBlue');
        const btnStrokeYellow = document.getElementById('btnStrokeYellow');
        const captureArea = document.getElementById('captureArea');
        const contentWrapper = document.getElementById('contentWrapper');
        const btnRatio169 = document.getElementById('btnRatio169');
        const btnRatio916 = document.getElementById('btnRatio916');

        let wordColorsState = [true, false, true]; 
        let currentStrokeMode = 'mixed'; 
        let currentTextPosition = 'center';
        let currentTextOffsetY = 0;
        let currentAspectRatio = '16:9';
        
        let pages = [];
        let currentPageId = 0;
        let pageCounter = 1;

        function getDefaultState() {
            return {
                bgImage: "url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')",
                bgName: 'Clique ou arraste a imagem',
                logoSrc: "https://cdn-icons-png.flaticon.com/512/3670/3670151.png",
                logoName: 'Upload Logo (Transparente)',
                logoSize: 128,
                logoVisible: true,
                textValue: "TEMA\nDA LIVE",
                textSize: 72,
                textVisible: true, 
                textPosition: 'center',
                textOffsetY: 0,
                aspectRatio: '16:9',
                wordColors: [true, false, true],
                strokeMode: 'mixed'
            };
        }

        function addNewPage() {
            savePage(currentPageId);
            pageCounter++;
            const newPage = { id: pageCounter, name: `Novo Tema ${pageCounter}`, state: getDefaultState() };
            pages.push(newPage);
            currentPageId = newPage.id;
            loadStateToDOM(newPage.state);
            renderPageNavigation();
            bgInput.value = ''; logoInput.value = '';
        }

        function savePage(id) {
            const pageIndex = pages.findIndex(p => p.id === id);
            if (pageIndex !== -1) pages[pageIndex].state = captureCurrentState();
        }

        function switchPage(id) {
            if (id === currentPageId) return;
            savePage(currentPageId);
            const page = pages.find(p => p.id === id);
            if (page) { currentPageId = id; loadStateToDOM(page.state); renderPageNavigation(); }
        }

        function renderPageNavigation() {
            const container = document.getElementById('pageNavigation');
            container.innerHTML = '';
            if (pages.length <= 1) { container.style.display = 'none'; return; } 
            else { container.style.display = 'block'; }
            const label = document.createElement('div');
            label.className = "text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1";
            label.textContent = "Navegar entre Temas";
            container.appendChild(label);
            pages.forEach(page => {
                const isActive = page.id === currentPageId;
                const btn = document.createElement('button');
                btn.onclick = () => switchPage(page.id);
                const baseClass = "w-full text-left px-3 py-2 rounded-md text-xs font-medium transition-all flex justify-between items-center group ";
                const activeClass = "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-sm";
                const inactiveClass = "text-slate-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 border border-transparent";
                btn.className = baseClass + (isActive ? activeClass : inactiveClass);
                const spanName = document.createElement('span');
                spanName.textContent = page.name;
                const indicator = document.createElement('i');
                indicator.className = isActive ? "fas fa-circle text-[6px] text-blue-500 animate-pulse" : "fas fa-chevron-right text-[8px] opacity-0 group-hover:opacity-100 transition-opacity";
                btn.appendChild(spanName); btn.appendChild(indicator);
                container.appendChild(btn);
            });
        }

        function initPages() {
            const initialPage = { id: 1, name: "Tema Principal", state: getDefaultState() };
            pages.push(initialPage);
            currentPageId = 1;
            renderPageNavigation();
            loadStateToDOM(initialPage.state);
        }

        function captureCurrentState() {
            return {
                bgImage: previewBg.style.backgroundImage,
                bgName: bgFileName.textContent,
                logoSrc: previewLogo.src,
                logoName: logoFileName.textContent,
                logoSize: logoSizeInput.value,
                logoVisible: previewLogo.style.display !== 'none',
                textValue: themeTextInput.value,
                textSize: fontSizeInput.value,
                textVisible: neonTextContainer.style.display !== 'none', 
                textPosition: currentTextPosition,
                textOffsetY: currentTextOffsetY,
                aspectRatio: currentAspectRatio,
                wordColors: [...wordColorsState], 
                strokeMode: currentStrokeMode
            };
        }

        function loadStateToDOM(state) {
            previewBg.style.backgroundImage = state.bgImage;
            bgFileName.textContent = state.bgName;
            previewLogo.src = state.logoSrc;
            logoFileName.textContent = state.logoName;
            logoSizeInput.value = state.logoSize;
            previewLogo.style.height = `${state.logoSize}px`;
            logoSizeDisplay.textContent = `${state.logoSize}px`;
            previewLogo.style.display = state.logoVisible ? 'block' : 'none';
            const iconLogo = btnToggleLogo.querySelector('i');
            iconLogo.className = state.logoVisible ? 'fas fa-eye' : 'fas fa-eye-slash';
            themeTextInput.value = state.textValue;
            fontSizeInput.value = state.textSize;
            neonTextContainer.style.fontSize = `${state.textSize}px`;
            fontSizeDisplay.textContent = `${state.textSize}px`;
            const isTextVisible = state.textVisible !== undefined ? state.textVisible : true;
            neonTextContainer.style.display = isTextVisible ? 'block' : 'none';
            const iconText = btnToggleText.querySelector('i');
            iconText.className = isTextVisible ? 'fas fa-eye' : 'fas fa-eye-slash';
            wordColorsState = [...state.wordColors];
            setStrokeMode(state.strokeMode);
            setTextPosition(state.textPosition || 'center');
            setTextOffsetY(state.textOffsetY || 0, false);
            setAspectRatio(state.aspectRatio || '16:9');
            renderText();
        }

        function setTextPosition(pos) {
            currentTextPosition = pos;
            const wrapper = document.getElementById('contentWrapper');
            wrapper.classList.remove('justify-center', 'justify-start', 'justify-end', 'pt-24', 'pb-24');
            if (pos === 'center') wrapper.classList.add('justify-center');
            else if (pos === 'top') wrapper.classList.add('justify-start', 'pt-24');
            else if (pos === 'bottom') wrapper.classList.add('justify-end', 'pb-24');
            updatePositionButtonsUI();
            savePage(currentPageId);
        }

        function updateTextOffsetUI() {
            textOffsetInput.value = currentTextOffsetY;
            textOffsetDisplay.textContent = `${currentTextOffsetY}px`;
            contentWrapper.style.setProperty('--content-offset-y', `${currentTextOffsetY}px`);
        }

        function setTextOffsetY(value, shouldSave = true) {
            currentTextOffsetY = parseInt(value, 10) || 0;
            updateTextOffsetUI();
            if (shouldSave) savePage(currentPageId);
        }

        function setAspectRatio(ratio) {
            currentAspectRatio = ratio;
            captureArea.classList.remove('aspect-video', 'aspect-[9/16]', 'max-w-5xl', 'max-w-sm', 'h-full', 'max-h-[85vh]');
            if (ratio === '16:9') {
                captureArea.classList.add('aspect-video', 'max-w-5xl', 'w-full');
                btnRatio169.className = "px-2 py-1 text-[10px] font-bold rounded-md bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-white transition-all";
                btnRatio916.className = "px-2 py-1 text-[10px] font-bold rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-700 transition-all";
            } else {
                captureArea.classList.add('aspect-[9/16]', 'h-full', 'max-h-[85vh]', 'max-w-sm'); 
                btnRatio916.className = "px-2 py-1 text-[10px] font-bold rounded-md bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-white transition-all";
                btnRatio169.className = "px-2 py-1 text-[10px] font-bold rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-700 transition-all";
            }
            savePage(currentPageId);
        }

        function updatePositionButtonsUI() {
            [btnPosTop, btnPosCenter, btnPosBottom].forEach(btn => btn.className = 'flex-1 py-2 rounded-md transition-all text-slate-500 hover:bg-white/50 dark:hover:bg-slate-600/50');
            const activeClass = 'flex-1 py-2 rounded-md transition-all shadow-sm bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500 text-blue-500 font-bold';
            if (currentTextPosition === 'top') btnPosTop.className = activeClass;
            else if (currentTextPosition === 'center') btnPosCenter.className = activeClass;
            else if (currentTextPosition === 'bottom') btnPosBottom.className = activeClass;
        }

        function setStrokeMode(mode) {
            currentStrokeMode = mode;
            neonTextContainer.classList.remove('force-stroke-blue', 'force-stroke-yellow');
            if (mode === 'blue') neonTextContainer.classList.add('force-stroke-blue');
            else if (mode === 'yellow') neonTextContainer.classList.add('force-stroke-yellow');
            updateStrokeButtonsUI();
            savePage(currentPageId);
        }

        function updateStrokeButtonsUI() {
            [btnStrokeMixed, btnStrokeBlue, btnStrokeYellow].forEach(btn => btn.className = 'flex-1 py-2 rounded-md text-xs font-bold transition-all text-slate-500 hover:bg-white/50 dark:hover:bg-slate-600/50');
            const activeClass = 'flex-1 py-2 rounded-md text-xs font-bold transition-all shadow-sm bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500';
            if (currentStrokeMode === 'mixed') btnStrokeMixed.className = activeClass;
            else if (currentStrokeMode === 'blue') btnStrokeBlue.className = activeClass + ' text-cyan-500';
            else if (currentStrokeMode === 'yellow') btnStrokeYellow.className = activeClass + ' text-yellow-500';
        }

        function renderText() {
            if (!themeTextInput.value && document.activeElement !== themeTextInput) themeTextInput.value = "TEMA\nDA LIVE";
            const rawText = themeTextInput.value;
            const allWords = rawText.replace(/\n/g, ' ').split(' ').filter(w => w.length > 0);
            if (allWords.length !== wordColorsState.length) {
                wordColorsState = allWords.map((_, i) => wordColorsState[i] !== undefined ? wordColorsState[i] : true);
            }
            neonTextContainer.innerHTML = '';
            let globalWordIndex = 0;
            const lines = rawText.split('\n');
            lines.forEach((line, lineIndex) => {
                const wordsInLine = line.split(' ').filter(w => w.length > 0);
                if (wordsInLine.length > 0) {
                    wordsInLine.forEach((word) => {
                        const currentIndex = globalWordIndex;
                        const span = document.createElement('span');
                        span.textContent = word + ' '; 
                        span.classList.add('interactive-word');
                        if (wordColorsState[currentIndex]) span.classList.add('text-neon-blue');
                        else span.classList.add('text-neon-yellow');
                        span.addEventListener('click', () => {
                            wordColorsState[currentIndex] = !wordColorsState[currentIndex];
                            if (wordColorsState[currentIndex]) {
                                span.classList.remove('text-neon-yellow'); span.classList.add('text-neon-blue');
                            } else {
                                span.classList.remove('text-neon-blue'); span.classList.add('text-neon-yellow');
                            }
                            savePage(currentPageId);
                        });
                        neonTextContainer.appendChild(span);
                        globalWordIndex++;
                    });
                } 
                if (lineIndex < lines.length - 1) neonTextContainer.appendChild(document.createElement('br'));
            });
        }

        function updateButtonVisibility() {
            const isMobile = window.innerWidth < 768;
            const isDesktopClosed = sidebarPanel.classList.contains('md:w-0');
            const isMobileClosed = sidebarPanel.classList.contains('-translate-x-full');
            if (isMobile) {
                if (isMobileClosed) { openSidebarBtn.classList.remove('scale-0', 'opacity-0'); openSidebarBtn.classList.add('scale-100', 'opacity-100'); }
                else { openSidebarBtn.classList.remove('scale-100', 'opacity-100'); openSidebarBtn.classList.add('scale-0', 'opacity-0'); }
            } else {
                if (isDesktopClosed) { openSidebarBtn.classList.remove('md:scale-0', 'md:opacity-0', 'scale-0', 'opacity-0'); openSidebarBtn.classList.add('md:scale-100', 'md:opacity-100', 'scale-100', 'opacity-100'); }
                else { openSidebarBtn.classList.remove('md:scale-100', 'md:opacity-100', 'scale-100', 'opacity-100'); openSidebarBtn.classList.add('md:scale-0', 'md:opacity-0', 'scale-0', 'opacity-0'); }
            }
        }

        textOffsetInput.addEventListener('input', (e) => setTextOffsetY(e.target.value, false));
        textOffsetInput.addEventListener('change', (e) => setTextOffsetY(e.target.value, true));

        function toggleSidebar() {
            const isMobile = window.innerWidth < 768;
            if (isMobile) {
                if (sidebarPanel.classList.contains('-translate-x-full')) { sidebarPanel.classList.remove('-translate-x-full'); sidebarBackdrop.classList.remove('hidden'); }
                else { sidebarPanel.classList.add('-translate-x-full'); sidebarBackdrop.classList.add('hidden'); }
            } else {
                if (sidebarPanel.classList.contains('md:w-0')) { sidebarPanel.classList.remove('md:w-0'); sidebarPanel.classList.add('md:w-96'); }
                else { sidebarPanel.classList.remove('md:w-96'); sidebarPanel.classList.add('md:w-0'); }
            }
            setTimeout(updateButtonVisibility, 50);
        }

        function toggleLogo() {
            const icon = btnToggleLogo.querySelector('i');
            if (previewLogo.style.display === 'none') {
                previewLogo.style.display = 'block'; icon.className = 'fas fa-eye';
            } else {
                previewLogo.style.display = 'none'; icon.className = 'fas fa-eye-slash';
            }
            savePage(currentPageId);
        }

        function toggleText() {
            const icon = btnToggleText.querySelector('i');
            if (neonTextContainer.style.display === 'none') {
                neonTextContainer.style.display = 'block'; icon.className = 'fas fa-eye';
            } else {
                neonTextContainer.style.display = 'none'; icon.className = 'fas fa-eye-slash';
            }
            savePage(currentPageId);
        }

