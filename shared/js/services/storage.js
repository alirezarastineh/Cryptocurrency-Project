/**
 * Quota-Safe, Namespaced StorageManager with Cross-Tab Synchronization
 * FinTech Cryptocurrency Club Portal
 */

const NAMESPACE = "crypto_club_v1_";

class StorageService {
  constructor() {
    this.memoryFallback = new Map();
    this.subscribers = new Map();
    this.isStorageAvailable = this._checkStorageAvailability();

    if (typeof window !== "undefined") {
      window.addEventListener("storage", (event) =>
        this._handleStorageEvent(event),
      );
    }
  }

  /**
   * Check if localStorage is available and writable
   * @private
   */
  _checkStorageAvailability() {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return false;
      }
      const testKey = `__${NAMESPACE}test__`;
      window.localStorage.setItem(testKey, "1");
      window.localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn(
        "[StorageManager] localStorage unavailable, using in-memory store fallback.",
        e,
      );
      return false;
    }
  }

  /**
   * Resolve namespaced key.
   * If already prefixed with crypto_club_v1_, keep it; otherwise prepend.
   * @param {string} key
   * @returns {string}
   */
  _formatKey(key) {
    if (!key) return NAMESPACE;
    return key.startsWith(NAMESPACE) ? key : `${NAMESPACE}${key}`;
  }

  /**
   * Retrieve an item by key with default value fallback
   * @param {string} key
   * @param {any} defaultValue
   * @returns {any}
   */
  get(key, defaultValue = null) {
    const formattedKey = this._formatKey(key);

    if (!this.isStorageAvailable) {
      return this.memoryFallback.has(formattedKey)
        ? this.memoryFallback.get(formattedKey)
        : defaultValue;
    }

    try {
      const raw = window.localStorage.getItem(formattedKey);
      if (raw === null || raw === undefined) {
        return defaultValue;
      }
      try {
        return JSON.parse(raw);
      } catch {
        // Return raw string if content is not JSON-formatted
        return raw;
      }
    } catch (err) {
      console.warn(`[StorageManager] Failed to read key: ${formattedKey}`, err);
      return defaultValue;
    }
  }

  /**
   * Store a value under the specified key
   * @param {string} key
   * @param {any} value
   * @returns {boolean} True if successfully stored
   */
  set(key, value) {
    const formattedKey = this._formatKey(key);
    const serialized = JSON.stringify(value);

    // Keep memory cache synced
    this.memoryFallback.set(formattedKey, value);

    if (!this.isStorageAvailable) {
      this._notifySubscribers(formattedKey, value, null);
      return true;
    }

    try {
      window.localStorage.setItem(formattedKey, serialized);
      return true;
    } catch (err) {
      console.warn(
        `[StorageManager] Quota exceeded or error writing key: ${formattedKey}`,
        err,
      );
      // Fallback kept in memory
      return false;
    }
  }

  /**
   * Remove an item by key
   * @param {string} key
   * @returns {boolean}
   */
  remove(key) {
    const formattedKey = this._formatKey(key);
    this.memoryFallback.delete(formattedKey);

    if (!this.isStorageAvailable) {
      this._notifySubscribers(formattedKey, null, null);
      return true;
    }

    try {
      window.localStorage.removeItem(formattedKey);
      return true;
    } catch (err) {
      console.warn(
        `[StorageManager] Failed to remove key: ${formattedKey}`,
        err,
      );
      return false;
    }
  }

  /**
   * Check if a key exists
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    const formattedKey = this._formatKey(key);
    if (!this.isStorageAvailable) {
      return this.memoryFallback.has(formattedKey);
    }
    return window.localStorage.getItem(formattedKey) !== null;
  }

  /**
   * Clear all items under the crypto_club_v1_ namespace only
   */
  clearNamespace() {
    this.memoryFallback.clear();
    if (!this.isStorageAvailable) return;

    try {
      const keysToRemove = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k?.startsWith(NAMESPACE)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => window.localStorage.removeItem(k));
    } catch (err) {
      console.warn("[StorageManager] Failed to clear namespace", err);
    }
  }

  /**
   * Subscribe to changes for a specific key (including cross-tab storage events)
   * @param {string} key
   * @param {Function} callback (newValue, oldValue) => void
   * @returns {Function} Unsubscribe function
   */
  subscribe(key, callback) {
    const formattedKey = this._formatKey(key);
    if (!this.subscribers.has(formattedKey)) {
      this.subscribers.set(formattedKey, new Set());
    }
    this.subscribers.get(formattedKey).add(callback);

    return () => {
      const set = this.subscribers.get(formattedKey);
      if (set) {
        set.delete(callback);
        if (set.size === 0) {
          this.subscribers.delete(formattedKey);
        }
      }
    };
  }

  /**
   * Handle cross-tab storage events
   * @private
   */
  _handleStorageEvent(event) {
    if (!event.key?.startsWith(NAMESPACE)) return;

    let newValue = null;
    let oldValue = null;
    try {
      newValue = event.newValue ? JSON.parse(event.newValue) : null;
    } catch {
      // Fall back to raw string if newValue is not valid JSON
      newValue = event.newValue;
    }
    try {
      oldValue = event.oldValue ? JSON.parse(event.oldValue) : null;
    } catch {
      // Fall back to raw string if oldValue is not valid JSON
      oldValue = event.oldValue;
    }

    this._notifySubscribers(event.key, newValue, oldValue);
  }

  /**
   * Notify registered listeners
   * @private
   */
  _notifySubscribers(key, newValue, oldValue) {
    const callbacks = this.subscribers.get(key);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(newValue, oldValue);
        } catch (err) {
          console.error(
            `[StorageManager] Subscriber error for key ${key}:`,
            err,
          );
        }
      });
    }
  }
}

export const Storage = new StorageService();
export const StorageManager = Storage;
export default Storage;
