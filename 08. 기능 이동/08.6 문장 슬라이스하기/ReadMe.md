# 08. 기능 이동
## 8.6 문장 슬라이드하기
```JS
const pricingPlan = retrievePricingPlan()
const order = retreiveOrder()
let charge
const chargePerUnit = pricingPlan.unit
```
->
```JS
const pricingPlan = retrievePricingPlan()
const chargePerUnit = pricingPlan.unit
const order = retreiveOrder()
let charge
```
### 배경
관련된 코드들이 가까이 모여 있다면 이해하기가 더 쉽다.  
문장 슬라이드하기를 이용해 코드를 모아보자.

### 절차
1. 코드 조각(문장들)을 이동할 목표 위치를 찾는다. 코드 조각의 원래 위치와 목표 위치 사이의 코드들을 흝어보면서, 조각을 모으고 나면 동작이 달라지는 코드가 있는지 살핀다. 다음과 같은 간섭이 있다면 이 리팩터링을 포기한다.
 - 코드 조각에서 참조하는 요소를 선언하는 문장 앞으로는 이동할 수 없다.
 - 코드 조각을 참조하는 요소의 뒤로는 이동할 수 없다.
 - 코드 조각에서 참조하는 요소를 수정하는 문장을 건나뛰어 이동할 수 없다.
 - 코드 조각이 수정하는 요소를 참조하는 요소를 건너뛰어 이동할 수 없다.
2. 코드 조각을 원래 위치에 잘라내어 목표 위치에 붙여 넣는다.
3. 테스트한다.

### 예시
코드 조각을 슬라이드 할 떄는 무엇을 슬라이드 할지와 슬라이드 할 수 있는지를 확인하자.  

```JS
1 const pricingPlan = retrievePricingPlan()
2 const order = retreiveOrder()
3 const baseChange = pricingPlan.base
4 let charge
5 const chargePerUnit = pricingPlan.unit
6 const units = order.units
7 let discount
8 charge = baseChange + units * chargePerUnit
9 let discountableUnits = Math.max(units - pricingPlan.discountThreshold, 0)
10 discount = discountableUnits * pricingPlan.discountFactor
11 if (order.isRepeat) discount += 20
12 charge -= discount  
13 chargeOrder(charge)
```
 - 처음 일곱줄은 선언이기때문에 이동하기가 쉽다. ex) 할인 관련 코드를 모으고 싶다면 7번 줄을 10번줄 바로 위까지 내린다. 
 - 11번 줄을 코드 끝으로 슬라이드 하고 싶다면? 12번줄떄문에 가로막힌다.. (참조하고 있기 떄문)
 - 슬라이드가 안전한 지를 판단하려면 관련된 연산이 무엇이고 어떻게 구성되는지 완벽히 이해해야 한다.

### 예시 조건문이 있을 떄의 슬라이드
조건문 밖으로 슬라이드할 때는 중복 로직이 제거될 것이고, 조건문 안으로 슬라이드할 때는 반대로 중복 로직이 추가될 것이다.
```JS
let result
if (availableResources.length === 0) {
	result = createResource()
	allocatedResources.push(result)
} else {
	result = availableResources.pop()
	allocatedResources.push(result)
}
return result
```
->
```JS
let result
if (availableResources.length === 0) {
	result = createResource()
	// allocatedResources.push(result)
} else {
	result = availableResources.pop()
	// allocatedResources.push(result)
}
allocatedResources.push(result) // 슬라이드
return result
```
반대의 상황이면 코드 조각이 모든 분기에 복제되어 들어간다.































