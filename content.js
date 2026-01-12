// src/content.ts
var styles = `
#cmdk-overlay {
  --cmdk-bg: rgba(22, 22, 22, 0.98);
  --cmdk-border: rgba(255, 255, 255, 0.1);
  --cmdk-text: #ffffff;
  --cmdk-text-secondary: rgba(255, 255, 255, 0.5);
  --cmdk-accent: #7c5cff;
  --cmdk-input-bg: rgba(255, 255, 255, 0.06);
  --cmdk-shadow: 0 16px 70px rgba(0, 0, 0, 0.5);
  --cmdk-radius: 12px;

  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2147483647;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 20vh;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.15s ease, visibility 0.15s ease;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

#cmdk-overlay.cmdk-visible {
  opacity: 1;
  visibility: visible;
}

#cmdk-overlay * {
  box-sizing: border-box;
}

.cmdk-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.cmdk-modal {
  position: relative;
  width: 100%;
  max-width: 640px;
  background: var(--cmdk-bg);
  border: 1px solid var(--cmdk-border);
  border-radius: var(--cmdk-radius);
  box-shadow: var(--cmdk-shadow);
  overflow: hidden;
  transform: scale(0.98) translateY(-10px);
  transition: transform 0.15s ease;
}

#cmdk-overlay.cmdk-visible .cmdk-modal {
  transform: scale(1) translateY(0);
}

.cmdk-header {
  padding: 16px;
  border-bottom: 1px solid var(--cmdk-border);
}

.cmdk-input {
  width: 100%;
  background: var(--cmdk-input-bg);
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 16px;
  color: var(--cmdk-text);
  outline: none;
  font-family: inherit;
}

.cmdk-input::placeholder {
  color: var(--cmdk-text-secondary);
}

.cmdk-input:focus {
  background: rgba(255, 255, 255, 0.08);
}

.cmdk-content {
  padding: 8px;
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
}

.cmdk-hello {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 180px;
  font-size: 24px;
  font-weight: 600;
  color: var(--cmdk-text);
  background: linear-gradient(135deg, var(--cmdk-accent), #ff6b6b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.cmdk-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--cmdk-border);
  display: flex;
  justify-content: flex-end;
}

.cmdk-hint {
  font-size: 12px;
  color: var(--cmdk-text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
}

.cmdk-hint kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  font-size: 11px;
  font-family: inherit;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--cmdk-border);
  border-radius: 4px;
  color: var(--cmdk-text-secondary);
}

.cmdk-content::-webkit-scrollbar {
  width: 8px;
}

.cmdk-content::-webkit-scrollbar-track {
  background: transparent;
}

.cmdk-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
}

.cmdk-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}
`;
function injectStyles() {
  const styleEl = document.createElement("style");
  styleEl.id = "cmdk-styles";
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);
}
function createOverlay() {
  const overlay = document.createElement("div");
  overlay.id = "cmdk-overlay";
  overlay.innerHTML = `
    <div class="cmdk-backdrop"></div>
    <div class="cmdk-modal">
      <div class="cmdk-header">
        <input type="text" class="cmdk-input" placeholder="Type a command..." autofocus />
      </div>
      <div class="cmdk-content">
        <div class="cmdk-hello">Hello World</div>
      </div>
      <div class="cmdk-footer">
        <span class="cmdk-hint"><kbd>esc</kbd> to close</span>
      </div>
    </div>
  `;
  return overlay;
}
var overlay = null;
function showOverlay() {
  if (!document.getElementById("cmdk-styles")) {
    injectStyles();
  }
  if (overlay && document.body.contains(overlay)) {
    overlay.classList.add("cmdk-visible");
    const input = overlay.querySelector(".cmdk-input");
    input?.focus();
    return;
  }
  overlay = createOverlay();
  document.body.appendChild(overlay);
  requestAnimationFrame(() => {
    overlay?.classList.add("cmdk-visible");
    const input = overlay?.querySelector(".cmdk-input");
    input?.focus();
  });
  const backdrop = overlay.querySelector(".cmdk-backdrop");
  backdrop?.addEventListener("click", hideOverlay);
  overlay.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      hideOverlay();
    }
  });
}
function hideOverlay() {
  if (overlay) {
    overlay.classList.remove("cmdk-visible");
  }
}
function toggleOverlay() {
  if (overlay?.classList.contains("cmdk-visible")) {
    hideOverlay();
  } else {
    showOverlay();
  }
}
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  if (message.action === "toggle-cmdk") {
    toggleOverlay();
  }
});
document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "k") {
    e.preventDefault();
    toggleOverlay();
  }
});
