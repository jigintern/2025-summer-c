import { PostSubmission } from "../../types/postData.ts";
import { queryJson } from "../../utils/api.ts";

class PostListComponent extends HTMLElement {
  private _posts: PostSubmission[] = [];
  private container: HTMLElement | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            overflow-y: auto; /* Allow scrolling for the whole component */
            height: 100%;
          }
          .container {
            padding: 4px; /* A little padding around the list */
            height: 100%;
            box-sizing: border-box;
          }
          ul {
            list-style-type: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            gap: 16px; /* Space between post cards */
          }
          .no-posts-message {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
            text-align: center;
            color: #555;
            font-family: 'Klee One', cursive;
          }
        </style>
        <div class="container"></div>
      `;
      this.container = this.shadowRoot.querySelector('.container');
    }

    this.handleMapBoundsChanged = this.handleMapBoundsChanged.bind(this);
  }

  connectedCallback() {
    window.addEventListener(
      "map-bounds-changed",
      this.handleMapBoundsChanged as unknown as EventListener
    );
  }

  disconnectedCallback() {
    window.removeEventListener(
      "map-bounds-changed",
      this.handleMapBoundsChanged as unknown as EventListener
    );
  }

  async handleMapBoundsChanged(event: CustomEvent) {
    const bounds = event.detail.bounds;
    try {
      const posts = await queryJson({
        year: -1, // Or some other relevant year filter
        x: bounds.west,
        y: bounds.south,
        x2: bounds.east,
        y2: bounds.north,
      });
      this.posts = posts;
    } catch (error) {
      console.error("Failed to load posts for the current view:", error);
      this.posts = []; // Clear posts on error
    }
  }

  get posts(): PostSubmission[] {
    return this._posts;
  }

  set posts(newPosts: PostSubmission[]) {
    this._posts = newPosts;
    this.render();
  }

  render() {
    if (!this.container) return;

    if (this.posts.length === 0) {
        this.container.innerHTML = `
            <div class="no-posts-message">
              表示する投稿がありません
            </div>
        `;
    } else {
        this.container.innerHTML = '<ul></ul>';
        const listElement = this.container.querySelector('ul');

        this.posts.forEach(post => {
          const listItem = document.createElement('li');
          const postCard = document.createElement('menu-post-card');
          (postCard as any).post = post;
          listItem.appendChild(postCard);
          listElement?.appendChild(listItem);
        });
    }
  }
}

customElements.define("post-list-component", PostListComponent);
