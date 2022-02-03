function createPerfomanceCalculator(aPerformance, aPlay) {
    switch(aPlay.type) {
      case 'tragedy': return new TragedyCalculator(aPerformance, aPlay);
      case 'comdey': return new ComedyCalculator(aPerformance, aPlay);
      default:
       throw new Error('알 수 없는 장르: ${aPlay.type}');
    }
}

class TragedyCalculator extends PerfomanceCalculator {
  get amount() {
    let result = 40000;
    if (this.performance.audience > 30) {
      result += 1000 * (this.performance.audience - 30);
    }
    return result;
  }
}

class ComedyCalculator extends PerfomanceCalculator {
  get amount() {
    result = 30000;
    if (aPerformance.audience > 20) {
      result += 10000 + 500 * (aPerformance.audience - 20);
    }
    result += 300 * aPerformance.audience;
    return result;
  }
}