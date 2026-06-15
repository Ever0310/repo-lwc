import { LightningElement, api } from 'lwc';

/**
 * Carte « Résumé d'article » pour Experience Cloud (portail).
 * Les boutons et le vote peuvent être branchés via les propriétés @api ou les événements personnalisés.
 */
export default class ArticleResumeCard extends LightningElement {
    /** URL optionnelle pour « Ouvrir un ticket » (navigation pleine page si renseignée). */
    @api ticketUrl;

    /** URL optionnelle pour « Analyser mon rendement ». */
    @api analyzeUrl;

    /** Texte du corps (modifiable depuis App Builder si besoin). */
    @api bodyText =
        "Le VoltBrain 5000 optimise votre solaire via le Rapid MPPT Scanning, ajustant le voltage toutes les 500 ms. Si le voyant clignote orange, patientez deux minutes de synchronisation. En cas d'arrêt au soleil, vérifiez le disjoncteur DC/AC. Malgré cette technologie, des obstacles fixes peuvent nécessiter l'ajout d'optimiseurs de puissance.";

    handleThumbUp() {
        this.dispatchEvent(
            new CustomEvent('feedback', {
                detail: { value: 'up' },
                bubbles: true,
                composed: true
            })
        );
    }

    handleThumbDown() {
        this.dispatchEvent(
            new CustomEvent('feedback', {
                detail: { value: 'down' },
                bubbles: true,
                composed: true
            })
        );
    }

    handleOpenTicket() {
        if (this.ticketUrl) {
            window.location.assign(this.ticketUrl);
            return;
        }
        this.dispatchEvent(
            new CustomEvent('openticket', {
                bubbles: true,
                composed: true
            })
        );
    }

    handleAnalyze() {
        if (this.analyzeUrl) {
            window.location.assign(this.analyzeUrl);
            return;
        }
        this.dispatchEvent(
            new CustomEvent('analyzerendement', {
                bubbles: true,
                composed: true
            })
        );
    }
}
