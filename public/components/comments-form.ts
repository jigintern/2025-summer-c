import { PostSubmission, Thread } from "../../types/postData.ts";

const content: string = `
    <style>
      :host {
        display: block;
        height: 100%;
      }
      .container {
        display: flex;
        flex-direction: column;
        height: 100%;
        gap: 16px;
      }

      .header {
        flex-shrink: 0; /* Do not shrink */
      }

      .content {
        flex-grow: 1; /* Grow to fill available space */
        overflow-y: auto; /* Scroll if content overflows */
        min-height: 0; /* Necessary for scrolling in flexbox */
        background-color: transparent;
        border-top: 4px double #a1887f;
        border-bottom: 4px double #a1887f;
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .footer {
        flex-shrink: 0; /* Do not shrink */
        background: transparent;
        border-top: 4px double #a1887f;
        border-bottom: 4px double #a1887f;
        padding: 24px;
      }

      /* Comment List Styles */
      .comment-item {
          border-bottom: 1px dotted #aaa;
          padding-bottom: 16px;
      }
      .comment-item:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }
      .comment-text, .comment-meta {
          font-family: 'Klee One', cursive;
          color: #333;
          margin: 0;
      }
      .comment-text {
          font-size: 1em;
          line-height: 1.8;
          margin-bottom: 12px;
      }
      .comment-meta {
          text-align: right;
          font-size: 0.9em;
      }

      /* Submission Form Styles */
      h3 {
        font-family: 'Klee One', cursive;
        text-align: center;
        color: #333;
        margin: 0 0 16px 0;
      }
      textarea {
        width: 100%;
        padding: 10px;
        box-sizing: border-box;
        border: 1px solid #8c7853;
        background-color: rgba(245, 232, 215, 0.2);
        font-size: 1rem;
        font-family: 'Zen Kaku Gothic New', sans-serif;
        color: #333;
        resize: vertical;
        line-height: 1.8;
        min-height: 80px;
        transition: border-color 0.2s ease;
      }
      textarea:focus {
        outline: none;
        border-color: #c0392b;
      }
      
      button {
        cursor: pointer;
        border: none;
        background: none;
        padding: 0;
        font-family: 'Klee One', cursive;
      }
      #submitComment {
        padding: 8px 16px;
        background: #c0392b;
        color: #fff;
        border-radius: 4px;
        display: block;
        margin: 16px auto 0;
        transition: background-color 0.2s ease;
      }
      #submitComment:hover, #submitComment:active {
        background: #a03024;
      }
      button.back {
        background-color: #607d8b;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
      }
      button.back:hover { background-color: #546e7a; }
      .error { color: red; text-align: center; }
      .success { color: green; text-align: center; }
    </style>

    <div class="container">
        <div class="header">
            <button id="backButton" class="back">← 投稿一覧に戻る</button>
        </div>

        <div class="content" id="commentsList">
            <!-- Comments will be injected here -->
        </div>

        <div class="footer">
            <h3>コメント投稿</h3>
            <textarea id="commentText" rows="3" placeholder="ここにコメントを入力..."></textarea>
            <div id="statusMessage"></div>
            <button id="submitComment" type="submit">投稿</button>
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
            if (statusMessage) {
                statusMessage.textContent = 'コメント内容を入力してください';
                statusMessage.className = 'error';
            }
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
                commentsList.innerHTML = '<p style="text-align: center; font-family: \'Klee One\', cursive;">コメントはまだありません</p>';
                return;
            }

            commentsList.innerHTML = '';
            comments.forEach((comment: Thread) => {
                const date = new Date(comment.created_at);
                const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
                const commentElement = document.createElement('div');
                commentElement.className = 'comment-item';
                commentElement.innerHTML = `
                    <p class="comment-text">${this._escapeHTML(comment.comment)}</p>
                    <p class="comment-meta">―― ${formattedDate}</p>
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
