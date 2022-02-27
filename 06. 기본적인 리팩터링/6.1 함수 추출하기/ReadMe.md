# 06. 기본적인 리팩터링

## 6.1 함수 추출하기
> 반대 리팩터링: 함수 인라인하기

```JS
function printOwing(invoice) {
	printBanner();
	let outstanding = calculateOutstanding();

	// 세부사항 출력
	console.log('고객명: $(invoice.customer)');
	console.log('채무액: $(outstanding)');
}
```
->
```JS
function printOwing(invoice) {
	printBanner();
	let outstanding = calculateOutstanding();
	printDetails(outstanding);

	function printDetails(outstanding) {
		console.log('고객명: $(invoice.customer)');
		console.log('채무액: $(outstanding)');
	}
}
```
> 코드 조각을 찾아 무슨 일을 하는지 파악한 다음, 독립된 함수로 추출하고 목적에 맞는 이름을 붙인다.  

### 언제 사용?
목적과 구현을 분리해야할 떄.  
코드를 보고 무슨 일을 하는지 파악하는 데 한참이 걸린다면 그 부분을 함수로 추출한 뒤 '무슨 일'에 맞는 이름을 짖는다.  
이렇게 되면 나중에 한번에 그 함수가 어떤일을 하는지 알 수 있고, 신경 쓸 필요가 없다.  
  
### 절차
1. 함수를 새로 만들고 목적을 잘 드러내는 이름을 붙인다('어떻게'가 아닌 '무엇을' 하는지가 드러나야 한다.)
2. 추출할 코드를 원본 함수에서 복사하여 새 함수에 붙여넣는다.
3. 추출한 코드 중 원본 함수의 지역 변수를 참조하거나 추출한 함수의 유효범위를 벗어나는 변수는 없는지 검사한다. 있다면 매개변수로 전달한다. 
  -> 때로는 추출한 코드에서 값을 수정하는 지역 변수가 너무 많을 수 있다. 이럴 떄는 함수 추출을 멈추고, 변수 쪼개기나 임시 변수를 질의 함수로 바꾸기와 같은 다른 리팩터링을 적용해서 변수를 사용하는 코드를 단순하게 버꿔본다. 그리고 함수 추출을 다시 시도한다. 
4. 변수를 다 처리했다면 컴파일 한다.
5. 원본 함수에서 추출한 코드 부분을 새로 만든 함수를 호출하는 문장으로 바꾼다.(즉, 추출한 함수로 일을 위임한다.)
6. 테스트한다.
7. 다른 코드에 방금 추출한 것과 똑같거나 비슷한 코드가 없는지 살핀다. 있다면 방금 추출한 새 함수를 호출하도록 바꿀지 검토한다.(인라인 코드를 함수 호출로 바꾸기)

### ex) 유효 범위를 벗어나는 변수가 없을 때

#### 원문
```JS
function printOwing(invoice) {
	let outstanding = 0

	console.log("***************")
	console.log("*** 고객 채무 ***")
	console.log("***************")

	// 미해결 채무(outstanding)를 계산한다.
	for (const o of invoice.orders) {
		outstanding += o.amount
	}

	// 마감일(dueDate)을 기록한다.
	const today = Clock.today
	invoice.dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30)

	// 세부사항을 출력한다.
	console.log(`고객명: ${invoice.customer}`)
	console.log(`채무액: ${outstanding}`)
	console.log(`마감일: ${invoice.dueDate.toLocaleDateString()}`)
}
```

#### 배너를 출력하는 코드를 추출
```JS
function printOwing(invoice) {
	let outstanding = 0

	printBanner() // 배너 출력 로직을 함수로 추출

	// 미해결 채무(outstanding)를 계산한다.
	for (const o of invoice.orders) {
		outstanding += o.amount
	}

	// 마감일(dueDate)을 기록한다.
	const today = Clock.today
	invoice.dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30)

	// 세부사항을 출력한다.
	console.log(`고객명: ${invoice.customer}`)
	console.log(`채무액: ${outstanding}`)
	console.log(`마감일: ${invoice.dueDate.toLocaleDateString()}`)
}

function printBanner() { // 추출됨
	console.log("***************")
	console.log("*** 고객 채무 ***")
	console.log("***************")
}
```

