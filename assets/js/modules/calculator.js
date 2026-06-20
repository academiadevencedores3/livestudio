// ================= CALCULATOR LOGIC =================
        let calcType = 'compound';
        let calcView = 'daily';
        let calcResults = [];
        let calcCommissionEnabled = false;

        function setCalcType(type) {
            calcType = type;
            const btnCompound = document.getElementById('btnCompound');
            const btnSimple = document.getElementById('btnSimple');
            const btnBitradex = document.getElementById('btnBitradex');
            
            const standardInputs = document.getElementById('standardInputs');
            const bitradexInputs = document.getElementById('bitradexInputs');

            // Reset Styles
            [btnCompound, btnSimple, btnBitradex].forEach(btn => {
                btn.className = "flex-1 py-2 rounded-lg text-xs font-bold transition-all text-slate-500 dark:text-slate-400 hover:text-slate-700 flex items-center justify-center gap-1";
            });

            // Activate Selected
            const activeClass = "flex-1 py-2 rounded-lg text-xs font-bold transition-all shadow-sm bg-white dark:bg-slate-600 text-green-600 dark:text-white flex items-center justify-center gap-1";
            
            if(type === 'compound') {
                btnCompound.className = activeClass;
                standardInputs.classList.remove('hidden');
                bitradexInputs.classList.add('hidden');
            } else if (type === 'simple') {
                btnSimple.className = activeClass;
                standardInputs.classList.remove('hidden');
                bitradexInputs.classList.add('hidden');
            } else if (type === 'bitradex') {
                btnBitradex.className = activeClass;
                standardInputs.classList.add('hidden');
                bitradexInputs.classList.remove('hidden');
            }
            
            // REMOVIDO: Cálculo automático ao trocar abas. Agora aguarda o clique no botão.
            // calculateInterest();
        }

        function setCalcView(view) {
            calcView = view;
            // Update UI buttons
            ['daily', 'weekly', 'biweekly', 'monthly'].forEach(v => {
                const btn = document.getElementById('view' + v.charAt(0).toUpperCase() + v.slice(1));
                if(v === view) {
                    btn.className = "px-3 py-1.5 rounded-md text-xs font-bold bg-white dark:bg-slate-600 shadow-sm text-slate-800 dark:text-white transition-all whitespace-nowrap";
                } else {
                    btn.className = "px-3 py-1.5 rounded-md text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-600/50 transition-all whitespace-nowrap";
                }
            });
            renderResults();
        }

        function toggleCommission(forceState) {
            const shouldEnable = typeof forceState === 'boolean' ? forceState : !calcCommissionEnabled;
            calcCommissionEnabled = shouldEnable;

            const toggle = document.getElementById('commissionToggle');
            const toggleDot = document.getElementById('commissionToggleDot');
            const rateWrapper = document.getElementById('commissionRateWrapper');
            const rateInput = document.getElementById('calcCommissionRate');

            toggle.setAttribute('aria-pressed', String(shouldEnable));

            if (shouldEnable) {
                toggle.classList.remove('bg-slate-300', 'dark:bg-slate-600');
                toggle.classList.add('bg-emerald-500');
                toggleDot.classList.add('translate-x-5');
                rateWrapper.classList.remove('hidden');
                rateInput.disabled = false;
            } else {
                toggle.classList.add('bg-slate-300', 'dark:bg-slate-600');
                toggle.classList.remove('bg-emerald-500');
                toggleDot.classList.remove('translate-x-5');
                rateWrapper.classList.add('hidden');
                rateInput.disabled = true;
            }

            updateResultsHeaders();
        }

        function getCommissionRate() {
            if (!calcCommissionEnabled) return 0;

            const inputValue = parseFloat(document.getElementById('calcCommissionRate').value) || 0;
            return Math.min(Math.max(inputValue, 0), 100);
        }

        function applyCommission(grossInterest, commissionRate) {
            const commission = grossInterest * (commissionRate / 100);
            return {
                grossInterest,
                commission,
                netInterest: grossInterest - commission
            };
        }

        function getDailyRate(rateInput, rateType, selectedType) {
            if (rateType === 'monthly') {
                if (selectedType === 'simple') {
                    return (rateInput / 100) / 30;
                }

                return Math.pow(1 + (rateInput / 100), 1 / 30) - 1;
            }

            return rateInput / 100;
        }

        function calculateBitradexResults(principal, days, commissionRate) {
            const planDays = parseInt(document.getElementById('bitradexPlan').value);
            let dailyBaseRate = 0;

            if (planDays === 30) dailyBaseRate = 0.003;
            else if (planDays === 90) dailyBaseRate = 0.0035;
            else if (planDays === 180) dailyBaseRate = 0.004;
            else if (planDays === 360) dailyBaseRate = 0.005;

            const poolRate = 0.002;
            const results = [];
            let poolBalance = 0;
            let totalGrossInterest = 0;
            let totalCommission = 0;
            let totalNetInterest = 0;

            for (let i = 1; i <= days; i++) {
                const poolGrowth = poolBalance * poolRate;
                const capitalYield = principal * dailyBaseRate;
                const grossInterest = poolGrowth + capitalYield;
                const dayResult = applyCommission(grossInterest, commissionRate);

                poolBalance += dayResult.netInterest;
                totalGrossInterest += dayResult.grossInterest;
                totalCommission += dayResult.commission;
                totalNetInterest += dayResult.netInterest;

                results.push({
                    day: i,
                    interest: dayResult.netInterest,
                    grossInterest: dayResult.grossInterest,
                    commission: dayResult.commission,
                    balance: principal + poolBalance,
                    totalInterest: totalNetInterest,
                    totalGrossInterest,
                    totalCommission,
                    totalNetInterest
                });
            }

            return {
                results,
                currentBalance: principal + poolBalance,
                totalGrossInterest,
                totalCommission,
                totalNetInterest
            };
        }

        function calculateStandardResults(principal, days, rateInput, rateType, selectedType, commissionRate) {
            const dailyRate = getDailyRate(rateInput, rateType, selectedType);
            const results = [];
            let currentBalance = principal;
            let totalGrossInterest = 0;
            let totalCommission = 0;
            let totalNetInterest = 0;

            for (let i = 1; i <= days; i++) {
                let grossInterest = 0;

                if (selectedType === 'simple') {
                    grossInterest = principal * dailyRate;
                } else {
                    grossInterest = currentBalance * dailyRate;
                }

                const dayResult = applyCommission(grossInterest, commissionRate);

                currentBalance += dayResult.netInterest;
                totalGrossInterest += dayResult.grossInterest;
                totalCommission += dayResult.commission;
                totalNetInterest += dayResult.netInterest;

                results.push({
                    day: i,
                    interest: dayResult.netInterest,
                    grossInterest: dayResult.grossInterest,
                    commission: dayResult.commission,
                    balance: currentBalance,
                    totalInterest: totalNetInterest,
                    totalGrossInterest,
                    totalCommission,
                    totalNetInterest
                });
            }

            return {
                results,
                currentBalance,
                totalGrossInterest,
                totalCommission,
                totalNetInterest
            };
        }

        function updateCalculatorSummary(principal, currentBalance, totalGrossInterest, totalCommission, totalNetInterest) {
            const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
            document.getElementById('resFinalAmount').textContent = formatter.format(currentBalance);
            document.getElementById('resTotalInterest').textContent = formatter.format(totalGrossInterest);
            document.getElementById('resTotalCommission').textContent = formatter.format(totalCommission);
            document.getElementById('resNetInterest').textContent = formatter.format(totalNetInterest);

            const profitPercentage = principal > 0 ? ((totalNetInterest / principal) * 100).toFixed(2) : '0.00';
            document.getElementById('resPercentage').textContent = profitPercentage + '%';
        }

        function updateResultsHeaders() {
            const dailyInterestHeader = document.getElementById('calcDailyInterestHeader');
            const totalInterestHeader = document.getElementById('calcTotalInterestHeader');

            dailyInterestHeader.textContent = calcCommissionEnabled ? 'Juros Líq. (Dia)' : 'Juros (Dia)';
            totalInterestHeader.textContent = calcCommissionEnabled ? 'Total Líquido' : 'Total Juros';
        }

        function calculateInterest() {
            const principal = parseFloat(document.getElementById('calcPrincipal').value) || 0;
            const days = parseInt(document.getElementById('calcDays').value) || 0;
            const commissionRate = getCommissionRate();
            
            if (principal <= 0 || days <= 0) return;

            let calculation;
            if (calcType === 'bitradex') {
                calculation = calculateBitradexResults(principal, days, commissionRate);
            } else {
                const rateInput = parseFloat(document.getElementById('calcRate').value) || 0;
                const rateType = document.getElementById('calcRateType').value;
                calculation = calculateStandardResults(principal, days, rateInput, rateType, calcType, commissionRate);
            }

            calcResults = calculation.results;
            updateCalculatorSummary(
                principal,
                calculation.currentBalance,
                calculation.totalGrossInterest,
                calculation.totalCommission,
                calculation.totalNetInterest
            );
            updateResultsHeaders();
            renderResults();
        }

        function renderResults() {
            const list = document.getElementById('calcResultsList');
            list.innerHTML = '';

            if (calcResults.length === 0) return;

            const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
            
            // Filter Logic
            const filtered = calcResults.filter(item => {
                if (calcView === 'daily') return true;
                if (calcView === 'weekly') return item.day % 7 === 0 || item.day === calcResults.length;
                if (calcView === 'biweekly') return item.day % 15 === 0 || item.day === calcResults.length;
                if (calcView === 'monthly') return item.day % 30 === 0 || item.day === calcResults.length;
                return true;
            });

            filtered.forEach(item => {
                const el = document.createElement('div');
                el.className = "grid grid-cols-12 gap-2 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors cursor-default text-sm border-b border-gray-50 dark:border-slate-700/50 last:border-0";
                
                el.innerHTML = `
                    <div class="col-span-2 md:col-span-1 text-center font-bold text-slate-500 dark:text-slate-400 bg-gray-200 dark:bg-slate-700 rounded px-1 flex items-center justify-center">${item.day}</div>
                    <div class="col-span-5 md:col-span-4 text-right text-green-600 font-medium">+${formatter.format(item.interest)}</div>
                    <div class="col-span-5 md:col-span-4 text-right font-bold text-slate-800 dark:text-white">${formatter.format(item.balance)}</div>
                    <div class="hidden md:block col-span-3 text-right text-slate-500 dark:text-slate-400 text-xs pt-1">${formatter.format(item.totalInterest)}</div>
                `;
                list.appendChild(el);
            });
        }

        toggleCommission(false);
        // ================= END CALCULATOR LOGIC =================

