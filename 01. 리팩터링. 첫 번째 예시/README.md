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

function amountFor(perf) { // 필요없는 매개변수 제거
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

  result += ` ${playFor(perf)/* thisAmount변수 인라인*/.name}: ${format(thisAmount / 100)} (${
    perf.audience
  }석)\n`;
  totalAmount += amountFor(perf); // 필요없는 매개변수 제거
}
```

### 적립 포인트 계산 코드 추출하기

```TS
function volumeCreditsFor(aPerformance) { // <---- 새로 추출한 함수
	let result = 0;
	result += Math.max(aPerformance.audience - 30, 0);
	if ("comady" === playFor(aPerformance).type)
		result += Math.floor(aPerformance.audience / 5);
	return result;
}
```
> 새로 추출한 함수

```TS
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

  	volumeCredits += volumeCreditsFor(perf); // <------ 추출한 함수를 이용해 값을 누적

  	// 청구 내역을 출력한다.
    result += `${playFor(perf).name} : ${format(amountFor(perf)/100)} (${perf.audience}석)\n`;
    totalAmount += thisAmount;
  }

  result += `총액: ${format(totalAmount / 100)}\n`;
  result += `적립 포인트: ${volumeCredits}점\n`;

  return result;
}
```
> statement() 함수


### format 변수 재거하기
임시 변수는 나중에 문제를 일으킬 수 있다. 임시 변수는 자신이 속한 루틴에서만 의미가 있어서 루틴이 길고 복잡해지기 쉽다.  

```TS
function format(aNumber) {
	return new Intl.NumberFormat("en-US",{ style: "currency", currency: "USD", minimumFractionDigits: 2}).format(aNumber)
}
```

```TS
export default function statement(invoice: Invoice, plays: Plays) {
  let totalAmount = 0;
  let volumeCredits = 0;
  let result = `청구내역 (고객명: ${invoice.customer})\n`;

  for (let perf of invoice.performances) {

  	volumeCredits += volumeCreditsFor(perf); // <------ 추출한 함수를 이용해 값을 누적

  	// 청구 내역을 출력한다.
    result += `${playFor(perf).name} : ${format(amountFor(perf)/100)} (${perf.audience}석)\n`;
    totalAmount += thisAmount;
  }

  result += `총액: ${format(totalAmount / 100)}\n`; // <---- 임시 변수였던 format을 함수 호출로 대체
  result += `적립 포인트: ${volumeCredits}점\n`;

  return result;
}
```

format이라는 이름이 맘에 들지 않는다.

```TS
function usd(aNumber) { // 이름 변경
	return new Intl.NumberFormat("en-US",{ style: "currency", currency: "USD", minimumFractionDigits: 2}).format(aNumber/100 /* 단위 변환도 이 함수 안으로 이동*/)
}
```

```TS
export default function statement(invoice: Invoice, plays: Plays) {
  let totalAmount = 0;
  let volumeCredits = 0;
  let result = `청구내역 (고객명: ${invoice.customer})\n`;

  for (let perf of invoice.performances) {

  	volumeCredits += volumeCreditsFor(perf);

  	// 청구 내역을 출력한다.
    result += `${playFor(perf).name} : ${usd(amountFor(perf))} (${perf.audience}석)\n`; // <- 함수 이름 변경
    totalAmount += thisAmount;
  }

  result += `총액: ${usd(totalAmount)}\n`; // <- 함수 이름 변경
  result += `적립 포인트: ${volumeCredits}점\n`;

  return result;
}
```

### volumeCredits 변수 제거하기
volumeCredits 변수는 한 바퀴 돌 때마다 값을 누적하기 때문에 리팩터링하기가 더 까다롭다. 반복문 쪼개기로 누적되는 부분을 따로 뺸다.

```TS
export default function statement(invoice: Invoice, plays: Plays) {
  let totalAmount = 0;
  let volumeCredits = 0;
  let result = `청구내역 (고객명: ${invoice.customer})\n`;

  // for (let perf of invoice.performances) {

  // 	volumeCredits += volumeCreditsFor(perf);

  // 	// 청구 내역을 출력한다.
  //   result += `${playFor(perf).name} : ${usd(amountFor(perf))} (${perf.audience}석)\n`;
  //   totalAmount += thisAmount;
  // }
  for (let perf of invoice.performances) {

  	// 청구 내역을 출력한다.
  	result += ` ${playFor(perf).name}: ${usd(amountFor(perf))} (${perf.audience}석)\n`;
  	totalAmount += amountFor(perf);
  }
  for (let perf of invoice.performances) { // 값 누적 로직을 별도 for문으로 분리
  	volumeCredits += volumeCreditsFor(perf);
  }

  result += `총액: ${usd(totalAmount)}\n`;
  result += `적립 포인트: ${volumeCredits}점\n`;

  return result;
}
```

이어서 문장 슬라이스하기(8.6)를 적용해서 volumeCredits 변수를 선언하는 문장을 반복문 바로 앞으로 옮긴다. 


```TS
export default function statement(invoice: Invoice, plays: Plays) {
  let totalAmount = 0;
  let result = `청구내역 (고객명: ${invoice.customer})\n`;

  for (let perf of invoice.performances) {

  	// 청구 내역을 출력한다.
  	result += ` ${playFor(perf).name}: ${usd(amountFor(perf))} (${perf.audience}석)\n`;
  	totalAmount += amountFor(perf);
  }
  let volumeCredits = 0; // 이동
  for (let perf of invoice.performances) {
  	volumeCredits += volumeCreditsFor(perf);
  }

  result += `총액: ${usd(totalAmount)}\n`;
  result += `적립 포인트: ${volumeCredits}점\n`;

  return result;
}
```
  
volumeCredits 값 갱신과 관련한 문장을 한데 모아두면 임시 변수를 질의 함수로 바꾸기(7.4)가 수월해 진다. 이번에도 volumeCredits값 계산 코드를 함수로 추출(6.1)하는 작업부터 한다.  

```TS
function totalVolumeCredits() {
	let volumeCredits = 0;
	for (let perf of invoice.performances) {
		volumeCredits += volumeCreditsFor(perf);
	}
	return volumeCredits;
}
```

```TS
export default function statement(invoice: Invoice, plays: Plays) {
  let totalAmount = 0;
  let result = `청구내역 (고객명: ${invoice.customer})\n`;

  for (let perf of invoice.performances) {

  	// 청구 내역을 출력한다.
  	result += ` ${playFor(perf).name}: ${usd(amountFor(perf))} (${perf.audience}석)\n`;
  	totalAmount += amountFor(perf);
  }
  // let volumeCredits = 0;
  // for (let perf of invoice.performances) {
  // 	volumeCredits += volumeCreditsFor(perf);
  // }
  let volumeCredits = totalVolumeCredits(); // 값 계산 로직을 함수로 추출

  result += `총액: ${usd(totalAmount)}\n`;
  result += `적립 포인트: ${volumeCredits}점\n`;

  return result;
}
```

함수 추출이 끝났으면, 다음은 volumeCredits 변수를 인라인(6.4)할 차례다.

```TS
export default function statement(invoice: Invoice, plays: Plays) {
  let totalAmount = 0;
  let result = `청구내역 (고객명: ${invoice.customer})\n`;

  for (let perf of invoice.performances) {

  	// 청구 내역을 출력한다.
  	result += ` ${playFor(perf).name}: ${usd(amountFor(perf))} (${perf.audience}석)\n`;
  	totalAmount += amountFor(perf);
  }

  result += `총액: ${usd(totalAmount)}\n`;
  result += `적립 포인트: ${totalVolumeCredits()}점\n`; // 변수 인라인

  return result;
}
```

> 반복문을 쪼개서 성능이 떨어진다? -> 아니다. 시간복잡도는 동일한 n을 가지게된다.
  

다음으로 total Amount도 앞에서와 똑같은 절차로 제거한다. 추출할 함수의 이름은 "totalAmount"가 가장 좋지만 이미 같은 이름의 변수가 있으니 아무 이름인 "appleSauce"를 붙여준다.

```TS
function appleSauce() {
	let totalAmount = 0;
	for (let perf of invoice.performances) {
  		totalAmount += amountFor(perf);
  	}
  	return totalAmount
}
```

```TS
export default function statement(invoice: Invoice, plays: Plays) {
  let totalAmount = 0;
  let result = `청구내역 (고객명: ${invoice.customer})\n`;

  for (let perf of invoice.performances) {

  	// 청구 내역을 출력한다.
  	result += ` ${playFor(perf).name}: ${usd(amountFor(perf))} (${perf.audience}석)\n`;
  }
  totalAmount = appleSauce(); // 함수 추출 & 임시 이름 부여

  result += `총액: ${usd(totalAmount)}\n`;
  result += `적립 포인트: ${totalVolumeCredits()}점\n`;

  return result;
}
```

  
  
이제 totalAmount 변수를 인라인한 다음, 함수 이름을 의미있게 고치자
```TS
export default function statement(invoice: Invoice, plays: Plays) {
  let result = `청구내역 (고객명: ${invoice.customer})\n`;

  for (let perf of invoice.performances) {

  	// 청구 내역을 출력한다.
  	result += ` ${playFor(perf).name}: ${usd(amountFor(perf))} (${perf.audience}석)\n`;
  }

  result += `총액: ${usd(totalAmount())}\n`; // 변수 인라인 후 이름 바꾸기
  result += `적립 포인트: ${totalVolumeCredits()}점\n`;

  return result;
}
```

```TS
function totalAmount() { // 함수 이름바꾸기
	let result = 0; // 이름 바꾸기
	for (let perf of invoice.performances) {
  		result += amountFor(perf);
  	}
  	return result
}
```

## 1.5 중간 점검: 난무하는 중첩 함수





































