const REFERENCE_INTERVAL_MS = 4000;
const SHORT_STORY_LIMIT = 400;

let siteData = null;
let referenceIndex = 0;
let referenceTimer = null;

const toggleBtn = document.querySelector(".info-toggle");
const toggleLabel = document.querySelector(".info-toggle-label");
const quoteEl = document.querySelector(".references-quote");
const citeEl = document.querySelector(".references-cite");
const currentEl = document.querySelector(".references-current");
const totalEl = document.querySelector(".references-total");

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatPoemText(text) {
  return escapeHtml(text).replace(/\n/g, "<br>");
}

function normalizePlainText(text) {
  return text.replace(/\s+/g, " ").trim();
}

function truncateStory(text) {
  const plain = normalizePlainText(text);
  if (plain.length <= SHORT_STORY_LIMIT) {
    return { preview: plain, isTruncated: false };
  }

  return {
    preview: `${plain.slice(0, SHORT_STORY_LIMIT).trimEnd()}…`,
    full: plain,
    isTruncated: true,
  };
}

function renderContentBlocks(items, renderText) {
  return items
    .map(
      (item) => `
        <article class="content-block">
          <p class="content-label">${escapeHtml(item.title)}</p>
          ${renderText(item.text)}
        </article>
      `
    )
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

function renderSite(data) {
  document.title = data.siteTitle;
  document.querySelector(".site-title").textContent = data.siteTitle;
  toggleLabel.textContent = data.infoLabel;

  document.querySelectorAll("[data-column]").forEach((el) => {
    const key = el.dataset.column;
    el.textContent = data.columnTitles[key] ?? key;
  });

  document.querySelector('[data-content="biography"]').innerHTML = renderContentBlocks(
    data.biography ?? [],
    (text) => `<p>${escapeHtml(text)}</p>`
  );

  document.querySelector('[data-content="shortStories"]').innerHTML =
    renderShortStories(data.shortStories);
  bindReadAllButtons();

  document.querySelector('[data-content="poems"]').innerHTML = renderContentBlocks(
    data.poems ?? [],
    (text) => `<p>${formatPoemText(text)}</p>`
  );

  document.querySelector('[data-content="interviews"]').innerHTML = renderContentBlocks(
    data.interviews ?? [],
    (text) => text
  );

  document.querySelector('[data-content="contact"]').innerHTML = (data.contactLinks ?? [])
    .map(
      (link) =>
        `<a href="${escapeHtml(link.text)}" class="contact-link">${escapeHtml(link.title)}</a>`
    )
    .join("");

  document.querySelector('[aria-label="Short Story Preview"]').setAttribute(
    "aria-label",
    data.columnTitles.shortStories
  );
  document.querySelector('[aria-label="Poems"]').setAttribute(
    "aria-label",
    data.columnTitles.poems
  );
  document.querySelector('[aria-label="Interview Series Excerpt"]').setAttribute(
    "aria-label",
    data.columnTitles.interviews
  );

  totalEl.textContent = String((data.references ?? []).length || 1);
  renderReference(0);
}

function renderReference(index) {
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

function setInfoOpen(isOpen) {
  document.body.classList.toggle("info-open", isOpen);
  toggleBtn.setAttribute("aria-expanded", String(isOpen));
  toggleLabel.textContent = isOpen ? siteData.onlyWorkLabel : siteData.infoLabel;

  document.querySelectorAll(".overlay-block").forEach((block) => {
    block.hidden = !isOpen;
  });

  if (isOpen) {
    startReferenceCycle();
    if (window.matchMedia("(max-width: 768px)").matches) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  } else {
    stopReferenceCycle();
  }
}

toggleBtn.addEventListener("click", () => {
  setInfoOpen(!document.body.classList.contains("info-open"));
});

async function init() {
  const response = await fetch("data/site.json");
  if (!response.ok) {
    throw new Error("Failed to load site content.");
  }

  siteData = await response.json();
  renderSite(siteData);
}

init().catch((error) => {
  console.error(error);
  document.body.insertAdjacentHTML(
    "beforeend",
    '<p style="padding:1rem;color:#262945;">Unable to load site content.</p>'
  );
});
