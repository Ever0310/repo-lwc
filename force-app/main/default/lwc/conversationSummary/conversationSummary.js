import { LightningElement, api } from 'lwc';

export default class ConversationSummary extends LightningElement {
    @api recordId;

    // Default content
    summaryText = 'Lauren souhaite modifier sa commander n°00000224 pour y ajouter 10 boîtes de tarama 500g. Cette modification est possible car la commande est toujours en préparation.';
    issueText = 'Modification de commande';

    // State management
    isVisible = true;
    feedbackGiven = null; // 'like', 'dislike', or null

    get likeVariant() {
        return this.feedbackGiven === 'like' ? 'brand' : 'border';
    }

    get dislikeVariant() {
        return this.feedbackGiven === 'dislike' ? 'brand' : 'border';
    }

    handleDismiss(event) {
        event.preventDefault();
        // Hide the component
        this.isVisible = false;
        // Dispatch event to parent component
        this.dispatchEvent(new CustomEvent('dismiss'));
    }

    handleLike() {
        this.feedbackGiven = this.feedbackGiven === 'like' ? null : 'like';
        // You can add logic here to save feedback
        this.dispatchEvent(new CustomEvent('feedback', {
            detail: { type: 'like', active: this.feedbackGiven === 'like' }
        }));
    }

    handleDislike() {
        this.feedbackGiven = this.feedbackGiven === 'dislike' ? null : 'dislike';
        // You can add logic here to save feedback
        this.dispatchEvent(new CustomEvent('feedback', {
            detail: { type: 'dislike', active: this.feedbackGiven === 'dislike' }
        }));
    }
}
