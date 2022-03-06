# 06. 기본적인 리팩터링

## 6.9 여러 함수를 클래스로 묶기

```JS
function base(aReading) { ... }
function taxableCharge(aReading) { ... }
function calculateBaseCharge(aReading) { ... }
```
->
```JS
class Reading {
	base() { ... }
 	taxableCharge() { ... }
 	calculateBaseCharge() { ... }
}
```
클래스는 데이터와 함수를 하나의 공유 환경으로 묶은 후, 다른 프로그램 요소와 어우러질 수 있도록 그중 일부를 외부에 제공한다.  
클래스로 묶으면 이 함수들이 공유하는 공통 환경을 더 명확하게 표현할 수 있고, 함수에 전달되는 인수를 줄여서 객체 안에서의 함수 호출을 간결하게 만들 수 있다.  

### 절차
1. 함수들이 공유하는 공통 데이터 레코드를 캡슐화한다. 
2. 공통 레코드를 사용하는 함수 각각을 새 클래스로 옮긴다.
3. 데이터를 조작하는 로직들은 함수로 추출해서 새 클래스로 옮긴다.

### 예시
차(tea)를 수돗물처럼 제공하는 예. 사람들은 매달 차 계랑기를 읽어서 측정값(reading)을 다음과 같이 기록한다고 하자.
```JS
reading = {customer: "ivan", quantity: 10, month: 5, year: 2017};
```
계산하는 코드
```JS
// 클라이언트1
const aReading = acquireReading();
const baseCharge = baseRate(aReading.month, aReading.year) * aReading.quantity;
```
차에도 세금을 부과한다. 하지만 기본적인 차 소비량만큼은 면세가 되도록 했다.
```JS
// 클라이언트2
const aReading = acquireReading();
const base = (baseRate(aReading.month, aReading.year) * aReading.quantity);
const taxableCharge = Math.max(0, base - taxThreshold(aReading.year));
```
함수 추출
```JS
// 클라이언트3
const aReading = acquireReading();
const basicChargeAmount = calculateBaseCharge(aReading);

function calculateBaseCharge(aReading) { // 기본 요금 계산 함수
	return baseRate(aReading.month, aReading.year) * aReading.quantity;
}
```

### 리팩터링 ㄱㄱ
#### 1. 먼저 레코드를 클래스로 변환하기 위해 레코드를 캡슐화한다.
```JS
class Reading {
	constructor(data) {
		this._customer = data.customer;
		this._quantity = data.quantity;
		this._month = data.month;
		this._year = data.year;
	}

	get customer() { return this._customer };
	get quantity() { return this._quantity };
	get month() { return this._month };
	get year() { return this._year };
}
```

#### 2. 이미 만들어져 있는 calculateBaseCharge()부터 옮기자
```JS
// 클라이언트3

// const aReading = acquireReading();
const rawReading = acquireReading(); // 추가
const aReading = new Reading(rawReading); // 추가

const basicChargeAmount = calculateBaseCharge(aReading);

function calculateBaseCharge(aReading) { // 기본 요금 계산 함수
	return baseRate(aReading.month, aReading.year) * aReading.quantity;
}
```
그런 다음 calculateBaseCharge()를 새로 만든 클래스로 옮긴다.
```JS
class Reading {
	constructor(data) {
		this._customer = data.customer;
		this._quantity = data.quantity;
		this._month = data.month;
		this._year = data.year;
	}

	get customer() { return this._customer };
	get quantity() { return this._quantity };
	get month() { return this._month };
	get year() { return this._year };

	get calculateBaseCharge() { // 이동됨
		return baseRate(this.month, this.year) * this.quantity; // this. 으로 변경
	}
}
```
```JS
// 클라이언트3

const rawReading = acquireReading();
const aReading = new Reading(rawReading);

// const basicChargeAmount = calculateBaseCharge(aReading);
const basicChargeAmount = aReading.calculateBaseCharge;

// function calculateBaseCharge(aReading) {
// 	return baseRate(aReading.month, aReading.year) * aReading.quantity;
// }
```
이 과정에서 메서드 이름을 원하는대로 바꾼다.
```JS
class Reading {

	...

	// get calculateBaseCharge() {
	get baseCharge() { // 이름 변경	
		return baseRate(this.month, this.year) * this.quantity;
	}
}

// 클라이언트3

const rawReading = acquireReading();
const aReading = new Reading(rawReading);
// const basicChargeAmount = aReading.calculateBaseCharge;
const basicChargeAmount = aReading.baseCharge; // 변경된 이름 사용
```
다른 클라이언트도 수정해주자.

```JS
// 클라이언트1
// const aReading = acquireReading();
const rawReading = acquireReading();
const aReading = new Reading(rawReading);

// const baseCharge = baseRate(aReading.month, aReading.year) * aReading.quantity;
const baseCharge = aReading.baseCharge;
```
차에도 세금을 부과한다. 하지만 기본적인 차 소비량만큼은 면세가 되도록 했다.
```JS
// 클라이언트2
// const aReading = acquireReading();
const rawReading = acquireReading();
const aReading = new Reading(rawReading);

// const base = (baseRate(aReading.month, aReading.year) * aReading.quantity);
// const taxableCharge = Math.max(0, base - taxThreshold(aReading.year));
const taxableCharge = Math.max(0, aReading.baseCharge - taxThreshold(aReading.year));
```

#### 3. 이어서 세금을 부과할 소비량을 계산하는 코드를 함수로 추출한다.
```JS
function taxableChargeFn(aReading) {
	return Math.max(0, aReading.baseCharge - taxThreshold(aReading.year));
}

// 클라이언트3

const rawReading = acquireReading();
const aReading = new Reading(rawReading);
// const basicChargeAmount = aReading.baseCharge;
const taxableCharge = taxableCharge(aReading);
```
그런 다음 방금 추출한 함수를 Reading 클래스로 옮긴다.
```JS
class Reading {

	...

	// get calculateBaseCharge() {
	get baseCharge() { // 이름 변경	
		return baseRate(this.month, this.year) * this.quantity;
	}

	get taxableChargeFn() {
		return Math.max(0, this.baseCharge - taxThreshold(this.year));
	}
}

// 클라이언트3

const rawReading = acquireReading();
const aReading = new Reading(rawReading);
// const taxableCharge = taxableCharge(aReading);
const taxableCharge = aReading.taxableCharge();
```


















