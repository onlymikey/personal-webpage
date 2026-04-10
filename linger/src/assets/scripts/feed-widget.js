const FEED_CONTAINER_ID = "feed-container";
const FEED_LIST_ID = "feed-list";
const FEED_LIKES_STORAGE_KEY = "linger.feed.likes.v1";
const FEED_LIGHTBOX_ID = "feed-lightbox";

const FEED_POSTS = [
  {
    id: "post-001",
    content: "Placeholder post. My updates will appear here.",
    createdAt: "2026-04-09T00:00:00-06:00",
    media: null,
    likes: 0,
  },
];

function getFeedPosts() {
  return [...FEED_POSTS]
    .map((post) => ({ ...post }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function loadLikedState() {
  try {
    const raw = localStorage.getItem(FEED_LIKES_STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveLikedState(likedMap) {
  localStorage.setItem(FEED_LIKES_STORAGE_KEY, JSON.stringify(likedMap));
}

function formatDate(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "invalid date";

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getMediaRatio(media) {
  if (media?.type === "video") return "panoramic";

  if (media?.aspectRatio === "panoramic") return "panoramic";
  return "square";
}

function closeFeedLightbox() {
  const lightbox = document.getElementById(FEED_LIGHTBOX_ID);
  if (!lightbox) return;

  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("feed-lightbox-open");
}

function openFeedLightbox(src, altText = "media") {
  const lightbox = ensureFeedLightbox();
  if (!lightbox) return;

  const image = lightbox.querySelector(".feed-lightbox__image");
  if (!image) return;

  image.src = src;
  image.alt = altText;

  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("feed-lightbox-open");
}

function ensureFeedLightbox() {
  const existing = document.getElementById(FEED_LIGHTBOX_ID);
  if (existing) return existing;

  const lightbox = document.createElement("div");
  lightbox.id = FEED_LIGHTBOX_ID;
  lightbox.className = "feed-lightbox";
  lightbox.setAttribute("aria-hidden", "true");

  const dialog = document.createElement("div");
  dialog.className = "feed-lightbox__dialog";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-label", "Expanded media view");
  dialog.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "feed-lightbox__close";
  closeButton.setAttribute("aria-label", "Close expanded view");
  closeButton.textContent = "X";
  closeButton.addEventListener("click", closeFeedLightbox);

  const image = document.createElement("img");
  image.className = "feed-lightbox__image";
  image.alt = "media";

  dialog.appendChild(closeButton);
  dialog.appendChild(image);
  lightbox.appendChild(dialog);

  lightbox.addEventListener("click", closeFeedLightbox);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeFeedLightbox();
    }
  });

  document.body.appendChild(lightbox);
  return lightbox;
}

function createMediaElement(media) {
  if (!media || typeof media !== "object") return null;

  const wrap = document.createElement("figure");
  wrap.className = "feed-post__media";
  wrap.classList.add(`feed-post__media--${getMediaRatio(media)}`);

  if (media.type === "image" || media.type === "gif") {
    wrap.classList.add("feed-post__media--expandable");

    const img = document.createElement("img");
    img.src = media.src;
    img.alt = media.alt || "media post";
    img.loading = "lazy";
    img.className = "feed-post__media-image";
    img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.setAttribute("aria-label", "Open image in full size");
    img.addEventListener("click", () => {
      openFeedLightbox(media.src, media.alt || "media post");
    });
    img.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openFeedLightbox(media.src, media.alt || "media post");
      }
    });

    const indicator = document.createElement("span");
    indicator.className = "feed-post__expand-indicator";
    indicator.setAttribute("aria-hidden", "true");
    indicator.textContent = "expand ↗";

    wrap.appendChild(img);
    wrap.appendChild(indicator);
    return wrap;
  }

  if (media.type === "video") {
    const video = document.createElement("video");
    video.controls = true;
    video.preload = "metadata";
    if (media.poster) video.poster = media.poster;

    const source = document.createElement("source");
    source.src = media.src;
    if (media.mimeType) source.type = media.mimeType;

    video.appendChild(source);
    video.append("Your browser does not support HTML5 video.");
    wrap.appendChild(video);
    return wrap;
  }

  return null;
}

function renderFeedPost(post, likedMap) {
  const article = document.createElement("article");
  article.className = "feed-post";
  article.dataset.postId = post.id;

  const date = document.createElement("p");
  date.className = "feed-post__date";
  date.textContent = formatDate(post.createdAt);

  const content = document.createElement("p");
  content.className = "feed-post__content";
  content.textContent = post.content;

  article.appendChild(date);
  article.appendChild(content);

  const mediaEl = createMediaElement(post.media);
  if (mediaEl) article.appendChild(mediaEl);

  const actions = document.createElement("div");
  actions.className = "feed-post__actions";

  const likeButton = document.createElement("button");
  likeButton.type = "button";
  likeButton.className = "feed-like-btn";
  likeButton.setAttribute("aria-label", "Like post");

  const heart = document.createElement("span");
  heart.className = "feed-like-btn__heart";

  const label = document.createElement("span");
  label.className = "feed-like-btn__label";
  label.textContent = "like";

  likeButton.appendChild(heart);
  likeButton.appendChild(label);

  const count = document.createElement("span");
  count.className = "feed-like-count";

  const baseLikes = Number(post.likes) || 0;

  const setLikedUI = (isLiked) => {
    likeButton.classList.toggle("is-liked", isLiked);
    heart.textContent = isLiked ? "♥" : "♡";
    count.textContent = `${baseLikes + (isLiked ? 1 : 0)} likes`;
  };

  setLikedUI(Boolean(likedMap[post.id]));

  likeButton.addEventListener("click", () => {
    const nextState = !Boolean(likedMap[post.id]);
    likedMap[post.id] = nextState;
    saveLikedState(likedMap);
    setLikedUI(nextState);
  });

  actions.appendChild(likeButton);
  actions.appendChild(count);
  article.appendChild(actions);

  return article;
}

function renderFeed(feedRoot) {
  const list = feedRoot.querySelector(`#${FEED_LIST_ID}`);
  if (!list) return;

  list.innerHTML = "";

  const posts = getFeedPosts();
  const likedMap = loadLikedState();

  if (!posts.length) {
    const empty = document.createElement("p");
    empty.className = "feed-empty";
    empty.textContent = "No posts yet.";
    list.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  posts.forEach((post) => {
    fragment.appendChild(renderFeedPost(post, likedMap));
  });

  list.appendChild(fragment);
}

document.addEventListener("DOMContentLoaded", () => {
  const feedRoot = document.getElementById(FEED_CONTAINER_ID);
  if (!feedRoot) return;

  ensureFeedLightbox();
  renderFeed(feedRoot);
});
