/**
 * Sets the address property for every element that matches
 * the given selector inside the root and returs every
 * updated element.
 * @param root
 * @param selectorFilter
 * @param address
 */
export function setElementsAddress<T extends HTMLElement & { address: string }>(
  root: Element | ShadowRoot,
  selector: string,
  address: string,
) {
  const elems = root.querySelectorAll<T>(selector);
  elems.forEach((e) => e.address = address);
  return elems;
}

/**
 * Determines if the current context has WebCoponents capabilities, meaning
 * that `window.customElements.defin` is available.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/customElements
 */
export function hasWebComponentSupport() {
  return window && window.customElements &&
    typeof window.customElements.define === "function";
}

/**
 * Determines if the current context has support `<slot>` behaviour.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/slot
 */
export function hasSlotSupport() {
  return hasWebComponentSupport() && Element && Element.prototype &&
    Object.prototype.hasOwnProperty.call(Element.prototype, "slot");
}
