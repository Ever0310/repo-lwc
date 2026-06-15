import { LightningElement, track } from 'lwc';
import kerastaseLogo from '@salesforce/resourceUrl/kerastaseLogoImg';
import kerastaseHeroBg from '@salesforce/resourceUrl/kerastaseHeroBg';
import ksUserJC from '@salesforce/resourceUrl/JC';
import ksBainDeForce from '@salesforce/resourceUrl/ksBainDeForce';
import ksConcentreDecalcifiant from '@salesforce/resourceUrl/ksConcentreDecalcifiant';
import ksBainDensite from '@salesforce/resourceUrl/ksBainDensite';
import ksBainDivalent from '@salesforce/resourceUrl/ksBainDivalent';
import ksQuatuorChute from '@salesforce/resourceUrl/ksQuatuorChute';
import ksSerumAntiChute from '@salesforce/resourceUrl/ksSerumAntiChute';
import ksBainPrevention from '@salesforce/resourceUrl/ksBainPrevention';
import ksAgentAvatar from '@salesforce/resourceUrl/ksAgentAvatar';
import ksBainMasse from '@salesforce/resourceUrl/ksBainMasse';
import ksBainMasse3 from '@salesforce/resourceUrl/ksBainMasse3';
import ksBainMasse4 from '@salesforce/resourceUrl/ksBainMasse4';
import ksBainMasse2 from '@salesforce/resourceUrl/ksBainMasse2';
import ksBainPreventionSpec from '@salesforce/resourceUrl/ksBainPreventionSpec';
import ksGallery1 from '@salesforce/resourceUrl/ksGallery1';
import ksGallery2 from '@salesforce/resourceUrl/ksGallery2';
import ksGallery3 from '@salesforce/resourceUrl/ksGallery3';
import ksGallery4 from '@salesforce/resourceUrl/ksGallery4';
import ksResult4Specifique from '@salesforce/resourceUrl/ksResult4Specifique';

const QUALIFICATION_QUESTIONS = [
    {
        id: 'q1',
        text: 'À quelle fréquence lavez-vous vos cheveux ?',
        options: [
            { id: 'a', label: 'Tous les jours' },
            { id: 'b', label: '3 à 4 fois par semaine' },
            { id: 'c', label: '1 à 2 fois par semaine' }
        ]
    },
    {
        id: 'q2',
        text: 'Comment décririez-vous votre type de chute ?',
        options: [
            { id: 'a', label: 'Chute diffuse (répartie sur tout le crâne)' },
            { id: 'b', label: 'Affinement des tempes et du dessus' },
            { id: 'c', label: 'Chute localisée à la couronne' }
        ]
    },
    {
        id: 'q3',
        text: 'Votre cuir chevelu est-il sensible ou irritable ?',
        options: [
            { id: 'a', label: 'Oui, souvent des démangeaisons' },
            { id: 'b', label: 'Parfois, selon les produits' },
            { id: 'c', label: 'Non, cuir chevelu normal' }
        ]
    }
];

export default class KerastaseHomepage extends LightningElement {

    logoUrl = kerastaseLogo;
    userJcUrl = ksUserJC;
    bainDeForceUrl = ksBainDeForce;
    concentreDecalcifiantUrl = ksConcentreDecalcifiant;
    bainDensiteUrl = ksBainDensite;
    bainDivalentUrl = ksBainDivalent;
    quatuorChuteUrl = ksQuatuorChute;
    serumAntiChuteUrl = ksSerumAntiChute;
    bainPreventionUrl = ksBainPrevention;
    agentAvatarUrl = ksAgentAvatar;
    bainMasseUrl = ksBainMasse;
    bainMasse3Url = ksBainMasse3;
    bainMasse4Url = ksBainMasse4;
    bainMasse2Url = ksBainMasse2;
    bainPreventionSpecUrl = ksBainPreventionSpec;
    gallery1Url = ksGallery1;
    gallery2Url = ksGallery2;
    gallery3Url = ksGallery3;
    gallery4Url = ksGallery4;
    result4SpecifiqueUrl = ksResult4Specifique;

    get heroBgStyle() {
        return `background-image: url('${kerastaseHeroBg}')`;
    }

    // ===== NAV =====
    @track navOpen = false;

    get navPanelClass() {
        return this.navOpen ? 'ks-nav-panel ks-nav-panel--open' : 'ks-nav-panel';
    }

    get navHidden() { return !this.navOpen; }

    get hamburgerClass() {
        return this.navOpen ? 'ks-hamburger__bar ks-hamburger__bar--open' : 'ks-hamburger__bar';
    }

    toggleNav() { this.navOpen = !this.navOpen; }

    handleNavCategory(event) {
        this.navOpen = false;
        this._triggerSearch(event.currentTarget.dataset.query);
    }

    // ===== VIEWS =====
    @track view = 'home';

    get showHome() { return this.view === 'home'; }
    get showResults() { return this.view === 'results'; }
    get showProduct() { return this.view === 'product'; }
    get showConfirmation() { return this.view === 'confirmation'; }
    get isLoading() { return this.view === 'loading'; }

