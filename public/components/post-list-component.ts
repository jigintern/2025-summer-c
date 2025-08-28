import { PostSubmission } from "../../types/postData.ts";
import { queryJson } from "../../utils/api.ts";

class PostListComponent extends HTMLElement {
  private _posts: PostSubmission[] = [];
  private listElement: HTMLUListElement | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            padding: 16px;
            overflow-y: auto;
            height: calc(100% - 32px); /* Adjust as needed */
          }
          ul {
            list-style-type: none;
            padding: 0;
            margin: 0;
          }
          li {
            padding: 8px 0;
            border-bottom: 1px solid #ccc;
          }
        </style>
        <ul></ul>
      `;
      this.listElement = this.shadowRoot.querySelector('ul');
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
    console.log("Map bounds changed:", bounds);
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
    if (!this.listElement) return;

    this.listElement.innerHTML = ''; // Clear existing list

    this.posts.forEach(post => {
      const listItem = document.createElement('li');
      // Using menu-post-card to display post information
      const postCard = document.createElement('menu-post-card');
      // The 'post' attribute on menu-post-card should probably take a Post object.
      // Assuming it has a 'post' property that can be set.
      (postCard as any).post = post;
      listItem.appendChild(postCard);
      this.listElement?.appendChild(listItem);
    });
  }
}

customElements.define("post-list-component", PostListComponent);
