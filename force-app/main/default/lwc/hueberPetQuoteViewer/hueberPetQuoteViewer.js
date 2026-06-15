import { LightningElement, api } from 'lwc';
import { FlowNavigationNextEvent } from 'lightning/flowSupport';

export default class HueberPetQuoteViewer extends LightningElement {
    @api pdfUrl;
    @api htmlUrl;
    @api contentDocumentId;

    get iframeUrl() {
        const base = this.htmlUrl || this.pdfUrl;
        if (!base) return null;
        return base.replace('/apex/HueberPetInsuranceQuote?', '/apex/HueberPetInsuranceQuoteHTML?');
    }

    get hasQuote() {
        return !!this.iframeUrl;
    }

    get downloadUrl() {
        if (this.contentDocumentId) {
            return '/sfc/servlet.shepherd/document/download/' + this.contentDocumentId;
        }
        return this.pdfUrl;
    }

    handleDownload() {
        if (this.downloadUrl) {
            window.open(this.downloadUrl, '_blank');
        }
    }

    handleNext() {
        this.dispatchEvent(new FlowNavigationNextEvent());
    }
}
