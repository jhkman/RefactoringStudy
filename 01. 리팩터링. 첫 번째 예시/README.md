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
지금까지의 리팩터링 결과 
```TS
function statement(invoice: Invoice, plays: Plays) {
  let result = `청구내역 (고객명: ${invoice.customer})\n`;

  for (let perf of invoice.performances) {

    // 청구 내역을 출력한다.
    result += ` ${playFor(perf).name}: ${usd(amountFor(perf))} (${perf.audience}석)\n`;
  }

  result += `총액: ${usd(totalAmount())}\n`; // 변수 인라인 후 이름 바꾸기
  result += `적립 포인트: ${totalVolumeCredits()}점\n`;

  return result;

  function totalAmount() { // 함수 이름바꾸기
    let result = 0; // 이름 바꾸기
    for (let perf of invoice.performances) {
    result += amountFor(perf);
    }
    return result
  }

  // 여기서부터 중첩 함수 시작
  function totalVolumeCredits() {
    let volumeCredits = 0;
    for (let perf of invoice.performances) {
      volumeCredits += volumeCreditsFor(perf);
    }
    return volumeCredits;
  }

  function usd(aNumber) { // 이름 변경
    return new Intl.NumberFormat("en-US",{ style: "currency", currency: "USD", minimumFractionDigits: 2}).format(aNumber/100 /* 단위 변환도 이 함수 안으로 이동*/)
  }

  function volumeCreditsFor(aPerformance) {
    let result = 0;
    result += Math.max(aPerformance.audience - 30, 0);
    if ("comady" === playFor(aPerformance).type)
      result += Math.floor(aPerformance.audience / 5);
    return result;
  }

  function playFor(aPerformance) {
    return plays[aPerformance.playID];
  }

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
} // amountFor() 끝


} // statement() 끝
```

## 1.6 계산 단계와 포맷팅 단계 분리하기
이제 statement()의 HTML 버전을 만드는 작업을 살펴보자.  
분리된 계산 함수들이 텍스트 버전인 statement()안에 중첩 함수로 들어가있다. 이 모두를 그대로 복붙하는 방식으로 HTML버전을 만들고 싶지는 않다. 텍스트 버전과 HTML 버전 함수 모두가 똑같은 계산 함수들을 사용하게 만들고 싶다.  
단계쪼개기(6.11)를 하자.  
목표는 statement()의 로직을 두 단계로 나누는 것이다.  
1. statement()에 필요한 데이터를 처리하고
2. 앞서 처리한 결과를 텍스트나 HTML로 표현하자.  

단계를 쪼개려면 먼저 두 번째 단계가 될 코드들을 함수 추출하기(6.1)로 뽑아내야 한다.  

```TS
function statement(invoice: Invoice, plays: Plays) {
  return renderPlainText(invoice, plays); // 본문 전체를 별도 함수로 추출
}

function renderPlainText(invoice, plays) { // 본문 전체를 별도 함수로 추출
  let result = `청구내역 (고객명: ${invoice.customer})\n`;

  for (let perf of invoice.performances) {

    // 청구 내역을 출력한다.
    result += ` ${playFor(perf).name}: ${usd(amountFor(perf))} (${perf.audience}석)\n`;
  }

  result += `총액: ${usd(totalAmount())}\n`;
  result += `적립 포인트: ${totalVolumeCredits()}점\n`;

  return result;

  ...
}
```
> 계산 단계와 포맷팅 단계 분리하기 Step1

```TS
function statement(invoice: Invoice, plays: Plays) {
  const statementData = {};
  return renderPlainText(statementData, invoice, plays); // 중간 데이터 구조를 인수로 전달
}

function renderPlainText(data, invoice, plays) { // 중간 데이터 구조를 인수로 전달
  let result = `청구내역 (고객명: ${invoice.customer})\n`;

  for (let perf of invoice.performances) {

    // 청구 내역을 출력한다.
    result += ` ${playFor(perf).name}: ${usd(amountFor(perf))} (${perf.audience}석)\n`;
  }

  result += `총액: ${usd(totalAmount())}\n`;
  result += `적립 포인트: ${totalVolumeCredits()}점\n`;

  return result;

  ...
}
```
> Step2 두 단계 사이의 중간 데이터 구조 역할을 할 객체를 만들어 renderPlainText()에 인수로 전달한다.


