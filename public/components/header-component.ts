// Web Components.

const content: string = `  
    <style>
    :host {
        display: contents;
    }
    header {
            
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 50px;
        color: white;
        background: var(--accent-color);
        border-bottom: 2px solid var(--accent-color);
        z-index: 10000;
        display: flex;
        align-items: center;
        padding-left: 1em;
        font-size: 20px;
    }
    </style>
    <header>
    
        思い出マップ(仮)
    </header>
   
      `;

// WebComponents
class HeaderComponent extends HTMLElement {
    constructor() {
        super(); // 親クラスのコンストラクタを呼び出して
        // このカスタム要素をShadow DOMというカプセル化されたDOMツリーにアタッチする
        this.attachShadow({ mode: 'open' }); // mode:open ならば .shadowRoot で外部からこのDOMにアクセスできる. 推奨モード.
    }

    // このカスタム要素がページ(ドキュメントのDOM)に追加されたときに呼び出されるメソッド. ここで初めてHTMLを記入.
    connectedCallback() {
        if (this.shadowRoot) { // ちゃんと追加先のDOMが取得できるなら
            this.shadowRoot.innerHTML = content; // そのinnerHTMLを書き換える
        }
    }
}


customElements.define('header-component', HeaderComponent);  
