# 06. 기본적인 리팩터링

## 6.2 함수 인라인 하기

```JS
function getRating(driver) {
	return moreTanFiveLateDeliveries(driver) ? 2 : 1
}

function moreTanFiveLateDeliveries(driver) {
	return driver.numberOfLateDeliveries > 5
}
```
-> 
```JS
function getRating(driver) {
	return driver.numberOfLateDeliveries > 5 ? 2 : 1
}
```
> 간접 호출은 유용할 수도 있지만 쓸데없는 간접 호출은 거슬릴 뿐이다. 잘못 추출퇸 함수들은 원래 함수로 합친 다음, 필요하면 원하는 형태로 다시 추출하는 것이다.

### 절차
 1. 다형 메서드(polymorphic method)인지 확인한다.  
   -> 서브 클래스에서 오버라이드 하는 메서드는 인라인하면 안 된다.
 2. 인라인할 함수를 호출하는 곳을 모두 찾는다.
 3. 각 호출문을 함수 본문으로 교체한다.
 4. 하나씩 교체할 때마다 테스트한다.  
   -> 인라인 작업을 한 번에 처리할 필요는 없다. 
 5. 함수 정의(원래 함수)를 삭제한다.

### 예시

```JS
function getRating(driver) {
	return moreTanFiveLateDeliveries(driver) ? 2 : 1
}

function moreTanFiveLateDeliveries(driver) {
	return driver.numberOfLateDeliveries > 5
}
```
-> 
```JS
function getRating(driver) {
	return driver.numberOfLateDeliveries > 5 ? 2 : 1
}
```
> 호출되는 함수의 반환문을 그대로 복사해서 호출하는 함수의 호출문을 덮어쓰면 끝이다.

#### 복사한 코드가 새로운 위치에 잘 들어맞도록 손봐줘야 할 때도 있다.
```JS
function rating(aDriver) {
	return moreTanFiveLateDeliveries(aDriver) ? 2 : 1
}

function moreTanFiveLateDeliveries(dvr) {
	return dvr.numberOfLateDeliveries > 5;
}
```
-> 거의 비슷하지만 moreTanFiveLateDeliveries 를 호출할때 전달하는 인수의 이름이 정의와 다르다

```JS
function getRating(aDriver) {
	return aDriver.numberOfLateDeliveries > 5 ? 2 : 1
}
```
> 맞춰줌

##### 다른 케이스
```JS
function reportLines(aCustomer) {
	const lines = []
	gatherCustomerData(lines, aCustomer)
	return lines
}

function gatherCustomerData(out, aCustomer) {
	out.push(["name", aCustomer.name])
	out.push(["location", aCustomer.location])
}
```
> 단순히 잘라 붙이는 식으로는 gatherCustomerData()를 reportLines()로 인라인 할 수 없다.

```JS
function reportLines(aCustomer) {
	const lines = []
	// gatherCustomerData(lines, aCustomer)
	out.push(["name", aCustomer.name])
	return lines
}

function gatherCustomerData(out, aCustomer) {
	// out.push(["name", aCustomer.name])
	out.push(["location", aCustomer.location])
}
```

```JS
function reportLines(aCustomer) {
	const lines = []
	// gatherCustomerData(lines, aCustomer)
	out.push(["name", aCustomer.name])
	out.push(["location", aCustomer.location])
	return lines
}

// function gatherCustomerData(out, aCustomer) {
// 	out.push(["name", aCustomer.name])
// 	out.push(["location", aCustomer.location])
// }
```
> 핵심은 항상 단계를 잘게 나눠서 처리하는것. 어느정도 자신감이 붙으면 다시 작업을 크게 묶어서 처리하자. 그러다 테스트가 실패하면 다시 리팩터링 하자.























