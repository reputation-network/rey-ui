// tslint:disable:max-classes-per-file
export class CloseModalEvent extends Event {
  constructor() {
    super("close", { bubbles: true });
  }
}

export class ActionEvent extends Event {
  constructor(action: string) {
    super(`action:${action}`, { bubbles: true });
  }
}