    // ===== SEARCH =====
    @track searchQuery = '';

    handleSearchInput(event) { this.searchQuery = event.target.value; }

    handleSearch(event) {
        event.preventDefault();
        if (!this.searchQuery.trim()) return;
        this._triggerSearch(this.searchQuery);
    }

    handleChipClick(event) {
        const query = event.currentTarget.dataset.query;
        this.searchQuery = query;
        this._triggerSearch(query);
    }

    _triggerSearch(query) {
        this.searchQuery = query;
        this.navOpen = false;
        this.view = 'loading';
        this.showAgentChat = false;
        this.showRecommendation = false;
        this.agentMessages = [];
        this.currentQuestionIndex = 0;
        this.qualificationAnswers = {};

        setTimeout(() => {
            this.view = 'results';
            setTimeout(() => {
                this.showAgentChat = true;
                this._addAgentMessage(
                    `Bonjour Jean-Christophe ! Je suis Kéraforce, votre expert Kérastase. ` +
                    `Je vois que vous recherchez "${query}". ` +
                    `Pour vous recommander le rituel le plus adapté à votre chevelure, j'ai besoin de vous poser 3 questions rapides.`
                );
            }, 800);
        }, 1000);
    }

    // ===== AGENT =====
    @track agentMessages = [];
    @track currentQuestionIndex = 0;
    @track qualificationAnswers = {};
    @track showAgentChat = false;
    @track showRecommendation = false;

    _addAgentMessage(text) {
        this.agentMessages = [
            ...this.agentMessages,
            { id: `msg-${Date.now()}`, text, cssClass: 'ks-msg ks-msg--agent' }
        ];
    }

    _addUserMessage(text) {
        this.agentMessages = [
            ...this.agentMessages,
            { id: `msg-${Date.now()}`, text, cssClass: 'ks-msg ks-msg--user' }
        ];
    }

    get showQualificationQuestion() {
        return this.showAgentChat &&
               !this.showRecommendation &&
               this.currentQuestionIndex < QUALIFICATION_QUESTIONS.length;
    }

    get currentQuestion() {
        return QUALIFICATION_QUESTIONS[this.currentQuestionIndex] || null;
    }

    handleAnswerSelect(event) {
        const questionId = event.currentTarget.dataset.question;
        const answerId = event.currentTarget.dataset.answer;
        const question = QUALIFICATION_QUESTIONS.find(q => q.id === questionId);
        const option = question?.options.find(o => o.id === answerId);
        if (!option) return;

        this.qualificationAnswers[questionId] = answerId;
        this._addUserMessage(option.label);
        this.currentQuestionIndex += 1;

        const followUps = [
            'Merci pour cette précision !',
            'Très bien, c\'est noté.',
            'Parfait, je prends en compte votre réponse.'
        ];
        if (this.currentQuestionIndex < QUALIFICATION_QUESTIONS.length) {
            const msg = followUps[this.currentQuestionIndex % followUps.length];
            setTimeout(() => { this._addAgentMessage(msg); }, 400);
        } else {
            setTimeout(() => {
                this._addAgentMessage(
                    'Parfait. Sur la base de votre profil, Kéraforce vous recommande le Bain de Masse Épaississant Genesis Homme — ' +
                    'notre shampooing booster d\'épaisseur formulé avec Créatine et Racine de Gingembre.'
                );
                this.showRecommendation = true;
            }, 600);
        }
    }

    // ===== DATA =====
    get featuredProducts() {
        return [
            {
                id: 'feat-bain-force',
                range: 'GENESIS HOMME',
                name: 'Bain de Force Quotidien',
                price: '32,00 €',
                badge: 'Best-seller',
                imgUrl: ksBainDeForce,
                bgStyle: null
            },
            {
                id: 'feat-concentre',
                range: 'PREMIÈRE',
                name: 'Concentré Décalcifiant',
                price: '54,00 €',
                badge: 'Nouveau',
                imgUrl: ksConcentreDecalcifiant,
                bgStyle: null
            },
            {
                id: 'feat-bain-densite',
                range: 'DENSIFIQUE',
                name: 'Bain de Densité Homme',
                price: '29,00 €',
                badge: null,
                imgUrl: ksBainDensite,
                bgStyle: null
            },
            {
                id: 'feat-bain-divalent',
                range: 'SPÉCIFIQUE',
                name: 'Bain Divalent',
                price: '27,00 €',
                badge: null,
                imgUrl: ksBainDivalent,
                bgStyle: null
            }
        ];
    }

