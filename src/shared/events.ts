export class AppClickEvent extends Event {
  public readonly appAddress: string;
  constructor(address: string) {
    super("app-click", { bubbles: true, composed: true });
    this.appAddress = address;
  }
}

// tslint:disable:max-classes-per-file
export class StructDetailsEvent extends Event {
  public readonly struct: any;
  constructor(struct: any) {
    super("struct-details", { bubbles: true, composed: true });
    this.struct = struct;
  }
}

export class SignModalEvent extends Event {
  constructor() {
    super("sign", { bubbles: true, composed: true, cancelable: true });
  }
}

export class CloseModalEvent extends Event {
  constructor() {
    super("close", { bubbles: true, composed: true, cancelable: true });
  }
}

export class ActionEvent extends Event {
  constructor(action: string) {
    super(`action:${action}`, { bubbles: true, composed: true, cancelable: true });
  }
}
