export default class FormatDateText {
  static formatDateText(elementWithTime, askedOrAnswered = "asked") {
    const date = new Date();
    const askedDate = new Date(elementWithTime);

    let timeDiff = date.getTime() - askedDate.getTime();
    let timeDiffSeconds = timeDiff / 1000;
    let timeDiffMins = timeDiffSeconds / 60;
    let timeDiffHours = timeDiffMins / 60;
    let timeDiffDays = timeDiffHours / 24;

    let twoDigitMins = String(askedDate.getMinutes()).padStart(2, "0");
    let twoDigitHours = String(askedDate.getHours()).padStart(2, "0");

    if (timeDiffMins < 1) {
      return `${parseInt(timeDiffSeconds)} seconds ago`;
    }
    if (timeDiffHours < 1) {
      return `${askedOrAnswered} ${parseInt(timeDiffMins)} minutes ago`;
    }
    if (timeDiffDays < 1) {
      return `${askedOrAnswered} ${parseInt(timeDiffHours)} hours ago`;
    }
    if (askedDate.getFullYear() === date.getFullYear()) {
      return `${askedOrAnswered} ${askedDate.toLocaleString("default", {
        month: "long",
      })} ${askedDate.getDate()} at ${twoDigitHours}:${twoDigitMins}`;
    }
    return `${askedOrAnswered} ${askedDate.toLocaleString("default", {
      month: "long",
    })} ${askedDate.getDate()}, ${askedDate.getFullYear()} at ${twoDigitHours}:${twoDigitMins}`;
  }

  static formatNewQDateText() {
    let now = new Date();
    let twoDigitMins = String(now.getMinutes()).padStart(2, "0");

    let dateText = `${now.toLocaleString("default", {
      month: "long",
    })} ${now.getDate()}, ${now.getFullYear()} ${now.getHours()}:${twoDigitMins}:${now.getSeconds()}`;

    return dateText;
  }
}
