/**
 * Zero-Dependency E2E Test Harness & Assertion Engine
 * Compatible with Node.js (v20+) and modern web browsers (ES Modules).
 * Cryptocurrency Club FinTech Portal
 */

// Detect runtime environment
export const isNode =
  typeof process !== "undefined" && process.versions?.node != null;
export const isBrowser = typeof window !== "undefined" && !isNode;

// Node filesystem imports
let nodeFs = null;
let nodePath = null;
let nodeUrl = null;

if (isNode) {
  try {
    nodeFs = await import("node:fs");
    nodePath = await import("node:path");
    nodeUrl = await import("node:url");
  } catch (err) {
    console.warn("Failed to load Node.js native filesystem modules:", err);
  }
}

// -------------------------------------------------------------
// Lightweight DOM & Browser Environment Shim for Headless Node
// -------------------------------------------------------------

class MockDOMTokenList {
  constructor(element) {
    this._element = element;
    this._classes = new Set();
  }
  add(...tokens) {
    tokens.forEach((t) => t && this._classes.add(t));
    this._sync();
  }
  remove(...tokens) {
    tokens.forEach((t) => this._classes.delete(t));
    this._sync();
  }
  toggle(token, force) {
    if (force === true) {
      this._classes.add(token);
    } else if (force === false) {
      this._classes.delete(token);
    } else if (this._classes.has(token)) {
      this._classes.delete(token);
    } else {
      this._classes.add(token);
    }
    this._sync();
    return this._classes.has(token);
  }
  contains(token) {
    return this._classes.has(token);
  }
  _sync() {
    this._element._attributes.set("class", Array.from(this._classes).join(" "));
  }
  _initFromClass(className) {
    this._classes.clear();
    if (className) {
      className
        .split(/\s+/)
        .filter(Boolean)
        .forEach((c) => this._classes.add(c));
    }
  }
  toString() {
    return Array.from(this._classes).join(" ");
  }
}

class MockElement {
  constructor(tagName = "div") {
    this.tagName = tagName.toUpperCase();
    this.nodeName = this.tagName;
    this.nodeType = 1;
    this._attributes = new Map();
    this.children = [];
    this.parentElement = null;
    this._listeners = new Map();
    this.classList = new MockDOMTokenList(this);
    this.style = {};
    this.dataset = new Proxy(
      {},
      {
        get: (_target, prop) => {
          if (typeof prop !== "string") return undefined;
          const attrName =
            "data-" + prop.replace(/([A-Z])/g, "-$1").toLowerCase();
          return this._attributes.get(attrName);
        },
        set: (target, prop, value) => {
          if (typeof prop === "string") {
            const attrName =
              "data-" + prop.replace(/([A-Z])/g, "-$1").toLowerCase();
            const strVal = String(value);
            this._attributes.set(attrName, strVal);
            target[prop] = strVal;
          }
          return true;
        },
        deleteProperty: (target, prop) => {
          if (typeof prop === "string") {
            const attrName =
              "data-" + prop.replace(/([A-Z])/g, "-$1").toLowerCase();
            this._attributes.delete(attrName);
            delete target[prop];
          }
          return true;
        },
        has: (_target, prop) => {
          if (typeof prop !== "string") return false;
          const attrName =
            "data-" + prop.replace(/([A-Z])/g, "-$1").toLowerCase();
          return this._attributes.has(attrName);
        },
      },
    );
    this._textContent = "";
    this.value = "";
    this.checked = false;
    this.disabled = false;
  }

  get id() {
    return this._attributes.get("id") || "";
  }
  set id(val) {
    this._attributes.set("id", val);
  }

  get className() {
    return this.classList.toString();
  }
  set className(val) {
    this.classList._initFromClass(val);
  }

  get textContent() {
    if (this.children.length === 0) return this._textContent;
    return this.children.map((c) => c.textContent).join("");
  }
  set textContent(val) {
    this._textContent = String(val ?? "");
    this.children = [];
  }

  get innerHTML() {
    if (this._rawHtml) return this._rawHtml;
    return this.textContent;
  }
  set innerHTML(val) {
    this._rawHtml = String(val ?? "");
    this._textContent = "";
    this.children = parseHtmlToMockElements(this._rawHtml, this);
  }

