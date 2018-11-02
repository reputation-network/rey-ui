import ReyAppHeaderComponent from "./components/rey-app-header";
import ReyAppNameComponent from "./components/rey-app-name";
import ReyCtaButtonComponent from "./components/rey-cta-button";
import ReyErrorComponent from "./components/rey-error";
import ReyLoaderComponent from "./components/rey-loader";
import ReyModalComponent from "./components/rey-modal";
import ReyPortalComponent from "./components/rey-portal";
import ReyPreComponent from "./components/rey-pre";
import { ReyPrefaceAllowToRun, ReyPrefaceOptIn, ReyPrefaceSelfRun } from "./components/rey-preface";
import ReyStructLabelComponent from "./components/rey-struct-label";
import { hasSlotSupport, hasWebComponentSupport } from "./shared/dom-utils";

export default function registerComponents() {
  if (!hasWebComponentSupport()) {
    throw new Error("Current context does not have WebComponents support");
  }
  if (!hasSlotSupport()) {
    throw new Error("Current context does not have <slot> support");
  }

  const customElements: Array<[string, any]> = [
    ["rey-app-header", ReyAppHeaderComponent],
    ["rey-app-name", ReyAppNameComponent],
    ["rey-cta-button", ReyCtaButtonComponent],
    ["rey-error", ReyErrorComponent],
    ["rey-loader", ReyLoaderComponent],
    ["rey-preface-allow-to-run", ReyPrefaceAllowToRun],
    ["rey-portal", ReyPortalComponent],
    ["rey-pre", ReyPreComponent],
    ["rey-preface-opt-in", ReyPrefaceOptIn],
    ["rey-preface-self-run", ReyPrefaceSelfRun],
    ["rey-struct-label", ReyStructLabelComponent],
    ["rey-modal", ReyModalComponent],
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
  ReyAppHeaderComponent,
  ReyAppNameComponent,
  ReyCtaButtonComponent,
  ReyErrorComponent,
  ReyLoaderComponent,
  ReyPortalComponent,
  ReyPreComponent,
  ReyPrefaceAllowToRun,
  ReyPrefaceOptIn,
  ReyPrefaceSelfRun,
  ReyStructLabelComponent,
  ReyModalComponent,
};
