import { LightningElement, api, wire } from "lwc";
import { CurrentPageReference } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import DRIVER_PHOTO from "@salesforce/resourceUrl/Driver1";

/** Case record page copy (demo). */
const CASE_COPY = {
    headerSubtitle: "Trip linked to this case",
    statusTitle: "In progress",
    statusDetail: "The driver has not confirmed departure.",
    refundButton: "Refund trip",
    refundLoadingAlt: "Processing refund",
    refundDone: "The trip has been refunded."
};

/** Messaging Session page copy (demo). */
const MS_COPY = {
    headerSubtitle: "Trip status for this messaging session",
    cancelPill: "Trip cancelled",
    refundPill: "34€ refunded",
    reduceLabel: "Minimize",
    reduceTitle: "Minimize to route card only",
    expandLabel: "Show all",
    expandTitle: "Show full trip details"
};

/** Static demo data for BlaBlaCar-style demo (replace with fields / Apex as needed). */
const TRIP = {
    routeLabel: "Trip",
    route: "Paris — Bordeaux",
    dateLabel: "Date",
    date: "27 April 2026",
    timeLabel: "Departure time",
    time: "9:00 a.m.",
    pickupLabel: "Pickup location",
    pickup: "Porte de Versailles carpool area",
    driverLabel: "Driver",
    /** Wordplay: “Noah Show” → no-show / questionable reliability. */
    driver: "Noah Show",
    driverAlt: "Driver photo, Noah Show",
    driverBadge: "3,4/5",
    priceLabel: "Trip price",
    price: "€34"
};

export default class BlablacarTripSummaryEn extends LightningElement {
    @api recordId;

    trip = TRIP;

    caseCopy = CASE_COPY;

    msCopy = MS_COPY;

    /** Resolved URL from Static Resource `Driver1`. */
    driverPhotoUrl = DRIVER_PHOTO;

    pageObjectApiName;

    refundLoading = false;

    refunded = false;

    _refundTimer;

    /** Collapsed (Messaging Session only): route card only. */
    msCollapsed = false;

    @wire(CurrentPageReference)
    wiredPageRef(wired) {
        const pageRef = wired?.data !== undefined ? wired.data : wired;
        const attrs = pageRef?.attributes;
        const next = attrs?.objectApiName || attrs?.objectAPIName;
        if (next !== "MessagingSession") {
            this.msCollapsed = false;
        }
        this.pageObjectApiName = next;
    }

    get isCaseRecord() {
        return this.pageObjectApiName === "Case";
    }

    get isMessagingSession() {
        return this.pageObjectApiName === "MessagingSession";
    }

    get headerSubtitleText() {
        if (this.isCaseRecord) {
            return CASE_COPY.headerSubtitle;
        }
        if (this.isMessagingSession) {
            return MS_COPY.headerSubtitle;
        }
        return "Reference trip for this conversation";
    }

    get routeBandAriaLabel() {
        const t = this.trip;
        return `${t.routeLabel} ${t.route}. ${t.priceLabel} ${t.price}.`;
    }

    get highlightCardClass() {
        const base = "bbc-highlight-card";
        return this.isMessagingSession ? `${base} bbc-highlight-card--ms-cancelled` : base;
    }

    get msCompactView() {
        return this.isMessagingSession && this.msCollapsed;
    }

    get showMsReduceButton() {
        return this.isMessagingSession && !this.msCollapsed;
    }

    get showMsExpandButton() {
        return this.isMessagingSession && this.msCollapsed;
    }

    get shellClass() {
        const base = "bbc-shell";
        return this.msCompactView ? `${base} bbc-shell--ms-compact` : base;
    }

    get shellHeadClass() {
        const base = "bbc-shell__head";
        return this.msCompactView ? `${base} bbc-shell__head--ms-compact` : base;
    }

    handleMsToggleCompact() {
        if (!this.isMessagingSession) {
            return;
        }
        this.msCollapsed = !this.msCollapsed;
    }

    handleViewDriver() {
        this.dispatchToast("Driver profile", "Opening profile (demo).", "info");
    }

    handleEditTrip() {
        this.dispatchToast("Trip", "Editing trip (demo).", "info");
    }

    handleContact() {
        this.dispatchToast("Contact", "Contact channel opened (demo).", "success");
    }

    handleOpenPickup() {
        this.dispatchToast("Map", "Pickup location link (demo).", "info");
    }

    handleRefundTrip() {
        if (!this.isCaseRecord || this.refundLoading || this.refunded) {
            return;
        }
        this.refundLoading = true;
        this._refundTimer = window.setTimeout(() => {
            this.refundLoading = false;
            this.refunded = true;
            this._refundTimer = undefined;
        }, 1000);
    }

    disconnectedCallback() {
        if (this._refundTimer) {
            window.clearTimeout(this._refundTimer);
        }
    }

    dispatchToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }
}