  contains(child) {
    if (!child) return false;
    if (child === this) return true;
    for (const c of this.children) {
      if (c === child || (c instanceof MockElement && c.contains(child)))
        return true;
    }
    return false;
  }

  scrollIntoView() {
    // No-op stub for headless DOM environment
  }

  setAttribute(name, value) {
    const val = String(value);
    this._attributes.set(name.toLowerCase(), val);
    if (name.toLowerCase() === "class") {
      this.classList._initFromClass(val);
    }
    if (name.startsWith("data-")) {
      const key = name.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      this.dataset[key] = val;
    }
  }

  getAttribute(name) {
    return this._attributes.has(name.toLowerCase())
      ? this._attributes.get(name.toLowerCase())
      : null;
  }

  hasAttribute(name) {
    return this._attributes.has(name.toLowerCase());
  }

  removeAttribute(name) {
    this._attributes.delete(name.toLowerCase());
    if (name.toLowerCase() === "class") {
      this.classList._classes.clear();
    }
  }

  appendChild(child) {
    if (!child) return child;
    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  append(...items) {
    for (const item of items) {
      if (typeof item === "string") {
        const textNode = new MockElement("span");
        textNode.textContent = item;
        this.appendChild(textNode);
      } else if (item instanceof MockElement) {
        this.appendChild(item);
      }
    }
  }

  prepend(...items) {
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      if (item instanceof MockElement) {
        item.parentElement = this;
        this.children.unshift(item);
      }
    }
  }

  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
      child.parentElement = null;
    }
    return child;
  }

  remove() {
    if (this.parentElement) {
      const index = this.parentElement.children.indexOf(this);
      if (index !== -1) {
        this.parentElement.children.splice(index, 1);
      }
      this.parentElement = null;
    }
  }

  replaceChildren(...newChildren) {
    this.children.forEach((c) => (c.parentElement = null));
    this.children = [];
    newChildren.forEach((c) => {
      if (c instanceof MockElement) {
        this.appendChild(c);
      }
    });
  }

  querySelector(selector) {
    return this._findFirst(selector);
  }

  querySelectorAll(selector) {
    return this._findAll(selector);
  }

  _matches(selector) {
    const sel = selector.trim();
    if (sel.startsWith("#")) {
      return this.id === sel.slice(1);
    }
    if (sel.startsWith(".")) {
      const classes = sel.slice(1).split(".");
      return classes.every((c) => this.classList.contains(c));
    }
    if (sel.startsWith("[") && sel.endsWith("]")) {
      const attrExpr = sel.slice(1, -1);
      if (attrExpr.includes("=")) {
        const [attr, val] = attrExpr.split("=");
        const cleanVal = val.replace(/['"]/g, "");
        return this.getAttribute(attr) === cleanVal;
      }
      return this.hasAttribute(attrExpr);
    }
    return this.tagName.toLowerCase() === sel.toLowerCase();
  }

  _findFirst(selector) {
    for (const child of this.children) {
      if (child._matches(selector)) return child;
      const found = child._findFirst(selector);
      if (found) return found;
    }
    return null;
  }

  _findAll(selector) {
    const results = [];
    for (const child of this.children) {
      if (child._matches(selector)) results.push(child);
      results.push(...child._findAll(selector));
    }
    return results;
  }

  addEventListener(type, handler) {
    if (!this._listeners.has(type)) {
      this._listeners.set(type, new Set());
    }
    this._listeners.get(type).add(handler);
  }

  removeEventListener(type, handler) {
    if (this._listeners.has(type)) {
      this._listeners.get(type).delete(handler);
    }
  }

  dispatchEvent(event) {
    if (!event) return true;
    event.target = this;
    event.currentTarget = this;
    const handlers = this._listeners.get(event.type);
    if (handlers) {
      for (const h of handlers) {
        try {
          h.call(this, event);
        } catch (err) {
          console.error("Error in event listener:", err);
        }
      }
    }
    return !event.defaultPrevented;
  }

  click() {
    const ev = new MockEvent("click", { bubbles: true, cancelable: true });
    this.dispatchEvent(ev);
  }

  focus() {
    // No-op stub for headless DOM environment
  }
  blur() {
    // No-op stub for headless DOM environment
  }

  // Canvas mock support
  getContext(type) {
    if (this.tagName === "CANVAS" && type === "2d") {
      if (!this._ctx2d) {
        this._ctx2d = new MockCanvasRenderingContext2D(this);
      }
      return this._ctx2d;
    }
    return null;
  }

  toDataURL(type = "image/png") {
    return `data:${type};base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`;
  }
}

class MockCanvasRenderingContext2D {
  constructor(canvas) {
    this.canvas = canvas;
    this.fillStyle = "#000000";
    this.strokeStyle = "#000000";
    this.lineWidth = 1;
    this.font = "10px sans-serif";
    this.textAlign = "start";
    this.textBaseline = "alphabetic";
    this.calls = [];
  }
  _record(name, args) {
    this.calls.push({
      name,
      args,
      fillStyle: this.fillStyle,
      strokeStyle: this.strokeStyle,
    });
  }
  beginPath() {
    this._record("beginPath", []);
  }
  closePath() {
    this._record("closePath", []);
  }
  moveTo(x, y) {
    this._record("moveTo", [x, y]);
  }
  lineTo(x, y) {
    this._record("lineTo", [x, y]);
  }
  arc(x, y, radius, startAngle, endAngle, counterclockwise) {
    this._record("arc", [x, y, radius, startAngle, endAngle, counterclockwise]);
  }
  fill() {
    this._record("fill", []);
  }
  stroke() {
    this._record("stroke", []);
  }
  fillRect(x, y, w, h) {
    this._record("fillRect", [x, y, w, h]);
  }
  strokeRect(x, y, w, h) {
    this._record("strokeRect", [x, y, w, h]);
  }
  clearRect(x, y, w, h) {
    this._record("clearRect", [x, y, w, h]);
  }
  fillText(text, x, y) {
    this._record("fillText", [text, x, y]);
  }
  strokeText(text, x, y) {
    this._record("strokeText", [text, x, y]);
  }
  measureText(text) {
    return { width: (text || "").length * 7 };
  }
  save() {
    this._record("save", []);
  }
  restore() {
    this._record("restore", []);
  }
  translate(x, y) {
    this._record("translate", [x, y]);
  }
  scale(x, y) {
    this._record("scale", [x, y]);
  }
  rotate(angle) {
    this._record("rotate", [angle]);
  }
  createLinearGradient() {
    return { addColorStop: () => {} };
  }
}

const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

function _applyAttributes(el, attrStr) {
  if (!attrStr) return;
  const attrRegex = /([a-zA-Z0-9-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^>\s]+)))?/g;
  let attrMatch;
  while ((attrMatch = attrRegex.exec(attrStr)) !== null) {
    const attrName = attrMatch[1];
    const attrVal = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? "";
    el.setAttribute(attrName, attrVal);
  }
}

