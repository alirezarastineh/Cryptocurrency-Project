/**
 * Base Component with Dynamic Root Path Resolution
 * FinTech Cryptocurrency Club Portal
 */

export class BaseComponent {
  rootElement = null;

  /**
   * Determine relative path prefix to project root ('', '../', etc.)
   * Handles local file://, localhost, GitHub Pages, or server environments.
   *
   * @returns {string}
   */
  static getRootPath() {
    if (typeof window === "undefined") return "";

    // Check meta tag override if set
    const meta = document.querySelector('meta[name="app-root"]');
    if (meta?.content) {
      return meta.content.endsWith("/") ? meta.content : `${meta.content}/`;
    }

    const path = window.location.pathname || "";
    const href = window.location.href || "";

    // Known 1-level deep subdirectories in Cryptocurrency-Project
    const subdirs = [
      "coins",
      "investment",
      "news",
      "membership",
      "registration",
      "contact",
      "confirmation",
    ];

    for (const dir of subdirs) {
      if (
        path.includes(`/${dir}/`) ||
        href.includes(`/${dir}/`) ||
        path.endsWith(`/${dir}`) ||
        path.endsWith(`/${dir}.html`)
      ) {
        return "../";
      }
    }

    // Two levels deep check (e.g. tests or subfolders)
    if (path.includes("/tests/") || href.includes("/tests/")) {
      return "../";
    }

    return "";
  }

  /**
   * Resolve an internal relative path against the current document location
   * @param {string} relativePath (e.g. 'coins/coins.html' or 'index.html')
   * @returns {string}
   */
  static resolvePath(relativePath) {
    const root = BaseComponent.getRootPath();
    // Remove leading slash if any
    const cleanPath = relativePath.startsWith("/")
      ? relativePath.slice(1)
      : relativePath;
    return `${root}${cleanPath}`;
  }

  /**
   * Instance helper for root path
   */
  getRootPath() {
    return BaseComponent.getRootPath();
  }

  /**
   * Instance helper for resolving path
   */
  resolvePath(relativePath) {
    return BaseComponent.resolvePath(relativePath);
  }

  /**
   * Resolve target DOM element
   * @param {string|HTMLElement} target
   * @returns {HTMLElement|null}
   */
  resolveTarget(target) {
    if (typeof target === "string") {
      return document.querySelector(target);
    }
    return target instanceof HTMLElement ? target : null;
  }
}

export default BaseComponent;
