import { PostSubmission } from "../../types/postData.ts";

class MenuComponent extends HTMLElement {
    private postList: HTMLElement | null = null;
    private commentsForm: HTMLElement & { post?: PostSubmission } | null = null;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        if (!this.shadowRoot) return;

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    position: relative;
                    display: block;
                }
                .menu-wrapper {
                    position: fixed;
                    display: block;
                    top: 0;
                    left: 0;
                    height: calc(100vh - 50px);
                    transform: translateY(50px);
                    width: 256px;
                    background-color: var(--background-color);
                    background-image: url(../sand-noise.svg);
                    z-index: 1000;
                    padding: 16px;
                    box-sizing: border-box;
                }
            </style>
            <div class="menu-wrapper">
                <slot></slot>
            </div>
        `;

        // Slot change listener to get references to the components
        const slot = this.shadowRoot.querySelector('slot');
        slot?.addEventListener('slotchange', () => {
            this.postList = this.querySelector('post-list-component');
            this.commentsForm = this.querySelector('comments-form');
            // Initially hide comments form
            if (this.commentsForm) {
                this.commentsForm.style.display = 'none';
            }
        });

        window.addEventListener('show-comments', this.handleShowComments.bind(this) as EventListener);
        this.addEventListener('back-to-list', this.handleBackToList.bind(this));
    }

    disconnectedCallback() {
        window.removeEventListener('show-comments', this.handleShowComments.bind(this) as EventListener);
        this.removeEventListener('back-to-list', this.handleBackToList.bind(this));
    }

    private handleShowComments(event: CustomEvent) {
        const post = event.detail.post as PostSubmission;
        if (this.postList) this.postList.style.display = 'none';
        if (this.commentsForm) {
            this.commentsForm.style.display = 'block';
            this.commentsForm.post = post;
        }
    }

    private handleBackToList() {
        if (this.commentsForm) this.commentsForm.style.display = 'none';
        if (this.postList) this.postList.style.display = 'block';
    }
}

customElements.define('menu-component', MenuComponent);
