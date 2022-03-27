# 10 조건부 로직 간소화
## 10.5 특이케이스 추가하기

```JS
if (aCustomer === "미확인 고객") customerName = "거주자"
```
-> 
```JS
class UnknownCustomer {
	get name() { return "거주자" }
}
```

### 배경
데이터 구조의 특정 값을 확인한 후 똑같은 동작을 수행하는 코드가 곳곳에 등장하는 경우가 있는데, 흔한 중복패턴이다.  
이런 경우엔 그 반응들을 한 데로 모으는게 효율적이다.  
특수한 경우 공통 동작을 요소 하나에 모아서 사용하는 특이 케이스 패턴이라는것이 있는데 이럴떄 적용하는것.  
특이케이스는 여러 형태로 표현할 수 있다.  
1. 단순히 데이터를 읽기만 한다 -> 반환할 값들을 담은 리터럴 객체 형태로 준비
2. 그 이상의 어떤 동작을 수행해야한다면 -> 필요한 메서드를 담은 객체를 생성

### 절차
1. 컨테이너에 특이 케이스인지를 검사하는 속성을 추가하고, false를 반환하게 한다.
2. 특이 케이스 객체를 만든다. 이 객체는 특이 케이스인지를 검사하는 속성만 포함하며, 이 속성은 true를 반환하게 한다.
3. 클라이언트에서 특이 케이스인지를 검사하는 코드를 함수로 추출한다. 모든 클라이언트가 값을 직접 비교하는 대신 방금 추출한 함수를 사용하도록 고친다.
4. 코드에 새로운 특이 케이스 대상을 추가한다. 함수의 반환 값으로 받거나 변환 함수를 적용하면 된다.
5. 특이 케이스를 검사하는 함수 본문을 수정하여 특이 케이스 객체의 속성을 사용하도록 한다.
6. 테스트 한다.
7. 여러 함수를 클래스로 묶기나 여러 함수를 변환 함수로 묶기를 적용하여 특이 케이스를 처리하는 공통 동작을 새로운 요소로 옮긴다.
8. 아직도 특이 케이스 검사 함수를 이용하는 곳이 남아 있다면 검사 함수를 인라인한다. 

### 예시
전력회사는 전력이 피료한 현장에 인프라를 설치해 서비스를 제공한다.

```JS
class Site {
	get customer() { return this._customer }
}

class Customer {
	get name() {...} // 고객 이름
	get billingPlan() {...} // 요금제
	set billingPlan(arg) {...}
	get paymentHistory() {...} // 납부 이력
}
```
일반적으로는 현장에 고객이 거주하지만 특이케이스가 있다. 누군가 이사를 나가고(아직 누군지 모름) 다른 누군가가 이사를 왔을 수도 있다.  
이럴 때는 데이터 레코드의 고객 필드를 "미확인 고객"이란 문자열로 채운다.  
이런 상황을 감안하여 Site 클래스를 사용하는 클라이언트 코드들은 알려지지 않은 미확인 고객에도 처리할 수 있어야 한다.

```JS
class Client1 {
	const aCustomer = site.customer
	// ...  수 많은 코드들
	let customerName
	if (aCustomer === "미확인 고객") 
		customerName = "거주자"
	else 
		customerName = aCustomer.name
}

class Client2 {
	const plan = (aCustomer === "미확인 고객") ? registry.billingPlan.basic : aCustomer.billingPlan
}

class Client3 {
	if (aCustomer !== "미확인 고객")
		aCustomer.billingPlan = newPlan
}

class Client4 {
	const weeksDelinquent = (aCustomer === "미확인 고객") ? 0 : aCustomer.paymentHistory.weekDelinquentInLastYear
}

```
미확인 고객의 처리가 중복되었다.  
고객 이름으로는 "거주자"를 사용하고, 기본 요금제(billing plan)를 청구하고, 연체 기간은 0주로 분류한것이다.  
리팩토링 ㄱㄱ  
1. 먼저 미확인 고객인지를 나타내는 메서드를 고객 클래스에 추가한다
```JS
class Customer {
	get name() {...}
	get billingPlan() {...}
	set billingPlan(arg) {...}
	get paymentHistory() {...}

	get isUnknown() { return false } // 추가
}
```
2. 그런 다음 미확인 고객 전용 클래스를 만든다.
```JS
class UnknownCustomer {
	get isUnknown() { return true }
}
```
3. 지금부터는 좀 까다롭다. "미확인 고객"을 기대하는 곳 모두에 새로 만든 특이케이스 객체를 반환하도록 하고, 값이 "미확인 고객"인지를 검사하는 곳 모두에서 새로운 isUnknown() 메서드를 사용하도록 고쳐야 한다.  
여러 곳에서 똑같이 수정해야만 하는 코드를 별도 함수로 추출하여 한데로 모으자. 지금 예에서는 특이 케이스인지 확인하는 코드가 그 대상이다.  
```JS
function isUnknown(arg) {
	if (!((arg instanceof Customer) || (arg === "미확인 고객")))
		throw new Error(`잘못된 값과 비교: <${arg}>`);
	return (arg === "미확인 고객")
}
```
이제 이 isUnknown() 함수를 이용해 미확인 고객인지를 확인할 수 있다. 이 변경을 한 번에 하나씩만 적용하고 테스트해보자