function _appendNodeText(stack, text) {
  const trimmed = text.trim();
  const current = stack.at(-1);
  if (trimmed && current?.children.length === 0) {
    current.textContent = current.textContent
      ? `${current.textContent} ${trimmed}`
      : trimmed;
  }
}

function _parseTagToken(tagContent) {
  const selfClosing = tagContent.endsWith("/");
  const cleanContent = selfClosing
    ? tagContent.slice(0, -1).trim()
    : tagContent.trim();

  const spaceIdx = cleanContent.search(/\s/);
  const tagName = (
    spaceIdx === -1 ? cleanContent : cleanContent.slice(0, spaceIdx)
  ).toLowerCase();
  const attrStr = spaceIdx === -1 ? "" : cleanContent.slice(spaceIdx + 1);

  return { tagName, attrStr, selfClosing };
}

function _attachElement(el, stack, parent, rootElements) {
  const currentParent = stack.at(-1) || parent;
  if (currentParent instanceof MockElement) {
    currentParent.children.push(el);
    el.parentElement = currentParent;
  }

  if (stack.length === 0) {
    rootElements.push(el);
  }
}

function parseHtmlToMockElements(htmlStr, parent = null) {
  if (!htmlStr || typeof htmlStr !== "string") return [];

  const rootElements = [];
  const stack = [];
  const tokenRegex = /<([^<>]+)>|([^<]+)/g;
  let match;

  while ((match = tokenRegex.exec(htmlStr)) !== null) {
    const [, tagContent, text] = match;

    if (text) {
      _appendNodeText(stack, text);
      continue;
    }

    if (!tagContent || tagContent.startsWith("!--")) continue;

    if (tagContent.startsWith("/")) {
      const closingTag = tagContent.slice(1).trim().toLowerCase();
      if (stack.at(-1)?.tagName.toLowerCase() === closingTag) {
        stack.pop();
      }
      continue;
    }

    const { tagName, attrStr, selfClosing } = _parseTagToken(tagContent);
    if (!tagName) continue;

    const el = new MockElement(tagName);
    _applyAttributes(el, attrStr);
    _attachElement(el, stack, parent, rootElements);

    const isVoid = selfClosing || VOID_TAGS.has(tagName);
    if (!isVoid) {
      stack.push(el);
    }
  }

  return rootElements;
}

class MockEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.bubbles = options.bubbles ?? false;
    this.cancelable = options.cancelable ?? false;
    this.defaultPrevented = false;
    this.target = null;
    this.currentTarget = null;
  }
  preventDefault() {
    if (this.cancelable) this.defaultPrevented = true;
  }
  stopPropagation() {
    // No-op stub for mock event
  }
}

class MockCustomEvent extends MockEvent {
  constructor(type, options = {}) {
    super(type, options);
    this.detail = options.detail ?? null;
  }
}

class MockKeyboardEvent extends MockEvent {
  constructor(type, options = {}) {
    super(type, options);
    this.key = options.key || "";
    this.code = options.code || "";
    this.ctrlKey = !!options.ctrlKey;
    this.metaKey = !!options.metaKey;
    this.shiftKey = !!options.shiftKey;
    this.altKey = !!options.altKey;
  }
}

class MockStorageEvent extends MockEvent {
  constructor(type, options = {}) {
    super(type, options);
    this.key = options.key ?? null;
    this.oldValue = options.oldValue ?? null;
    this.newValue = options.newValue ?? null;
    this.url = options.url ?? "";
    this.storageArea = options.storageArea ?? null;
  }
}

class MockStorage {
  constructor() {
    this._store = new Map();
  }
  getItem(key) {
    return this._store.has(String(key)) ? this._store.get(String(key)) : null;
  }
  setItem(key, value) {
    this._store.set(String(key), String(value));
  }
  removeItem(key) {
    this._store.delete(String(key));
  }
  clear() {
    this._store.clear();
  }
  get length() {
    return this._store.size;
  }
  key(index) {
    return Array.from(this._store.keys())[index] || null;
  }
}

class MockDocument {
  constructor() {
    this.documentElement = new MockElement("html");
    this.body = new MockElement("body");
    this.head = new MockElement("head");
    this.documentElement.appendChild(this.head);
    this.documentElement.appendChild(this.body);
  }
  createElement(tag) {
    return new MockElement(tag);
  }
  getElementById(id) {
    return this.documentElement._findFirst(`#${id}`);
  }
  querySelector(selector) {
    if (selector === ":root" || selector === "html")
      return this.documentElement;
    if (selector === "body") return this.body;
    return this.documentElement.querySelector(selector);
  }
  querySelectorAll(selector) {
    return this.documentElement.querySelectorAll(selector);
  }
  addEventListener(type, handler) {
    if (!this._listeners) this._listeners = new Map();
    if (!this._listeners.has(type)) this._listeners.set(type, new Set());
    this._listeners.get(type).add(handler);
  }
  removeEventListener(type, handler) {
    if (!this._listeners) return;
    if (this._listeners.has(type)) this._listeners.get(type).delete(handler);
  }
  dispatchEvent(event) {
    if (!this._listeners) return !event?.defaultPrevented;
    const handlers = Array.from(this._listeners.get(event?.type) || []);
    for (const h of handlers) {
      h.call(this, event);
    }
    return !event?.defaultPrevented;
  }
}

