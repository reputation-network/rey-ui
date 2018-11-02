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

/**
 * Appends the provided children elements to the root element.
 * @returns The root element with all the children
 */
export function appendChildren(root: HTMLElement, ...children: HTMLElement[]) {
  children.forEach((c) => root.appendChild(c));
  return root;
}

/**
 * Sets every attribute defined by attributes on the provided elemen
 * @param elem
 * @param attributes
 */
export function setAttributes(elem: HTMLElement, attributes: Record<string, string> = {}) {
  Object.keys(attributes)
    .forEach((attr) => elem.setAttribute(attr, attributes[attr]));
  return elem;
}