```JS
class Client1 {
	const aCustomer = site.customer
	// ...  수 많은 코드들
	let customerName
	// if (aCustomer === "미확인 고객") 
	if (isUnknown(aCustomer))
		customerName = "거주자"
	else 
		customerName = aCustomer.name
}

class Client2 {
	// const plan = (aCustomer === "미확인 고객") ? registry.billingPlan.basic : aCustomer.billingPlan
	const plan = (isUnknown(aCustomer)) ? registry.billingPlan.basic : aCustomer.billingPlan
}

class Client3 {
	// if (aCustomer !== "미확인 고객")
	if (!isUnknown(aCustomer))
		aCustomer.billingPlan = newPlan
}

class Client4 {
	// const weeksDelinquent = (aCustomer === "미확인 고객") ? 0 : aCustomer.paymentHistory.weekDelinquentInLastYear
	const weeksDelinquent = isUnknown(aCustomer) ? 0 : aCustomer.paymentHistory.weekDelinquentInLastYear
}

```
호출하는 곳 모두에서 isknown() 함수를 사용하도록 수정했다면 4. 특이 케이스일 때 Site 클래스가 UnkownCustomer 객체를 반환하도록 수정하자.  
```JS
class Site {
	get customer() {
	 // return this._customer 
	 	return (this._customer === "미확인 고객") ? new UnknownCustomer() : this._customer
	}
}
````
5. isUnknown()함수를 수정하여 고객 객체의 속성을 사용하도록 하면 "미확인 고객"문자열의 코드는 더이상 없어진다.
```JS
function isUnknown(arg) {
	// if (!((arg instanceof Customer) || (arg === "미확인 고객")))
	// 	throw new Error(`잘못된 값과 비교: <${arg}>`);
	// return (arg === "미확인 고객")
	if (!((arg instanceof Customer) || (arg instanceof UnknownCustomer)))
		throw new Error(`잘못된 값과 비교: <${arg}>`);
	return arg.isUnknown
}
```
6. 모든 기능이 잘 작동하는지 테스트한다.
7. 각 클라이언트에서 수행하는 특이 케이스 검사를 일반적인 기본값으로 대체할 수 있다면 이 검사 코드에 여러 함수를 클래스로 묶기를 적용 할 수 있다.  
지금 예시에서는 미확인 고객의 이름으로 "거주자"를 사용하는 코드가 많다.  
예를들면..
```JS 
class Client1 {
	const aCustomer = site.customer
	// ...  수 많은 코드들
	let customerName
	if (isUnknown(aCustomer))
		customerName = "거주자"
	else 
		customerName = aCustomer.name
}
```
다음과 같이 적절한 메서드를 UnkownCustomer 클래스에 추가하자.
```JS
class UnknownCustomer {
	get isUnknown() { return true }
	get name() { return "거주자" }
}
```
그러면 조건부 코드는 지워도 된다.
```JS 
class Client1 {
	const aCustomer = site.customer
	// ...  수 많은 코드들
	// let customerName
	// if (isUnknown(aCustomer))
	// 	customerName = "거주자"
	// else 
	// 	customerName = aCustomer.name
	const customerName = aCustomer.name
}
```
지금까지의 코드가 동작하는지 테스트한다.  
다음은 요금제 속성 차례다.
```JS 
class Client2 {
	const plan = (isUnknown(aCustomer)) ? registry.billingPlan.basic : aCustomer.billingPlan
}

