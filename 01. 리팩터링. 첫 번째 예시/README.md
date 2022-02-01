# 01. 리팩터링: 첫 번째 예시
## 1.1 자, 시작해보자!

1. 공연 요청이 들어오면 연극의 장르와 관객 규모를 기초로 비용을 책정한다.
2. 이 극단은 두 가지 장르, 비극과 희극만을 공연한다.
3. 공연료와 별개로 포인트를 지급해서 다음번 의뢰 시 공연료를 할인 받을 수 있다.

```JSON
{
	"hamlet": {
		"name": "hamlet",
		"type": "tragedy"
	},
	"as-like": {
		"name": "As You Like It",
		"type": "comedy"
	},
	"othello": {
		"name": "Othello",
		"type": "tragedy"
	}
}
```
> 공연할 연극 정보를 다음과 같이 JSON파일에 저정한다.

```JSON
[
  {
    "customer": "BigCo",
    "performances": [
      {
        "playID": "hamlet",
        "audience": 55
      },
      {
        "playID": "as-like",
        "audience": 35
      },
      {
        "playID": "othello",
        "audience": 40
      }
    ]
  }
]
```
> 공연료 청구서에 들어갈 데이터도 JSON 파일로 표현한다

```TS
import { Invoice, Plays } from './types';

export default function statement(invoice: Invoice, plays: Plays) {
  let totalAmount = 0;
  let volumeCredits = 0;
  let result = `청구내역 (고객명: ${invoice.customer})\n`;

  const format = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format;

  for (let perf of invoice.performances) {
    const play = plays[perf.playID];

    let thisAmount = 0;

    switch (play.type) {
      case 'tragedy': // 비극
        thisAmount = 40000;

        if (perf.audience > 30) {
          thisAmount += 1000 * (perf.audience - 30);
        }
        break;
      case 'comedy': // 희극
        thisAmount = 30000;

        if (perf.audience > 20) {
          thisAmount += 10000 + 500 * (perf.audience - 20);
        }
        thisAmount += 300 * perf.audience;

        break;

      default:
        throw new Error(`알 수 없는 장르 : ${play.type}`);
    }

    // 포인트를 적립한다.
    volumeCredits += Math.max(perf.audience - 30, 0);

    // 희극 관객 5명마다 추가 포인트를 제공한다.
    if ('comedy' === play.type) {
      volumeCredits += Math.floor(perf.audience / 5);
    }

    result += `${play.name} : ${format(thisAmount / 100)} (${
      perf.audience
    }석)\n`;
    totalAmount += thisAmount;
  }

  result += `총액: ${format(totalAmount / 100)}\n`;
  result += `적립 포인트: ${volumeCredits}점\n`;

  return result;
}

```
> 공연료 청구서를 출력하는 코드

```
청구 내역 (고객명: BigCo)  
  Hamlet: $650.00 (55석)
  As You Like It: $580.00 (35석)
  Othllo: $500.00 (40석)
총액: $1,730.00
적립 포인트: 47점
```
> 실행 결과

## 1.2 예시 프로그램을 본 소감
프로그램이 잘 작동하는 상황에서 그저 코드가 '지저분하다'는 이유로 불평하는 것은 프로그램의 구조를 미학적인 기준으로 판단하는것은 아닐까?  
설계가 나쁜 시스템은 수정하기 어렵다. 원하는 동작을 수행하도록 하기 위해 수정해야 할 부분을 찾고, 기존 코드와 잘 맞물려 작동하게 할 방법을 강구하기가 어렵다. 버그발생활률도 높다.  
**프로그램이 새로운 기능을 추가하기에 편한 구조가 아니라면, 먼저 기능을 추가하기 쉬운 형태로 리팩터링하고 나서 원하는 기능을 추가한다.**

### 요구사항
청구 내역을 HTML로 출력하는 기능이 필요하다.  
-> 해결방법은 코드 복사? -> 중복되는 코드는 매우 안좋다.
-> 왜? -> 청구서 작성 로직을 변경할떄마다 복사된 코드를 모두 수정해야함. 또한 statement()함수를 다른 여러가지 사유로 계속 수정해야함  
**리팩터링이 필요한 이유는 변경 떄문이다.**  

## 1.3 리팩터링의 첫 단계
리펙터링의 첫단계는 테스트코드 작성이다.  
**리팩터링하기 전에 제대로 된 테스트부터 마련한다. 테스트는 반드시 자가진단하도록 만든다.** 내가 저지를 실수로부터 보호해주는 버그 검출기의 역할이다.  

