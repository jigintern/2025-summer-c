class MenuComponent extends HTMLElement {
    

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
          left:0;
          height: 100vh;
          width: 256px;
          background: var(--background-color);
          z-index: 1000;
        }
        
        /*@media (max-width: 768px) {*/
        /*   .menu-wrapper {*/
        /*    background: none;*/
        /*    bottom: 0;*/
        /*   }*/
        
        /*}*/
      </style>

      <div class="menu-wrapper">
  
        <slot></slot>
      </div>
    `;
        
    }

}

customElements.define('menu-component', MenuComponent);

