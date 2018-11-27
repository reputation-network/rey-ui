import { ComponentFactory, h, render } from "preact";
import { AllowToRunModal, Props as AllowToRunModalProps } from "./components/AllowToRunModal";
import { MetamaskErrorModal } from "./components/MetamaskErrorModal";
import { OptInModal, Props as OptInModalProps } from "./components/OptInModal";
import { Props as SelfRunModalProps, SelfRunModal } from "./components/SelfRunModal";
import ReyPortalComponent from "./customElements/rey-portal";
import { ActionEvent, CloseModalEvent } from "./shared/events";

function createModal<P extends object>(params: {
  component: ComponentFactory<P>,
  props: P,
}) {
  const div = document.createElement("div");
  const props = Object.assign({}, params.props, {
    onSignClick: () => {
      div.dispatchEvent(new ActionEvent("sign"));
    },
    onCloseClick: () => {
      div.dispatchEvent(new CloseModalEvent());
    },
  });
  render(h<P>(params.component, props), div);
  return new ReyPortalComponent(div);
}

function createOptinModal(props: OptInModalProps) {
  return createModal({ component: OptInModal, props });
}

function createAllowToRunModal(props: AllowToRunModalProps) {
  return createModal({ component: AllowToRunModal, props });
}

function createSelfRunModal(props: SelfRunModalProps) {
  return createModal({ component: SelfRunModal, props });
}

function createErrorModal(error: Error) {
  const props = { error };
  return createModal({ component: MetamaskErrorModal, props });
}

export {
  createOptinModal,
  OptInModalProps,
  createAllowToRunModal,
  AllowToRunModalProps,
  createSelfRunModal,
  SelfRunModalProps,
  createErrorModal,
};
