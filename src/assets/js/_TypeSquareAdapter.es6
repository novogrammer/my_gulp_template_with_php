const { Ts } = window;
export default class TypeSquareAdapter {
  static load() {
    return new Promise((resolve) => {
      Ts.onComplete(() => {
        resolve();
      });
      Ts.reload();
    });
  }
}