export function setupNodeEnvironment() {
  if (!isNode) return;

  if (globalThis.window === undefined) {
    const document = new MockDocument();
    const localStorage = new MockStorage();
    const sessionStorage = new MockStorage();

    const windowMock = {
      document,
      localStorage,
      sessionStorage,
      devicePixelRatio: 2,
      innerWidth: 1280,
      innerHeight: 800,
      _listeners: new Map(),
      addEventListener(type, handler) {
        if (!this._listeners.has(type)) this._listeners.set(type, new Set());
        this._listeners.get(type).add(handler);
      },
      removeEventListener(type, handler) {
        if (this._listeners.has(type))
          this._listeners.get(type).delete(handler);
      },
      dispatchEvent(event) {
        const handlers = Array.from(this._listeners.get(event?.type) || []);
        for (const h of handlers) {
          h.call(this, event);
        }
        return !event?.defaultPrevented;
      },
      matchMedia(query) {
        let matches = false;
        if (query.includes("prefers-color-scheme: dark")) matches = true;
        return {
          matches,
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
        };
      },
      requestAnimationFrame(cb) {
        return setTimeout(() => cb(Date.now()), 16);
      },
      cancelAnimationFrame(id) {
        clearTimeout(id);
      },
      location: {
        pathname: "/index.html",
        href: "http://localhost/index.html",
      },
      print() {
        // No-op stub for mock window
      },
      fetch: async () => ({
        ok: true,
        status: 200,
        json: async () => ({ RAW: {} }),
        text: async () => "",
      }),
    };

    windowMock.Event = MockEvent;
    windowMock.CustomEvent = MockCustomEvent;
    windowMock.KeyboardEvent = MockKeyboardEvent;
    windowMock.StorageEvent = MockStorageEvent;

    globalThis.window = windowMock;
    globalThis.document = document;
    globalThis.localStorage = localStorage;
    globalThis.sessionStorage = sessionStorage;
    globalThis.Event = MockEvent;
    globalThis.CustomEvent = MockCustomEvent;
    globalThis.KeyboardEvent = MockKeyboardEvent;
    globalThis.StorageEvent = MockStorageEvent;
    globalThis.HTMLElement = MockElement;
    globalThis.HTMLCanvasElement = MockElement;
    globalThis.fetch = windowMock.fetch;
  }
}

// Auto-initialize Node shim
setupNodeEnvironment();

// -------------------------------------------------------------
// Module & File Helpers
// -------------------------------------------------------------

/**
 * Get project root path
 */
export function getProjectRoot() {
  if (isNode && nodePath) {
    const __dirname = nodePath.dirname(nodeUrl.fileURLToPath(import.meta.url));
    return nodePath.resolve(__dirname, "..");
  }
  return ".";
}

/**
 * Safely check if a project file exists on disk
 */
export function fileExists(relativePath) {
  if (isNode && nodeFs && nodePath) {
    const fullPath = nodePath.join(getProjectRoot(), relativePath);
    return nodeFs.existsSync(fullPath);
  }
  return true; // Browser assumes accessible unless fetch 404
}

/**
 * Read text file from project
 */
export async function readProjectFile(relativePath) {
  if (isNode && nodeFs && nodePath) {
    const fullPath = nodePath.join(getProjectRoot(), relativePath);
    if (!nodeFs.existsSync(fullPath)) return null;
    return nodeFs.readFileSync(fullPath, "utf8");
  }
  if (isBrowser) {
    try {
      const res = await fetch(`../${relativePath}`);
      if (!res.ok) return null;
      return await res.text();
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Safely import an ES module relative to project root
 */
export async function safeImport(relativePath) {
  if (isNode) {
    if (!fileExists(relativePath)) {
      return {
        available: false,
        module: null,
        reason: `File ${relativePath} not yet implemented`,
      };
    }
    try {
      const fullPath = nodePath.join(getProjectRoot(), relativePath);
      const fileUrl = nodeUrl.pathToFileURL(fullPath).href;
      const mod = await import(fileUrl);
      return { available: true, module: mod };
    } catch (err) {
      return {
        available: false,
        module: null,
        error: err,
        reason: err.message,
      };
    }
  } else {
    try {
      const mod = await import(`../${relativePath}`);
      return { available: true, module: mod };
    } catch (err) {
      return {
        available: false,
        module: null,
        error: err,
        reason: err.message,
      };
    }
  }
}

// -------------------------------------------------------------
// Rich Assertion Framework (expect)
// -------------------------------------------------------------

class ExpectationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ExpectationError";
  }
}

function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (
    typeof a !== "object" ||
    a === null ||
    typeof b !== "object" ||
    b === null
  )
    return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!Object.hasOwn(b, key) || !deepEqual(a[key], b[key])) {
      return false;
    }
  }
  return true;
}

