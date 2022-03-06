# 06. 기본적인 리팩터링

## 6.5 함수 선언 바꾸기

```JS
function cicum(radius) {...}
```
->
```JS
function circumference(radius) {...}
```
 - 이름이 좋으면 함수의 구현 코드를 분석할 필요 없이 호출문만 보고도 무슨 일을 하는지 파악할 수 있다. 
 - 함수의 매개변수도 마찬가지임. 매개변수로 인해서 결합도가 달라지는 결과가 생길 수 있다. 

### 절차
간단한 절차와 마이그레이션 절차가 있음.  
먼저 변경사항을 살펴보고 함수 선언과 호출문들을 단번에 고칠 수 있을기 가늠하고 어떤 절차를 사용할지 선택한다.
#### 간단한 절차
 1. 매개변수를 제거하려거든 먼저 함수 본문에서 제거 대상 매개변수를 참조하는 곳은 없는지 확인한다.
 2. 메서드 선언을 원하는 형태로 바꾼다.
 3. 기존 메서드 선언을 참조하는 부분을 모두 찾아서 바뀐 형태로 수정한다.
 4. 테스트 한다.

> 이름 변경과 매개변수 추가를 모두 하고 싶다면 각각을 독립적으로 처리하자.(그러다 문제가 생기면 작업을 되돌리고 '마이그레이션 절차'를 따른다)

#### 마이그레이션 절차
 1. 이어지는 추출 단계를 수월하게 만들어야 한다면 함수의 본문을 적절히 리팩터링한다.
 2. 함수 본문을 새로운 함수로 추출한다.  
  -> 새로 만들 함수 이름이 기존 함수와 같다면 일단 검색하기 쉬운 이름을 임시로 붙여둔다.
 3. 추출한 함수에 매개변수를 추가해야 한다면 '간단한 절차'를 따라 추가한다.
 4. 테스트한다.
 5. 기존 함수를 인라인한다.
 6. 이름을 임시로 붙여뒀다면 함수 선언 바꾸기를 한 번 더 적용해서 원래 이름으로 되돌린다.
 7. 테스트한다.

### 예시: 함수 이름 바꾸기
#### 예시: 간단한 절차
```JS
function cicum(radius) {
	return 2 * Math.PI * radius
}
```
> 이 함수의 이름을 이해하기 더 쉽게 바꾸자.
```JS
function circumference(radius) {
	return 2 * Math.PI * radius
}
```
> 이 다음은 cicum()을 호출한 곳을 모두 찾아서 circumference()로 바꾼다.

#### 예시: 마이그레이션 절차

```JS
function cicum(radius) {
	return 2 * Math.PI * radius
}
```
> 먼저 함수 본문 전체를 새로운 함수로 추출한다.
```JS
function cicum(radius) {
	return circumference(radius)
}

function circumference(radius) {
	return 2 * Math.PI * radius
}
```
> 수정한 코드를 테스트한 뒤 예전 함수를 인라인한다. 하나를 변경할때마다 테스트하면서 한번에 하나씩 처리하자. 모두 바꿨다면 기존 함수를 삭제한다. 

#### 예시: 매개변수 

```JS
class Book {
	addReservation(customer) {
		this._reservation.push(customer)
	}
}
```
##### 예약 시 우선순위 큐를 지원하라는 새로운 요구가 추가되었다.
먼저 addReservation()의 본문을 새로운 함수로 추출한다. 이름이 같으니 임시 이름을 붙히자

```JS
class Book {
	addReservation(customer) {
		this.zz_addReservation.push(customer)
	}

	zz_addReservation(customer) {
		this._reservation.push(customer)
	}
}
```
그런 다음 새 함수의 선언문과 호출문에 원하는 매개변수를 추가한다.

```JS
class Book {
	addReservation(customer) {
		this.zz_addReservation.push(customer, false) // 인풋 추가
	}

	zz_addReservation(customer, isPriority) { // 파라미터 추가
		this._reservation.push(customer)
	}
}
```
이제 기존 함수를 인라인하여 호출 코드들이 새 함수를 이용하도록 고친다.  
다 고 쳤다면 새 함수의 이름을 기존함수의 이름으로 바꾼다.  


#### 예시: 매개변수를 속성으로 바꾸기
고객이 뉴잉글랜드에 살고있는지 확인하는 함수가 있다고 하자.
```JS
function isNewEngland(aCustomer) {
	return ["MA", "CT", "ME", "VT", "NH", "RI"].includes(aCustomer.address.state)
}
```
다음은 이 함수를 호출하는 코드 중 하나다.
```JS
// 호출문
const newEnglanders = someCustomers.filter(c => isNewEngland(c))
```
isNewEngland() 함수는 고객이 거주하는 주 이름을 보고 뉴잉글랜드에 사는지 판단한다. 이 함수가 주(state)식별코드를 매개변수로 받도록 리팩터링 해보자.

```JS
function isNewEngland(aCustomer) {
	const stateCode = aCustomer.address.state // 변수로 추출
	return ["MA", "CT", "ME", "VT", "NH", "RI"].includes(stateCode) // 추출된 변수를 사용
}
```
이제 함수 추출하기를 사용해보자.
```JS 
function isNewEngland(aCustomer) {
	const stateCode = aCustomer.address.state
	// return ["MA", "CT", "ME", "VT", "NH", "RI"].includes(stateCode)
	return xxNewInNewEngland(stateCode)
}
function xxNewInNewEngland(stateCode) {
	return ["MA", "CT", "ME", "VT", "NH", "RI"].includes(stateCode)
}
```
이제 기존 함수 안에 변수로 추출해둔 입력 매개변수를 인라인한다(변수 인라인하기)
```JS
function isNewEngland(aCustomer) {
	// const stateCode = aCustomer.address.state
	return xxNewInNewEngland(aCustomer.address.state)
}
function xxNewInNewEngland(stateCode) {
	return ["MA", "CT", "ME", "VT", "NH", "RI"].includes(stateCode)
}
```
함수 인라인하기로 기존 함수의 본문을 호출문들에게 집어넣는다. 실질적으로 기존 함수 호출문을 새 함수 호출문으로 교체하는 셈이다. 이 작업은 한 번에 하나씩 처리한다.

```JS
// 호출문
// const newEnglanders = someCustomers.filter(c => isNewEngland(c))
const newEnglanders = someCustomers.filter(c => xxNewInNewEngland(c.address.state))
```
기존 함수를 모든 호출문에 인라인 했다면, 함수 선언 바꾸기를 사용해 이름을 바꿔주자.

```JS
// 호출문
// const newEnglanders = someCustomers.filter(c => xxNewInNewEngland(c.address.state))
const newEnglanders = someCustomers.filter(c => isNewEngland(c.address.state))
```
```JS
// function isNewEngland(aCustomer) {
// 	return xxNewInNewEngland(aCustomer.address.state)
// }

// function xxNewInNewEngland(stateCode) {
function isNewEngland(stateCode) {
	return ["MA", "CT", "ME", "VT", "NH", "RI"].includes(stateCode)
}
```




































