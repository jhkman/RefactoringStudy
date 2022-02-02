function createPerfomanceCalculator(aPerformance, aPlay) {
    switch(aPlay.type) {
      case 'tragedy': return new TragedyCalculator(aPerformance, aPlay);
      case 'comdey': return new ComedyCalculator(aPerformance, aPlay);
      default:
       throw new Error('알 수 없는 장르: ${aPlay.type}');
    }
}

class TragedyCalculator extends PerfomanceCalculator {

}

class ComedyCalculator extends PerfomanceCalculator {
  
}