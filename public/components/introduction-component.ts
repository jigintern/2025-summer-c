class IntroductionComponent extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        #introduction {
        width: 100%;
        height: 100%;
        background: blue;
        }
      </style>

      <div id="introduction">
        ここに説明を追加
      </div>
    `;

  }


}

customElements.define('introduction-component', IntroductionComponent);

