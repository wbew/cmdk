import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";

const styles = `
:host {
  all: initial;
}

#cmdk-overlay {
  --cmdk-bg: rgba(22, 22, 22, 0.95);
  --cmdk-border: rgba(255, 255, 255, 0.15);
  --cmdk-text: #ffffff;
  --cmdk-text-secondary: rgba(255, 255, 255, 0.5);
  --cmdk-accent: #7c5cff;
  --cmdk-input-bg: rgba(255, 255, 255, 0.06);
  --cmdk-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
  --cmdk-radius: 12px;

  position: fixed;
  left: 50%;
  bottom: 10vh;
  transform: translateX(-50%);
  z-index: 2147483647;
  width: 100%;
  max-width: 640px;
  padding: 0 16px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.15s ease, visibility 0.15s ease;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  pointer-events: none;
}

#cmdk-overlay.visible {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

#cmdk-overlay * {
  box-sizing: border-box;
}

.cmdk-modal {
  position: relative;
  width: 100%;
  background: var(--cmdk-bg);
  border: 1px solid var(--cmdk-border);
  border-radius: var(--cmdk-radius);
  box-shadow: var(--cmdk-shadow);
  overflow: hidden;
  transform: translateY(10px);
  transition: transform 0.15s ease;
}

#cmdk-overlay.visible .cmdk-modal {
  transform: translateY(0);
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

interface CommandPaletteProps {
  visible: boolean;
  onClose: () => void;
}

function CommandPalette({ visible, onClose }: CommandPaletteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (visible) {
      inputRef.current?.focus();
    }
  }, [visible]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      id="cmdk-overlay"
      className={visible ? "visible" : ""}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
    >
      <div className="cmdk-modal">
        <div className="cmdk-header">
          <input
            ref={inputRef}
            type="text"
            className="cmdk-input"
            placeholder="Type a command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="cmdk-content">
          <div className="cmdk-hello">Hello World</div>
        </div>
        <div className="cmdk-footer">
          <span className="cmdk-hint">
            <kbd>esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setVisible((v) => !v);
      }
    };

    const handleMessage = (message: { action: string }) => {
      if (message.action === "toggle-cmdk") {
        setVisible((v) => !v);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  return <CommandPalette visible={visible} onClose={() => setVisible(false)} />;
}

// Mount React app in shadow DOM for style isolation
const host = document.createElement("div");
host.id = "cmdk-root";
const shadow = host.attachShadow({ mode: "open" });

const styleEl = document.createElement("style");
styleEl.textContent = styles;
shadow.appendChild(styleEl);

const reactRoot = document.createElement("div");
shadow.appendChild(reactRoot);

document.body.appendChild(host);
createRoot(reactRoot).render(<App />);
