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
          height: calc(100vh - 50px);
          transform: translateY(50px);
          width: 256px;
            /*filter: contrast(170%) brightness(1000%);*/
          background-color: var(--background-color);
          background-image: url(../sand-noise.svg);
          
          
          
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