```TS
function statement(invoice: Invoice, plays: Plays) {
  const statementData = {};
  statementData.customer = invoice.customer; // 고객 데이터를 중간 데이터로 옮김
  return renderPlainText(statementData, invoice, plays); 
}

function renderPlainText(data, invoice, plays) { 
  let result = `청구내역 (고객명: ${data.customer})\n`; // 고객 데이터를 중간 데이터로부터 얻음

  for (let perf of invoice.performances) {

    // 청구 내역을 출력한다.
    result += ` ${playFor(perf).name}: ${usd(amountFor(perf))} (${perf.audience}석)\n`;
  }

  result += `총액: ${usd(totalAmount())}\n`;
  result += `적립 포인트: ${totalVolumeCredits()}점\n`;

  return result;

  ...
}
```
> Step3 계산 관련 코드는 전부 statement()함수로 모으고 renderPlainText()는 data 매개변수로 전달된 데이터만 처리하게 만들 수 있다.

```TS
function statement(invoice: Invoice, plays: Plays) {
  const statementData = {};
  statementData.customer = invoice.customer;
  statementData.perfomances = invoice.perfomances; // 공연 정보를 중간 데이터로 옮김
  return renderPlainText(statementData, ~~invoice~~, plays); // 필요 없어진 인수 삭제
}

function renderPlainText(data, plays) { 
  let result = `청구내역 (고객명: ${data.customer})\n`; // 고객 데이터를 중간 데이터로부터 얻음

  for (let perf of data.performances) {

    // 청구 내역을 출력한다.
    result += ` ${playFor(perf).name}: ${usd(amountFor(perf))} (${perf.audience}석)\n`;
  }

  result += `총액: ${usd(totalAmount())}\n`;
  result += `적립 포인트: ${totalVolumeCredits()}점\n`;

  return result;

  function totalAmount() { // 함수 이름바꾸기
    let result = 0; // 이름 바꾸기
    for (let perf of data.performances) { // invoice.perfomances -> data.perfomances
    result += amountFor(perf);
    }
    return result
  }

  // 여기서부터 중첩 함수 시작
  function totalVolumeCredits() {
    let volumeCredits = 0;
    for (let perf of data.performances) { // invoice.perfomances -> data.perfomances
      volumeCredits += volumeCreditsFor(perf);
    }
    return volumeCredits;
  }

  ...
}
```
> Step4 같은 방식으로 공연 정보까지 중간 데이터 구조로 옮기고 나면 renderPlainText()의 invoice 매개변수를 삭제해도 된다

```TS
function statement(invoice: Invoice, plays: Plays) {
  const statementData = {};
  statementData.customer = invoice.customer;
  statementData.perfomances = invoice.perfomances.map(enrichPerformance);
  return renderPlainText(statementData, plays);
}

function enrichPerformance(aPerformance) {
  const result = Object.assign({}, aPerformance); // 얕은 복사 수행
  return result;
}
```
> Step5 이제 연극 제목도 중간 데이터 구조에서 가져오자. 이를 위해 공연 정보 레코드에 연극 데이터를 추가해야 한다.  

```TS

function enrichPerformance(aPerformance) {
  const result = Object.assign({}, aPerformance);
  result.play = playFor(result); // 중간 데이터에 연극 정보를 저장
  return result;
}

function playFor(aPerformance) { // renderPlainText()의 중첩 함수였던 playFor()를 statement()로 옮김
  return plays[aPerformance.playID];
}

```
> Step6 이제 연극 정보를 담을 자리가 마련됐으니 실데이터를 담아보자. 이를 위해 함수 옮기기(8.1)를 적용해여 playFor()함수를 statement()로 옮긴다.  

