

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
          display: block;map-bounds-display
        }

        .drawer {
          position: fixed; /* 画面に固定 */
          bottom: 0;
          left: 0;
          height: 80vh; 
          width: 100vw; 
          background-color: white;
          box-shadow: -2px 0 5px rgba(0,0,0,0.2);
          transform: translateY(70vh); 
          transition: transform 0.3s ease-in-out;
          z-index: 1000;
          padding: 20px 15px 0;
          box-sizing: border-box;
        }

        .drawer.is-open {
          transform: translateY(0);
        }

        .toggle-button {
          /* ボタンのスタイルはお好みで調整してください */
          position: absolute;
          top: 0;
          left: 0;
          width: 100vw;
          height: 3em;
          z-index: 1001;
          padding: 0;
          border: none;
          background: white;
          cursor: pointer;
        }
        .toggle-button::after {
          content: "";
          position: absolute;
          width: 40%;
          height: 10px;
          top: 50%;
          left: 50%;
          transform: translateX(-50%) translateY(-50%);
          margin: 0 auto;
          z-index: 1001;
          text-align: center;
          padding: 0;
          background-color: #e5e5e5;
          color: white;
          
          border-radius: 5px;
          
            
        }
      </style>

      <div class="drawer">
        <button class="toggle-button"></button>
        <!-- ↓↓↓ ここに外部のHTMLが挿入される ↓↓↓ -->
        <slot></slot>
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

