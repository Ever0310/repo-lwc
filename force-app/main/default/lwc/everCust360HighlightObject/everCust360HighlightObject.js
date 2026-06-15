import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';

const Account_RECORD_FIELDS = ['Account.PersonContactId'];
const Case_RECORD_FIELDS = ['Case.ContactId'];
const LiveChatTranscript_RECORD_FIELDS = ['LiveChatTranscript.ContactId'];
const MessagingSession_RECORD_FIELDS = ['MessagingSession.EndUserContactId'];
const VoiceCall_RECORD_FIELDS = ['VoiceCall.RelatedRecordId', 'VoiceCall.Contact__c'];
const WorkOrder_RECORD_FIELDS = ['WorkOrder.ContactId'];

export default class EverCust360HighlightObject extends LightningElement {
    @api recordId;
    @api objectApiName;
    @api flexipageRegionWidth;
    @api cardBorderRadius;
    @api custombackgroundImageUrl;
    @api collapseButtonBackgroundColor;
    @api backgroundTemplate = '';
    @api hueRotation = 0;
    @api showTitle = false;
    @api collapsed = false;
    @api displayCsatIcon = false;
    @api displayAccountName = false;
    @api accountType = 'Company';
    @api displayContactCard = 'inline';
    @api hideContactDescription = false;
    @api metricMultipleRows = false;
    @api backgroundMetricColor = '';
    @api metric1icon;
    @api metric1iconsize;
    @api metric1label;
    @api metric1value;
    @api metric2icon;
    @api metric2iconsize;
    @api metric2label;
    @api metric2value;
    @api metric3icon;
    @api metric3iconsize;
    @api metric3label;
    @api metric3value;
    @api displaycaseoverview = false;
    @api caseoverviewicon;
    @api displayworkorderoverview = false;
    @api workorderoverviewicon;
    @api displayCsat = false;
    @api csatlabel;
    @api csatminvalue = 0;
    @api csatmaxvalue = 5;
    @api displayNps = false;
    @api npslabel;
    @api npsminvalue = -100;
    @api npsmaxvalue = 100;
    @api displayChurnRisk = false;
    @api churnRiskIcon;
    @api churnRiskLabel;
    @api churnRiskColor;
    @api churnThreshold1;
    @api churnThreshold2;
    @api churnRiskHighlyActive;
    @api churnRiskMediumActive;
    @api churnRiskLowActive;

    @wire(getRecord, { recordId: '$recordId', fields: Account_RECORD_FIELDS }) accountRecord
    @wire(getRecord, { recordId: '$recordId', fields: Case_RECORD_FIELDS }) caseRecord
    @wire(getRecord, { recordId: '$recordId', fields: LiveChatTranscript_RECORD_FIELDS }) liveChatTranscriptRecord
    @wire(getRecord, { recordId: '$recordId', fields: MessagingSession_RECORD_FIELDS }) messagingSessionRecord
    @wire(getRecord, { recordId: '$recordId', fields: VoiceCall_RECORD_FIELDS }) voiceCallRecord
    @wire(getRecord, { recordId: '$recordId', fields: WorkOrder_RECORD_FIELDS }) workOrderRecord

    get isData() {
        if (this.objectApiName == 'Account') return this.accountRecord.data;
        if (this.objectApiName == 'Case') return this.caseRecord.data;
        if (this.objectApiName == 'Contact') return this.recordId;
        if (this.objectApiName == 'LiveChatTranscript') return this.liveChatTranscriptRecord.data;
        if (this.objectApiName == 'MessagingSession') return this.messagingSessionRecord.data;
        if (this.objectApiName == 'VoiceCall') return this.voiceCallRecord.data;
        if (this.objectApiName == 'WorkOrder') return this.workOrderRecord.data;
        return false;
    }

    get isError() {
        if (this.objectApiName == 'Account') return this.accountRecord.error;
        if (this.objectApiName == 'Case') return this.caseRecord.error;
        if (this.objectApiName == 'Contact') return false;
        if (this.objectApiName == 'LiveChatTranscript') return this.liveChatTranscriptRecord.error;
        if (this.objectApiName == 'MessagingSession') return this.messagingSessionRecord.error;
        if (this.objectApiName == 'VoiceCall') return this.voiceCallRecord.error;
        if (this.objectApiName == 'WorkOrder') return this.workOrderRecord.error;
        return false;
    }

    get contactId() {
        if (this.objectApiName == 'Account') return this.accountRecord.data.fields.PersonContactId.value;
        if (this.objectApiName == 'Case') return this.caseRecord.data.fields.ContactId.value;
        if (this.objectApiName == 'Contact') return this.recordId;
        if (this.objectApiName == 'LiveChatTranscript') return this.liveChatTranscriptRecord.data.fields.ContactId.value;
        if (this.objectApiName == 'MessagingSession') return this.messagingSessionRecord.data.fields.EndUserContactId.value;
        if (this.objectApiName == 'VoiceCall') return this.voiceCallRecord.data.fields.Contact__c.value;
        if (this.objectApiName == 'WorkOrder') return this.workOrderRecord.data.fields.ContactId.value;
        return false;
    }

    get errorMessage() {
        if (this.objectApiName == 'Account') return this.accountRecord.error;
        if (this.objectApiName == 'Case') return this.caseRecord.error;
        if (this.objectApiName == 'Contact') return 'error on contact';
        if (this.objectApiName == 'LiveChatTranscript') return this.liveChatTranscriptRecord.error;
        if (this.objectApiName == 'MessagingSession') return this.messagingSessionRecord.error;
        if (this.objectApiName == 'VoiceCall') return this.voiceCallRecord.error;
        if (this.objectApiName == 'WorkOrder') return this.workOrderRecord.error;
        return false;
    }
}