```TS
// renderPlainText() 함수
function renderPlainText(data, plays) { 
  let result = `청구내역 (고객명: ${data.customer})\n`;

  for (let perf of data.performances) {

    result += ` ${perf.play.name}: ${usd(amountFor(perf))} (${perf.audience}석)\n`; // playFor(perf). -> perf.play.
  }

  result += `총액: ${usd(totalAmount())}\n`;
  result += `적립 포인트: ${totalVolumeCredits()}점\n`;

  return result;

  function volumeCreditsFor(aPerformance) {
    let result = 0;
    result += Math.max(aPerformance.audience - 30, 0);
    if ("comady" === aPerformance.play.type) // playFor(perf). -> perf.play.
      result += Math.floor(aPerformance.audience / 5);
    return result;
  }

  function amountFor(aPerformance) { // param 변경
    let thisAmount = 0;

    switch (aPerformance.play.type) { // 변경
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
      throw new Error(`알 수 없는 장르: ${aPerformance.play.type}`); // 변경
  }

  ...
}
```
> Step7 renderPlainText()안에서 playFor()를 호출하던 부분을 중간 데이터를 사용하도록 바꾼다

```TS
// statement() 함수...
function enrichPerformance(aPerformance) {
  const result = Object.assign({}, aPerformance);
  result.play = playFor(result);
  result.amount = amountFor(result);
  return result;
}

function amountFor(aPerformance) { ... }
```

```TS
// renderPlainText 함수...
  let result = `청구내역 (고객명: ${data.customer})\n`;

  for (let perf of data.performances) {

    result += ` ${perf.play.name}: ${usd(perf.amount)} (${perf.audience}석)\n`;
  }

  result += `총액: ${usd(totalAmount())}\n`;
  result += `적립 포인트: ${totalVolumeCredits()}점\n`;

  return result;

  function totalAmount() { 
    let result = 0;
    for (let perf of data.performances) { 
    result += perf.amount;
    }
    return result
  }
```
> Step8 amountFor()도 비슷한 방법으로 옮긴다.

...

