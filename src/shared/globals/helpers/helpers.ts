export class Helpers {
  static firstLetterUppercase(str: string): string {
    const value = str.toLowerCase();
    return value
      .split(" ")
      .map(
        (value: string) =>
          `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`
      )
      .join(" ");
  }
  static lowerCase(str: string): string {
    return str.toLowerCase();
  }
  static getRandomNumber(integerLenght:number): number {
    const characters = "1234567890";
    let result = ' ';
    const charactersLength = characters.length;
    for (let i = 0; i < integerLenght; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return parseInt(result, 10);
  }
}
