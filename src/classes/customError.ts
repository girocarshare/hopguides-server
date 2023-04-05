export class CustomError {
  code: number;
  error: object;

  constructor(code: number, error: any) {
    this.code = code;
    const str = `{"errors":[{"code":"${code}","error":"${error}"}]}`;
    this.error = JSON.parse(str);
  }
}
