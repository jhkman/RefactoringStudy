class PerfomanceCalculator {
  constructor(aPerformance, aPlay) {
    this.performances = aPerformance
    this.Play = aPlay;
  }

  get amount() { 
    let result = 0;
    switch (this.play.type) {
      case "tragedy":
        throw '오류 발생';
      case "comedy":
        throw '오류 발생';
      default:
        throw new Error(`알 수 없는 장르 : ${aPerformance.play.type}`);
    }
    return result;
  }

  get volumeCredits() {
    let result = 0;
    result += Math.max(aPerformance.audience - 30, 0);
    if ("comedy" === aPerformance.play.type) {
      result += Math.floor(aPerformance.audience / 5);
    }
    return result;
  }
}
