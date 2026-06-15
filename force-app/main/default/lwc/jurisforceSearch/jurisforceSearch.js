import { LightningElement, track } from 'lwc';
import search from '@salesforce/apex/JurisforceSearchController.search';

const API_BASE = 'https://massachusetts-divided-conscious-entry.trycloudflare.com';

// 24-char hex IDs used in the RAG corpus
const DECISION_ID_RE = /\b([0-9a-f]{24})\b/g;

export default class JurisforceSearch extends LightningElement {
    @track question = '';
    @track isLoading = false;
    @track hasResult = false;
    @track hasError = false;
    @track errorMessage = '';

    // Jurisprudence tooltip
    @track tooltipVisible = false;
    @track tooltipLoading = false;
    @track tooltipData = null;
    @track tooltipNotFound = false;
    @track tooltipX = 0;
    @track tooltipY = 0;
    @track texteVisible = false;

    // Article tooltip
    @track articleTooltipVisible = false;
    @track articleTooltipLoading = false;
    @track articleTooltipData = null;
    @track articleTooltipNotFound = false;
    @track articleTooltipX = 0;
    @track articleTooltipY = 0;

    _detailCache = {};
    _articleCache = {};

    handleQuestionChange(evt) {
        this.question = evt.target.value;
    }

    async handleSearch() {
        const q = (this.question || '').trim();
        if (!q) return;

        this.isLoading = true;
        this.hasResult = false;
        this.hasError = false;
        this.errorMessage = '';
        this.tooltipVisible = false;
        this.articleTooltipVisible = false;

        try {
            const raw = await search({ question: q });
            this._renderResult(raw || '');
            this.hasResult = true;
        } catch (err) {
            this.hasError = true;
            this.errorMessage =
                (err && err.body && err.body.message) ? err.body.message : 'Une erreur est survenue.';
        } finally {
            this.isLoading = false;
        }
    }

