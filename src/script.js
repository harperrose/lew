const REFERENCE_INTERVAL_MS = 4000;
const SHORT_STORY_LIMIT_MOBILE = 400;
const SHORT_STORY_LIMIT_DESKTOP = 1600;
const MOBILE_MEDIA_QUERY = window.matchMedia("(max-width: 768px)");
const PAGE = document.body.dataset.page;

let siteData = null;
let referenceIndex = 0;
let referenceTimer = null;

function getShortStoryLimit() {
  return MOBILE_MEDIA_QUERY.matches
    ? SHORT_STORY_LIMIT_MOBILE
    : SHORT_STORY_LIMIT_DESKTOP;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function resolveMediaSrc(src) {
  if (!src) {
    return "";
  }

  if (typeof src === "object" && src.src) {
    return resolveMediaSrc(src.src);
  }

  if (src.startsWith("http") || src.startsWith("//")) {
    return src;
  }

  if (src.startsWith("/")) {
    return `.${src}`;
  }

  return `./${src}`;
}

function formatPoemText(text) {
  return escapeHtml(text).replace(/\n/g, "<br>");
}

function renderBiographyParagraphs(text) {
  return text
    .split(/\n\n+/)
    .map((paragraph) => `<p>${escapeHtml(paragraph.trim())}</p>`)
    .join("");
}

function normalizePlainText(text) {
  return text.replace(/\s+/g, " ").trim();
}

function truncateStory(text) {
  const plain = normalizePlainText(text);
  const limit = getShortStoryLimit();

  if (plain.length <= limit) {
    return { preview: plain, isTruncated: false };
  }

  return {
    preview: `${plain.slice(0, limit).trimEnd()}…`,
    full: plain,
    isTruncated: true,
  };
}

function renderContentBlocks(items, renderText, options = {}) {
  const { showTitle = true } = options;

  return (items ?? [])
    .map((item) => {
      const titleMarkup =
        showTitle && item.title
          ? `<p class="content-label">${escapeHtml(item.title)}</p>`
          : "";

      return `
        <article class="content-block">
          ${titleMarkup}
          ${renderText(item)}
        </article>
      `;
    })
    .join("");
}

function renderShortStories(stories) {
  return (stories ?? [])
    .map((story, index) => {
      const { preview, full, isTruncated } = truncateStory(story.text);

      return `
        <article class="content-block story-block" data-story-index="${index}">
          <p class="content-label">${escapeHtml(story.title)}</p>
          <p class="story-text">
            <span class="story-preview">${escapeHtml(preview)}</span>${
              isTruncated
                ? `<span class="story-full" hidden> ${escapeHtml(full)}</span> <button type="button" class="read-all">read all</button>`
                : ""
            }
          </p>
        </article>
      `;
    })
    .join("");
}

function renderPoems(poems) {
  return (poems ?? [])
    .map((poem) => {
      const imageMarkup = poem.image
        ? `<img class="poem-image" src="${escapeHtml(resolveMediaSrc(poem.image))}" alt="">`
        : "";

      return `
        <article class="content-block">
          <p class="content-label">${escapeHtml(poem.title)}</p>
          <p>${formatPoemText(poem.text)}</p>
          ${imageMarkup}
        </article>
      `;
    })
    .join("");
}

function bindReadAllButtons() {
  document.querySelectorAll(".read-all").forEach((button) => {
    button.addEventListener("click", () => {
      const block = button.closest(".story-block");
      const preview = block.querySelector(".story-preview");
      const full = block.querySelector(".story-full");

      preview.hidden = true;
      full.hidden = false;
      button.remove();
    });
  });
}

function renderHeader(data) {
  document.title = PAGE === "about" ? `${data.siteTitle} — About` : data.siteTitle;
  document.querySelector(".site-title").textContent = data.siteTitle;

  const navLink = document.querySelector(".site-nav");
  if (navLink) {
    navLink.textContent =
      PAGE === "about" ? data.onlyWorkLabel : data.infoLabel;
  }

  document.querySelectorAll("[data-column]").forEach((el) => {
    const key = el.dataset.column;
    el.textContent = data.columnTitles[key] ?? key;
  });
}

function renderWorkPage(data) {
  document.querySelector('[data-content="shortStories"]').innerHTML =
    renderShortStories(data.shortStories);
  bindReadAllButtons();

  document.querySelector('[data-content="poems"]').innerHTML = renderPoems(data.poems);

  document.querySelector('[data-content="interviews"]').innerHTML = renderContentBlocks(
    data.interviews,
    (item) => item.text
  );

  document
    .querySelector('[aria-label="Short Stories"]')
    ?.setAttribute("aria-label", data.columnTitles.shortStories);
  document
    .querySelector('[aria-label="Poems"]')
    ?.setAttribute("aria-label", data.columnTitles.poems);
  document
    .querySelector('[aria-label="Interview Series Excerpt"]')
    ?.setAttribute("aria-label", data.columnTitles.interviews);
}

function renderAboutPage(data) {
  document.querySelector('[data-content="biography"]').innerHTML = renderContentBlocks(
    data.biography,
    (item) => renderBiographyParagraphs(item.text),
    { showTitle: false }
  );

  document.querySelector('[data-content="contact"]').innerHTML = (data.contactLinks ?? [])
    .map(
      (link) =>
        `<a href="${escapeHtml(link.text)}" class="contact-link">${escapeHtml(link.title)}</a>`
    )
    .join("");

  document.querySelector(".references-total").textContent = String(
    (data.references ?? []).length || 1
  );
  renderReference(0);
  startReferenceCycle();

  document
    .querySelector('[aria-label="Biography"]')
    ?.setAttribute("aria-label", data.columnTitles.biography);
  document
    .querySelector('[aria-label="References"]')
    ?.setAttribute("aria-label", data.columnTitles.references);
  document
    .querySelector('[aria-label="Contact"]')
    ?.setAttribute("aria-label", data.columnTitles.contact);
}

function renderReference(index) {
  const quoteEl = document.querySelector(".references-quote");
  const citeEl = document.querySelector(".references-cite");
  const currentEl = document.querySelector(".references-current");

  if (!quoteEl || !citeEl || !currentEl) {
    return;
  }

  const references = siteData?.references ?? [];
  if (!references.length) {
    quoteEl.textContent = "";
    citeEl.textContent = "";
    currentEl.textContent = "0";
    return;
  }

  const ref = references[index];
  quoteEl.textContent = `"${ref.text}"`;
  citeEl.textContent = ref.title;
  currentEl.textContent = String(index + 1);
}

function startReferenceCycle() {
  stopReferenceCycle();

  const references = siteData?.references ?? [];
  if (!references.length) {
    return;
  }

  referenceIndex = 0;
  renderReference(referenceIndex);

  referenceTimer = window.setInterval(() => {
    referenceIndex = (referenceIndex + 1) % references.length;
    renderReference(referenceIndex);
  }, REFERENCE_INTERVAL_MS);
}

function stopReferenceCycle() {
  if (referenceTimer !== null) {
    window.clearInterval(referenceTimer);
    referenceTimer = null;
  }
}

function renderShortStoriesColumn() {
  if (!siteData || PAGE !== "work") {
    return;
  }

  document.querySelector('[data-content="shortStories"]').innerHTML =
    renderShortStories(siteData.shortStories);
  bindReadAllButtons();
}

async function init() {
  const response = await fetch("data/site.json");
  if (!response.ok) {
    throw new Error("Failed to load site content.");
  }

  siteData = await response.json();
  renderHeader(siteData);

  if (PAGE === "work") {
    renderWorkPage(siteData);
    MOBILE_MEDIA_QUERY.addEventListener("change", renderShortStoriesColumn);
  } else if (PAGE === "about") {
    renderAboutPage(siteData);
  }
}

init().catch((error) => {
  console.error(error);
  document.body.insertAdjacentHTML(
    "beforeend",
    '<p style="padding:1rem;color:#34280C;">Unable to load site content.</p>'
  );
});
