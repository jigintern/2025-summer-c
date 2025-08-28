// コメント投稿・閲覧用のWeb Component

const content: string = `  
    <style>
      .comment-container {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .comment-box {
        background: #fff;
        padding: 15px;
        border-radius: 5px;
        border: 1px solid #ddd;
        margin-bottom: 10px;
      }

      h3, p {
        margin: 5px 0;
      }

      .comment-box input, .comment-box textarea {
        width: 95%;
        padding: 8px;
        margin-top: 5px;
        border: 1px solid #ccc;
        border-radius: 4px;
      }

      textarea {
        min-height: 80px;
        resize: vertical;
      }

      button {
        padding: 8px 12px;
        margin-right: 10px;
        cursor: pointer;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
      }

      button:hover {
        background-color: #45a049;
      }

      button.cancel {
        background-color: #f44336;
      }

      button.cancel:hover {
        background-color: #d32f2f;
      }

      button.fetch {
        background-color: #2196F3;
      }

      button.fetch:hover {
        background-color: #0b7dda;
      }

      .comments-list {
        margin-top: 20px;
      }

      .comment-item {
        background-color: #f9f9f9;
        padding: 10px;
        margin-bottom: 10px;
        border-radius: 5px;
        border-left: 4px solid #4CAF50;
      }

      .comment-meta {
        color: #666;
        font-size: 0.8em;
        margin-top: 5px;
      }

      .error {
        color: red;
        font-size: 0.9em;
        margin-top: 10px;
      }

      .success {
        color: green;
        font-size: 0.9em;
        margin-top: 10px;
      }
    </style>
    <div class="comment-container">
      <div class="comment-box">
          <h3>コメント投稿</h3>
          <p>アイテムID<input type="text" id="itemId"></p>
          <p>コメント内容<textarea id="commentText" rows="4"></textarea></p>
          <div id="statusMessage" class="error"></div>
          <div>
            <button id="submitComment">投稿する</button>
            <button id="cancelComment" class="cancel">キャンセル</button>
          </div>
      </div>

      <div class="comment-box">
          <h3>コメント取得</h3>
          <p>アイテムID<input type="text" id="fetchItemId"></p>
          <button id="fetchComments" class="fetch">コメントを取得</button>
          <div class="comments-list" id="commentsList"></div>
      </div>
    </div>
`;