## 1.4 statement() 함수 쪼개기

```TS
function amountFor(perf, play) {
  let thisAmount = 0;

  switch (play.type) {
    case "tragedy":
      thisAmount += 40000;
      if (aPerformance.audience > 30) {
        thisAmount += 1000 * (aPerformance.audience - 30);
      }
      break;
    case "comedy":
      thisAmount += 30000;
      if (aPerformance.audience > 20) {
        thisAmount += 10000 + 500 * (aerformance.audience - 20);
      }
      break;
    default:
      throw new Error(`알 수 없는 장르: ${play.type}`);
  }

  return thisAmount;
}
```
> 함수 추출하기

```TS
import { Invoice, Plays } from './types';

export default function statement(invoice: Invoice, plays: Plays) {
  let totalAmount = 0;
  let volumeCredits = 0;
  let result = `청구내역 (고객명: ${invoice.customer})\n`;

  const format = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format;

  for (let perf of invoice.performances) {
    const play = plays[perf.playID];

    let thisAmount = amountFor(perf, play); // <--------- 추출한 함수를 이용

    // 포인트를 적립한다.
    volumeCredits += Math.max(perf.audience - 30, 0);

    // 희극 관객 5명마다 추가 포인트를 제공한다.
    if ('comedy' === play.type) {
      volumeCredits += Math.floor(perf.audience / 5);
    }

    result += `${play.name} : ${format(thisAmount / 100)} (${
      perf.audience
    }석)\n`;
    totalAmount += thisAmount;
  }

  result += `총액: ${format(totalAmount / 100)}\n`;
  result += `적립 포인트: ${volumeCredits}점\n`;

  return result;
}
```
> 이렇게 수정하고 나면 곧바로 컴파일하고 테스트해서 실수한 게 없는지 확인한다. **리퍽터링은 프로그램 수정을 작은 단계로 나눠 진행한다. 그래서 중간에 실수하더라도 버그를 쉽게 찾을 수 있다.**  
  
```TS
export default function statement(invoice: Invoice, plays: Plays) {
	...
  for (let perf of invoice.performances) {
    const play = plays[perf.playID];

    let result = amountFor(perf, play); // <--------- 명확한 이름으로 변경
    ...
}
```
> 함수를 추출하고 나면 지금보다 명확하게 표현할 수 있는 방법이 있는지 찾아본다. 가장 먼저 변수의 이름을 더 명확하게 바꿔보자. 가령 thisAmount를 result로 변경할 수 있다.  

```TS
function amountFor(aPerformance, play) { // <------- 파라미터를 명확한 이름으로 변경
	...
  return thisAmount;
}
```
> 매개변수의 역할이 뚜렷하지 않을 때는 부정 관사(a/an)를 붙인다.  
**컴퓨터가 이해하는 코드는 바보도 작성할 수 있다. 사람이 이해하도록 작성하는 프로그래머가 진정한 실력자다.**  
  
### play변수 제거하기
aPerformance는 루프변수에서 오기 때문에 값이 변경되지만, play는 aPerformance에서 얻기 떄문에 애초에 파라미터로 넣을 필요가 없다.  

```TS
... in statement()

function playFor(aPerformance) {
  return plays[aPerformance.playID];
}

function amountFor(perf) {
  let thisAmount = 0;

  switch (playFor(perf.playID).type) {
    case "tragedy":
      thisAmount += 40000;
      if (aPerformance.audience > 30) {
        thisAmount += 1000 * (aPerformance.audience - 30);
      }
      break;
    case "comedy":
      thisAmount += 30000;
      if (aPerformance.audience > 20) {
        thisAmount += 10000 + 500 * (aerformance.audience - 20);
      }
      break;
    default:
      throw new Error(`알 수 없는 장르: ${playFor(perf.playID).type}`);
  }

  return thisAmount;
}

for (let perf of invoice.performances) {
  volumeCredits += Math.max(perf.audience - 30, 0);

  if ("comedy" === playFor(perf).type)
    volumeCredits += Math.floor(perf.audience / 5);

  result += ` ${playFor(perf).name}: ${format(thisAmount / 100)} (${
    perf.audience
  }석)\n`;
  totalAmount += amountFor(perf);
}
```













































