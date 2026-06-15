import { LightningElement, track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import CHARTJS from '@salesforce/resourceUrl/chartjs';

const AF_AVATAR_SVG = `<svg class="af-avatar" width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="14" fill="#D8E6FE"/><g transform="translate(5,4.5)"><circle cx="9" cy="5" r="1.2" fill="#0250D9"/><line x1="9" y1="6.2" x2="9" y2="8" stroke="#0250D9" stroke-width="1.4" stroke-linecap="round"/><rect x="2" y="8" width="14" height="10" rx="5" fill="#0250D9"/><circle cx="6.5" cy="13" r="1.6" fill="white"/><circle cx="11.5" cy="13" r="1.6" fill="white"/><circle cx="6.5" cy="13" r="0.7" fill="#0250D9"/><circle cx="11.5" cy="13" r="0.7" fill="#0250D9"/><path d="M7 16.2Q9 17.8 11 16.2" stroke="white" stroke-width="1" fill="none" stroke-linecap="round"/><rect x="0" y="11.5" width="2.5" height="3.5" rx="1.25" fill="#0250D9"/><rect x="15.5" y="11.5" width="2.5" height="3.5" rx="1.25" fill="#0250D9"/></g></svg>`;

export default class ServiceInsightsDashboard extends LightningElement {
    @track currentPage = 'omni';
    @track currentSubTab = 'cases';
    @track dropdownOpen = false;
    @track afPanelOpen = false;
    @track afGreeted = false;
    @track afMessages = [];

    chartjsLoaded = false;
    chartsInitialized = {};

    FC = {
        blue: '#4992FE', purple: '#BA01FF', teal: '#06A59A',
        indigo: '#3A49DA', red: '#FE5C4C', pink: '#E3066A',
        green: '#2E844A', orange: '#FE8F1D', cyan: '#0D9DDA'
    };

    connectedCallback() {
        loadScript(this, CHARTJS)
            .then(() => {
                this.chartjsLoaded = true;
                // eslint-disable-next-line no-undef
                Chart.defaults.font.family = "'SF Pro',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";
                // eslint-disable-next-line no-undef
                Chart.defaults.font.size = 11;
                // eslint-disable-next-line no-undef
                Chart.defaults.color = '#2E2E2E';
                // eslint-disable-next-line no-undef
                Chart.register({
                    id: 'noBackground',
                    beforeDraw: (chart) => { chart.canvas.style.background = 'transparent'; }
                });
                this.initChartsForPage('omni');
                this.initCounterAnimations();
            })
            .catch(err => console.error('Chart.js load error', err));
    }

    /* ---- Page Navigation ---- */
    get isOmni() { return this.currentPage === 'omni'; }
    get isAgents() { return this.currentPage === 'agents'; }
    get isKnowledge() { return this.currentPage === 'knowledge'; }
    get isCsi() { return this.currentPage === 'csi'; }
    get isKi() { return this.currentPage === 'ki'; }
    get isCri() { return this.currentPage === 'cri'; }

    get dropdownMenuClass() { return this.dropdownOpen ? 'nav-dropdown-menu open' : 'nav-dropdown-menu'; }
    get afPanelClass() { return this.afPanelOpen ? 'af-panel open' : 'af-panel'; }

    get consoleTabLabel() {
        const labels = { omni: 'Service Insights', agents: 'Service Insights', knowledge: 'Service Insights', csi: 'Customer Signals Intelligence', ki: 'Knowledge Intelligence', cri: 'Knowledge Intelligence' };
        return labels[this.currentPage] || 'Service Insights';
    }

    get dropdownItemOmniClass() { return ['omni','agents','knowledge'].includes(this.currentPage) ? 'nav-dropdown-item active' : 'nav-dropdown-item'; }
    get dropdownItemCsiClass() { return this.currentPage === 'csi' ? 'nav-dropdown-item active' : 'nav-dropdown-item'; }
    get dropdownItemKiClass() { return ['ki','cri'].includes(this.currentPage) ? 'nav-dropdown-item active' : 'nav-dropdown-item'; }

    get subTabCasesClass() { return this.currentSubTab === 'cases' ? 'page-tab active' : 'page-tab'; }
    get subTabOmniClass() { return this.currentSubTab === 'omni' ? 'page-tab active' : 'page-tab'; }
    get subTabKnowledgeClass() { return this.currentSubTab === 'knowledge' ? 'page-tab active' : 'page-tab'; }
    get isCasesSubTab() { return this.currentSubTab === 'cases'; }
    get isOmniSubTab() { return this.currentSubTab === 'omni'; }
    get isKnowledgeSubTab() { return this.currentSubTab === 'knowledge'; }

    switchSubTab(e) {
        const id = e.currentTarget.dataset.subtab;
        if (!id || id === this.currentSubTab) return;
        this.currentSubTab = id;
        setTimeout(() => {
            if (id === 'cases' && !this.chartsInitialized.cases) { this.chartsInitialized.cases = true; this.initCasesChart(); }
            if (id === 'omni' && !this.chartsInitialized.omni) { this.chartsInitialized.omni = true; this.initOmniCharts(); }
            if (id === 'knowledge' && !this.chartsInitialized.knowledgeSubTab) { this.chartsInitialized.knowledgeSubTab = true; this.initKbSubTabCharts(); }
        }, 50);
    }

    get topTabOmniClass() { return this.currentPage === 'omni' ? 'top-tab active' : 'top-tab'; }
    get topTabAgentsClass() { return this.currentPage === 'agents' ? 'top-tab active' : 'top-tab'; }
    get topTabKnowledgeClass() { return this.currentPage === 'knowledge' ? 'top-tab active' : 'top-tab'; }
    get topTabKiOverviewClass() { return this.currentPage === 'ki' ? 'top-tab active' : 'top-tab'; }
    get topTabCriClass() { return this.currentPage === 'cri' ? 'top-tab active' : 'top-tab'; }

    switchPage(e) {
        const id = e.currentTarget.dataset.page || e.target.dataset.page;
        if (!id) return;
        this.currentPage = id;
        this.currentSubTab = 'cases';
        this.dropdownOpen = false;
        setTimeout(() => {
            this.initChartsForPage(id);
            this.initCounterAnimations();
            this.template.querySelector('.content-area')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
    }

    toggleDropdown() { this.dropdownOpen = !this.dropdownOpen; }

    handleDocumentClick(e) {
        if (this.dropdownOpen) this.dropdownOpen = false;
    }

    /* ---- Chart Initialization ---- */
    initChartsForPage(page) {
        if (!this.chartjsLoaded) return;
        if (page === 'omni' && !this.chartsInitialized.cases) { this.chartsInitialized.cases = true; this.initCasesChart(); }
        if (page === 'agents' && !this.chartsInitialized.agents) { this.chartsInitialized.agents = true; this.initAgentCharts(); }
        if (page === 'knowledge' && !this.chartsInitialized.knowledge) { this.chartsInitialized.knowledge = true; this.initKbCharts(); }
        if (page === 'csi' && !this.chartsInitialized.csi) { this.chartsInitialized.csi = true; this.initCsiCharts(); }
        if (page === 'ki' && !this.chartsInitialized.ki) { this.chartsInitialized.ki = true; this.initKiCharts(); }
        if (page === 'cri' && !this.chartsInitialized.cri) { this.chartsInitialized.cri = true; this.initCriCharts(); }
    }

    initCasesChart() {
        const FC = this.FC;
        const labels = [
            'Questions produits antichute',
            'Réclamations livraison',
            'Demandes remboursement',
            'Conseils routine capillaire',
            'Problèmes commande en ligne',
            'Questions ingrédients / allergènes',
            'Programme fidélité'
        ];
        const volumes = [1840, 1420, 1185, 980, 875, 640, 512];
        const evolutions = ['+14%', '+3%', '-2%', '+1%', '-5%', '+2%', '-1%'];
        const colors = volumes.map((_, i) => i === 0 ? FC.teal : FC.blue);

        // eslint-disable-next-line no-undef
        const contactReasonsPlugin = {
            id: 'evolutionLabels',
            afterDatasetsDraw(chart) {
                const { ctx } = chart;
                chart.data.datasets[0].data.forEach((val, i) => {
                    const meta = chart.getDatasetMeta(0);
                    const bar = meta.data[i];
                    const evo = evolutions[i];
                    const isPos = evo.startsWith('+');
                    const isNeg = evo.startsWith('-');
                    ctx.save();
                    ctx.font = 'bold 11px SF Pro, -apple-system, sans-serif';
                    ctx.fillStyle = isPos ? '#2E844A' : isNeg ? '#FE5C4C' : '#5C5C5C';
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(evo, bar.x + 6, bar.y);
                    ctx.restore();
                });
            }
        };

        this.newChart('casesContactReasonsChart', {
            type: 'bar',
            plugins: [contactReasonsPlugin],
            data: {
                labels,
                datasets: [{
                    data: volumes,
                    backgroundColor: colors,
                    borderRadius: 4,
                    barPercentage: 0.65,
                    categoryPercentage: 0.85
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: { right: 60 } },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (c) => ' ' + c.raw.toLocaleString('fr-FR') + ' contacts'
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: '#F3F3F3' },
                        border: { color: '#E0E0E0' },
                        ticks: { font: { size: 10 }, color: '#5C5C5C' }
                    },
                    y: {
                        grid: { display: false },
                        border: { color: '#E0E0E0' },
                        ticks: { font: { size: 11 }, color: '#2E2E2E' }
                    }
                }
            }
        });
    }

    initKbSubTabCharts() {
        const FC = this.FC;
        this.newChart('kbInteractionsChart2', { type: 'bar', data: { labels: ['Janvier', 'Février', 'Mars', 'Avril'], datasets: [
            { label: 'Requêtes avec KB', data: [420, 380, 520, 310], backgroundColor: FC.blue, borderRadius: 3, barPercentage: 0.4 },
            { label: 'Requêtes sans KB', data: [280, 320, 480, 250], backgroundColor: FC.pink, borderRadius: 3, barPercentage: 0.4 }
        ]}, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', font: { size: 11 }, boxWidth: 8, padding: 12 } } }, scales: { y: { grid: { color: '#F3F3F3' }, border: { color: '#939393' }, ticks: { font: { size: 10 } } }, x: { grid: { display: false }, border: { color: '#939393' }, ticks: { font: { size: 10 } } } } } });
        this.newChart('avgHandleTimeChart2', { type: 'bar', data: { labels: ['Jan S1', 'Jan S2', 'Fév S1', 'Fév S2', 'Mars S1', 'Mars S2', 'Avr S1', 'Avr S2'], datasets: [
            { label: 'Req. avec PJ', data: [12, 14, 15, 12, 18, 15, 11, 12], backgroundColor: FC.teal, borderRadius: 2, barPercentage: 0.7 },
            { label: 'Req. sans PJ', data: [18, 20, 20, 18, 28, 22, 16, 18], backgroundColor: FC.purple, borderRadius: 2, barPercentage: 0.7 }
        ]}, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', font: { size: 10 }, boxWidth: 6, padding: 8 } } }, scales: { y: { grid: { color: '#F3F3F3' }, border: { color: '#939393' }, ticks: { font: { size: 9 } } }, x: { grid: { display: false }, border: { color: '#939393' }, ticks: { font: { size: 9 } } } } } });
    }

    getCanvas(id) { return this.template.querySelector(`#${id}`); }

    newChart(id, config) {
        const ctx = this.getCanvas(id);
        if (!ctx) return null;
        // eslint-disable-next-line no-undef
        return new Chart(ctx, config);
    }

    initOmniCharts() {
        const FC = this.FC;
        /* Volume par Canal - stacked vertical */
        this.newChart('channelPieChart', { type: 'bar', data: { labels: [''], datasets: [
            { label: 'Téléphone', data: [5372], backgroundColor: FC.blue, barPercentage: 0.15, categoryPercentage: 1 },
            { label: 'SMS', data: [3278], backgroundColor: FC.purple, barPercentage: 0.15, categoryPercentage: 1 },
            { label: 'Chat', data: [2522], backgroundColor: FC.teal, barPercentage: 0.15, categoryPercentage: 1 },
            { label: 'Email', data: [1374], backgroundColor: FC.indigo, barPercentage: 0.15, categoryPercentage: 1 },
            { label: 'WhatsApp', data: [800], backgroundColor: FC.red, barPercentage: 0.15, categoryPercentage: 1 }
        ]}, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', align: 'start', labels: { usePointStyle: true, pointStyle: 'circle', padding: 6, font: { size: 11 }, boxWidth: 8 } } }, scales: { y: { stacked: true, display: false }, x: { stacked: true, display: false } } } });

        /* Volume par Statut - stacked vertical */
        this.newChart('statusBarChart', { type: 'bar', data: { labels: [''], datasets: [
            { label: 'Assigné', data: [8500], backgroundColor: FC.blue, barPercentage: 0.15, categoryPercentage: 1 },
            { label: 'Annulé', data: [1200], backgroundColor: FC.teal, barPercentage: 0.15, categoryPercentage: 1 },
            { label: 'Fermé', data: [3846], backgroundColor: FC.indigo, barPercentage: 0.15, categoryPercentage: 1 }
        ]}, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', align: 'start', labels: { usePointStyle: true, pointStyle: 'circle', padding: 6, font: { size: 11 }, boxWidth: 8 } } }, scales: { y: { stacked: true, display: false }, x: { stacked: true, display: false } } } });

        /* Efficacité du Routage */
        this.newChart('routingChart', { type: 'bar', data: { labels: ['Requêtes', 'Lead', 'Chat', 'Appel vocal', 'Personnalisé'], datasets: [
            { label: 'Réassigné', data: [412, 288, 320, 175, 100], backgroundColor: FC.blue, barPercentage: 0.7, categoryPercentage: 0.85 },
            { label: 'Non réassigné', data: [412, 370, 320, 250, 175], backgroundColor: FC.purple, barPercentage: 0.7, categoryPercentage: 0.85 }
        ]}, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', align: 'center', labels: { usePointStyle: true, pointStyle: 'circle', padding: 16, font: { size: 11 }, boxWidth: 8 } } }, scales: { x: { stacked: true, grid: { color: '#F3F3F3' }, border: { color: '#939393' }, ticks: { display: false } }, y: { stacked: true, grid: { display: false }, border: { color: '#939393' }, ticks: { font: { size: 11 }, color: '#2E2E2E', padding: 4 } } } } });

        /* Volume par File d'Attente */
        this.newChart('queueChart', { type: 'bar', data: { labels: ['Téléphone', 'SMS', 'Chat', 'Email', 'WhatsApp'], datasets: [
            { data: [5372, 3278, 2522, 1374, 890], backgroundColor: [FC.blue, FC.purple, FC.teal, FC.indigo, FC.red], borderRadius: 3, barPercentage: 0.6 }
        ]}, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: '#F3F3F3' }, border: { color: '#939393' }, ticks: { font: { size: 10 } } }, y: { grid: { display: false }, border: { color: '#939393' }, ticks: { font: { size: 11 }, color: '#2E2E2E' } } } } });

        /* Tendance du Volume */
        this.newChart('volumeTrendChart', { type: 'line', data: { labels: ['Mars 25', 'Juin 25', 'Sept 25', 'Déc 25', 'Mars 26'], datasets: [
            { data: [6800, 8200, 9100, 10500, 12546], borderColor: FC.blue, fill: false, tension: 0.4, pointRadius: 3, pointHoverRadius: 8, borderWidth: 2, pointBackgroundColor: FC.blue }
        ]}, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: '#F3F3F3' }, border: { color: '#939393' }, ticks: { font: { size: 10 }, color: '#2E2E2E' } }, x: { grid: { display: false }, border: { color: '#939393' }, ticks: { font: { size: 10 }, color: '#2E2E2E' } } } } });
    }

    initAgentCharts() {
        const FC = this.FC;
        this.newChart('agentVolumeChart', { type: 'bar', data: { labels: ['Sandrine', 'Laurent', 'Antoine', 'Julia', 'David'], datasets: [
            { label: 'Assigné', data: [180, 140, 160, 120, 100], backgroundColor: FC.blue, barPercentage: 0.6 },
            { label: 'Réassigné', data: [120, 90, 110, 85, 75], backgroundColor: FC.pink, barPercentage: 0.6 }
        ]}, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', font: { size: 11 }, boxWidth: 8, padding: 12 } } }, scales: { x: { stacked: true, display: false }, y: { stacked: true, grid: { display: false }, border: { color: '#939393' }, ticks: { font: { size: 11 }, color: '#2E2E2E' } } } } });

        this.newChart('agentWorkItemChart', { type: 'bar', data: { labels: ['Sandrine', 'Laurent', 'Antoine', 'Julia'], datasets: [
            { data: [10600, 6200, 5100, 2700], backgroundColor: FC.blue, borderRadius: 3, barPercentage: 0.5 }
        ]}, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: '#F3F3F3' }, border: { color: '#939393' }, ticks: { font: { size: 10 }, color: '#2E2E2E', callback: (v) => v >= 1000 ? (v / 1000) + 'k' : v } }, y: { grid: { display: false }, border: { color: '#939393' }, ticks: { font: { size: 11 }, color: '#2E2E2E' } } } } });
    }

    initKbCharts() {
        const FC = this.FC;
        this.newChart('kbInteractionsChart', { type: 'bar', data: { labels: ['Janvier', 'Février', 'Mars', 'Avril'], datasets: [
            { label: 'Requêtes avec KB', data: [420, 380, 520, 310], backgroundColor: FC.blue, borderRadius: 3, barPercentage: 0.4 },
            { label: 'Requêtes sans KB', data: [280, 320, 480, 250], backgroundColor: FC.pink, borderRadius: 3, barPercentage: 0.4 }
        ]}, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', font: { size: 11 }, boxWidth: 8, padding: 12 } } }, scales: { y: { grid: { color: '#F3F3F3' }, border: { color: '#939393' }, ticks: { font: { size: 10 } } }, x: { grid: { display: false }, border: { color: '#939393' }, ticks: { font: { size: 10 } } } } } });

        this.newChart('avgHandleTimeChart', { type: 'bar', data: { labels: ['Jan S1', 'Jan S2', 'Jan S3', 'Jan S4', 'Fév S1', 'Fév S2', 'Fév S3', 'Fév S4', 'Mars S1', 'Mars S2', 'Mars S3', 'Mars S4', 'Avr S1', 'Avr S2', 'Avr S3', 'Avr S4'], datasets: [
            { label: 'Req. avec PJ', data: [12, 14, 11, 13, 15, 12, 14, 16, 18, 15, 14, 12, 11, 13, 10, 12], backgroundColor: FC.teal, borderRadius: 2, barPercentage: 0.7 },
            { label: 'Req. avec Vues', data: [8, 10, 9, 11, 10, 8, 12, 10, 14, 12, 10, 9, 8, 10, 8, 9], backgroundColor: FC.blue, borderRadius: 2, barPercentage: 0.7 },
            { label: 'Req. Vues+PJ', data: [6, 7, 5, 8, 7, 6, 8, 7, 10, 8, 7, 6, 5, 7, 5, 6], backgroundColor: FC.indigo, borderRadius: 2, barPercentage: 0.7 },
            { label: 'Req. sans PJ', data: [18, 20, 16, 22, 20, 18, 22, 24, 28, 22, 20, 18, 16, 20, 15, 18], backgroundColor: FC.purple, borderRadius: 2, barPercentage: 0.7 },
            { label: 'Req. sans Vues', data: [15, 16, 14, 18, 16, 14, 18, 20, 24, 18, 16, 14, 12, 16, 12, 14], backgroundColor: FC.red, borderRadius: 2, barPercentage: 0.7 }
        ]}, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', font: { size: 9 }, boxWidth: 6, padding: 8 } } }, scales: { y: { grid: { color: '#F3F3F3' }, border: { color: '#939393' }, ticks: { font: { size: 9 } } }, x: { grid: { display: false }, border: { color: '#939393' }, ticks: { font: { size: 8 }, maxRotation: 0 } } } } });

        this.newChart('engagementTrendChart', { type: 'line', data: { labels: ['Janvier', 'Février', 'Mars', 'Avril'], datasets: [
            { label: 'Engagements', data: [4200, 4800, 6200, 5800], borderColor: FC.blue, fill: false, tension: 0.4, pointRadius: 4, pointHoverRadius: 7, borderWidth: 2, pointBackgroundColor: FC.blue },
            { label: 'Pièces Jointes', data: [1800, 2200, 3100, 2600], borderColor: FC.teal, fill: false, tension: 0.4, pointRadius: 4, pointHoverRadius: 7, borderWidth: 2, pointBackgroundColor: FC.teal }
        ]}, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', font: { size: 11 }, boxWidth: 8, padding: 12 } } }, scales: { y: { grid: { color: '#F3F3F3' }, border: { color: '#939393' }, ticks: { font: { size: 10 } } }, x: { grid: { display: false }, border: { color: '#939393' }, ticks: { font: { size: 10 } } } } } });

        this.newChart('userTypeChart', { type: 'doughnut', data: { labels: ['Service Rep Niv 1', 'Service Rep Niv 2', 'Superviseur', 'Finance'], datasets: [{ data: [45, 30, 15, 10], backgroundColor: [FC.blue, FC.teal, FC.purple, FC.pink], hoverOffset: 6 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '55%', plugins: { legend: { position: 'right', labels: { usePointStyle: true, pointStyle: 'circle', font: { size: 10 }, boxWidth: 8, padding: 6 } } } } });

        this.newChart('contextChart', { type: 'doughnut', data: { labels: ['Portail', 'Console', 'Agentforce', 'Service Assistant'], datasets: [{ data: [38, 30, 20, 12], backgroundColor: [FC.blue, FC.teal, FC.purple, FC.pink], hoverOffset: 6 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '55%', plugins: { legend: { position: 'right', labels: { usePointStyle: true, pointStyle: 'circle', font: { size: 10 }, boxWidth: 8, padding: 4 } } } } });

        this.newChart('categoryChart', { type: 'bar', data: { labels: ['Annulation vol', 'Bagage perdu', 'Échange de vol', 'Assurance annulation', 'Remboursement'], datasets: [{ data: [732, 580, 465, 312, 198], backgroundColor: FC.blue, borderRadius: 3, barPercentage: 0.5 }] }, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: '#F3F3F3' }, border: { color: '#939393' }, ticks: { font: { size: 9 } } }, y: { grid: { display: false }, border: { color: '#939393' }, ticks: { font: { size: 10 } } } } } });
    }

    initCsiCharts() {
        const FC = this.FC;
        this.newChart('csiSentimentDonut', { type: 'doughnut', data: { labels: ['Neutre', 'Mixte', 'Positif', 'Négatif'], datasets: [{ data: [18, 18, 46, 18], backgroundColor: [FC.blue, FC.purple, FC.teal, FC.pink], hoverOffset: 6 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '55%', plugins: { legend: { position: 'right', labels: { usePointStyle: true, pointStyle: 'circle', font: { size: 11 }, boxWidth: 8, padding: 8 } }, tooltip: { callbacks: { label: (c) => ' ' + c.label + ': ' + c.raw + '%' } } } } });

        const clusterData = {
            'Clusters': { labels: ['Réclamations Annulation', 'Bagages Endommagés', 'Inscriptions Club Voyageur', 'Expérience Vol', 'Problèmes Surréservation'], datasets: [{ label: 'Neutre', data: [180, 170, 150, 80, 70] }, { label: 'Mixte', data: [160, 180, 140, 70, 50] }, { label: 'Positif', data: [280, 430, 120, 80, 80] }, { label: 'Négatif', data: [300, 70, 150, 90, 50] }] },
            'Motifs Contact': { labels: ['Vol annulé', 'Remboursement', 'Modification billet', 'Info correspondance', 'Réclamation bagage'], datasets: [{ label: 'Neutre', data: [90, 140, 200, 160, 60] }, { label: 'Mixte', data: [80, 100, 130, 90, 70] }, { label: 'Positif', data: [120, 80, 310, 200, 40] }, { label: 'Négatif', data: [410, 230, 60, 50, 180] }] },
            'Produit': { labels: ['Siège Affaires', 'Siège Économique', 'Programme Miles', 'Application mobile', 'Lounge accès'], datasets: [{ label: 'Neutre', data: [110, 200, 130, 90, 140] }, { label: 'Mixte', data: [70, 120, 80, 110, 60] }, { label: 'Positif', data: [320, 180, 240, 130, 290] }, { label: 'Négatif', data: [80, 260, 90, 210, 60] }] },
            'Entité': { labels: ['Équipe sol JFK', 'Équipe sol LGA', 'Service client tél.', 'Agentforce IA', 'Comptoir enregistrement'], datasets: [{ label: 'Neutre', data: [60, 80, 190, 220, 100] }, { label: 'Mixte', data: [50, 60, 140, 80, 90] }, { label: 'Positif', data: [70, 50, 280, 340, 160] }, { label: 'Négatif', data: [280, 340, 100, 40, 210] }] },
            'Expression Clé': { labels: ['Retard inacceptable', 'Remboursement rapide', 'Personnel aimable', 'Application lente', 'Bagage introuvable'], datasets: [{ label: 'Neutre', data: [30, 120, 80, 150, 40] }, { label: 'Mixte', data: [40, 60, 50, 90, 30] }, { label: 'Positif', data: [20, 310, 420, 60, 25] }, { label: 'Négatif', data: [520, 30, 40, 280, 430] }] }
        };
        const clusterColors = [FC.blue, FC.purple, FC.teal, FC.pink];
        const buildClusterDatasets = (view) => clusterData[view].datasets.map((ds, i) => ({ label: ds.label, data: ds.data, backgroundColor: clusterColors[i], barPercentage: 0.7, categoryPercentage: 0.85 }));
        // eslint-disable-next-line no-undef
        const csiClustersCtx = this.getCanvas('csiClustersChart');
        if (csiClustersCtx) {
            // eslint-disable-next-line no-undef
            const clusterChart = new Chart(csiClustersCtx, { type: 'bar', data: { labels: clusterData['Clusters'].labels, datasets: buildClusterDatasets('Clusters') }, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, animation: { duration: 500 }, plugins: { legend: { position: 'top', align: 'end', labels: { usePointStyle: true, pointStyle: 'circle', font: { size: 11 }, boxWidth: 8, padding: 12 } } }, scales: { x: { stacked: true, grid: { color: '#F3F3F3' }, border: { color: '#939393' }, ticks: { font: { size: 9 } } }, y: { stacked: true, grid: { display: false }, border: { color: '#939393' }, ticks: { font: { size: 10 }, color: '#2E2E2E' } } } } });
            this.template.querySelectorAll('.cluster-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    this.template.querySelectorAll('.cluster-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    const view = tab.textContent.trim();
                    if (clusterData[view]) {
                        clusterChart.data.labels = clusterData[view].labels;
                        clusterChart.data.datasets = buildClusterDatasets(view);
                        clusterChart.update();
                    }
                });
            });
        }
    }

    initKiCharts() {
        const FC = this.FC;
        this.newChart('kiSentimentDonut', { type: 'doughnut', data: { labels: ['FAQ', 'Procédure', 'Politique', 'Vidéo Tutoriel'], datasets: [{ data: [22, 38, 28, 12], backgroundColor: [FC.teal, FC.blue, FC.purple, FC.pink], hoverOffset: 6 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '55%', plugins: { legend: { position: 'right', labels: { usePointStyle: true, pointStyle: 'circle', font: { size: 11 }, boxWidth: 8, padding: 8 } }, tooltip: { callbacks: { label: (c) => ' ' + c.label + ': ' + c.raw + '%' } } } } });

        const kiData = {
            'Thèmes KB': { labels: ['Annulation vol', 'Remboursement', 'Bagage perdu', 'Compensation retard', 'Modification billet'], datasets: [{ label: 'Utile', data: [120, 180, 160, 90, 310] }, { label: 'Partiellement utile', data: [80, 90, 100, 60, 140] }, { label: 'Pas utile', data: [580, 420, 340, 490, 85] }, { label: 'Aucune réponse', data: [410, 280, 250, 380, 60] }] },
            'Catégorie Article': { labels: ['Opérationnel', 'Tarifaire', 'Réglementaire', 'Commercial', 'Technique'], datasets: [{ label: 'Utile', data: [280, 200, 90, 340, 180] }, { label: 'Partiellement utile', data: [120, 80, 60, 100, 90] }, { label: 'Pas utile', data: [160, 280, 510, 120, 200] }, { label: 'Aucune réponse', data: [80, 200, 420, 60, 140] }] },
            'Type de Contenu': { labels: ['Article texte', 'Vidéo tutoriel', 'Infographie', 'FAQ', 'Chatbot flow'], datasets: [{ label: 'Utile', data: [340, 480, 290, 380, 210] }, { label: 'Partiellement utile', data: [140, 80, 120, 100, 80] }, { label: 'Pas utile', data: [280, 60, 180, 120, 320] }, { label: 'Aucune réponse', data: [200, 30, 100, 80, 260] }] },
            "Canal d'Accès": { labels: ['Portail self-service', 'Agentforce IA', 'Console Agent', 'Application mobile', 'Email lien KB'], datasets: [{ label: 'Utile', data: [420, 580, 280, 340, 160] }, { label: 'Partiellement utile', data: [180, 90, 120, 100, 80] }, { label: 'Pas utile', data: [220, 60, 260, 280, 340] }, { label: 'Aucune réponse', data: [140, 30, 180, 200, 280] }] }
        };
        const kiColors = [FC.teal, FC.blue, FC.red, FC.purple];
        const buildKiDatasets = (view) => kiData[view].datasets.map((ds, i) => ({ label: ds.label, data: ds.data, backgroundColor: kiColors[i], barPercentage: 0.7, categoryPercentage: 0.85 }));
        const kiClustersCtx = this.getCanvas('kiClustersChart');
        if (kiClustersCtx) {
            // eslint-disable-next-line no-undef
            const kiChart = new Chart(kiClustersCtx, { type: 'bar', data: { labels: kiData['Thèmes KB'].labels, datasets: buildKiDatasets('Thèmes KB') }, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, animation: { duration: 500 }, plugins: { legend: { position: 'top', align: 'end', labels: { usePointStyle: true, pointStyle: 'circle', font: { size: 11 }, boxWidth: 8, padding: 12 } } }, scales: { x: { stacked: true, grid: { color: '#F3F3F3' }, border: { color: '#939393' }, ticks: { font: { size: 9 } } }, y: { stacked: true, grid: { display: false }, border: { color: '#939393' }, ticks: { font: { size: 10 }, color: '#2E2E2E' } } } } });
            this.template.querySelectorAll('.ki-cluster-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    this.template.querySelectorAll('.ki-cluster-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    const view = tab.textContent.trim();
                    if (kiData[view]) {
                        kiChart.data.labels = kiData[view].labels;
                        kiChart.data.datasets = buildKiDatasets(view);
                        kiChart.update();
                    }
                });
            });
        }
    }

    initCriCharts() {
        const neg = '#FE5C4C', mix = '#FE8F1D', pos = '#06A59A';
        const criLabels = ['Annulation vol', 'Remboursement billet', 'Bagage perdu/retardé', 'Modif. réservation', 'Indemnisation retard'];

        this.newChart('criKbChart', { type: 'bar', data: { labels: criLabels, datasets: [
            { label: 'Négatif', data: [58, 52, 61, 35, 64], backgroundColor: neg, barPercentage: 0.65, categoryPercentage: 0.85 },
            { label: 'Mixte', data: [28, 31, 25, 38, 24], backgroundColor: mix, barPercentage: 0.65, categoryPercentage: 0.85 },
            { label: 'Positif', data: [14, 17, 14, 27, 12], backgroundColor: pos, barPercentage: 0.65, categoryPercentage: 0.85 }
        ]}, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ' ' + c.dataset.label + ': ' + c.raw + '%' } } }, scales: { x: { stacked: true, display: false, max: 100 }, y: { stacked: true, grid: { display: false }, border: { color: '#939393' }, ticks: { font: { size: 10 }, color: '#2E2E2E' } } } } });

        this.newChart('criVolChart', { type: 'bar', data: { labels: criLabels, datasets: [
            { label: 'Négatif', data: [2790, 1685, 1330, 578, 627], backgroundColor: neg, barPercentage: 0.65, categoryPercentage: 0.85 },
            { label: 'Mixte', data: [1350, 1004, 545, 627, 235], backgroundColor: mix, barPercentage: 0.65, categoryPercentage: 0.85 },
            { label: 'Positif', data: [672, 551, 305, 445, 118], backgroundColor: pos, barPercentage: 0.65, categoryPercentage: 0.85 }
        ]}, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ' ' + c.dataset.label + ': ' + c.raw.toLocaleString('fr-FR') } } }, scales: { x: { stacked: true, grid: { color: '#F3F3F3' }, border: { color: '#939393' }, ticks: { font: { size: 9 }, callback: (v) => v >= 1000 ? (v / 1000) + 'k' : v } }, y: { stacked: true, grid: { display: false }, border: { color: '#939393' }, ticks: { font: { size: 10 }, color: '#2E2E2E' } } } } });

        this.newChart('criBubbleChart', { type: 'bubble', data: { datasets: [
            { label: 'Annulation vol', data: [{ x: 4812, y: 22, r: 32 }], backgroundColor: 'rgba(6,165,154,0.75)', borderColor: '#06A59A', borderWidth: 1.5 },
            { label: 'Remboursement billet', data: [{ x: 3240, y: 38, r: 24 }], backgroundColor: 'rgba(73,146,254,0.75)', borderColor: '#4992FE', borderWidth: 1.5 },
            { label: 'Bagage perdu/retardé', data: [{ x: 2180, y: 15, r: 18 }], backgroundColor: 'rgba(186,1,255,0.75)', borderColor: '#BA01FF', borderWidth: 1.5 },
            { label: 'Modification réservation', data: [{ x: 1650, y: 71, r: 14 }], backgroundColor: 'rgba(254,143,29,0.75)', borderColor: '#FE8F1D', borderWidth: 1.5 },
            { label: 'Indemnisation retard', data: [{ x: 4600, y: 20, r: 40 }], backgroundColor: 'rgba(254,92,76,0.75)', borderColor: '#FE5C4C', borderWidth: 1.5 }
        ]}, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => c.dataset.label + ' — Vol: ' + c.parsed.x.toLocaleString('fr-FR') + ' | Score KB: ' + c.parsed.y } } }, scales: { y: { title: { display: true, text: 'Score Couverture KB', font: { size: 10 }, color: '#5C5C5C' }, min: 0, max: 100, grid: { color: '#F3F3F3' }, border: { color: '#939393' }, ticks: { font: { size: 9 } } }, x: { title: { display: true, text: 'Volume', font: { size: 10 }, color: '#5C5C5C' }, min: 0, max: 5500, grid: { color: '#F3F3F3' }, border: { color: '#939393' }, ticks: { font: { size: 9 }, callback: (v) => v >= 1000 ? (v / 1000) + 'k' : v } } } } });
    }

    /* ---- Counter Animations ---- */
    initCounterAnimations() {
        const els = this.template.querySelectorAll('[data-target]');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        els.forEach(el => observer.observe(el));
    }

    animateCounter(el) {
        const target = parseFloat(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        const isDecimal = el.dataset.decimal === 'true';
        const duration = 1000;
        const start = performance.now();
        const update = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = target * eased;
            if (isDecimal) el.textContent = current.toFixed(2) + suffix;
            else if (target >= 1000) el.textContent = Math.round(current).toLocaleString('fr-FR') + suffix;
            else el.textContent = Math.round(current) + suffix;
            if (progress < 1) requestAnimationFrame(update);
            else {
                if (isDecimal) el.textContent = target.toFixed(2) + suffix;
                else if (target >= 1000) el.textContent = Math.round(target).toLocaleString('fr-FR') + suffix;
                else el.textContent = Math.round(target) + suffix;
            }
        };
        requestAnimationFrame(update);
    }

    /* ---- Agentforce Panel ---- */
    openAgentforcePanel() {
        this.afPanelOpen = true;
        if (!this.afGreeted) {
            this.afGreeted = true;
            setTimeout(() => this.afAddAI('Bonjour, comment puis-je vous aider à modifier l\'article <strong>"Condition d\'indemnisation exclusives pour les perturbations météorologiques"</strong> ?'), 300);
        }
    }

    closeAgentforcePanel() { this.afPanelOpen = false; }

    afAddUser(text) {
        const msgs = this.template.querySelector('#afMessages');
        if (!msgs) return;
        const el = document.createElement('div');
        el.className = 'af-msg af-msg-user';
        el.textContent = text;
        msgs.appendChild(el);
        msgs.scrollTop = msgs.scrollHeight;
    }

    afAddAI(html) {
        const msgs = this.template.querySelector('#afMessages');
        if (!msgs) return;
        const row = document.createElement('div');
        row.className = 'af-msg-row af-msg-row-ai';
        row.innerHTML = AF_AVATAR_SVG + '<div class="af-msg af-msg-ai">' + html + '</div>';
        msgs.appendChild(row);
        msgs.scrollTop = msgs.scrollHeight;
    }

    afShowTyping() {
        const msgs = this.template.querySelector('#afMessages');
        if (!msgs) return;
        const row = document.createElement('div');
        row.id = 'afTyping';
        row.className = 'af-msg-row af-msg-row-ai';
        row.innerHTML = AF_AVATAR_SVG + '<div class="af-msg af-msg-ai af-typing"><span></span><span></span><span></span></div>';
        msgs.appendChild(row);
        msgs.scrollTop = msgs.scrollHeight;
    }

    afRemoveTyping() {
        const el = this.template.querySelector('#afTyping');
        if (el) el.remove();
    }

    handleAfSend() {
        const input = this.template.querySelector('#afInput');
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;
        this.afAddUser(text);
        input.value = '';
        this.afShowTyping();
        setTimeout(() => {
            this.afRemoveTyping();
            this.afAddAI('Très bien, je procède à la création d\'une nouvelle version de l\'article au statut brouillon.');
            this.afShowTyping();
            setTimeout(() => {
                this.afRemoveTyping();
                this.afAddAI('C\'est fait, le brouillon est disponible <a href="#" class="af-link">ici</a>.');
            }, 1800);
        }, 1500);
    }

    handleAfKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.handleAfSend();
        }
    }
}