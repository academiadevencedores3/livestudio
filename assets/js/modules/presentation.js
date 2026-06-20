// Presentation Logic
        const presUpload = document.getElementById('presentationUpload');
        const slideWrapper = document.getElementById('slideWrapper');
        const currentSlideImg = document.getElementById('currentSlideImg');
        const currentSlideVideo = document.getElementById('currentSlideVideo'); // NOVO ELEMENTO
        const emptyStatePres = document.getElementById('emptyStatePres');
        const slideCounter = document.getElementById('slideCounter');
        const canvas = document.getElementById('drawingCanvas');
        const ctx = canvas.getContext('2d');
        const btnPrevSlide = document.getElementById('btnPrevSlide');
        const btnNextSlide = document.getElementById('btnNextSlide');
        const presentationStage = document.getElementById('presentationStage');
        const magnifierLens = document.getElementById('magnifierLens');
        const magnifierCanvas = document.getElementById('magnifierCanvas');
        const magnifierCtx = magnifierCanvas.getContext('2d');
        const magnifierPlaceholder = document.getElementById('magnifierPlaceholder');
        const magnifierFocusIndicator = document.getElementById('magnifierFocusIndicator');
        const magnifierPanelBody = document.getElementById('magnifierPanelBody');
        const btnMagnifier = document.getElementById('btnMagnifier');
        const zoomDisplayBtn = document.getElementById('zoomDisplayBtn');
        const magnifierZoomBtn = document.getElementById('magnifierZoomBtn');
        const magnifierZoomLabel = document.getElementById('magnifierZoomLabel');
        const videoControls = document.getElementById('videoControls'); // NOVO CONTROLE

        // Main Slide Storage
        let presSlides = []; 
        let currentSlideIndex = 0;
        
        // Organizer Temporary Storage
        let tempUploadedSlides = [];

        // Canvas State
        const DRAWING_DEFAULT_COLOR = '#3b82f6';
        const DRAWING_DARK_REPLACEMENT = '#3b82f6';
        const DRAWING_BLACK = '#000000';

        let isDrawing = false;
        let currentTool = 'pencil'; 
        let currentColor = DRAWING_DEFAULT_COLOR;
        let currentStrokeSize = 4;
        let undoStack = []; 
        let presentationZoom = 1;
        let magnifierEnabled = false;
        let lastMagnifierPoint = null;
        let magnifierZoomLevel = 3.6;
        let isDraggingMagnifierFocus = false;
        let magnifierDragMode = null;
        let lastMagnifierDragClientPoint = null;

        const PRESENTATION_ZOOM_MIN = 1;
        const PRESENTATION_ZOOM_MAX = 1.35;
        const PRESENTATION_ZOOM_STEP = 0.05;
        const MAGNIFIER_ZOOM_MIN = 2.4;
        const MAGNIFIER_ZOOM_MAX = 5;
        const MAGNIFIER_ZOOM_STEP = 0.4;
        const PRESENTATION_SAFE_MARGIN = 16;
        const PRESENTATION_FIT_RATIO_DESKTOP = 0.88;
        const PRESENTATION_FIT_RATIO_MOBILE = 0.84;

        function clamp(value, min, max) {
            return Math.min(Math.max(value, min), max);
        }

        function getActiveSlideElement() {
            return !currentSlideVideo.classList.contains('hidden') ? currentSlideVideo : currentSlideImg;
        }

        function updatePresentationZoomUI() {
            slideWrapper.style.setProperty('--presentation-zoom', presentationZoom.toFixed(2));
            zoomDisplayBtn.textContent = `${Math.round(presentationZoom * 100)}%`;
        }

        function getDebugRunId() {
            return window.__LIVE_STUDIO_DEBUG_RUN_ID || 'pre-fix';
        }

        function getToolbarReserve() {
            const toolbar = document.getElementById('drawingToolbar');
            const toggleBtn = document.getElementById('toolbarToggleBtn');
            const toolbarVisible = !toolbar.classList.contains('pointer-events-none');
            const reserveSource = toolbarVisible ? toolbar : toggleBtn;
            return (reserveSource?.getBoundingClientRect().height || 0) + 24;
        }

        function getPresentationSafeArea() {
            const stageRect = presentationStage.getBoundingClientRect();
            const horizontalMargin = window.innerWidth < 768 ? 8 : PRESENTATION_SAFE_MARGIN;
            const topMargin = window.innerWidth < 768 ? 8 : PRESENTATION_SAFE_MARGIN;
            const bottomMargin = getToolbarReserve() + (window.innerWidth < 768 ? 8 : PRESENTATION_SAFE_MARGIN);

            return {
                stageRect,
                safeTop: stageRect.top + topMargin,
                safeLeft: stageRect.left + horizontalMargin,
                safeRight: stageRect.right - horizontalMargin,
                safeBottom: stageRect.bottom - bottomMargin,
                availableWidth: Math.max(stageRect.width - (horizontalMargin * 2), 1),
                availableHeight: Math.max(stageRect.height - topMargin - bottomMargin, 1)
            };
        }

        function updatePresentationBoundsVars() {
            const { availableWidth, availableHeight } = getPresentationSafeArea();
            const fitRatio = window.innerWidth < 768 ? PRESENTATION_FIT_RATIO_MOBILE : PRESENTATION_FIT_RATIO_DESKTOP;
            slideWrapper.style.setProperty('--presentation-safe-width', `${availableWidth}px`);
            slideWrapper.style.setProperty('--presentation-safe-height', `${availableHeight}px`);
            slideWrapper.style.setProperty('--presentation-fit-width', `${availableWidth * fitRatio}px`);
            slideWrapper.style.setProperty('--presentation-fit-height', `${availableHeight * fitRatio}px`);
        }

        function getPresentationZoomCap() {
            const activeElement = getActiveSlideElement();
            if (!activeElement || slideWrapper.classList.contains('hidden')) return PRESENTATION_ZOOM_MAX;

            updatePresentationBoundsVars();

            const baseWidth = activeElement.offsetWidth || slideWrapper.offsetWidth;
            const baseHeight = activeElement.offsetHeight || slideWrapper.offsetHeight;

            if (!baseWidth || !baseHeight) {
                return PRESENTATION_ZOOM_MAX;
            }

            const { availableWidth, availableHeight } = getPresentationSafeArea();
            const widthCap = availableWidth / baseWidth;
            const heightCap = availableHeight / baseHeight;
            const responsiveCap = window.innerWidth < 768 ? Math.min(PRESENTATION_ZOOM_MAX, 1.16) : PRESENTATION_ZOOM_MAX;

            return clamp(Math.min(responsiveCap, widthCap, heightCap), PRESENTATION_ZOOM_MIN, responsiveCap);
        }

        function adjustPresentationViewport() {
            if (slideWrapper.classList.contains('hidden')) return;

            updatePresentationBoundsVars();
            slideWrapper.style.setProperty('--presentation-shift-x', '0px');
            slideWrapper.style.setProperty('--presentation-shift-y', '0px');

            const activeElement = getActiveSlideElement();
            if (!activeElement) return;

            const focusRect = activeElement.getBoundingClientRect();
            const { safeTop, safeLeft, safeRight, safeBottom } = getPresentationSafeArea();

            let shiftX = 0;
            let shiftY = 0;

            if (focusRect.left < safeLeft) shiftX += safeLeft - focusRect.left;
            if (focusRect.right > safeRight) shiftX -= focusRect.right - safeRight;
            if (focusRect.top < safeTop) shiftY += safeTop - focusRect.top;
            if (focusRect.bottom > safeBottom) shiftY -= focusRect.bottom - safeBottom;

            slideWrapper.style.setProperty('--presentation-shift-x', `${shiftX}px`);
            slideWrapper.style.setProperty('--presentation-shift-y', `${shiftY}px`);

            if (magnifierEnabled) {
                if (lastMagnifierPoint) {
                    requestAnimationFrame(() => renderMagnifier(lastMagnifierPoint));
                } else {
                    requestAnimationFrame(syncMagnifierPanel);
                }
            }
        }

        function setPresentationZoom(nextZoom) {
            presentationZoom = clamp(nextZoom, PRESENTATION_ZOOM_MIN, getPresentationZoomCap());
            updatePresentationZoomUI();
            requestAnimationFrame(() => adjustPresentationViewport());
            if (magnifierEnabled && lastMagnifierPoint) renderMagnifier(lastMagnifierPoint);
        }

        function zoomPresentationIn() {
            setPresentationZoom(presentationZoom + PRESENTATION_ZOOM_STEP);
        }

        function zoomPresentationOut() {
            setPresentationZoom(presentationZoom - PRESENTATION_ZOOM_STEP);
        }

        function resetPresentationZoom() {
            setPresentationZoom(1);
        }

        function updateMagnifierButtonUI() {
            btnMagnifier.classList.toggle('active', magnifierEnabled);
            btnMagnifier.classList.toggle('bg-blue-600', magnifierEnabled);
            btnMagnifier.classList.toggle('text-white', magnifierEnabled);
            btnMagnifier.classList.toggle('bg-gray-100', !magnifierEnabled);
            btnMagnifier.classList.toggle('dark:bg-slate-700', !magnifierEnabled);
            btnMagnifier.classList.toggle('text-slate-600', !magnifierEnabled);
            btnMagnifier.classList.toggle('dark:text-slate-300', !magnifierEnabled);
            btnMagnifier.title = magnifierEnabled ? 'Desativar lupa' : 'Lupa';
        }

        function updateMagnifierZoomUI() {
            const zoomText = `${magnifierZoomLevel.toFixed(1)}x`;
            magnifierZoomBtn.textContent = zoomText;
            magnifierZoomLabel.textContent = zoomText;
        }

        function setMagnifierZoom(nextZoom) {
            magnifierZoomLevel = clamp(nextZoom, MAGNIFIER_ZOOM_MIN, MAGNIFIER_ZOOM_MAX);
            updateMagnifierZoomUI();
            if (magnifierEnabled && lastMagnifierPoint) renderMagnifier(lastMagnifierPoint);
        }

        function increaseMagnifierZoom() {
            setMagnifierZoom(magnifierZoomLevel + MAGNIFIER_ZOOM_STEP);
        }

        function decreaseMagnifierZoom() {
            setMagnifierZoom(magnifierZoomLevel - MAGNIFIER_ZOOM_STEP);
        }

        function hideMagnifier() {
            magnifierLens.classList.add('hidden');
            magnifierCanvas.classList.add('hidden');
            magnifierPlaceholder.classList.add('hidden');
            magnifierFocusIndicator.classList.add('hidden');
        }

        function positionMagnifierPanel(point = null) {
            const rect = canvas.getBoundingClientRect();
            if (!rect.width || !rect.height) return;

            const panelGap = window.innerWidth < 768 ? 8 : 12;
            const panelWidth = magnifierLens.offsetWidth || (window.innerWidth < 768 ? 210 : 240);
            const panelHeight = magnifierLens.offsetHeight || (window.innerWidth < 768 ? 170 : 190);

            let left = Math.max(rect.width - panelWidth - panelGap, panelGap);
            let top = panelGap;

            if (point && canvas.width && canvas.height) {
                const pointerX = (point.x / canvas.width) * rect.width;
                const pointerY = (point.y / canvas.height) * rect.height;

                left = pointerX > rect.width / 2 ? panelGap : rect.width - panelWidth - panelGap;
                top = pointerY > rect.height / 2 ? panelGap : rect.height - panelHeight - panelGap;
            }

            magnifierLens.style.left = `${clamp(left, panelGap, Math.max(rect.width - panelWidth - panelGap, panelGap))}px`;
            magnifierLens.style.top = `${clamp(top, panelGap, Math.max(rect.height - panelHeight - panelGap, panelGap))}px`;
        }

        function updateMagnifierFocusUI(point = null) {
            if (!point) {
                magnifierFocusIndicator.classList.add('hidden');
                magnifierFocusIndicator.classList.remove('is-dragging');
                return;
            }

            const rect = canvas.getBoundingClientRect();
            if (!rect.width || !rect.height || !canvas.width || !canvas.height) {
                magnifierFocusIndicator.classList.add('hidden');
                return;
            }

            const indicatorX = (point.x / canvas.width) * rect.width;
            const indicatorY = (point.y / canvas.height) * rect.height;

            magnifierFocusIndicator.style.left = `${indicatorX}px`;
            magnifierFocusIndicator.style.top = `${indicatorY}px`;
            magnifierFocusIndicator.classList.remove('hidden');
        }

        function getEventClientPoint(e) {
            return e.touches ? {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            } : {
                x: e.clientX,
                y: e.clientY
            };
        }

        function getMagnifierFocusHitRadius() {
            return window.innerWidth < 768 ? 32 : 22;
        }

        function isNearMagnifierFocus(pos) {
            if (!magnifierEnabled || !lastMagnifierPoint) return false;

            const dx = pos.x - lastMagnifierPoint.x;
            const dy = pos.y - lastMagnifierPoint.y;
            return Math.hypot(dx, dy) <= getMagnifierFocusHitRadius();
        }

        function setMagnifierFocus(point) {
            renderMagnifier(point);
        }

        function beginMagnifierFocusDrag(mode, clientPoint) {
            isDraggingMagnifierFocus = true;
            magnifierDragMode = mode;
            lastMagnifierDragClientPoint = clientPoint;
            magnifierFocusIndicator.classList.remove('is-settling');
            magnifierFocusIndicator.classList.add('is-dragging');
        }

        function animateMagnifierFocusSettle() {
            magnifierFocusIndicator.classList.remove('is-settling');
            void magnifierFocusIndicator.offsetWidth;
            magnifierFocusIndicator.classList.add('is-settling');
        }

        function updateMagnifierFocusFromPanelDrag(clientPoint) {
            if (!lastMagnifierPoint) return;

            const rect = canvas.getBoundingClientRect();
            if (!rect.width || !rect.height) return;

            const deltaX = clientPoint.x - lastMagnifierDragClientPoint.x;
            const deltaY = clientPoint.y - lastMagnifierDragClientPoint.y;
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            setMagnifierFocus({
                x: lastMagnifierPoint.x + (deltaX * scaleX),
                y: lastMagnifierPoint.y + (deltaY * scaleY)
            });
            lastMagnifierDragClientPoint = clientPoint;
        }

        function endMagnifierFocusDrag() {
            const wasDraggingMagnifierFocus = isDraggingMagnifierFocus;
            isDraggingMagnifierFocus = false;
            magnifierDragMode = null;
            lastMagnifierDragClientPoint = null;
            magnifierFocusIndicator.classList.remove('is-dragging');
            if (wasDraggingMagnifierFocus && !magnifierFocusIndicator.classList.contains('hidden')) {
                animateMagnifierFocusSettle();
            }
        }

        function syncMagnifierPanel() {
            if (!magnifierEnabled || presSlides.length === 0 || slideWrapper.classList.contains('hidden')) {
                hideMagnifier();
                return;
            }

            positionMagnifierPanel(lastMagnifierPoint);
            magnifierLens.classList.remove('hidden');

            const hasFocus = Boolean(lastMagnifierPoint);
            magnifierCanvas.classList.toggle('hidden', !hasFocus);
            magnifierPlaceholder.classList.toggle('hidden', hasFocus);

            if (!hasFocus) {
                updateMagnifierFocusUI(null);
            }
        }

        function toggleMagnifier(forceState) {
            magnifierEnabled = typeof forceState === 'boolean' ? forceState : !magnifierEnabled;
            lastMagnifierPoint = null;
            updateMagnifierButtonUI();
            if (magnifierEnabled) {
                syncMagnifierPanel();
            } else {
                hideMagnifier();
            }
        }

        function renderMagnifier(point) {
            if (!magnifierEnabled || presSlides.length === 0) {
                hideMagnifier();
                return;
            }

            const rect = canvas.getBoundingClientRect();
            if (!rect.width || !rect.height) {
                hideMagnifier();
                return;
            }

            const canvasPoint = {
                x: clamp(point.x, 0, canvas.width),
                y: clamp(point.y, 0, canvas.height)
            };

            lastMagnifierPoint = canvasPoint;
            syncMagnifierPanel();

            const sourceWidth = canvas.width / magnifierZoomLevel;
            const sourceHeight = canvas.height / magnifierZoomLevel;
            const sourceX = clamp(canvasPoint.x - (sourceWidth / 2), 0, Math.max(canvas.width - sourceWidth, 0));
            const sourceY = clamp(canvasPoint.y - (sourceHeight / 2), 0, Math.max(canvas.height - sourceHeight, 0));
            const lensWidth = magnifierCanvas.width;
            const lensHeight = magnifierCanvas.height;

            magnifierCtx.clearRect(0, 0, lensWidth, lensHeight);
            const mediaElement = getActiveSlideElement();

            if (mediaElement) {
                try {
                    const mediaSourceWidth = mediaElement.tagName === 'VIDEO' ? (mediaElement.videoWidth || canvas.width) : (mediaElement.naturalWidth || canvas.width);
                    const mediaSourceHeight = mediaElement.tagName === 'VIDEO' ? (mediaElement.videoHeight || canvas.height) : (mediaElement.naturalHeight || canvas.height);
                    const mediaScaleX = mediaSourceWidth / canvas.width;
                    const mediaScaleY = mediaSourceHeight / canvas.height;
                    const mediaSourceX = clamp(sourceX * mediaScaleX, 0, Math.max(mediaSourceWidth - (sourceWidth * mediaScaleX), 0));
                    const mediaSourceY = clamp(sourceY * mediaScaleY, 0, Math.max(mediaSourceHeight - (sourceHeight * mediaScaleY), 0));
                    const mediaCropWidth = Math.max(sourceWidth * mediaScaleX, 1);
                    const mediaCropHeight = Math.max(sourceHeight * mediaScaleY, 1);

                    magnifierCtx.drawImage(
                        mediaElement,
                        mediaSourceX,
                        mediaSourceY,
                        mediaCropWidth,
                        mediaCropHeight,
                        0,
                        0,
                        lensWidth,
                        lensHeight
                    );
                } catch (error) {
                    // Ignora frames indisponiveis no primeiro paint do video.
                }
            }

            magnifierCtx.drawImage(canvas, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, lensWidth, lensHeight);

            magnifierCtx.strokeStyle = 'rgba(255,255,255,0.9)';
            magnifierCtx.lineWidth = 1.5;
            magnifierCtx.beginPath();
            magnifierCtx.moveTo(lensWidth / 2, 20);
            magnifierCtx.lineTo(lensWidth / 2, lensHeight - 20);
            magnifierCtx.moveTo(20, lensHeight / 2);
            magnifierCtx.lineTo(lensWidth - 20, lensHeight / 2);
            magnifierCtx.stroke();
            positionMagnifierPanel(canvasPoint);
            updateMagnifierFocusUI(canvasPoint);
        }

        function updateMagnifierFromEvent(e) {
            if (!magnifierEnabled) return;
            renderMagnifier(getPos(e));
        }

        presUpload.addEventListener('change', handleSlideUpload);

        function handleSlideUpload(e) {
            const files = Array.from(e.target.files);
            if(files.length === 0) return;
            
            tempUploadedSlides = [...presSlides]; 

            let loadedCount = 0;
            files.forEach((file) => {
                const isVideo = file.type.startsWith('video');
                
                if (isVideo) {
                    const videoUrl = URL.createObjectURL(file);
                    tempUploadedSlides.push({
                        type: 'video',
                        src: videoUrl,
                        drawData: null, 
                        undoHistory: [] 
                    });
                    loadedCount++;
                    if (loadedCount === files.length) openOrganizerModal();
                } else {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        const img = new Image();
                        img.src = ev.target.result;
                        img.onload = () => {
                            tempUploadedSlides.push({
                                type: 'image',
                                src: img.src,
                                drawData: null, 
                                undoHistory: [] 
                            });
                            loadedCount++;
                            if (loadedCount === files.length) openOrganizerModal();
                        }
                    }
                    reader.readAsDataURL(file);
                }
            });
            presUpload.value = '';
        }

        // === ORGANIZER LOGIC ===
        function openOrganizerModal() {
            slideOrganizerModal.classList.remove('hidden');
            renderOrganizerGrid();
        }

        function renderOrganizerGrid() {
            const grid = document.getElementById('organizerGrid');
            const empty = document.getElementById('organizerEmpty');
            const countLabel = document.getElementById('organizerCount');
            
            grid.innerHTML = '';
            
            if (tempUploadedSlides.length === 0) {
                grid.classList.add('hidden');
                empty.classList.remove('hidden');
                countLabel.textContent = "0 slides selecionados";
                return;
            }

            grid.classList.remove('hidden');
            empty.classList.add('hidden');
            countLabel.textContent = `${tempUploadedSlides.length} slides selecionados`;

            tempUploadedSlides.forEach((slide, index) => {
                const el = document.createElement('div');
                el.className = 'relative group organizer-item bg-white dark:bg-slate-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md border border-gray-200 dark:border-slate-600 aspect-video flex items-center justify-center bg-gray-100 dark:bg-black';
                el.draggable = true;
                el.dataset.index = index;

                let mediaContent = '';
                if (slide.type === 'video') {
                    // Simples representação para vídeo no organizador
                    mediaContent = `
                        <video src="${slide.src}" class="w-full h-full object-cover pointer-events-none opacity-80"></video>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <div class="w-10 h-10 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <i class="fas fa-play text-white text-sm"></i>
                            </div>
                        </div>
                    `;
                } else {
                    mediaContent = `<img src="${slide.src}" class="w-full h-full object-cover pointer-events-none">`;
                }

                el.innerHTML = `
                    ${mediaContent}
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none"></div>
                    
                    <div class="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm pointer-events-none z-10">
                        ${index + 1}
                    </div>

                    <button onclick="deleteSlide(${index})" class="delete-slide-btn absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm z-20" title="Remover slide">
                        <i class="fas fa-trash text-xs"></i>
                    </button>
                    
                    <div class="absolute bottom-0 inset-x-0 h-1 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                `;

                el.addEventListener('dragstart', handleDragStart);
                el.addEventListener('dragover', handleDragOver);
                el.addEventListener('drop', handleDrop);
                el.addEventListener('dragend', handleDragEnd);

                grid.appendChild(el);
            });
        }

        let draggedIndex = null;

        function handleDragStart(e) {
            draggedIndex = parseInt(this.dataset.index);
            this.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        }

        function handleDragOver(e) {
            e.preventDefault(); 
            e.dataTransfer.dropEffect = 'move';
            return false;
        }

        function handleDrop(e) {
            e.stopPropagation();
            if (draggedIndex !== null) {
                const targetIndex = parseInt(this.dataset.index);
                if (draggedIndex !== targetIndex) {
                    const itemMoved = tempUploadedSlides.splice(draggedIndex, 1)[0];
                    tempUploadedSlides.splice(targetIndex, 0, itemMoved);
                    renderOrganizerGrid();
                }
            }
            return false;
        }

        function handleDragEnd(e) {
            this.classList.remove('dragging');
            draggedIndex = null;
        }

        function deleteSlide(index) {
            tempUploadedSlides.splice(index, 1);
            renderOrganizerGrid();
        }

        function confirmSlidesAndStart() {
            presSlides = [...tempUploadedSlides];
            closeOrganizerModal();
            if (presSlides.length > 0) {
                initPresentation();
            } else {
                emptyStatePres.classList.remove('hidden');
                slideWrapper.classList.add('hidden');
                slideCounter.classList.add('hidden');
            }
        }
        // === END ORGANIZER LOGIC ===

        function initPresentation() {
            emptyStatePres.classList.add('hidden');
            slideWrapper.classList.remove('hidden');
            slideCounter.classList.remove('hidden');
            updatePresentationZoomUI();
            updatePresentationBoundsVars();
            loadSlide(0);
        }

        function loadSlide(index) {
            if (index < 0 || index >= presSlides.length) return;
            
            // Save state before leaving
            if (presSlides[currentSlideIndex]) presSlides[currentSlideIndex].drawData = canvas.toDataURL();
            
            // Stop previous video if exists
            currentSlideVideo.pause();

            currentSlideIndex = index;
            const slide = presSlides[index];
            lastMagnifierPoint = null;
            if (!magnifierEnabled) hideMagnifier();
            
            slideCounter.textContent = `Slide ${index + 1} / ${presSlides.length}`;
            btnPrevSlide.disabled = index === 0;
            btnNextSlide.disabled = index === presSlides.length - 1;

            // TOGGLE IMAGE vs VIDEO
            if (slide.type === 'video') {
                currentSlideImg.classList.add('hidden');
                currentSlideVideo.classList.remove('hidden');
                currentSlideVideo.src = slide.src;
                currentSlideVideo.muted = true; // Start muted for UX
                currentSlideVideo.play().catch(e => console.log("Autoplay blocked:", e));
                
                // Show Video Controls in Toolbar
                videoControls.classList.remove('hidden');
                updateVideoControlIcons();
            } else {
                currentSlideVideo.classList.add('hidden');
                currentSlideImg.classList.remove('hidden');
                currentSlideImg.src = slide.src;
                
                // Hide Video Controls
                videoControls.classList.add('hidden');
            }
            
            // Handle Drawing Canvas
            setTimeout(() => {
                resizeCanvasToImage();
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                undoStack = slide.undoHistory || []; 
                if (slide.drawData) {
                    const img = new Image();
                    img.onload = function(){ ctx.drawImage(img,0,0); };
                    img.src = slide.drawData;
                }
                if (magnifierEnabled) syncMagnifierPanel();
                adjustPresentationViewport();
            }, 100);
        }

        // Video Control Logic
        function toggleVideoPlay() {
            if (currentSlideVideo.paused) {
                currentSlideVideo.play();
            } else {
                currentSlideVideo.pause();
            }
            updateVideoControlIcons();
        }

        function toggleVideoMute() {
            currentSlideVideo.muted = !currentSlideVideo.muted;
            updateVideoControlIcons();
        }

        function updateVideoControlIcons() {
            const btnPlayPause = document.getElementById('btnPlayPause');
            const btnMute = document.getElementById('btnMute');
            
            btnPlayPause.innerHTML = currentSlideVideo.paused ? '<i class="fas fa-play text-xs md:text-sm"></i>' : '<i class="fas fa-pause text-xs md:text-sm"></i>';
            btnMute.innerHTML = currentSlideVideo.muted ? '<i class="fas fa-volume-mute text-xs md:text-sm"></i>' : '<i class="fas fa-volume-up text-xs md:text-sm"></i>';
            
            if (!currentSlideVideo.muted) {
                btnMute.classList.remove('bg-gray-100', 'dark:bg-slate-700', 'text-slate-600');
                btnMute.classList.add('bg-blue-100', 'text-blue-600');
            } else {
                btnMute.classList.add('bg-gray-100', 'dark:bg-slate-700', 'text-slate-600');
                btnMute.classList.remove('bg-blue-100', 'text-blue-600');
            }
        }

        function nextSlide() { if (currentSlideIndex < presSlides.length - 1) loadSlide(currentSlideIndex + 1); }
        function prevSlide() { if (currentSlideIndex > 0) loadSlide(currentSlideIndex - 1); }

        function resizeCanvasToImage() {
            const activeElement = getActiveSlideElement();
            const rect = activeElement.getBoundingClientRect();
            
            if (rect.width > 0 && rect.height > 0) {
                canvas.width = rect.width;
                canvas.height = rect.height;
                updatePresentationBoundsVars();
                if (magnifierEnabled) {
                    if (lastMagnifierPoint) {
                        renderMagnifier(lastMagnifierPoint);
                    } else {
                        syncMagnifierPanel();
                    }
                }
            }
        }

        window.addEventListener('resize', () => {
             clearTimeout(window.resizeTimer);
             window.resizeTimer = setTimeout(() => {
                 if(!appPresentation.classList.contains('hidden') && presSlides.length > 0) {
                     const tempDraw = canvas.toDataURL();
                     resizeCanvasToImage();
                     const img = new Image();
                     img.onload = () => ctx.drawImage(img,0,0);
                     img.src = tempDraw;
                 }
             }, 200);
        });

        function getPos(e) {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const scaleX = rect.width ? canvas.width / rect.width : 1;
            const scaleY = rect.height ? canvas.height / rect.height : 1;
            return {
                x: (clientX - rect.left) * scaleX,
                y: (clientY - rect.top) * scaleY
            };
        }

        function startDraw(e) {
            if (magnifierEnabled && !lastMagnifierPoint) {
                e.preventDefault();
                updateMagnifierFromEvent(e);
                return;
            }

            if (magnifierEnabled && lastMagnifierPoint) {
                const pos = getPos(e);
                if (isNearMagnifierFocus(pos)) {
                    e.preventDefault();
                    beginMagnifierFocusDrag('indicator', getEventClientPoint(e));
                    setMagnifierFocus(pos);
                    return;
                }
            }

            isDrawing = true;
            const pos = getPos(e);
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            if (currentTool === 'eraser') {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.lineWidth = 20;
            } else if (currentTool === 'highlighter') {
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = convertHexToRGBA(currentColor, 0.4);
                ctx.lineWidth = 15;
            } else {
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = currentColor;
                ctx.lineWidth = 3;
            }
        }

        function draw(e) {
            if (e.currentTarget === window && !isDraggingMagnifierFocus) return;

            if (isDraggingMagnifierFocus) {
                if (magnifierDragMode === 'indicator' && e.currentTarget === window) return;
                e.preventDefault();
                if (magnifierDragMode === 'indicator') {
                    setMagnifierFocus(getPos(e));
                } else if (magnifierDragMode === 'panel') {
                    updateMagnifierFocusFromPanelDrag(getEventClientPoint(e));
                }
                return;
            }

            if (!isDrawing) return;
            e.preventDefault(); 
            const pos = getPos(e);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        }

        function endDraw() {
            if (isDraggingMagnifierFocus) {
                endMagnifierFocusDrag();
                return;
            }
            if (isDrawing) { isDrawing = false; ctx.closePath(); saveUndoStep(); }
        }

        function convertHexToRGBA(hex, alpha) {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }

        canvas.addEventListener('mousedown', startDraw);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', endDraw);
        canvas.addEventListener('mouseout', endDraw);
        canvas.addEventListener('touchstart', startDraw, {passive: false});
        canvas.addEventListener('touchmove', draw, {passive: false});
        canvas.addEventListener('touchend', endDraw);
        canvas.addEventListener('touchcancel', endDraw);
        magnifierPanelBody.addEventListener('mousedown', (e) => {
            if (!magnifierEnabled || !lastMagnifierPoint) return;
            e.preventDefault();
            e.stopPropagation();
            beginMagnifierFocusDrag('panel', getEventClientPoint(e));
        });
        magnifierPanelBody.addEventListener('touchstart', (e) => {
            if (!magnifierEnabled || !lastMagnifierPoint) return;
            e.preventDefault();
            e.stopPropagation();
            beginMagnifierFocusDrag('panel', getEventClientPoint(e));
        }, { passive: false });
        window.addEventListener('mousemove', draw);
        window.addEventListener('touchmove', draw, { passive: false });
        window.addEventListener('mouseup', endDraw);
        window.addEventListener('touchend', endDraw);
        window.addEventListener('touchcancel', endDraw);

        function setTool(tool) {
            currentTool = tool;
            document.querySelectorAll('.tool-btn').forEach(b => {
                b.classList.remove('active', 'bg-blue-600', 'text-white');
                b.classList.add('bg-gray-100', 'dark:bg-slate-700', 'text-slate-600', 'dark:text-slate-300', 'hover:text-blue-500', 'dark:hover:text-white', 'hover:bg-gray-200', 'dark:hover:bg-slate-600');
            });
            const btn = document.getElementById('tool' + tool.charAt(0).toUpperCase() + tool.slice(1));
            btn.classList.remove('bg-gray-100', 'dark:bg-slate-700', 'text-slate-600', 'dark:text-slate-300', 'hover:text-blue-500', 'dark:hover:text-white', 'hover:bg-gray-200', 'dark:hover:bg-slate-600');
            btn.classList.add('active', 'bg-blue-600', 'text-white');
        }

        function isDarkThemeEnabled() {
            return html.classList.contains('dark');
        }

        function getBlueColorButton() {
            return document.querySelector(".color-btn[title='Azul']");
        }

        function normalizeDrawingColor(color) {
            const normalizedColor = (color || '').toLowerCase();
            if (isDarkThemeEnabled() && normalizedColor === DRAWING_BLACK) {
                return DRAWING_DARK_REPLACEMENT;
            }

            return color;
        }

        function syncDrawingColorWithTheme() {
            if (!isDarkThemeEnabled()) return;
            if ((currentColor || '').toLowerCase() !== DRAWING_BLACK) return;

            setColor(DRAWING_DARK_REPLACEMENT, getBlueColorButton());
        }

        function setActiveColorButton(activeElement) {
            document.querySelectorAll('.color-btn').forEach(button => button.classList.remove('active'));
            if (activeElement) activeElement.classList.add('active');
        }

        function syncCustomColorPicker(color) {
            const colorPicker = document.getElementById('customColorPicker');
            if (colorPicker && colorPicker.value.toLowerCase() !== color.toLowerCase()) {
                colorPicker.value = color;
            }
        }

        function setColor(color, sourceElement = null) {
            const nextColor = normalizeDrawingColor(color);
            const nextSourceElement = nextColor !== color ? getBlueColorButton() : sourceElement;

            currentColor = nextColor;
            setActiveColorButton(nextSourceElement);
            syncCustomColorPicker(nextColor);
            if (currentTool === 'eraser') setTool('pencil');
        }

        function setCustomColor(color) {
            const colorPicker = document.getElementById('customColorPicker');
            setColor(color, colorPicker);
        }

        function saveUndoStep() {
            if (!presSlides[currentSlideIndex]) return;
            if (presSlides[currentSlideIndex].undoHistory.length > 20) presSlides[currentSlideIndex].undoHistory.shift();
            presSlides[currentSlideIndex].undoHistory.push(canvas.toDataURL());
        }

        function undoDraw() {
            const history = presSlides[currentSlideIndex]?.undoHistory;
            if (history && history.length > 1) {
                history.pop(); 
                const prevState = history[history.length - 1]; 
                const img = new Image();
                img.onload = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0); };
                img.src = prevState;
            } else if (history && history.length === 1) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                history.pop(); 
            }
        }

        document.addEventListener('keydown', (e) => {
            if (!appPresentation.classList.contains('hidden')) {
                if (e.key === 'ArrowRight') nextSlide();
                if (e.key === 'ArrowLeft') prevSlide();
                if (e.key === 'z' && e.ctrlKey) undoDraw();
                if (e.key === ' ') toggleVideoPlay(); // Spacebar plays video
            }
        });

        updatePresentationZoomUI();
        updateMagnifierButtonUI();
        updateMagnifierZoomUI();