export function expect(actual) {
  let isNot = false;

  const matchers = {
    get not() {
      isNot = !isNot;
      return matchers;
    },

    toBe(expected) {
      const pass = Object.is(actual, expected);
      if (isNot ? pass : !pass) {
        throw new ExpectationError(
          `Expected ${JSON.stringify(actual)} ${isNot ? "not to be" : "to be"} ${JSON.stringify(expected)}`,
        );
      }
    },

    toEqual(expected) {
      const pass = deepEqual(actual, expected);
      if (isNot ? pass : !pass) {
        throw new ExpectationError(
          `Expected ${JSON.stringify(actual)} ${isNot ? "not to equal" : "to equal"} ${JSON.stringify(expected)}`,
        );
      }
    },

    toBeTruthy() {
      const pass = Boolean(actual);
      if (isNot ? pass : !pass) {
        throw new ExpectationError(
          `Expected ${JSON.stringify(actual)} ${isNot ? "not to be truthy" : "to be truthy"}`,
        );
      }
    },

    toBeFalsy() {
      const pass = !actual;
      if (isNot ? pass : !pass) {
        throw new ExpectationError(
          `Expected ${JSON.stringify(actual)} ${isNot ? "not to be falsy" : "to be falsy"}`,
        );
      }
    },

    toBeNull() {
      const pass = actual === null;
      if (isNot ? pass : !pass) {
        throw new ExpectationError(
          `Expected ${JSON.stringify(actual)} ${isNot ? "not to be null" : "to be null"}`,
        );
      }
    },

    toBeUndefined() {
      const pass = actual === undefined;
      if (isNot ? pass : !pass) {
        throw new ExpectationError(
          `Expected ${JSON.stringify(actual)} ${isNot ? "not to be undefined" : "to be undefined"}`,
        );
      }
    },

    toBeDefined() {
      const pass = actual !== undefined;
      if (isNot ? pass : !pass) {
        throw new ExpectationError(
          `Expected value ${isNot ? "to be undefined" : "to be defined"}`,
        );
      }
    },

    toBeGreaterThan(expected) {
      const pass = actual > expected;
      if (isNot ? pass : !pass) {
        throw new ExpectationError(
          `Expected ${actual} ${isNot ? "not to be >" : "to be >"} ${expected}`,
        );
      }
    },

    toBeGreaterThanOrEqual(expected) {
      const pass = actual >= expected;
      if (isNot ? pass : !pass) {
        throw new ExpectationError(
          `Expected ${actual} ${isNot ? "not to be >=" : "to be >="} ${expected}`,
        );
      }
    },

    toBeLessThan(expected) {
      const pass = actual < expected;
      if (isNot ? pass : !pass) {
        throw new ExpectationError(
          `Expected ${actual} ${isNot ? "not to be <" : "to be <"} ${expected}`,
        );
      }
    },

    toBeLessThanOrEqual(expected) {
      const pass = actual <= expected;
      if (isNot ? pass : !pass) {
        throw new ExpectationError(
          `Expected ${actual} ${isNot ? "not to be <=" : "to be <="} ${expected}`,
        );
      }
    },

    toBeCloseTo(expected, numDigits = 2) {
      const tolerance = Math.pow(10, -numDigits) / 2;
      const pass = Math.abs(actual - expected) < tolerance;
      if (isNot ? pass : !pass) {
        throw new ExpectationError(
          `Expected ${actual} ${isNot ? "not to be close to" : "to be close to"} ${expected} (within ${tolerance})`,
        );
      }
    },

    toContain(item) {
      let pass = false;
      if (typeof actual === "string") {
        pass = actual.includes(String(item));
      } else if (Array.isArray(actual)) {
        pass = actual.some((elem) => deepEqual(elem, item));
      } else if (actual instanceof Set || actual instanceof Map) {
        pass = actual.has(item);
      }
      if (isNot ? pass : !pass) {
        throw new ExpectationError(
          `Expected ${JSON.stringify(actual)} ${isNot ? "not to contain" : "to contain"} ${JSON.stringify(item)}`,
        );
      }
    },

    toHaveLength(expected) {
      const length = actual?.length ?? actual?.size;
      const pass = length === expected;
      if (isNot ? pass : !pass) {
        throw new ExpectationError(
          `Expected length ${length} ${isNot ? "not to be" : "to be"} ${expected}`,
        );
      }
    },

    toMatch(pattern) {
      const regex = typeof pattern === "string" ? new RegExp(pattern) : pattern;
      const pass = regex.test(String(actual));
      if (isNot ? pass : !pass) {
        throw new ExpectationError(
          `Expected "${actual}" ${isNot ? "not to match pattern" : "to match pattern"} ${pattern}`,
        );
      }
    },

    toThrow(optPattern) {
      if (typeof actual !== "function") {
        throw new ExpectationError("Expected a function to test for throwing");
      }
      let threw = false;
      let errorThrown = null;
      try {
        actual();
      } catch (err) {
        threw = true;
        errorThrown = err;
      }
      if (isNot ? threw : !threw) {
        throw new ExpectationError(
          `Expected function ${isNot ? "not to throw an error" : "to throw an error"}`,
        );
      }
      if (threw && optPattern) {
        const msg = errorThrown?.message || String(errorThrown);
        const regex =
          typeof optPattern === "string" ? new RegExp(optPattern) : optPattern;
        if (!regex.test(msg)) {
          throw new ExpectationError(
            `Expected thrown error message "${msg}" to match pattern ${optPattern}`,
          );
        }
      }
    },
  };

  return matchers;
}

