import { LightningElement, api } from 'lwc';

const GAUGE_MIN = 59;
const GAUGE_MAX = 68;
const GAUGE_SCALE_MIN = 50;
const GAUGE_SCALE_MAX = 80;
const GAUGE_CX = 100;
const GAUGE_CY = 100;
const GAUGE_R = 80;

export default class InstalledBaseSummary extends LightningElement {
    /** Valeur affichée sur la jauge (oscille entre 59 et 68 %) */
    _gaugeValue = 63;
    _gaugeIntervalId;

    @api panelCount = 2;
    @api inverterCount = 1;
    /** Rendement initial / configurable (%) — valeur de départ de la jauge avant oscillation */
    @api rendementPercent = 63;

    get gaugeValue() {
        return Math.round(this._gaugeValue);
    }

    /** Arc SVG de la jauge : de 50 % à la valeur actuelle (échelle 50–80 %) */
    get gaugeArcPath() {
        const v = Math.min(GAUGE_SCALE_MAX, Math.max(GAUGE_SCALE_MIN, this._gaugeValue));
        const angleRad = Math.PI - ((v - GAUGE_SCALE_MIN) / (GAUGE_SCALE_MAX - GAUGE_SCALE_MIN)) * Math.PI;
        const x = GAUGE_CX + GAUGE_R * Math.cos(angleRad);
        const y = GAUGE_CY - GAUGE_R * Math.sin(angleRad);
        return `M 20 100 A ${GAUGE_R} ${GAUGE_R} 0 0 0 ${x.toFixed(2)} ${y.toFixed(2)}`;
    }

    connectedCallback() {
        this._gaugeValue = Math.min(GAUGE_MAX, Math.max(GAUGE_MIN, Number(this.rendementPercent) || 63));
        this._gaugeIntervalId = setInterval(() => {
            const delta = (Math.random() - 0.5) * 6;
            this._gaugeValue = Math.min(GAUGE_MAX, Math.max(GAUGE_MIN, this._gaugeValue + delta));
        }, 1500);
    }

    disconnectedCallback() {
        if (this._gaugeIntervalId) {
            clearInterval(this._gaugeIntervalId);
        }
    }
}