#### 세부 사항을 출력하는 코드를 추출

```JS
function printOwing(invoice) {
	let outstanding = 0

	printBanner()

	// 미해결 채무(outstanding)를 계산한다.
	for (const o of invoice.orders) {
		outstanding += o.amount
	}

	// 마감일(dueDate)을 기록한다.
	const today = Clock.today
	invoice.dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30)

	printDetails(); // 세부 사항 출력 로직을 함수로 추출
}

function printBanner() {
	console.log("***************")
	console.log("*** 고객 채무 ***")
	console.log("***************")
}

function printDetails() { // 추출됨
	console.log(`고객명: ${invoice.customer}`)
	console.log(`채무액: ${outstanding}`)
	console.log(`마감일: ${invoice.dueDate.toLocaleDateString()}`)
}
```

### ex) 지역 변수를 사용할 때

#### 원문
```JS
function printOwing(invoice) {
	let outstanding = 0

	printBanner()

	// 미해결 채무(outstanding)를 계산한다.
	for (const o of invoice.orders) {
		outstanding += o.amount
	}

	// 마감일(dueDate)을 기록한다.
	const today = Clock.today
	invoice.dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30)

	console.log(`고객명: ${invoice.customer}`)
	console.log(`채무액: ${outstanding}`)
	console.log(`마감일: ${invoice.dueDate.toLocaleDateString()}`)
}

function printBanner() {
	console.log("***************")
	console.log("*** 고객 채무 ***")
	console.log("***************")
}
```

#### 세부 사항을 출력하는 코드를 매개변수로 받는 함수로 추출
```JS
function printOwing(invoice) {
	let outstanding = 0

	printBanner()

	// 미해결 채무(outstanding)를 계산한다.
	for (const o of invoice.orders) {
		outstanding += o.amount
	}

	// 마감일(dueDate)을 기록한다.
	const today = Clock.today
	invoice.dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30)

	printDetails(invoce, outstanding) // 앞의 예와 달리 지역변수를 매개변수로 전달
}

function printDetails(invoce, outstanding) { // 추출됨
	console.log(`고객명: ${invoice.customer}`)
	console.log(`채무액: ${outstanding}`)
	console.log(`마감일: ${invoice.dueDate.toLocaleDateString()}`)
}

function printBanner() {
	console.log("***************")
	console.log("*** 고객 채무 ***")
	console.log("***************")
}
```

#### 지역변수가 데이터 구조라면 똑같이 매개변수로 넘긴 후 필드값을 수정할 수 있다. 마감일을 설정하는 코드 추출하기
```JS
function printOwing(invoice) {
	let outstanding = 0

	printBanner()

	// 미해결 채무(outstanding)를 계산한다.
	for (const o of invoice.orders) {
		outstanding += o.amount
	}

	recordDueDate(invoice) // 마감일 설정 로직을 함수로 추출
	printDetails(invoce, outstanding)
}

function recordDueDate(invoice) { // 추출됨
	const today = Clock.today
	invoice.dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30)
}

function printDetails(invoce, outstanding) {
	console.log(`고객명: ${invoice.customer}`)
	console.log(`채무액: ${outstanding}`)
	console.log(`마감일: ${invoice.dueDate.toLocaleDateString()}`)
}

function printBanner() {
	console.log("***************")
	console.log("*** 고객 채무 ***")
	console.log("***************")
}
```