    _renderResult(text) {
        const idStyle = 'color:#0070d2;background:#e8f4fd;border:1px solid #b0d4f1;border-radius:4px;padding:1px 5px;font-family:monospace;font-size:0.82em;cursor:pointer;display:inline-block;';
        const artStyle = 'color:#1b6b3a;background:#e6f4ec;border:1px solid #a3d7b4;border-radius:4px;padding:1px 5px;font-size:0.85em;cursor:pointer;';

        const CODE_RE = /code\s+(civil|p[eé]nal|de\s+proc[eé]dure\s+civile|de\s+proc[eé]dure\s+p[eé]nale)/i;
        const CODE_MAP = {
            'civil': 'Code civil',
            'pénal': 'Code pénal', 'penal': 'Code pénal',
            'de procédure civile': 'Code de procédure civile',
            'de procedure civile': 'Code de procédure civile',
            'de procédure pénale': 'Code de procédure pénale',
            'de procedure penale': 'Code de procédure pénale',
        };

        // Work on raw text to preserve accents for regex matching,
        // then escape each segment individually before injecting into HTML.
        // Strategy: collect all replacements with their positions, sort, rebuild.
        const replacements = []; // {start, end, html}

        // 1. Decision IDs
        let m;
        const decRe = /\b([0-9a-f]{24})\b/g;
        while ((m = decRe.exec(text)) !== null) {
            const id = m[1];
            replacements.push({
                start: m.index, end: m.index + m[0].length,
                html: `<span class="jf-decision-id" style="${idStyle}" data-id="${id}">${id}</span>`
            });
        }

        // 2. Article refs
        const artRe = /\barticles?\s+(?:([LRD])\.\s*)?(\d[\d\-]{0,10})/gi;
        while ((m = artRe.exec(text)) !== null) {
            const prefix = m[1];
            const num = m[2];
            const numero = prefix ? `${prefix.toUpperCase()}${num}` : num;
            const context = text.slice(m.index + m[0].length, m.index + m[0].length + 150);
            const codeMatch = context.match(CODE_RE);
            let nomCode = '';
            if (codeMatch) {
                const key = codeMatch[1].toLowerCase().replace(/\s+/g, ' ');
                nomCode = CODE_MAP[key] || '';
            }
            const displayText = this._escapeHtml(m[0]);
            replacements.push({
                start: m.index, end: m.index + m[0].length,
                html: `<span class="jf-article-ref" style="${artStyle}" data-numero="${numero}" data-code="${nomCode}">${displayText}</span>`
            });
        }

        // Sort by start position, remove overlaps (decision IDs take priority)
        replacements.sort((a, b) => a.start - b.start);
        const filtered = [];
        let lastEnd = 0;
        for (const r of replacements) {
            if (r.start >= lastEnd) {
                filtered.push(r);
                lastEnd = r.end;
            }
        }

        // Rebuild HTML from raw text + replacements
        let html = '';
        let pos = 0;
        for (const r of filtered) {
            html += this._escapeHtml(text.slice(pos, r.start));
            html += r.html;
            pos = r.end;
        }
        html += this._escapeHtml(text.slice(pos));
        html = html.replace(/\n/g, '<br>');

        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
            const el = this.refs.resultText;
            if (!el) return;
            // eslint-disable-next-line @lwc/lwc/no-inner-html
            el.innerHTML = html;
            el.addEventListener('click', this._onResultClick.bind(this));
        }, 0);
    }

    _escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // Single click handler for the result text — dispatches to decision or article
    _onResultClick(evt) {
        const decisionBadge = evt.target.closest && evt.target.closest('.jf-decision-id');
        const articleBadge = evt.target.closest && evt.target.closest('.jf-article-ref');
        // eslint-disable-next-line no-console
        console.log('[JF] click target:', evt.target.tagName, evt.target.className, 'decisionBadge:', !!decisionBadge, 'articleBadge:', !!articleBadge, 'dataset:', JSON.stringify(articleBadge ? articleBadge.dataset : {}));

        if (decisionBadge) {
            evt.stopPropagation();
            this._handleDecisionClick(decisionBadge);
        } else if (articleBadge) {
            evt.stopPropagation();
            this._handleArticleClick(articleBadge);
        }
    }

    _handleDecisionClick(badge) {
        const decisionId = badge.dataset.id;
        const containerEl = this.template.querySelector('.jf-container');
        const containerRect = containerEl.getBoundingClientRect();
        const badgeRect = badge.getBoundingClientRect();

        // Toggle off if same decision already open
        if (this.tooltipVisible && !this.tooltipLoading && this.tooltipData && this.tooltipData.decisionId === decisionId) {
            this.tooltipVisible = false;
            return;
        }

        this.articleTooltipVisible = false;
        this.tooltipX = badgeRect.left - containerRect.left;
        this.tooltipY = badgeRect.bottom - containerRect.top + 6;
        this.tooltipVisible = true;
        this.tooltipLoading = true;
        this.tooltipData = null;
        this.tooltipNotFound = false;
        this.texteVisible = false;
        this._loadDetail(decisionId);
    }

    _handleArticleClick(badge) {
        const numero = badge.dataset.numero;
        const nomCode = badge.dataset.code || '';
        const containerEl = this.template.querySelector('.jf-container');
        const containerRect = containerEl.getBoundingClientRect();
        const badgeRect = badge.getBoundingClientRect();

        // Toggle off if same article already open
        if (this.articleTooltipVisible && !this.articleTooltipLoading && this.articleTooltipData && this.articleTooltipData.numero === numero) {
            this.articleTooltipVisible = false;
            return;
        }

        this.tooltipVisible = false;
        this.articleTooltipX = badgeRect.left - containerRect.left;
        this.articleTooltipY = badgeRect.bottom - containerRect.top + 6;
        this.articleTooltipVisible = true;
        this.articleTooltipLoading = true;
        this.articleTooltipData = null;
        this.articleTooltipNotFound = false;
        this._loadArticleDetail(numero, nomCode);
    }

    // Close tooltips when clicking outside badges/tooltips
    handleContainerClick(evt) {
        const inTooltip = evt.target.closest && (
            evt.target.closest('.jf-tooltip') ||
            evt.target.closest('.jf-decision-id') ||
            evt.target.closest('.jf-article-ref')
        );
        if (!inTooltip) {
            this.tooltipVisible = false;
            this.articleTooltipVisible = false;
        }
    }

    async _loadDetail(decisionId) {
        if (Object.prototype.hasOwnProperty.call(this._detailCache, decisionId)) {
            this._applyDetail(this._detailCache[decisionId]);
            return;
        }
        try {
            const url = `${API_BASE}/decision/${encodeURIComponent(decisionId)}`;
            const resp = await fetch(url);
            const data = resp.ok ? await resp.json() : null;
            const found = (data && data.found) ? data : null;
            this._detailCache[decisionId] = found;
            this._applyDetail(found);
        } catch (e) {
            this._detailCache[decisionId] = null;
            this._applyDetail(null);
        }
    }

    _applyDetail(data) {
        if (!this.tooltipVisible) return;
        if (!data || !data.found) {
            this.tooltipLoading = false;
            this.tooltipData = null;
            this.tooltipNotFound = true;
        } else {
            this.tooltipLoading = false;
            this.tooltipNotFound = false;
            this.tooltipData = data;
        }
    }

    async _loadArticleDetail(numero, nomCode) {
        if (Object.prototype.hasOwnProperty.call(this._articleCache, numero)) {
            this._applyArticleDetail(this._articleCache[numero]);
            return;
        }
        try {
            const url = `https://massachusetts-divided-conscious-entry.trycloudflare.com/article/${encodeURIComponent(numero)}`;
            // eslint-disable-next-line no-console
            console.log('[JF] article fetch →', url);
            const resp = await fetch(url);
            // eslint-disable-next-line no-console
            console.log('[JF] article fetch status', resp.status);
            const data = resp.ok ? await resp.json() : null;
            // eslint-disable-next-line no-console
            console.log('[JF] article data', JSON.stringify(data));
            const found = (data && data.found) ? data : null;
            this._articleCache[numero] = found;
            this._applyArticleDetail(found);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error('[JF] article fetch error', e);
            this._articleCache[numero] = null;
            this._applyArticleDetail(null);
        }
    }

    _applyArticleDetail(data) {
        if (!this.articleTooltipVisible) return;
        if (!data || !data.found) {
            this.articleTooltipLoading = false;
            this.articleTooltipData = null;
            this.articleTooltipNotFound = true;
        } else {
            this.articleTooltipLoading = false;
            this.articleTooltipNotFound = false;
            this.articleTooltipData = data;
        }
    }

    handleToggleTexte(evt) {
        evt.stopPropagation();
        this.texteVisible = !this.texteVisible;
    }

    get tooltipStyle() {
        return `left:${this.tooltipX}px; top:${this.tooltipY}px;`;
    }

    get articleTooltipStyle() {
        return `left:${this.articleTooltipX}px; top:${this.articleTooltipY}px;`;
    }

    get tooltipHasSommaire() {
        return this.tooltipData && this.tooltipData.sommaire;
    }

    get tooltipNoSommaire() {
        return this.tooltipData && !this.tooltipData.sommaire;
    }

    get texteToggleLabel() {
        return this.texteVisible ? '▲ Réduire' : '▼ Voir tout';
    }

    get texteClass() {
        return this.texteVisible
            ? 'jf-tooltip-texte jf-tooltip-texte-open'
            : 'jf-tooltip-texte jf-tooltip-texte-collapsed';
    }
}