class Client3 {
	if (!isUnknown(aCustomer))
		aCustomer.billingPlan = newPlan
}

class Client4 {
	const weeksDelinquent = isUnknown(aCustomer) ? 0 : aCustomer.paymentHistory.weekDelinquentInLastYear
}
```
요금제 속성을 읽는 동작은 앞서 이름 속성을 처리한 과정을 그대로 반복한다. 즉 일반적인 기본값을 반환한다.  
쓰는 동작은 현재 코드에서는 미확인 고객에 대해서는 세터를 호출하지 않는다.  
겉보기 동작을 똑같게 만들어야 하므로 특이 케이스에서도 세터가 호출 되도록 하되, 세터에서는 아무 일도 하지 않는다. 
```JS
class UnknownCustomer {
	get isUnknown() { return true }
	get name() { return "거주자" }

	get billingPlan() { return registry.billingPlan.basic } // 추가
	set billingPlan(arg) { /* 무시한다. */ } // 추가
}

class ClientExample { // 사용법 예제
	const plan = aCustomer.billingPlan // 읽는 경우
	aCustomer.billingPlan = newPlan // 쓰는 경우
}
```
특이 케이스 객체는 값 객체이다. 따라서 항상 불변이어야 한다. 대체하려는 값이 가변이라도 마찬가지다.  

마지막 상황은 특이 케이스가 자신만의 속성을 갖는 또 다른 객체(지불 이력)를 반환해야 한다. 
```JS 
class Client4 {
	const weeksDelinquent = isUnknown(aCustomer) ? 0 : aCustomer.paymentHistory.weekDelinquentInLastYear // 이런코드 를 말하는것..
}
```
특이 케이스 객체가 다른 객체를 반환해야 한다면 그 객체 역시 특이케이스여야 한다. 그래서 NullPaymentHistory를 만들기로 했다.
```JS
class UnknownCustomer {
	get isUnknown() { return true }
	get name() { return "거주자" }

	get billingPlan() { return registry.billingPlan.basic } 
	set billingPlan(arg) { /* 무시한다. */ }

	get paymentHistory() { return new NullPaymentHistory() }
}

class NullPaymentHistory {
	get weekDelinquentInLastYear() { return 0 }
}

class Client4 {
	const weeksDelinquent = isUnknown(aCustomer) ? 0 : aCustomer.paymentHistory.weekDelinquentInLastYear // return 0이 될듯..
}
```
8. 계속해서 모든 클라이언트의 코드를 이 다형적 행위로 대체할 수 있는지를 살펴본다. 

### 예시: 객체 리터럴 이용하기
데이터 구조를 읽기만 한다면 클래스 대신 리터럴 객체를 사용해도 된다.

```JS
class Site {
	get customer() { return this._customer }
}

class Customer {
	get name() {...} // 고객 이름
	get billingPlan() {...} // 요금제
	set billingPlan(arg) {...}
	get paymentHistory() {...} // 납부 이력
}

class Client1 {
	const aCustomer = site.customer
	// ...  수 많은 코드들
	let customerName
	if (aCustomer === "미확인 고객") 
		customerName = "거주자"
	else 
		customerName = aCustomer.name
}

class Client2 {
	const plan = (aCustomer === "미확인 고객") ? registry.billingPlan.basic : aCustomer.billingPlan
}

class Client3 {
	const weeksDelinquent = (aCustomer === "미확인 고객") ? 0 : aCustomer.paymentHistory.weekDelinquentInLastYear
}
```
1. 앞의 예와 같이, 먼저 고객에 isUnknown()속성을 추가하고 2. 이 필드를 포함하는 특이 케이스 객체를 생성한다. 차이점이라면 이번에는 특이케이스가 리터럴이다.

```JS
class Site {
	get customer() { return this._customer }
	get isUnknown() { return false }
}

class 최상위클래스 {
	function createUnknownCustomer() {
		return {
			isUnknown: true, 
		}
	}
}
```
3. 특이 케이스 조건 검사 부분을 함수로 추출한다. 
```JS
function isUnknown(arg) {
	return (arg === "미확인 고객")
}

class Client1 {
	const aCustomer = site.customer
	// ...  수 많은 코드들
	let customerName
	// if (aCustomer === "미확인 고객") 
	if (isUnknown(aCustomer))
		customerName = "거주자"
	else 
		customerName = aCustomer.name
}