// -------------------------------------------------------------
// Test Runner & Suite Registry
// -------------------------------------------------------------

export class TestRegistry {
  constructor() {
    this.suites = [];
    this._currentSuite = null;
    this.tier = 1;
  }

  setTier(tier) {
    this.tier = tier;
  }

  describe(name, fn) {
    const parentSuite = this._currentSuite;
    const suite = {
      name,
      tier: this.tier,
      tests: [],
      beforeEachHooks: [],
      afterEachHooks: [],
      beforeAllHooks: [],
      afterAllHooks: [],
      subSuites: [],
      parent: parentSuite,
    };

    if (parentSuite) {
      parentSuite.subSuites.push(suite);
    } else {
      this.suites.push(suite);
    }

    this._currentSuite = suite;
    try {
      fn();
    } finally {
      this._currentSuite = parentSuite;
    }
  }

  test(name, fn) {
    if (!this._currentSuite) {
      this.describe("Default Suite", () => this.test(name, fn));
      return;
    }
    this._currentSuite.tests.push({
      name,
      fn,
      tier: this._currentSuite.tier,
      skipped: false,
    });
  }

  it(name, fn) {
    this.test(name, fn);
  }

  skip(name, fn) {
    if (!this._currentSuite) return;
    this._currentSuite.tests.push({
      name,
      fn,
      tier: this._currentSuite.tier,
      skipped: true,
      skipReason: "Explicitly skipped",
    });
  }

  beforeEach(fn) {
    if (this._currentSuite) this._currentSuite.beforeEachHooks.push(fn);
  }

  afterEach(fn) {
    if (this._currentSuite) this._currentSuite.afterEachHooks.push(fn);
  }

  beforeAll(fn) {
    if (this._currentSuite) this._currentSuite.beforeAllHooks.push(fn);
  }

  afterAll(fn) {
    if (this._currentSuite) this._currentSuite.afterAllHooks.push(fn);
  }

  clear() {
    this.suites = [];
    this._currentSuite = null;
  }

