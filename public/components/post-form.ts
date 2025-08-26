// Web Components.

const content: string = `  
    <style>
      .info-box {
        background: #fff;
        padding: 10px;
        border-radius: 5px;
        border: 1px solid #ddd;
        margin-bottom: 10px;
      }
      h3, p {
        margin: 5px 0;
      }
      input, textarea {
        width: 95%;
        padding: 5px;
        margin-top: 5px;
      }
      button {
        padding: 8px 12px;
        margin-right: 10px;
        cursor: pointer;
      }
    </style>
    <div class="info-box">
        <h3>投稿者: <input type="text" id="posterName"></h3>
        <p><strong>年代:</strong> <input type="text" id="era"></p>
        <p><textarea id="bodyText" rows="4"></textarea></p>
    </div>
    <button id="submitInfo">Submit</button>
    <button id="cancelInfo">Cancel</button>
      `;

// WebComponents
class PostForm extends HTMLElement {
	constructor() {
		super(); // 親クラスのコンストラクタを呼び出して
		// このカスタム要素をShadow DOMというカプセル化されたDOMツリーにアタッチする
		this.attachShadow({ mode: 'open' }); // mode:open ならば .shadowRoot で外部からこのDOMにアクセスできる. 推奨モード.
	}

	// このカスタム要素がページ(ドキュメントのDOM)に追加されたときに呼び出されるメソッド. ここで初めてHTMLを記入.
	connectedCallback() {
		if (this.shadowRoot) { // ちゃんと追加先のDOMが取得できるなら
			this.shadowRoot.innerHTML = content; // そのinnerHTMLを書き換える

            // submitInfoボタンが押されたら_submitを呼ぶ
			this.shadowRoot.getElementById('submitInfo')?.addEventListener(
				'click',
				() => this._submit(),
			);
            // cancelInfoボタンが押されたら_cancelを呼ぶ
			this.shadowRoot.getElementById('cancelInfo')?.addEventListener(
				'click',
				() => this._cancel(),
			);
		}
	}

    // 外部からはアクセスできないメソッド.
	private _submit() {
		if (!this.shadowRoot) return;  // DOMの存在確認をしておく
        // 接続されたDOMからフォームのinputを取得して値を取得
		const posterName =
			(this.shadowRoot.getElementById('posterName') as HTMLInputElement)
				.value;
		const era =
			(this.shadowRoot.getElementById('era') as HTMLInputElement).value;
		const bodyText =
			(this.shadowRoot.getElementById('bodyText') as HTMLTextAreaElement)
				.value;

        
		this.dispatchEvent(  // 渡されたcustomEventをこのコンポーネントで発火する 
			new CustomEvent('submit', { // submitという名前の独自イベントを作成
				bubbles: true,  // イベントの発火が祖先要素まで伝達するか. trueならば祖先要素でもイベントを受け取れる.
				composed: true,  // このイベントがこのShadow DOMの外から観測できるか否か. これを有効にしないと他のtsでイベントをキャッチできない. 
				detail: { posterName, era, bodyText },  // detailでデータを乗せる(ペイロード)。 e.detailで取れる。
			}),
		);
	}

	private _cancel() {
		this.dispatchEvent(
			new CustomEvent('cancel', {
				bubbles: true,
				composed: true,
			}),
		);
	}

    // フォームをリセットするメソッド
	clear() {
		if (!this.shadowRoot) return;  // DOMの存在確認をしておく
        // Inputを取得して空文字をセット
		(this.shadowRoot.getElementById('posterName') as HTMLInputElement)
			.value = '';
		(this.shadowRoot.getElementById('era') as HTMLInputElement).value = '';
		(this.shadowRoot.getElementById('bodyText') as HTMLTextAreaElement)
			.value = '';
	}
}


customElements.define('post-form', PostForm);  // 定義する