class Client2 {
	// const plan = (aCustomer === "미확인 고객") ? registry.billingPlan.basic : aCustomer.billingPlan
	const plan = (isUnknown(aCustomer)) ? registry.billingPlan.basic : aCustomer.billingPlan
}

class Client3 {
	// const weeksDelinquent = (aCustomer === "미확인 고객") ? 0 : aCustomer.paymentHistory.weekDelinquentInLastYear
	if (isUnknown(aCustomer)) ? 0 : aCustomer.paymentHistory.weekDelinquentInLastYear
}
```
4. 조건을 검사하는 코드와 Site클래스에서 이 특이 케이스를 이용하도록 수정한다.
```JS
class Site {
	// get customer() { return this._customer }
	get customer() {
		return (aCustomer === "미확인 고객") ? createUnknownCustomer() : this._customer
	}
	get isUnknown() { return false }
}

class 최상위클래스 {
	function createUnknownCustomer() {
		return {
			isUnknown: true, 
		}
	}

	function isUnknown(arg) {
		return arg.isUnknown
	}
}
```
7. 다음으로 각각의 표준 응답을 적절한 리터럴 값으로 대체한다. 이름부터 해보자.
```JS
class 최상위클래스 {
	function createUnknownCustomer() {
		return {
			isUnknown: true, 
			name: "거주자", // 추가
		}
	}

	function isUnknown(arg) {
		return arg.isUnknown
	}
}

class Client1 {
	const aCustomer = site.customer
	// ...  수 많은 코드들
	// let customerName
	// if (isUnknown(aCustomer))
	// 	customerName = "거주자"
	// else 
	// 	customerName = aCustomer.name
	const customerName = aCustomer.name
}
```
다음은 요금제 차례다

```JS
class 최상위클래스 {
	function createUnknownCustomer() {
		return {
			isUnknown: true, 
			name: "거주자",
			billingPlan: registry.billingPlan.basic, // 추가
		}
	}

	function isUnknown(arg) {
		return arg.isUnknown
	}
}

class Client2 {
	// const plan = (isUnknown(aCustomer)) ? registry.billingPlan.basic : aCustomer.billingPlan
	const plan = aCustomer.billingPlan
}
```
비슷한 방법으로 납부 이력이 없다는 정보는 중첩 리터럴로 생성한다.

```JS
class 최상위클래스 {
	function createUnknownCustomer() {
		return {
			isUnknown: true, 
			name: "거주자",
			billingPlan: registry.billingPlan.basic,
			paymentHistory: {
				weekDelinquentInLastYear: 0
			}
		}
	}

	function isUnknown(arg) {
		return arg.isUnknown
	}
}

class Client3 {
	// if (isUnknown(aCustomer)) ? 0 : aCustomer.paymentHistory.weekDelinquentInLastYear
	const weeksDelinquent = aCustomer.paymentHistory.weekDelinquentInLastYear
}
```
#### 리터럴?
[링크](https://velog.io/@pjeeyoung/%EB%A6%AC%ED%84%B0%EB%9F%B4)

### 예시: 변환 함수 이용하기
입력이 다음처럼 단순한 레코드 구조라고 가정하자(JSON문서)
```JS
{
	name: "애크미 보스턴",
	location: "Malden MA",
	// 더 많은 현장 정보
	customer: {
		name: "애크미 산업",
		billingPlan: "plan-451",
		paymentHistory: {
			weekDelinquentInLastYear: 7
			// 중략
		},
		// 중략
	}
}
```
고객이 알려지지 않은경우는 미확인고객 으로 표시
```JS
{
	name: "물류창고 15",
	location: "Malden MA",
	// 더 많은 현장정보
	customer: "미확인 고객"
}
```
미확인 고객 검사 코드
```JS
class Client1 {
	const site = acuireSiteData()
	const aCustomer = site.customer
	// ... 수 많은 코드 ...
	let customerName
	if (aCustomer === "미확인 고객")
		customerName = "거주자"
	else 
		customerName = aCustomer.name
}

class Client2 {
	const plan = (aCustomer === "미확인 고객") ? registry.billingPlan.basic : aCustomer.billingPlan
}

class Client3 {
	const weeksDelinquent = (aCustomer === "미확인 고객") ? 0 : aCustomer.paymentHistory.weekDelinquentInLastYear
}

