
const content: string = `
    <style>
        /* --- 色変数 --- */
        :host {
            --color-background: #f5e8d7; /* 色褪せた紙の色 */
            --color-paper: #fffdfa;
            --color-border: #8c7853;
            --color-text-main: #333;
            --color-text-label: #5a4a2c;
            --color-accent-red: #c0392b; /* 朱色 */
            --color-accent-red-dark: #a03024;


            color: var(--color-text-main);
        }

        /* --- 全体のスタイル --- */
        .container {
            position: absolute;
            bottom: 40px;
            right: 40px;
            width: 100%;
            max-width: 480px;
            z-index: 800;
            
            background: var(--color-paper);
            border: 1px solid var(--color-border);
            box-shadow: 5px 5px 10px rgba(0,0,0,0.1);
            padding: 25px;
            box-sizing: border-box;

            transform:  translateY(calc(100% + 40px));
            transition: ease .3s transform;
        }

        .container.open {
            transform: translateY(0);
        }

        /* --- フォームエリア --- */
        .form-area {
            flex-grow: 1;
        }

        form {
            display: flex;
            flex-direction: column;
            gap: 25px;
        }

        label {
            text-align: center;
            margin-bottom: 8px;
            display: block;
            font-weight: bold;
            color: var(--color-text-label);
        }

        input[type="text"],
        input[type="number"],
        textarea {
            width: 100%;
            padding: 10px;
            background: transparent;
            border: none;
            border-bottom: 1px solid var(--color-border);
            box-sizing: border-box;
           
            font-size: 1rem;
            color: var(--color-text-main);
        }

        input[type="text"]:focus,
        input[type="number"]:focus,
        textarea:focus {
            outline: none;
            border-bottom: 2px solid var(--color-accent-red);
        }

        textarea {
            resize: vertical;
            line-height: 1.8;
            border: 1px solid var(--color-border);
            background-color: rgba(245, 232, 215, 0.2);
        }

        /* --- 年代セクション --- */
        fieldset {
            border: none;
            padding: 0;
            margin: 0;
            border-top: 1px dotted var(--color-border);
            padding-top: 20px;
        }

        legend {
            padding: 0 10px;
            /*margin-left: -10px;*/
            font-weight: bold;
            color: var(--color-text-label);
        }

        .field-row {
            display: flex;
            gap: 20px;
        }

        .date-field {
            flex: 1;
        }

        /* --- ボタン --- */
        .button-container {
            text-align: center;
            
            margin-top: 10px;
            display: flex;
            
            justify-content: center;
            align-items: center;
            gap: 20px;
            
        }

        button {
            padding: 12px;
            
            background: var(--color-accent-red);
            color: #fff;
            border: 3px solid var(--color-accent-red-dark);
            border-radius: 50%; /* 円形にする */
            cursor: pointer;
            
            box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
            transition: all 0.2s ease;
        }
        
        #submitInfo {
            width: 80px;
            height: 80px;
            font-size: 1rem;
        }
        #cancelInfo {
            width: 60px;
            height: 60px;
            font-size: .75rem;
        }

        button:active {
            box-shadow: none;
            transform: translate(1px, 1px);
            background: var(--color-accent-red-dark);
        }
    </style>
    <div class="container">
        <div class="form-area">
            <form onsubmit="return false;">
                <div class="field-row-stacked">
                    <label for="posterName">御芳名</label>
                    <input id="posterName" type="text" placeholder="名無しの権兵衛">
                </div>

                <div class="field-row-stacked">
                    <label for="bodyText">内容</label>
                    <textarea id="bodyText" rows="5" placeholder="おもひでの記"></textarea>
                </div>

                <fieldset>
                    <legend>年代</legend>
                    <div class="field-row">
                        <div class="date-field">
                            <label for="era-gt">いつから (任意)</label>
                            <input id="era-gt" type="number" placeholder="1980">
                        </div>
                        <div class="date-field">
                            <label for="era-lte">いつまで (必須)</label>
                            <input id="era-lte" type="number" placeholder="2024" required>
                        </div>
                    </div>
                </fieldset>

                <div class="button-container">
                    <div style="width: 60px; height:60px;"></div>
                    <button id="submitInfo" type="submit">投稿</button>
                    <button id="cancelInfo" type="button">取消</button>
                </div>
            </form>
        </div>
    </div>
`;

// WebComponents
class PostForm extends HTMLElement {
	private container: HTMLElement | null = null;
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
			this.container = this.shadowRoot.querySelector('.container');
		}
	}

	// 外部からはアクセスできないメソッド.
	private _submit() {
		if (!this.shadowRoot) return; // DOMの存在確認をしておく

        const posterNameInput = this.shadowRoot.getElementById('posterName') as HTMLInputElement;
        let posterName = posterNameInput.value.trim();
        const bodyText = (this.shadowRoot.getElementById('bodyText') as HTMLTextAreaElement).value.trim();
        const eraGtInput = this.shadowRoot.getElementById('era-gt') as HTMLInputElement;
        const eraLteInput = this.shadowRoot.getElementById('era-lte') as HTMLInputElement;

        // --- Validation ---
        if (!bodyText) {
            alert('「内容」は必須です。');
            return;
        }
        if (!posterName) {
            posterName = posterNameInput.placeholder;
        }

        const eraLteStr = eraLteInput.value;
        let eraGtStr = eraGtInput.value;

        if (!eraLteStr) {
            alert('「いつまで」の年は必須です。');
            return;
        }
        if (isNaN(Number(eraLteStr))) {
            alert('「いつまで」の年は数字で入力してください。');
            return;
        }
        const lte = Number(eraLteStr);
        if (lte < 1900 || lte > 2100) {
            alert('年代は1900年から2100年の間で入力してください。');
            return;
        }

        let gt = lte;
        if (eraGtStr) {
            if (isNaN(Number(eraGtStr))) {
                alert('「いつから」の年を正しく入力してください。');
                return;
            }
            gt = Number(eraGtStr);
            if (gt < 1900 || gt > 2100) {
                alert('年代は1900年から2100年の間で入力してください。');
                return;
            }
        } else {
            gt = lte;
        }

        if (gt > lte) {
            alert('開始年は終了年より前の年を入力してください。');
            return;
        }

        const era = `${gt}-${lte}`;

		this.dispatchEvent( // 渡されたcustomEventをこのコンポーネントで発火する
			new CustomEvent('submit', { // submitという名前の独自イベントを作成
				bubbles: true, // イベントの発火が祖先要素まで伝達するか. trueならば祖先要素でもイベントを受け取れる.
				composed: true, // このイベントがこのShadow DOMの外から観測できるか否か. これを有効にしないと他のtsでイベントをキャッチできない.
				detail: { posterName, era, bodyText }, // detailでデータを乗せる(ペイロード)。 e.detailで取れる。
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
		if (!this.shadowRoot) return; // DOMの存在確認をしておく
		// Inputを取得して空文字をセット
		(this.shadowRoot.getElementById('posterName') as HTMLInputElement)
			.value = '';
		(this.shadowRoot.getElementById('era-gt') as HTMLInputElement).value =
			'';
		(this.shadowRoot.getElementById('era-lte') as HTMLInputElement).value =
			'';
		(this.shadowRoot.getElementById('bodyText') as HTMLTextAreaElement)
			.value = '';
	}

	open() {
        this.container?.classList.add("open");
	}
	close() {
        this.container?.classList.remove("open");
	}
}

customElements.define('post-form', PostForm); // 定義する