    get searchResults() {
        return [
            {
                id: 'res-bain-masse',
                range: 'GENESIS HOMME',
                name: 'Bain de Masse Épaississant',
                price: '32,80 €',
                badge: 'Best-seller',
                imgUrl: ksBainMasse,
                bgStyle: null
            },
            {
                id: 'res-bain-densite',
                range: 'DENSIFIQUE',
                name: 'Bain de Densité Homme',
                price: '29,00 €',
                badge: null,
                imgUrl: ksBainDensite,
                bgStyle: null
            },
            {
                id: 'res-quatuor',
                range: 'GENESIS HOMME',
                name: 'Quatuor Chute & Affinement',
                price: '171,10 €',
                badge: 'Coffret',
                imgUrl: ksQuatuorChute,
                bgStyle: null
            },
            {
                id: 'rec-1',
                range: 'SPÉCIFIQUE',
                name: 'Bain Prévention',
                price: '35,90 €',
                badge: null,
                imgUrl: ksResult4Specifique,
                bgStyle: null
            }
        ];
    }

    get resultsCount() { return this.searchResults.length; }

    // ===== CAROUSEL =====
    @track featuredCarouselIndex = 0;
    @track resultsCarouselIndex = 0;

    get featuredCarouselProducts() {
        const all = this.featuredProducts;
        const i = this.featuredCarouselIndex;
        return [
            { ...all[i % all.length], carouselKey: `f0-${i}` },
            { ...all[(i + 1) % all.length], carouselKey: `f1-${i}` },
            { ...all[(i + 2) % all.length], carouselKey: `f2-${i}` },
            { ...all[(i + 3) % all.length], carouselKey: `f3-${i}` }
        ];
    }

    get resultsCarouselProducts() {
        const all = this.searchResults;
        const i = this.resultsCarouselIndex;
        return [
            { ...all[i % all.length], carouselKey: `r0-${i}` },
            { ...all[(i + 1) % all.length], carouselKey: `r1-${i}` },
            { ...all[(i + 2) % all.length], carouselKey: `r2-${i}` },
            { ...all[(i + 3) % all.length], carouselKey: `r3-${i}` }
        ];
    }

    handleFeaturedPrev() {
        const len = this.featuredProducts.length;
        this.featuredCarouselIndex = (this.featuredCarouselIndex - 1 + len) % len;
    }

    handleFeaturedNext() {
        this.featuredCarouselIndex = (this.featuredCarouselIndex + 1) % this.featuredProducts.length;
    }

    handleResultsPrev() {
        const len = this.searchResults.length;
        this.resultsCarouselIndex = (this.resultsCarouselIndex - 1 + len) % len;
    }

    handleResultsNext() {
        this.resultsCarouselIndex = (this.resultsCarouselIndex + 1) % this.searchResults.length;
    }

    // ===== NAVIGATION =====
    handleBackHome() {
        this.view = 'home';
        this.searchQuery = '';
        this.showAgentChat = false;
        this.showRecommendation = false;
        this.agentMessages = [];
        this.currentQuestionIndex = 0;
        this.selectedProduct = null;
        this.navOpen = false;
        window.scrollTo({ top: 0, behavior: 'instant' });
    }

    handleBackResults() {
        this.view = 'results';
        this.selectedProduct = null;
        this.activeThumbUrl = null;
        window.scrollTo({ top: 0, behavior: 'instant' });
    }

    handleCategoryClick(event) {
        this._triggerSearch(event.currentTarget.dataset.category);
    }

    handleProductClick(event) {
        const productId = event.currentTarget.dataset.id;
        const all = [...this.featuredProducts, ...this.searchResults];
        this.selectedProduct = all.find(p => p.id === productId) || {
            id: 'rec-1', name: 'Bain de Masse Épaississant', price: '32,80 €'
        };
        this.quantity = 1;
        this.activeThumbUrl = null;
        this.view = 'product';
        window.scrollTo({ top: 0, behavior: 'instant' });
    }

    handleViewProduct(event) {
        event.stopPropagation();
        this.handleProductClick(event);
    }

    handleAccountClick() {}
    handleCartClick() {}

    // ===== PRODUCT DETAIL =====
    @track selectedProduct = null;
    @track quantity = 1;
    @track cartCount = 0;
    @track orderNumber = '';

    incrementQty() { this.quantity = Math.min(this.quantity + 1, 10); }
    decrementQty() { this.quantity = Math.max(this.quantity - 1, 1); }

    // ===== PRODUCT GALLERY =====
    @track activeThumbUrl = null;
    @track lightboxUrl = null;

    get displayProductImgUrl() {
        return this.activeThumbUrl || this.gallery1Url;
    }

    get showLightbox() { return !!this.lightboxUrl; }

    handleThumbClick(event) {
        this.activeThumbUrl = event.currentTarget.dataset.src;
    }

    handleMainImgClick() {
        this.lightboxUrl = this.displayProductImgUrl;
    }

    handleLightboxClose() {
        this.lightboxUrl = null;
    }

    handleLightboxKey(event) {
        if (event.key === 'Escape') this.lightboxUrl = null;
    }

    handleAddToCart() {
        this.cartCount += this.quantity;
        this.orderNumber = 'KER-2026-' + Math.floor(100000 + Math.random() * 900000);
        this.view = 'confirmation';
        window.scrollTo({ top: 0, behavior: 'instant' });
    }
}