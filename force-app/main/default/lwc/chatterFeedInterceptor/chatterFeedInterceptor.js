import { LightningElement, api } from 'lwc';

export default class ChatterFeedInterceptor extends LightningElement {
    @api recordId;

    replacementName = 'Lauren Bailey';
    replacementAvatar = 'https://storm-8fc899a8bdd4a0--c.vf.force.com/resource/1775043784000/LaurenBailey';
    targetName = 'Edward Vergé';
    intervalId;

    connectedCallback() {
        // Lancer un intervalle pour remplacer continuellement
        this.intervalId = setInterval(() => {
            this.replaceAllInstances();
        }, 500);

        // Premier remplacement après 1 seconde
        setTimeout(() => {
            this.replaceAllInstances();
        }, 1000);
    }

    disconnectedCallback() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    replaceAllInstances() {
        // IMPORTANT : Remplacer les avatars AVANT le texte
        // car on cherche "Edward Vergé" dans le contexte
        this.replaceAvatars();

        // Ajouter les icônes WhatsApp dans le feed
        this.addWhatsAppIcons();

        // Remplacer l'icône du Messaging Channel
        this.replaceMessagingChannelIcon();

        // Remplacer dans le DOM normal
        this.replaceInElement(document.body);

        // Remplacer dans les Shadow DOMs
        this.replaceShadowDOMs(document.body);
    }

    replaceShadowDOMs(element) {
        if (!element) return;

        // Si l'élément a un shadowRoot, le traiter
        if (element.shadowRoot) {
            this.replaceInElement(element.shadowRoot);
            // Récursif dans le shadowRoot
            element.shadowRoot.querySelectorAll('*').forEach(child => {
                this.replaceShadowDOMs(child);
            });
        }

        // Traiter tous les enfants
        if (element.children) {
            Array.from(element.children).forEach(child => {
                this.replaceShadowDOMs(child);
            });
        }
    }

    replaceInElement(root) {
        if (!root) return;

        // Chercher tous les éléments texte
        const walker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        const nodesToReplace = [];
        let node;

        while (node = walker.nextNode()) {
            if (node.textContent && node.textContent.includes(this.targetName)) {
                nodesToReplace.push(node);
            }
        }

        // Remplacer tous les noeuds trouvés
        nodesToReplace.forEach(node => {
            node.textContent = node.textContent.replace(
                new RegExp(this.targetName, 'g'),
                this.replacementName
            );
        });

        // Remplacer dans les attributs
        const allElements = root.querySelectorAll ? root.querySelectorAll('*') : [];
        allElements.forEach(element => {
            ['aria-label', 'title', 'alt', 'placeholder'].forEach(attr => {
                const attrValue = element.getAttribute(attr);
                if (attrValue && attrValue.includes(this.targetName)) {
                    element.setAttribute(
                        attr,
                        attrValue.replace(new RegExp(this.targetName, 'g'), this.replacementName)
                    );
                }
            });
        });
    }

    replaceAvatars() {
        // Fonction pour remplacer les avatars dans un contexte donné
        const replaceInContext = (root) => {
            const avatarImages = root.querySelectorAll(
                'img[src*="/profilephoto/"], img[alt*="Edward"], img[alt*="Vergé"], span.slds-avatar img, .forceEntityIcon img'
            );

            avatarImages.forEach(img => {
                // Ne pas remplacer si déjà remplacé
                if (img.src === this.replacementAvatar) {
                    return;
                }

                // IMPORTANT: Ne remplacer QUE si l'alt de l'image elle-même contient Edward ou Vergé
                // OU si l'image a déjà été remplacée par notre script (alt = Lauren Bailey et data-replaced)
                const imgAlt = img.alt || '';
                const shouldReplace =
                    imgAlt.includes('Edward') ||
                    imgAlt.includes('Vergé') ||
                    (imgAlt === this.replacementName && img.hasAttribute('data-replaced'));

                if (shouldReplace) {
                    img.src = this.replacementAvatar;
                    img.alt = this.replacementName;
                    // Marquer comme remplacé pour les futures itérations
                    img.setAttribute('data-replaced', 'true');
                }
            });
        };

        // Remplacer dans le document principal
        replaceInContext(document);

        // Remplacer dans les shadowRoots
        document.querySelectorAll('*').forEach(element => {
            if (element.shadowRoot) {
                replaceInContext(element.shadowRoot);
            }
        });
    }