## 1.7 중간 점검: 두 파일(과 두 단계)로 분리됨
```JS
// statement.js
import createStatementData from "./createStatementData.js";
import invoices from "./invoices.json";
import plays from "./plays.json";
function Statement(invoice, plays) {
  return renderPlainText(createStatementData(invoice, plays));
}

function renderPlainText(data, plays) {
  let result = `청구 내역 (고객명: ${data.customer})\n`;
  for (let perf of data.performances) {
    result += `${perf.play.name}: ${perf.amount} (${perf.audience}석)\n`;
  }
  result += `총액 ${usd(data.totalAmount)}\n`;
  result += `적립 포인트 : ${data.totalVolumeCredits}점\n`;
  return result;
}

function htmlStatement(invoice, plays) {
  return renderHtml(createStatementData(invoice, plays));
}

function renderHtml(data) {
  let result = `<h1>청구 내역 (고객명 : ${data.customer})</h1>)`;
  result += "<table>\n";
  result += "<tr><th>연극</th><th>좌석 수</th><th>금액</th></tr>";
  for (let perf of data.performances) {
    result += ` <tr><td>${perf.play.name}</td><td>(${perf.audience}석</td>`;
    result += `<td>${usd(perf.amount)}</td></tr>\n`;
  }
  result += "</table>\n";
  result += `<p>총액: <em>${usd(data.totalAmount)}</em></p>\n`;
  result += `<p>적립 포인트: <em>${data.totalVolumeCredits}</em>점</p>\n`;
  return result;
}

function usd(aNumber) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(aNumber / 100);
}
```

```JS
export default function createStatementData(invoice, plays) {
  const result = {};
  result.customer = invoice.customer;
  result.performances = invoice.performances.map(enrichPerformance);
  result.totalAmount = totalAmount(result);
  result.totalVolumeCredits = totalVolumeCredits(result);
  return result;

  function enrichPerformance(aPerformance) {
    const result = Object.assign({}, aPerformance);
    result.play = playFor(result);
    result.amount = amountFor(result);
    result.volumeCredits = volumeCreditsFor(result);
    return result;
  }

  function playFor(aPerformance) {
    return plays[aPerformance.playID];
  }

  function totalAmount(data) {
    return data.performances.reduce((total, p) => total + p.amount, 0);
  }

  function totalVolumeCredits(data) {
    return data.performances.reduce((total, p) => total + p.volumeCredits, 0);
  }

  function amountFor(aPerformance) {
    // eslint-disable-next-line no-shadow
    let result = 0;
    switch (aPerformance.play.type) {
      case "tragedy":
        result = 40000;
        if (aPerformance.audience > 30) {
          result += 1000 * (aPerformance.audience - 30);
        }
        break;
      case "comedy":
        result = 30000;
        if (aPerformance.audience > 20) {
          result += 10000 + 500 * (aPerformance.audience - 20);
        }
        result += 300 * aPerformance.audience;
        break;
      default:
        throw new Error(`알 수 없는 장르 : ${aPerformance.play.type}`);
    }
    return result;
  }
  function volumeCreditsFor(aPerformance) {
    let result = 0;
    result += Math.max(aPerformance.audience - 30, 0);
    if ("comedy" === aPerformance.play.type) {
      result += Math.floor(aPerformance.audience / 5);
    }
    return result;
  }
}
```
> 어찌어찌 결과. 프로그래밍은 항시 코드베이스를 작업시작 전보다 건강하게 만들어놓고 떠나야 한다.

## 1.8 다형성을 활용해 계산 코드 재구성하기
이번에는 연극 장르를 추가하고 장르마다 공연료와 적립 포인트 계산법을 다르게 지정하도록 기능을 수정해본다.  
이번 작업의 목표는 상속 계층을 구성해서 희극 서브 클래스와 비극 서브클래스가 각자의 구체적인 계산 로직을 정의하는 것이다.  
조건부 로직을 다형성으로 바꾸기(10.4)를 이용해보자.  

### 공연료 계산기 만들기
todo) amountFor()와 volumeCreditsFor()를 전용 클래스로 옮기자
```JS
// createStatementData 함수
function enrichPerformance(aPerformance) {
    const calculator = new PerfomanceCalculator(aPerformance); // 공연료 계산기 생성
    const result = Object.assign({}, aPerformance);
    result.play = playFor(result);
    result.amount = amountFor(result);
    result.volumeCredits = volumeCreditsFor(result);
    return result;
  }
```
```JS
class PerfomanceCalculator { // 공연료 계산기 클래스
    constructor(aPerformance) {
      this.performances = aPerformance
  }
}
```

이제 옮겨보도록 한다. 모든 데이터 변환을 한 곳에서 수행할 수 있으면 코드가 명확해진다. 이를 위해 계산기 클래스의 생성자에 함수 선언 바꾸기(6.5)를 적용하여 공연할 연극을 계산기로 전달한다.  

```JS
function enrichPerformance(aPerformance) {
    const calculator = new PerfomanceCalculator(aPerformance, playFor(aPerformance)); // 공연 정보를 계산기로 전달
    const result = Object.assign({}, aPerformance);
    result.play = calculator.play;
    result.amount = amountFor(result);
    result.volumeCredits = volumeCreditsFor(result);
    return result;
  }
```
```JS
  class PerfomanceCalculator {
    constructor(aPerformance, aPlay) {
      this.performances = aPerformance
      this.Play = aPlay;
    }
  }
```

