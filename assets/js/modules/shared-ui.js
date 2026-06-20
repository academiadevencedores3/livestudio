// Shared Elements
        const appBuilder = document.getElementById('appBuilder');
        const appPresentation = document.getElementById('appPresentation');
        const appCalculator = document.getElementById('appCalculator'); // NEW
        const confirmModal = document.getElementById('confirmModal');
        const slideOrganizerModal = document.getElementById('slideOrganizerModal');

        function switchAppMode(mode) {
            // Hide all
            appBuilder.classList.add('hidden');
            appPresentation.classList.add('hidden');
            appCalculator.classList.add('hidden');
            
            // Reset Nav Styles
            document.getElementById('navBuilder').className = "flex-1 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-500 text-xs font-bold py-2 px-2 rounded border border-gray-200 dark:border-slate-700 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-slate-700 whitespace-nowrap";
            document.getElementById('navPresentation').className = "flex-1 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-500 text-xs font-bold py-2 px-2 rounded border border-gray-200 dark:border-slate-700 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-slate-700 whitespace-nowrap";
            document.getElementById('navCalculator').className = "flex-1 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-green-500 text-xs font-bold py-2 px-2 rounded border border-gray-200 dark:border-slate-700 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-slate-700 whitespace-nowrap";

            if (mode === 'presentation') {
                appPresentation.classList.remove('hidden');
                document.getElementById('navPresentation').className = "flex-1 bg-blue-600 text-white text-xs font-bold py-2 px-2 rounded shadow-inner cursor-default whitespace-nowrap";
                // #region debug-point E:presentation-mode
                fetch("http://10.2.0.2:7777/event",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId:"presentation-zoom-bugs",runId:(window.__LIVE_STUDIO_DEBUG_RUN_ID||'pre-fix'),hypothesisId:"E",location:"shared-ui.js:switchAppMode",msg:"[DEBUG] Presentation mode activated",data:{viewport:{width:window.innerWidth,height:window.innerHeight},presentationHidden:appPresentation.classList.contains('hidden'),toolbarOpen:!document.getElementById('drawingToolbar').classList.contains('pointer-events-none')},ts:Date.now()})}).catch(()=>{});
                // #endregion
                setTimeout(() => {
                    resizeCanvasToImage();
                    if (typeof adjustPresentationViewport === 'function') adjustPresentationViewport();
                }, 100);
            } else if (mode === 'calculator') {
                appCalculator.classList.remove('hidden');
                document.getElementById('navCalculator').className = "flex-1 bg-green-600 text-white text-xs font-bold py-2 px-2 rounded shadow-inner cursor-default whitespace-nowrap";
            } else {
                appBuilder.classList.remove('hidden');
                document.getElementById('navBuilder').className = "flex-1 bg-blue-600 text-white text-xs font-bold py-2 px-2 rounded shadow-inner cursor-default whitespace-nowrap";
            }
        }

        // Modal Logic
        function clearCanvas() { confirmModal.classList.remove('hidden'); }
        function closeConfirmModal() { confirmModal.classList.add('hidden'); }
        function executeClearCanvas() { ctx.clearRect(0, 0, canvas.width, canvas.height); saveUndoStep(); closeConfirmModal(); }
        
        // Organizer Modal Logic
        function closeOrganizerModal() { 
            slideOrganizerModal.classList.add('hidden'); 
            // If we cancel and have no slides, reset input
            if(presSlides.length === 0) presUpload.value = '';
        }

        // Toolbar Logic
        function toggleToolbar(show) {
            const toolbar = document.getElementById('drawingToolbar');
            const toggleBtn = document.getElementById('toolbarToggleBtn');
            
            if (show) {
                // Show Toolbar
                toolbar.classList.remove('scale-90', 'opacity-0', 'pointer-events-none', 'translate-y-24');
                toolbar.classList.add('scale-100', 'opacity-100', 'pointer-events-auto', 'translate-y-0');
                
                // Hide Toggle Button
                toggleBtn.classList.add('scale-0', 'opacity-0', 'pointer-events-none');
            } else {
                // Hide Toolbar
                toolbar.classList.add('scale-90', 'opacity-0', 'pointer-events-none', 'translate-y-24');
                toolbar.classList.remove('scale-100', 'opacity-100', 'pointer-events-auto', 'translate-y-0');
                
                // Show Toggle Button
                toggleBtn.classList.remove('scale-0', 'opacity-0', 'pointer-events-none');
            }
            if (typeof adjustPresentationViewport === 'function') setTimeout(adjustPresentationViewport, 0);
            // #region debug-point D:toolbar-layout
            fetch("http://10.2.0.2:7777/event",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId:"presentation-zoom-bugs",runId:(window.__LIVE_STUDIO_DEBUG_RUN_ID||'pre-fix'),hypothesisId:"D",location:"shared-ui.js:toggleToolbar",msg:"[DEBUG] Toolbar visibility/layout snapshot",data:{show,viewport:{width:window.innerWidth,height:window.innerHeight},toolbar:{clientWidth:toolbar.clientWidth,scrollWidth:toolbar.scrollWidth,childCount:toolbar.children.length,className:toolbar.className},toggleBtn:{hidden:toggleBtn.classList.contains('pointer-events-none')}},ts:Date.now()})}).catch(()=>{});
            // #endregion
        }