    addWhatsAppIcons() {
        const whatsappIconUrl = 'https://storm-8fc899a8bdd4a0--c.vf.force.com/servlet/servlet.FileDownload?file=015J6000000HyxK';

        const addIconsInContext = (root) => {
            // Chercher tous les liens qui contiennent "WP-" (enregistrements Conversation Whatsapp)
            const links = root.querySelectorAll('a[href*="/aCp"]');

            links.forEach(link => {
                const textContent = link.textContent || '';

                // Si c'est un enregistrement WP- et qu'il n'a pas déjà l'icône
                if (textContent.match(/WP-\d+/) && !link.querySelector('.whatsapp-icon-injected')) {
                    // Créer l'icône
                    const icon = document.createElement('img');
                    icon.src = whatsappIconUrl;
                    icon.alt = 'WhatsApp';
                    icon.className = 'whatsapp-icon-injected';
                    icon.style.cssText = 'width: 16px; height: 16px; margin-right: 4px; vertical-align: middle; border-radius: 3px;';

                    // Insérer l'icône au début du lien
                    link.insertBefore(icon, link.firstChild);
                }
            });
        };

        // Ajouter dans le document principal
        addIconsInContext(document);

        // Ajouter dans les shadowRoots
        document.querySelectorAll('*').forEach(element => {
            if (element.shadowRoot) {
                addIconsInContext(element.shadowRoot);
            }
        });
    }

    replaceMessagingChannelIcon() {
        const whatsappIconUrl = 'https://storm-8fc899a8bdd4a0--c.vf.force.com/servlet/servlet.FileDownload?file=015J6000000HyxK';

        // Vérifier l'URL actuelle
        const currentUrl = window.location.href;
        const isMessagingSessionPage = currentUrl.includes('MessagingSession') && currentUrl.includes('/r/');
        const isVoiceCallPage = currentUrl.includes('VoiceCall');

        // Si on n'est PAS sur une MessagingSession OU si on est sur un VoiceCall, ne rien faire
        if (!isMessagingSessionPage || isVoiceCallPage) {
            return;
        }

        const replaceIconsInContext = (root) => {
            // Trouver l'onglet actif uniquement (pas les onglets en arrière-plan)
            const activeTab = root.querySelector('.windowViewMode-maximized, [class*="active"][class*="workspace"], [aria-hidden="false"]');

            if (!activeTab) {
                return; // Pas d'onglet actif trouvé
            }

            // Vérifier si "Whatsapp" apparaît dans l'onglet ACTIF uniquement
            const activeTabText = activeTab.innerText || '';
            const hasWhatsapp = activeTabText.includes('Whatsapp') || activeTabText.includes('whatsapp');

            // Si pas de WhatsApp dans l'onglet actif, ne rien faire
            if (!hasWhatsapp) {
                return;
            }

            // Chercher les page headers UNIQUEMENT dans l'onglet actif
            const pageHeaders = activeTab.querySelectorAll('.slds-page-header, [class*="pageHeader"]');

            pageHeaders.forEach(header => {
                // 1. Remplacer les lightning-icon dans ce header
                const icons = header.querySelectorAll('lightning-icon');

                icons.forEach(icon => {
                    if (icon.hasAttribute('data-whatsapp-replaced')) return;

                    const img = document.createElement('img');
                    img.src = whatsappIconUrl;
                    img.alt = 'WhatsApp';
                    img.className = icon.className;
                    img.style.cssText = 'width: 2.5rem; height: 2.5rem; border-radius: 50%;';
                    img.setAttribute('data-whatsapp-replaced', 'true');

                    if (icon.parentNode) {
                        icon.parentNode.replaceChild(img, icon);
                    }
                });

                // 2. Remplacer les SVG dans ce header
                const svgIcons = header.querySelectorAll('svg.slds-icon');

                svgIcons.forEach(svg => {
                    if (svg.hasAttribute('data-whatsapp-replaced')) return;

                    const img = document.createElement('img');
                    img.src = whatsappIconUrl;
                    img.alt = 'WhatsApp';
                    img.style.cssText = 'width: 2.5rem; height: 2.5rem; border-radius: 50%;';
                    img.setAttribute('data-whatsapp-replaced', 'true');

                    if (svg.parentNode) {
                        svg.parentNode.replaceChild(img, svg);
                    }
                });
            });
        };

        // Remplacer dans le document principal
        replaceIconsInContext(document);

        // Remplacer dans les shadowRoots
        document.querySelectorAll('*').forEach(element => {
            if (element.shadowRoot) {
                replaceIconsInContext(element.shadowRoot);
            }
        });
    }
}