### 지역 변수의 값을 변경할 때
단계를 나눠서 진행해보자.
#### 1. 선언문을 변수가 사용되는 코드 근처로 슬라이스 한다.
```JS
function printOwing(invoice) {
	// let outstanding = 0

	printBanner()

	let outstanding = 0 // 맨 위에 있던 선언문을 이 위치로 이동
	// 미해결 채무(outstanding)를 계산한다.
	for (const o of invoice.orders) {
		outstanding += o.amount
	}

	recordDueDate(invoice)
	printDetails(invoce, outstanding)
}

function recordDueDate(invoice) {
	const today = Clock.today
	invoice.dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30)
}

function printDetails(invoce, outstanding) {
	console.log(`고객명: ${invoice.customer}`)
	console.log(`채무액: ${outstanding}`)
	console.log(`마감일: ${invoice.dueDate.toLocaleDateString()}`)
}

function printBanner() {
	console.log("***************")
	console.log("*** 고객 채무 ***")
	console.log("***************")
}
```

#### 추출할 부분을 새로운 함수로 복사한다.

```JS
function printOwing(invoice) {
	// let outstanding = 0

	printBanner()

	let outstanding = 0
	// 미해결 채무(outstanding)를 계산한다.
	for (const o of invoice.orders) {
		outstanding += o.amount
	}

	recordDueDate(invoice)
	printDetails(invoce, outstanding)
}

function calculateOutstanding(invoice) {
	let outstanding = 0 // 추출할 코드 복사
	for (const o of invoice.orders) {
		outstanding += o.amount
	}
	return outstanding // 수정된 값 반환
}

function recordDueDate(invoice) {
	const today = Clock.today
	invoice.dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30)
}

function printDetails(invoce, outstanding) {
	console.log(`고객명: ${invoice.customer}`)
	console.log(`채무액: ${outstanding}`)
	console.log(`마감일: ${invoice.dueDate.toLocaleDateString()}`)
}

function printBanner() {
	console.log("***************")
	console.log("*** 고객 채무 ***")
	console.log("***************")
}
```

#### 추출한 코드의 원래 자리를 새로 뽑아낸 함수를 호출하는 문장으로 교체한다. 추출한 함수에서 새 값을 반환하니, 이 값을 원래 변수에 저장한다.

```JS
function printOwing(invoice) {
	// let outstanding = 0

	printBanner()

	let outstanding = calculateOutstanding(invoice) // 함수 추출 완료. 추출한 함수가 반환한 값을 원래 변수에 저장한다.

	recordDueDate(invoice)
	printDetails(invoce, outstanding)
}

function calculateOutstanding(invoice) {
	let outstanding = 0
	for (const o of invoice.orders) {
		outstanding += o.amount
	}
	return outstanding
}

function recordDueDate(invoice) {
	const today = Clock.today
	invoice.dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30)
}

function printDetails(invoce, outstanding) {
	console.log(`고객명: ${invoice.customer}`)
	console.log(`채무액: ${outstanding}`)
	console.log(`마감일: ${invoice.dueDate.toLocaleDateString()}`)
}

function printBanner() {
	console.log("***************")
	console.log("*** 고객 채무 ***")
	console.log("***************")
}
```

#### 코드 스타일을 내 스타일로 바꾼다.
```JS
function printOwing(invoice) {

	printBanner()

	// let outstanding = calculateOutstanding(invoice)
	const outstanding = calculateOutstanding(invoice)

	recordDueDate(invoice)
	printDetails(invoce, outstanding)
}

function calculateOutstanding(invoice) {
	// let outstanding = 0
	let result = 0
	for (const o of invoice.orders) {
		// outstanding += o.amount
		result += o.amount
	}
	// return outstanding
	return result
}

function recordDueDate(invoice) {
	const today = Clock.today
	invoice.dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30)
}

function printDetails(invoce, outstanding) {
	console.log(`고객명: ${invoice.customer}`)
	console.log(`채무액: ${outstanding}`)
	console.log(`마감일: ${invoice.dueDate.toLocaleDateString()}`)
}

function printBanner() {
	console.log("***************")
	console.log("*** 고객 채무 ***")
	console.log("***************")
}
```

























