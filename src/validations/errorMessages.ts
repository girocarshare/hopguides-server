export interface ErrorMessage {
  printOut: (propertyKey: string, value: any) => string;
}

export const isRequired = new (class RequiredMessage implements ErrorMessage {
  printOut(propertyKey: string, value: any): string {
    return `Property (${propertyKey}) is required.`;
  }
})();

export const email = new (class EmailMessage implements ErrorMessage {
  printOut(propertyKey: string, value: any): string {
    return `Property (${propertyKey}) with value (${value}) is not valid email.`;
  }
})();

export const notEmpty = new (class NotEmptyMessage implements ErrorMessage {
  printOut(propertyKey: string, value: any): string {
    return `Property (${propertyKey}) cannot be empty.`;
  }
})();

export const enumMsg = (enumClass): any => {
  return new (class EnumMessage implements ErrorMessage {
    printOut(propertyKey: string, value: any): string {
      return `Property ${propertyKey} must have value one of [${Object.keys(
        enumClass,
      ).join(', ')}]`;
    }
  })();
};

export const minMsg = (min): any => {
  return new (class MinMessage implements ErrorMessage {
    printOut(propertyKey: string, value: any): string {
      return `Property ${propertyKey} must have value that is grater or equal than ${min}`;
    }
  })();
};

export const maxMsg = (max): any => {
  return new (class MaxMessage implements ErrorMessage {
    printOut(propertyKey: string, value: any): string {
      return `Property ${propertyKey} must have value that is lower or equal than ${max}`;
    }
  })();
};

export const arrayTypeMsg = (type): any => {
  return new (class ArrayTypeMessage implements ErrorMessage {
    printOut(propertyKey: string, value: any): string {
      return `Element(s) in (${propertyKey}) with value (${value}) is/are not of type ${type}.`;
    }
  })();
};

export const integerMsg = new (class IntegerMessage implements ErrorMessage {
  printOut(propertyKey: string, value: any): string {
    return `Property ${propertyKey} is not an integer.`;
  }
})();
