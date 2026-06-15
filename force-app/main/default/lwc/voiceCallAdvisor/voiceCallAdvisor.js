import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getAdvice    from '@salesforce/apex/VoiceCallAdvisorController.getAdvice';
import getAlerte    from '@salesforce/apex/VoiceCallAdvisorController.getAlerte';
import getTranscript from '@salesforce/apex/VoiceCallAdvisorController.getTranscript';
import getSummary   from '@salesforce/apex/VoiceCallAdvisorController.getSummary';

const POLL_INTERVAL  = 1000;
const VOICECALL_FIELDS = ['VoiceCall.CallDisposition'];

const BRIEFING_TEXT = 'Jean Philippe est un bon candidat pour l\'assurance Garantie Accidents de la Vie.';
const INITIAL_PITCH = 'Bonjour Jean Philippe, je suis Tania votre conseiller Hueber Assurances. Je vois que vous avez plusieurs assurances chez nous mais il y a un trou dans la raquette : vous ne disposez pas de la Garantie Accidents de la Vie. Est-ce que ce produit peut vous intéresser ?';

export default class VoiceCallAdvisor extends LightningElement {
    @api recordId;

    advice          = INITIAL_PITCH;
    alerte          = null;
    sentiment       = null;
    action          = null;
    actionSent      = false;
    error           = null;
    isLoading       = false;
    summary         = null;
    summaryLoading  = false;
    summaryValidated = false;
    _callEnded      = false;
    _pollTimer      = null;
    _lastTranscript = null;

    briefingText = BRIEFING_TEXT;

    @wire(getRecord, { recordId: '$recordId', fields: VOICECALL_FIELDS })
    wiredVoiceCall({ data }) {
        if (data) {
            const status = data.fields.CallDisposition.value;
            if (status === 'completed' && !this._callEnded) {
                this._callEnded = true;
                this._onCallEnded();
            }
        }
    }

    get callEnded()    { return this._callEnded; }
    get hasAdvice()    { return !this.isLoading && !!this.advice && !this.error; }
    get hasError()     { return !this.isLoading && !!this.error; }
    get hasAlerte()    { return !!this.alerte; }
    get hasSentiment() { return !!this.sentiment; }
    get hasAction()      { return !!this.action; }
    get hasSummary()     { return !!this.summary; }
    get showHelpButton() { return !this.hasAdvice && !this.isLoading; }

    get sentimentLabel() {
        if (this.sentiment === 'Positif') return 'Sentiment positif';
        if (this.sentiment === 'Négatif') return 'Sentiment négatif';
        return 'Sentiment neutre';
    }

    get sentimentClass() {
        if (this.sentiment === 'Positif') return 'sentiment-badge sentiment-positif';
        if (this.sentiment === 'Négatif') return 'sentiment-badge sentiment-negatif';
        return 'sentiment-badge sentiment-neutre';
    }

    get cardTitle() { return 'Conseiller IA'; }

    connectedCallback() {
        this._pollTranscript();
    }

    disconnectedCallback() {
        if (this._pollTimer) clearTimeout(this._pollTimer);
    }

    _onCallEnded() {
        // Arrêter le polling
        if (this._pollTimer) clearTimeout(this._pollTimer);
        // Effacer toutes les sections actives
        this.advice    = null;
        this.alerte    = null;
        this.action    = null;
        this.sentiment = null;
        this.error     = null;
        // Lancer la génération du résumé
        this.summaryLoading = true;
        getSummary({ voiceCallId: this.recordId })
            .then(result => {
                this.summary        = result;
                this.summaryLoading = false;
            })
            .catch(() => {
                this.summary        = 'Impossible de générer le compte rendu.';
                this.summaryLoading = false;
            });
    }

    _pollTranscript() {
        getTranscript({ voiceCallId: this.recordId })
            .then(transcript => {
                if (transcript && transcript !== this._lastTranscript) {
                    this._lastTranscript = transcript;
                    this._analyzeAlerte();
                }
                if (!this._callEnded) this._schedulePoll();
            })
            .catch(() => { if (!this._callEnded) this._schedulePoll(); });
    }

    _schedulePoll() {
        this._pollTimer = setTimeout(() => this._pollTranscript(), POLL_INTERVAL);
    }

    _analyzeAlerte() {
        getAlerte({ voiceCallId: this.recordId })
            .then(result => {
                if (!result) return;
                const lines = result.split('\n').map(l => l.trim()).filter(Boolean);
                let sentimentVal = null, alerteVal = null, actionVal = null;
                for (const line of lines) {
                    if (line.startsWith('SENTIMENT:')) {
                        sentimentVal = line.replace('SENTIMENT:', '').trim();
                    } else if (line.startsWith('ALERTE:')) {
                        const val = line.replace('ALERTE:', '').trim();
                        alerteVal = val === 'AUCUNE_ALERTE' ? null : val;
                    } else if (line.startsWith('ACTION:')) {
                        const val = line.replace('ACTION:', '').trim();
                        actionVal = val === 'AUCUNE_ACTION' ? null : val;
                    }
                }
                this.sentiment = sentimentVal;
                this.alerte    = alerteVal;
                if (!this.action || this.actionSent) {
                    if (actionVal !== this.action) this.actionSent = false;
                    this.action = actionVal;
                }
            })
            .catch(() => {});
    }

    handleAskHelp() {
        this.isLoading = true;
        this.error = null;
        getAdvice({ voiceCallId: this.recordId })
            .then(result => { this.advice = result; this.isLoading = false; })
            .catch(err => { this.error = err?.body?.message ?? 'Une erreur est survenue.'; this.isLoading = false; });
    }

    handlePitchValidate() {
        this.advice = null;
        const toolkit = this.template.querySelector('lightning-service-cloud-voice-toolkit-api');
        if (toolkit) toolkit.mute();
    }

    handleUnmute() {
        const toolkit = this.template.querySelector('lightning-service-cloud-voice-toolkit-api');
        if (toolkit) toolkit.unmute();
    }

    handleSummaryValidate() {
        this.summaryValidated = true;
        this.dispatchEvent(new ShowToastEvent({
            title: 'Compte rendu validé',
            message: 'Le compte rendu de l\'appel a bien été validé.',
            variant: 'success',
            mode: 'dismissable'
        }));
    }

    handleActionSend() {
        this.actionSent = true;
        this.dispatchEvent(new ShowToastEvent({
            title: 'Devis envoyé',
            message: 'Le devis personnalisé Garantie Accidents de la Vie a bien été envoyé à Jean Philippe.',
            variant: 'success',
            mode: 'dismissable'
        }));
    }
}
