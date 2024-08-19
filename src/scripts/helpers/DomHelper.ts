export class DomHelper {

  static addClasses(
    selector: string,
    classes: string[],
    parent: HTMLElement = document.body,
  ) {
    const element = parent.querySelector(selector);
    if (element) {
      element.classList.add(...classes);
    }
    return element;
  }

  static addEventListener(
    selector: string,
    event: string,
    callback: (event: Event) => void,
    parent: HTMLElement = document.body,
  ) {
    const element = parent.querySelector(selector);
    element?.addEventListener(event, callback);
    return element;
  }

  static removeClasses(
    selector: string,
    classes: string[],
    parent: HTMLElement = document.body,
  ) {
    const element = parent.querySelector(selector);
    if (element) {
      element.classList.remove(...classes);
    }
    return element;
  }

  static updateTextContent(
    selector: string,
    text: string,
    parent: HTMLElement = document.body,
  ) {
    const element = parent.querySelector(selector);
    if (element) {
      element.textContent = text;
    }
    return element;
  }
}
