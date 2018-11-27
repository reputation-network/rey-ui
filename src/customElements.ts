import ReyPortalComponent from "./customElements/rey-portal";
import { hasWebComponentSupport } from "./shared/dom-utils";

export default function defineCustomElements() {
  if (!hasWebComponentSupport()) {
    throw new Error("Current context does not have WebComponents support");
  }

  const customElements: Array<[string, any]> = [
    ["rey-portal", ReyPortalComponent],
  ];

  return Promise.all(customElements.map(([selector, clazz]) => {
    if (!window.customElements.get(selector)) {
      window.customElements.define(selector, clazz);
    }
    return window.customElements.whenDefined(selector);
  })).then(() => loadRequiredFonts());
}

function loadRequiredFonts(): Promise<void> {
  if (document.querySelectorAll(".rey-ui-font").length > 0) {
    return Promise.resolve();
  }
  const link = document.createElement("link");
  link.classList.add("rey-ui-font");
  link.setAttribute("rel", "stylesheet");
  link.setAttribute("href", "https://fonts.googleapis.com/css?family=Lato:300,400,700");
  document.head.appendChild(link);
  return new Promise((resolve, reject) => {
    link.onload = () => resolve();
    link.onerror = () => reject();
  });
}

export {
  ReyPortalComponent,
};
