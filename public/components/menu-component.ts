import { PostSubmission } from "../../types/postData.ts";

class MenuComponent extends HTMLElement {
    private postList: HTMLElement | null = null;
    private commentsForm: HTMLElement & { post?: PostSubmission } | null = null;
    private slider: HTMLElement | null = null;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        if (!this.shadowRoot) return;

        this.shadowRoot.innerHTML = `
            <style>
                .menu-wrapper {
                    position: fixed;
                    display: flex;
                    flex-direction: column;
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
                    gap: 16px; /* スライダーとメインコンテンツの間の隙間 */
                }
                #slider-container {
                    flex-shrink: 0; /* スライダーが縮まないようにする */
                }
                .main-content {
                    flex-grow: 1; /* メインコンテンツが残りのスペースを埋める */
                    overflow-y: hidden; /* スクロールは子要素に任せる */
                    position: relative;
                }
                /* スロットに入れられた要素がメインコンテンツ領域を埋めるようにする */
                ::slotted(post-list-component),
                ::slotted(comments-form) {
                    display: block;
                    height: 100%;
                }
            </style>
            <div class="menu-wrapper">
                <div id="slider-container"></div>
                <div class="main-content">
                    <slot></slot>
                </div>
            </div>
        `;

        const slot = this.shadowRoot.querySelector('slot');
        slot?.addEventListener('slotchange', () => {
            this.postList = this.querySelector('post-list-component');
            this.commentsForm = this.querySelector('comments-form');
            this.slider = this.querySelector('slider-component');

            // スライダーコンポーネントを専用のコンテナに移動する
            const sliderContainer = this.shadowRoot?.getElementById('slider-container');
            if (this.slider && sliderContainer) {
                sliderContainer.appendChild(this.slider);
            }

            // 初期状態ではコメントフォームを非表示にする
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
