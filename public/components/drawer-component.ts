class DrawerComponent extends HTMLElement {
  private drawer: HTMLElement | null = null;
  private toggleButton: HTMLElement | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          /* 親要素に対して配置の基準となるように設定 */
          position: relative;
          display: block;
        }

        .drawer {
          position: fixed; /* 画面に固定 */
          top: 0;
          right: 0;
          height: 100vh; /* 画面の高さ一杯 */
          width: 300px; /* ドロワーの幅 */
          background-color: white;
          box-shadow: -2px 0 5px rgba(0,0,0,0.2);
          transform: translateX(100%); /* 初期状態では画面外に隠す */
          transition: transform 0.3s ease-in-out;
          z-index: 1000;
          padding: 20px;
          box-sizing: border-box;
        }

        .drawer.is-open {
          transform: translateX(0); /* is-openクラスが付くと表示される */
        }

        .toggle-button {
          /* ボタンのスタイルはお好みで調整してください */
          position: fixed;
          top: 15px;
          right: 15px;
          z-index: 1001;
          padding: 10px 15px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
      </style>

      <button class="toggle-button">開く</button>
      <div class="drawer">
        <!-- ↓↓↓ ここが重要 ↓↓↓ -->
        <slot></slot>
        <!-- ↑↑↑ ここに外部のHTMLが挿入されます ↑↑↑ -->
      </div>
    `;

    this.drawer = this.shadowRoot.querySelector('.drawer');
    this.toggleButton = this.shadowRoot.querySelector('.toggle-button');

    this.toggleButton?.addEventListener('click', () => this.toggle());
  }

  toggle() {
    this.drawer?.classList.toggle('is-open');
  }

  open() {
    this.drawer?.classList.add('is-open');
  }

  close() {
    this.drawer?.classList.remove('is-open');
  }
}

customElements.define('drawer-component', DrawerComponent);
