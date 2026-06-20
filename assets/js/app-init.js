themeToggleBtn.addEventListener('click', () => {
            html.classList.toggle('dark');
            icon.className = html.classList.contains('dark') ? 'fas fa-moon text-yellow-300' : 'fas fa-sun text-orange-400';
            syncDrawingColorWithTheme();
        });

        bgInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                bgFileName.textContent = file.name;
                const reader = new FileReader();
                reader.onload = (event) => { previewBg.style.backgroundImage = `url('${event.target.result}')`; savePage(currentPageId); }
                reader.readAsDataURL(file);
            }
        });

        logoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                logoFileName.textContent = file.name;
                const reader = new FileReader();
                reader.onload = (event) => { previewLogo.src = event.target.result; savePage(currentPageId); }
                reader.readAsDataURL(file);
            }
        });

        logoSizeInput.addEventListener('input', (e) => { previewLogo.style.height = `${e.target.value}px`; logoSizeDisplay.textContent = `${e.target.value}px`; });
        logoSizeInput.addEventListener('change', () => savePage(currentPageId));

        fontSizeInput.addEventListener('input', (e) => { neonTextContainer.style.fontSize = `${e.target.value}px`; fontSizeDisplay.textContent = `${e.target.value}px`; });
        fontSizeInput.addEventListener('change', () => savePage(currentPageId));

        themeTextInput.addEventListener('input', renderText);
        themeTextInput.addEventListener('change', () => savePage(currentPageId));

        // REMOVIDO: Eventos de Auto-Cálculo para permitir controle manual pelo botão
        /*
        ['calcPrincipal', 'calcRate', 'calcDays', 'calcRateType', 'bitradexPlan'].forEach(id => {
            const el = document.getElementById(id);
            if(el) {
                el.addEventListener('input', calculateInterest);
                el.addEventListener('change', calculateInterest);
            }
        });
        */

        initPages();
        updateStrokeButtonsUI();
        updateButtonVisibility();
        syncDrawingColorWithTheme();
        window.addEventListener('resize', updateButtonVisibility);