### 함수들을 계산기로 옮기기
지금까지는 중첩 함수를 재배치하는 것이어서 함수를 옮기는 데 부담이 없었다. 하지만 이번에는 함수를 (모듈, 클래스등) 다른 컨텍스트로 옮기는 큰 작업이다. 그러니 이번엔 함수 옮기기(8.1) 리팩터링으로 작업을 단계별로 차근차근 진행해보자.  

```JS
class PerfomanceCalculator {
  constructor(aPerformance, aPlay) {
    this.performances = aPerformance
    this.Play = aPlay;
  }

  get amount() { // amountFor() 함수의 코드를 계산기 클래스로 복사
    let result = 0;
    switch (this.play.type) { // amountFor()함수가 매개변수로 받던 정보를 계산기 필드에서 바로 얻음
      case "tragedy":
        result = 40000;
        if (aPerformance.audience > 30) {
          result += 1000 * (aPerformance.audience - 30);
        }
        break;
      case "comedy":
        result = 30000;
        if (aPerformance.audience > 20) {
          result += 10000 + 500 * (aPerformance.audience - 20);
        }
        result += 300 * aPerformance.audience;
        break;
      default:
        throw new Error(`알 수 없는 장르 : ${aPerformance.play.type}`);
    }
    return result;
  }
}
```

```JS
function amountFor(aPerformance) {
    // let result = 0;
    // switch (aPerformance.play.type) {
    //   case "tragedy":
    //     result = 40000;
    //     if (aPerformance.audience > 30) {
    //       result += 1000 * (aPerformance.audience - 30);
    //     }
    //     break;
    //   case "comedy":
    //     result = 30000;
    //     if (aPerformance.audience > 20) {
    //       result += 10000 + 500 * (aPerformance.audience - 20);
    //     }
    //     result += 300 * aPerformance.audience;
    //     break;
    //   default:
    //     throw new Error(`알 수 없는 장르 : ${aPerformance.play.type}`);
    // }
    // return result;
    return new PerfomanceCalculator(aPerformance, playFor(aPerformance)).amount // 원본 함수인 amountFor()도 계산기를 이용하도록 수정
  }
```

```JS
function enrichPerformance(aPerformance) {
    const calculator = new PerfomanceCalculator(aPerformance, playFor(aPerformance));
    const result = Object.assign({}, aPerformance);
    result.play = calculator.play;
    result.amount = calculator.amount; // amount()대신 계산기의 함수 이용
    result.volumeCredits = volumeCreditsFor(result);
    return result;
  }
```
> 함수 인라인  

volumeCredits도 이사 가도록 변경
```JS
function enrichPerformance(aPerformance) {
    const calculator = new PerfomanceCalculator(aPerformance, playFor(aPerformance));
    const result = Object.assign({}, aPerformance);
    result.play = calculator.play;
    result.amount = calculator.amount;
    result.volumeCredits = calculator.volumeCredits; // 적립포인트도 이동시키자.
    return result;
  }
```

```JS
class PerfomanceCalculator { 
  ...
  get volumeCredits() {
    let result = 0;
    result += Math.max(aPerformance.audience - 30, 0);
    if ("comedy" === aPerformance.play.type) {
      result += Math.floor(aPerformance.audience / 5);
    }
    return result;
  }
}
```

```JS
function createStatementData(invoice, plays) {
  ...
  function volumeCreditsFor(aPerformance) {
    // let result = 0;
    // result += Math.max(aPerformance.audience - 30, 0);
    // if ("comedy" === aPerformance.play.type) {
    //   result += Math.floor(aPerformance.audience / 5);
    // }
    // return result;
    return new PerfomanceCalculator(aPerformance, playFor(aPerformance)).volumeCredits
  }
}
```

### 공연료 계산기를 다형성 버전으로 만들기
클래스에 로직을 담았으니 이제 다형성을 지원하자.  
가장 먼저 할 일은 타입 코드 대신 서브 클래스를 사용하도록 변경하는 것이다(타입 코드를 서브 클래스로 바꾸기(12.6))  
생성자를 팩터리 함수로 바꾸기(11.8)을 적용할 예정  