// WebComponent
class CommentForm extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    // コンポーネントがDOMに追加されたときに呼び出されるメソッド
    connectedCallback() {
        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = content;

            // 投稿ボタン
            this.shadowRoot.getElementById('submitComment')?.addEventListener(
                'click',
                () => this._submit()
            );

            // キャンセルボタン
            this.shadowRoot.getElementById('cancelComment')?.addEventListener(
                'click',
                () => this._cancel()
            );

            // コメント取得ボタン
            this.shadowRoot.getElementById('fetchComments')?.addEventListener(
                'click',
                () => this._fetchComments()
            );
        }
    }

    // コメント投稿処理
    private async _submit() {
        if (!this.shadowRoot) return;

        const statusMessage = this.shadowRoot.getElementById('statusMessage');
        const itemId = (this.shadowRoot.getElementById('itemId') as HTMLInputElement).value.trim();
        const commentText = (this.shadowRoot.getElementById('commentText') as HTMLTextAreaElement).value.trim();

        // 入力バリデーション
        if (!itemId) {
            if (statusMessage) {
                statusMessage.textContent = 'アイテムIDを入力してください';
                statusMessage.className = 'error';
            }
            return;
        }

        if (!commentText) {
            if (statusMessage) {
                statusMessage.textContent = 'コメント内容を入力してください';
                statusMessage.className = 'error';
            }
            return;
        }

        try {
            // バックエンドへのリクエスト
            const response = await fetch('/post-comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: itemId,
                    comment: commentText,
                    created_at: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error(`エラー: ${response.status}`);
            }

            const data = await response.json();
            console.log('投稿成功:', data);

            // 成功メッセージを表示
            if (statusMessage) {
                statusMessage.textContent = 'コメントが正常に投稿されました';
                statusMessage.className = 'success';
            }

            // 自動的にコメントリストを更新
            const fetchItemId = this.shadowRoot.getElementById('fetchItemId') as HTMLInputElement;
            fetchItemId.value = itemId;
            this._fetchComments();

            // フォームをクリア
            this.clear();

            // 成功イベントを発火
            this.dispatchEvent(
                new CustomEvent('comment-submit-success', {
                    bubbles: true,
                    composed: true,
                    detail: { data }
                })
            );
        } catch (error) {
            console.error('投稿エラー:', error);
            if (statusMessage && error instanceof Error) {
                statusMessage.textContent = `エラー: ${error.message}`;
                statusMessage.className = 'error';
            }

            // エラーイベントを発火
            this.dispatchEvent(
                new CustomEvent('comment-submit-error', {
                    bubbles: true,
                    composed: true,
                    detail: { error }
                })
            );
        }
    }

    // キャンセル処理
    private _cancel() {
        this.clear();
        // キャンセルイベントを発火
        this.dispatchEvent(
            new CustomEvent('comment-cancel', {
                bubbles: true,
                composed: true
            })
        );
    }

    // コメント取得処理
    private async _fetchComments() {
        if (!this.shadowRoot) return;

        const commentsList = this.shadowRoot.getElementById('commentsList');
        const fetchItemId = (this.shadowRoot.getElementById('fetchItemId') as HTMLInputElement).value.trim();

        if (!fetchItemId) {
            if (commentsList) {
                commentsList.innerHTML = '<p class="error">アイテムIDを入力してください</p>';
            }
            return;
        }

        if (commentsList) {
            commentsList.innerHTML = '<p>読み込み中...</p>';
        }

        try {
            const response = await fetch(`/get-comments?id=${encodeURIComponent(fetchItemId)}`);

            if (!response.ok) {
                throw new Error(`エラー: ${response.status}`);
            }

            const comments = await response.json();

            if (!comments || comments.length === 0) {
                if (commentsList) {
                    commentsList.innerHTML = '<p>コメントはありません</p>';
                }
                return;
            }

            // コメントを表示
            if (commentsList) {
                commentsList.innerHTML = '';
                comments.forEach((comment: any) => {
                    const date = new Date(comment.created_at);
                    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

                    const commentElement = document.createElement('div');
                    commentElement.className = 'comment-item';
                    commentElement.innerHTML = `
            <div>${this._escapeHTML(comment.comment)}</div>
            <div class="comment-meta">
              ID: ${this._escapeHTML(comment.id)} | 
              投稿日時: ${formattedDate}
            </div>
          `;
                    commentsList.appendChild(commentElement);
                });
            }

            // 取得成功イベントを発火
            this.dispatchEvent(
                new CustomEvent('comments-fetch-success', {
                    bubbles: true,
                    composed: true,
                    detail: { comments }
                })
            );
        } catch (error) {
            console.error('取得エラー:', error);
            if (commentsList && error instanceof Error) {
                commentsList.innerHTML = `<p class="error">エラー: ${error.message}</p>`;
            }

            // エラーイベントを発火
            this.dispatchEvent(
                new CustomEvent('comments-fetch-error', {
                    bubbles: true,
                    composed: true,
                    detail: { error }
                })
            );
        }
    }

    // HTML特殊文字をエスケープする関数
    private _escapeHTML(str: string): string {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // フォームをリセットするメソッド
    clear() {
        if (!this.shadowRoot) return;

        // 入力フィールドをクリア
        (this.shadowRoot.getElementById('commentText') as HTMLTextAreaElement).value = '';

        // ステータスメッセージをクリア
        const statusMessage = this.shadowRoot.getElementById('statusMessage');
        if (statusMessage) {
            statusMessage.textContent = '';
        }
    }
}

// Web Componentを登録
customElements.define('comments-form', CommentForm);