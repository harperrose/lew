const REFERENCES = [
  {
    quote: "Lewis writes with a precision that makes the ordinary feel luminous. Every sentence earns its place.",
    cite: "Sarah Chen, The New York Times Book Review",
  },
  {
    quote: "A master of the quiet moment—his stories linger long after the last page.",
    cite: "Michael Torres, The Paris Review",
  },
  {
    quote: "One of the most distinctive voices in contemporary American fiction.",
    cite: "Elena Vasquez, n+1",
  },
  {
    quote: "Lewis has the rare ability to find the epic within the everyday.",
    cite: "David Okonkwo, Granta",
  },
];

const REFERENCE_INTERVAL_MS = 4000;

const toggleBtn = document.querySelector(".info-toggle");
const toggleLabel = document.querySelector(".info-toggle-label");
const quoteEl = document.querySelector(".references-quote");
const citeEl = document.querySelector(".references-cite");
const currentEl = document.querySelector(".references-current");
const totalEl = document.querySelector(".references-total");

let referenceIndex = 0;
let referenceTimer = null;

function renderReference(index) {
  const ref = REFERENCES[index];
  quoteEl.textContent = `"${ref.quote}"`;
  citeEl.textContent = ref.cite;
  currentEl.textContent = String(index + 1);
}

function startReferenceCycle() {
  stopReferenceCycle();
  renderReference(referenceIndex);
  totalEl.textContent = String(REFERENCES.length);

  referenceTimer = window.setInterval(() => {
    referenceIndex = (referenceIndex + 1) % REFERENCES.length;
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
  toggleLabel.textContent = isOpen ? "Only Work" : "Info";

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

renderReference(0);
totalEl.textContent = String(REFERENCES.length);