```JS
export default function createStatementData(invoice, plays) {
  ...
  function enrichPerformance(aPerformance) {
    // const calculator = new PerfomanceCalculator(aPerformance, playFor(aPerformance));
    const calculator = createPerformanceCalculator(aPerformance, playFor(aPerformance)); // 생성자 대신 팩터리 함수 이용
    const result = Object.assign({}, aPerformance);
    result.play = calculator.play;
    result.amount = calculator.amount;
    result.volumeCredits = calculator.volumeCredits;
    return result;
  }
```

```JS
// 최상위
function createPerfomanceCalculator(aPerformance, aPlay) {
  return new PerfomanceCalculator(aPerformance, aPlay);
}
```

함수를 이용하면 다음과 같이 PerformanceCalculator의 서브클래스 중에서 어느 것을 생성해서 반환할지 선택할 수 있다. 

```JS
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
```

이제 다형성을 지원하기 위한 구조는 갖춰졌다. 다음은 조건부로직을 다형성으로 바꾸기(10.4)를 적용할 차례다.  
  
비극 공연의 공연료 계산부터 해보자.  

```JS
class TragedyCalculator extends PerfomanceCalculator {
  get amount() {
    let result = 40000;
    if (this.performance.audience > 30) {
      result += 1000 * (this.performance.audience - 30);
    }
    return result;
  }
}
```
> 이 메서드만 정의해도 오버라이드가 된다.

```JS
class PerfomanceCalculator {
  constructor(aPerformance, aPlay) {
    this.performances = aPerformance
    this.Play = aPlay;
  }

  get amount() { 
    let result = 0;
    switch (this.play.type) {
      case "tragedy":
        throw '오류 발생'; // 비극 공연료는 TragedyCalulator를 이용하도록 유도
      case "comedy":
        result = 30000;
        if (aPerformance.audience > 20) {
          result += 10000 + 500 * (aPerformance.audience - 20);
        }
        result += 300 * aPerformance.audience;
        break;
      default:
        throw new Error(`알 수 없는 장르 : ${aPerformance.play.type}`);
    }
    return result;
  }
}
```

## 1.9 상태 점검: 다형성을 활용하여 데이터 생성하기

```JS
export default function createStatementData(invoice, plays) {
  const result = {};
  result.customer = invoice.customer;
  result.performances = invoice.performances.map(enrichPerformance);
  result.totalAmount = totalAmount(result);
  result.totalVolumeCredits = totalVolumeCredits(result);
  return result;

  function enrichPerformance(aPerformance) {
    const calculator = createPerformanceCalculator(aPerformance, playFor(aPerformance));
    const result = Object.assign({}, aPerformance);
    result.play = calculator.play;
    result.amount = calculator.amount;
    result.volumeCredits = calculator.volumeCredits;
    return result;
  }

  function playFor(aPerformance) {
    return plays[aPerformance.playID];
  }

  function totalAmount(data) {
    return data.performances.reduce((total, p) => total + p.amount, 0);
  }

  function totalVolumeCredits(data) {
    return data.performances.reduce((total, p) => total + p.volumeCredits, 0);
  }

  function amountFor(aPerformance) {
    return new PerfomanceCalculator(aPerformance, playFor(aPerformance)).amount
  }

  function volumeCreditsFor(aPerformance) {
    return new PerfomanceCalculator(aPerformance, playFor(aPerformance)).volumeCredits
  }
}
```
```JS
class PerfomanceCalculator {
  constructor(aPerformance, aPlay) {
    this.performances = aPerformance
    this.Play = aPlay;
  }

  get amount() {
    throw '서브클래스에서 생성하도록 설계됨';
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
```
```JS
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
```

> 이제 다형성을 지원한다!

# 좋은 코드를 가늠하는 확실한 방법은 '얼마나 수정하기 쉬운가'다. 























