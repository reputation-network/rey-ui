/**
 * Determines if the current context has WebCoponents capabilities, meaning
 * that `window.customElements.defin` is available.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/customElements
 */
export function hasWebComponentSupport() {
  return window && window.customElements &&
    typeof window.customElements.define === "function";
}
