import { PostSubmission, Thread } from "../../types/postData.ts";

const content: string = `
    <style>
      /* [Existing styles] */
      .comment-container {
        display: flex;
        flex-direction: column;
        gap: 20px;
        max-height: 70vh;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: #888 #f1f1f1;
        padding-right: 5px;
      }
      .comment-box {
        background: #fff;
        padding: 15px;
        border-radius: 5px;
        border: 1px solid #ddd;
        margin-bottom: 10px;
      }
      h3, p { margin: 5px 0; }
      textarea { width: 95%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px; min-height: 80px; resize: vertical; }
      button { padding: 8px 12px; margin-right: 10px; cursor: pointer; background-color: #4CAF50; color: white; border: none; border-radius: 4px; }
      button:hover { background-color: #45a049; }
      button.cancel { background-color: #f44336; }
      button.cancel:hover { background-color: #d32f2f; }
      button.back {
        background-color: #607d8b;
        margin-bottom: 15px;
      }
      button.back:hover { background-color: #546e7a; }
      .comments-list { margin-top: 20px; max-height: 40vh; overflow-y: auto; }
      .comment-item { background-color: #f9f9f9; padding: 10px; margin-bottom: 10px; border-radius: 5px; border-left: 4px solid #4CAF50; }
      .comment-meta { color: #666; font-size: 0.8em; margin-top: 5px; }
      .error { color: red; }
      .success { color: green; }
    </style>
    <div>
      <button id="backButton" class="back">← 投稿一覧に戻る</button>
      <div class="comment-container">
        <div class="comment-box">
            <h3>コメント投稿</h3>
            <p>コメント内容<textarea id="commentText" rows="4"></textarea></p>
            <div id="statusMessage" class="error"></div>
            <div>
              <button id="submitComment">投稿する</button>
            </div>
        </div>
        <div class="comment-box">
            <h3>コメント一覧</h3>
            <div class="comments-list" id="commentsList"></div>
            
        </div>
      </div>
    </div>
`;



class CommentForm extends HTMLElement {
    private _post: PostSubmission | null = null;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    set post(newPost: PostSubmission) {
        this._post = newPost;
        this._fetchComments();
    }

    connectedCallback() {
        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = content;
            this.shadowRoot.getElementById('submitComment')?.addEventListener('click', () => this._submit());
            this.shadowRoot.getElementById('backButton')?.addEventListener('click', () => this._onBack());
        }
    }

    private _onBack() {
        this.dispatchEvent(new CustomEvent('back-to-list', { bubbles: true, composed: true }));
    }

    private async _submit() {
        if (!this.shadowRoot || !this._post) return;

        const statusMessage = this.shadowRoot.getElementById('statusMessage');
        const commentText = (this.shadowRoot.getElementById('commentText') as HTMLTextAreaElement).value.trim();

        if (!commentText) {
            if (statusMessage) statusMessage.textContent = 'コメント内容を入力してください';
            return;
        }

        try {
            const response = await fetch('/post-comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: this._post.id, comment: commentText })
            });

            if (!response.ok) throw new Error(`エラー: ${response.status}`);
            
            if (statusMessage) {
                statusMessage.textContent = 'コメントが正常に投稿されました';
                statusMessage.className = 'success';
            }
            (this.shadowRoot.getElementById('commentText') as HTMLTextAreaElement).value = '';
            this._fetchComments(); // Refresh comments list

        } catch (error) {
            console.error('投稿エラー:', error);
            if (statusMessage && error instanceof Error) {
                statusMessage.textContent = `エラー: ${error.message}`;
                statusMessage.className = 'error';
            }
        }
    }

    private async _fetchComments() {
        if (!this.shadowRoot || !this._post) return;

        const commentsList = this.shadowRoot.getElementById('commentsList');
        if (!commentsList) return;

        commentsList.innerHTML = '<p>読み込み中...</p>';

        try {
            const response = await fetch(`/get-comments?id=${encodeURIComponent(this._post.id)}`);
            if (!response.ok) throw new Error(`エラー: ${response.status}`);
            
            const comments: Thread[] = await response.json();

            if (!comments || comments.length === 0) {
                commentsList.innerHTML = '<p>コメントはありません</p>';
                return;
            }

            commentsList.innerHTML = '';
            comments.forEach((comment: Thread) => {
                const date = new Date(comment.created_at);
                const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
                const commentElement = document.createElement('div');
                commentElement.className = 'comment-item';
                commentElement.innerHTML = `
                    <div>${this._escapeHTML(comment.comment)}</div>
                    <div class="comment-meta">投稿日時: ${formattedDate}</div>
                `;
                commentsList.appendChild(commentElement);
            });
        } catch (error) {
            console.error('取得エラー:', error);
            if (error instanceof Error) {
                commentsList.innerHTML = `<p class="error">エラー: ${error.message}</p>`;
            }
        }
    }

    private _escapeHTML(str: string): string {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }
}

customElements.define('comments-form', CommentForm);
