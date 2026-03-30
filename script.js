let allowProgrammaticCopy = false;

function extractSectionText(section) {
  const clone = section.cloneNode(true);
  clone.querySelectorAll("[data-copy-btn], [data-copy-status]").forEach((el) => el.remove());
  let text = clone.innerText.trim();
  const heading = section.querySelector("h2")?.innerText || "";

  if (heading.startsWith("2)")) {
    text += "\n\nPoznamka: pole nech sa vola Field inak -1b.";
  }

  if (heading.startsWith("3)")) {
    text += "\n\nPoznamka: nech tam je a=0 deklarovane aspon 2x, inak -1b.";
  }

  return text;
}

async function copyTaskSection(section) {
  const text = extractSectionText(section);

  if (navigator.clipboard && window.isSecureContext) {
    allowProgrammaticCopy = true;
    try {
      await navigator.clipboard.writeText(text);
    } finally {
      allowProgrammaticCopy = false;
    }
    return;
  }

  const temp = document.createElement("textarea");
  temp.value = text;
  temp.setAttribute("readonly", "");
  temp.style.position = "fixed";
  temp.style.opacity = "0";
  document.body.appendChild(temp);
  temp.focus();
  temp.select();
  allowProgrammaticCopy = true;
  try {
    document.execCommand("copy");
  } finally {
    allowProgrammaticCopy = false;
  }
  document.body.removeChild(temp);
}

function isEditableElement(element) {
  return element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    (element instanceof HTMLElement && element.isContentEditable);
}

function preventManualClipboard(event) {
  if (allowProgrammaticCopy) {
    return;
  }

  if (isEditableElement(event.target)) {
    return;
  }

  event.preventDefault();
}

document.addEventListener("copy", preventManualClipboard);
document.addEventListener("cut", preventManualClipboard);

document.addEventListener("keydown", (event) => {
  if (allowProgrammaticCopy) {
    return;
  }

  const key = event.key.toLowerCase();
  const clipboardCombo = (event.ctrlKey || event.metaKey) && (key === "c" || key === "x");

  if (!clipboardCombo) {
    return;
  }

  if (isEditableElement(document.activeElement)) {
    return;
  }

  event.preventDefault();
});

document.querySelectorAll("[data-copy-section]").forEach((section) => {
  const button = section.querySelector("[data-copy-btn]");
  const status = section.querySelector("[data-copy-status]");

  button.addEventListener("click", async () => {
    try {
      await copyTaskSection(section);
      status.textContent = "Skopírované.";
    } catch (error) {
      status.textContent = "Kopírovanie zlyhalo, skús znova.";
    }

    window.setTimeout(() => {
      status.textContent = "";
    }, 1800);
  });
});