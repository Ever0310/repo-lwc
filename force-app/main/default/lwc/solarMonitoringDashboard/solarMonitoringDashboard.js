import { LightningElement } from 'lwc';

const GAUGE_MIN = 58;
const GAUGE_MAX = 68;
const GAUGE_SCALE_MIN = 50;
const GAUGE_SCALE_MAX = 80;
const GAUGE_CX = 100;
const GAUGE_CY = 100;
const GAUGE_R = 80;
const UPDATE_INTERVAL_MS = 1000;

export default class SolarMonitoringDashboard extends LightningElement {
    _gaugeValue = 63;
    _gaugeIntervalId;

    get gaugeValue() {
        return Math.round(this._gaugeValue);
    }

    get gaugeArcPath() {
        const v = Math.min(GAUGE_SCALE_MAX, Math.max(GAUGE_SCALE_MIN, this._gaugeValue));
        const angleRad = Math.PI - ((v - GAUGE_SCALE_MIN) / (GAUGE_SCALE_MAX - GAUGE_SCALE_MIN)) * Math.PI;
        const x = GAUGE_CX + GAUGE_R * Math.cos(angleRad);
        const y = GAUGE_CY - GAUGE_R * Math.sin(angleRad);
        return `M 20 100 A ${GAUGE_R} ${GAUGE_R} 0 0 0 ${x.toFixed(2)} ${y.toFixed(2)}`;
    }

    connectedCallback() {
        this._gaugeValue = GAUGE_MIN + Math.random() * (GAUGE_MAX - GAUGE_MIN);
        this._gaugeIntervalId = setInterval(() => {
            const delta = (Math.random() - 0.5) * 4;
            this._gaugeValue = Math.min(GAUGE_MAX, Math.max(GAUGE_MIN, this._gaugeValue + delta));
        }, UPDATE_INTERVAL_MS);
    }

    disconnectedCallback() {
        if (this._gaugeIntervalId) {
            clearInterval(this._gaugeIntervalId);
        }
    }

    handleDiagnostic() {
        // Événement personnalisé pour que la page ou un parent puisse réagir (flow, navigation, etc.)
        this.dispatchEvent(new CustomEvent('diagnostic', { bubbles: true, composed: true }));
    }
}