```
처음 할 일은 현장 데이터구조를 변환 함수인 enrichSite()에 통과시키는것이다. enrichSite()는 단순 Deep Copy해주는 메서드임

```JS
class Client1 {
	const rawSite = acuireSiteData() // 추가
	const site = enrichSite(rawSite)
	// const site = acuireSiteData()
	const aCustomer = site.customer
	// ... 수 많은 코드 ...
	let customerName
	if (aCustomer === "미확인 고객")
		customerName = "거주자"
	else 
		customerName = aCustomer.name

	function enrichSite(inputSite) {
		return _.cloneDeep(inputSite)
	}
}
```
3. 알려지지 않은 고객인지 검사하는 로직을 함수로 추출
```JS
function isUnknown(aCustomer) {
	return aCustomer === "미확인 고객"
}

class Client1 {
	const rawSite = acuireSiteData()
	const site = enrichSite(rawSite)
	const aCustomer = site.customer
	// ... 수 많은 코드 ...
	let customerName
	// if (aCustomer === "미확인 고객")
	if (isUnknown(aCustomer))
		customerName = "거주자"
	else 
		customerName = aCustomer.name

	function enrichSite(inputSite) {
		return _.cloneDeep(inputSite)
	}
}

class Client2 {
	// const plan = (aCustomer === "미확인 고객") ? registry.billingPlan.basic : aCustomer.billingPlan
	const plan = (isUnknown(aCustomer)) ? registry.billingPlan.basic : aCustomer.billingPlan
}

class Client3 {
	// const weeksDelinquent = (aCustomer === "미확인 고객") ? 0 : aCustomer.paymentHistory.weekDelinquentInLastYear
	const weeksDelinquent = (isUnknown(aCustomer)) ? 0 : aCustomer.paymentHistory.weekDelinquentInLastYear
}
```
1,2 고객레코드에 isUnknown() 속성을 추가하여 현장 정보를 보강(enrich)한다.
```JS
// function enrichSite(inputSite) {
// 	return _.cloneDeep(inputSite)
// }
function enrichSite(inputSite) {
	const result = _.cloneDeep(inputSite)
	const unknownCustomer = {
		isUnknown: true
	}

	if (isUnknown(result.customer)) 
		result.customer = unknownCustomer
	else 
		result.customer.isUnknown = false
	return result
}
```
5. 그런 다음 특이 케이스 검사 시 새로운 속성을 이용하도록 수정한다.
```JS
function isUnknown(aCustomer) {
	// return aCustomer === "미확인 고객"
	if (aCustomer === "미확인 고객")
		return true
	else 
		return aCustomer.isUnknown
}
```
6. 모든 기능이 잘되는지 테스트해보고 7. 특이 케이스에 여러 함수를 변환 함수로 묶기를 적용한다.
```JS
function enrichSite(inputSite) {
	const result = _.cloneDeep(inputSite)
	const unknownCustomer = {
		isUnknown: true,
		name: "거주자", // 추가
	}

	if (isUnknown(result.customer)) 
		result.customer = unknownCustomer
	else 
		result.customer.isUnknown = false
	return result
}

class Client1 {
	const rawSite = acuireSiteData()
	const site = enrichSite(rawSite)
	const aCustomer = site.customer
	// ... 수 많은 코드 ...
	// let customerName
	// if (isUnknown(aCustomer))
	// 	customerName = "거주자"
	// else 
	// 	customerName = aCustomer.name
	const customerName = aCustomer.name

	function enrichSite(inputSite) {
		return _.cloneDeep(inputSite)
	}
}
```
테스트후 요금제, 마지막 클라이언트를 수정해주자.
```JS
function enrichSite(inputSite) {
	const result = _.cloneDeep(inputSite)
	const unknownCustomer = {
		isUnknown: true,
		name: "거주자",
		billingPlan: registry.billingPlan.basic, // 추가
		paymentHistory: { // 추가
			weekDelinquentInLastYear: 0
		}
	}

	if (isUnknown(result.customer)) 
		result.customer = unknownCustomer
	else 
		result.customer.isUnknown = false
	return result
}

class Client2 {
	// const plan = (isUnknown(aCustomer)) ? registry.billingPlan.basic : aCustomer.billingPlan
	const plan = aCustomer.billingPlan
}

class Client3 {
	// const weeksDelinquent = (isUnknown(aCustomer)) ? 0 : aCustomer.paymentHistory.weekDelinquentInLastYear
	const weeksDelinquent = aCustomer.paymentHistory.weekDelinquentInLastYear
}

```









