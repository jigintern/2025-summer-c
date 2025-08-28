import { PostSubmission } from "../../types/postData.ts";

class MenuPostCard extends HTMLElement {
  private _post: PostSubmission | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  set post(newPost: PostSubmission) {
    this._post = newPost;
    this.render();
  }

  get post(): PostSubmission | null {
    return this._post;
  }

  connectedCallback() {
    this.render();
  }

  render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        .post-card {
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
        }
        h3 {
          margin: 0 0 8px 0;
          font-size: 1.1em;
        }
        p {
          margin: 4px 0;
        }
        .decade {
            font-size: 0.9em;
            color: #666;
        }
      </style>
      <div class="post-card">
        ${this._post ? `
          <h3>${this._post.name}</h3>
          <p class="decade">${this._post.decade.gt}-${this._post.decade.lte}</p>
          <p>${this._post.comment}</p>
        ` : `
          <p>No post data</p>
        `}
      </div>
    `;
  }
}

customElements.define('menu-post-card', MenuPostCard);
