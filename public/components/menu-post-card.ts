class MenuPostCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>

      </style>

      <div class="post-card">
        <button class="toggle-button"></button>
        <slot></slot>
      </div>
    `;
    
  }

}

customElements.define('menu-post-card', MenuPostCard);