  /**
   * Run all registered tests with progress tracking
   */
  async run({
    onTestStart,
    onTestComplete,
    onSuiteComplete,
    reporter,
    filter = null,
    tier = null,
    tierFilter = null,
  } = {}) {
    const effectiveTierFilter = tierFilter ?? tier;
    const results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      durationMs: 0,
      suites: [],
      suiteResults: [],
      failures: [],
    };

    const startTime = Date.now();
    const options = {
      effectiveTierFilter,
      filter,
      onTestStart,
      onTestComplete,
      onSuiteComplete,
      reporter,
    };

    await this.suites.reduce(
      (prev, suite) => prev.then(() => _runSuite(suite, results, options)),
      Promise.resolve(),
    );

    results.durationMs = Date.now() - startTime;
    return results;
  }
}

function _runHooks(hooks) {
  return hooks.reduce((p, hook) => p.then(() => hook()), Promise.resolve());
}

async function _executeTestBody(test, suite, ctx) {
  await _runHooks(suite.beforeEachHooks);
  await test.fn(ctx);
  await _runHooks(suite.afterEachHooks);
}

async function _runSingleTest(test, suite, results, suiteResult, options) {
  const { onTestStart, onTestComplete, reporter } = options;

  results.total++;
  const testResult = {
    name: test.name,
    suiteName: suite.name,
    tier: test.tier,
    status: "pending",
    durationMs: 0,
    error: null,
    skipReason: null,
  };

  onTestStart?.(testResult);
  reporter?.("test_start", testResult);

  if (test.skipped) {
    testResult.status = "skipped";
    testResult.skipReason = test.skipReason || "Skipped";
    results.skipped++;
    suiteResult.skipped++;
  } else {
    const testStart = Date.now();
    let currentSkipReason = null;
    const ctx = {
      skip: (reason) => {
        currentSkipReason = reason || "Skipped dynamically";
      },
    };

    try {
      await _executeTestBody(test, suite, ctx);

      if (currentSkipReason) {
        testResult.status = "skipped";
        testResult.skipReason = currentSkipReason;
        results.skipped++;
        suiteResult.skipped++;
      } else {
        testResult.status = "passed";
        results.passed++;
        suiteResult.passed++;
      }
    } catch (err) {
      testResult.status = "failed";
      testResult.error = {
        message: err.message,
        stack: err.stack,
      };
      results.failed++;
      suiteResult.failed++;
      results.failures.push(testResult);
    } finally {
      testResult.durationMs = Date.now() - testStart;
    }
  }

  suiteResult.tests.push(testResult);
  onTestComplete?.(testResult);
  reporter?.("test_end", testResult);
}

async function _runSuite(suite, results, options) {
  const { effectiveTierFilter, filter, onSuiteComplete, reporter } = options;
  if (effectiveTierFilter && suite.tier !== effectiveTierFilter) return;

  const suiteResult = {
    name: suite.name,
    tier: suite.tier,
    tests: [],
    passed: 0,
    failed: 0,
    skipped: 0,
  };

  await _runHooks(suite.beforeAllHooks);

  const testsToRun = filter
    ? suite.tests.filter((t) =>
        t.name.toLowerCase().includes(filter.toLowerCase()),
      )
    : suite.tests;

  await testsToRun.reduce(
    (prev, test) =>
      prev.then(() =>
        _runSingleTest(test, suite, results, suiteResult, options),
      ),
    Promise.resolve(),
  );

  await suite.subSuites.reduce(
    (prev, sub) => prev.then(() => _runSuite(sub, results, options)),
    Promise.resolve(),
  );

  await _runHooks(suite.afterAllHooks);

  results.suiteResults.push(suiteResult);
  results.suites.push(suiteResult);
  onSuiteComplete?.(suiteResult);
  reporter?.("suite_end", suiteResult);
}

// Global registry instance
export const registry = new TestRegistry();

export const describe = (name, fn) => registry.describe(name, fn);
export const it = (name, fn) => registry.it(name, fn);
export const test = (name, fn) => registry.test(name, fn);
export const itSkip = (name, fn) => registry.skip(name, fn);
export const beforeEach = (fn) => registry.beforeEach(fn);
export const afterEach = (fn) => registry.afterEach(fn);
export const beforeAll = (fn) => registry.beforeAll(fn);
export const afterAll = (fn) => registry.afterAll(fn);
