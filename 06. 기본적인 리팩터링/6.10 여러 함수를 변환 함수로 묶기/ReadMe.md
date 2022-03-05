# 06. 기본적인 리팩터링

## 6.10 여러 함수를 변환 함수로 묶기

```JS
function base(aReading) { ... }
function taxableCharge(aReading) { ... }
```
->
```JS
function enrichReading(argReading) {
	const aReading = _.cloneDeep(argReading);
	aReading.baseCharge = base(aReading);
	aReading.taxableCharge = taxableCharge(aReading);
	return aReading;
}
```

### 배경
소프트웨어는 데이터를 입력받아서 여러 가지 정보를 도출하고 하는데 이 정보가 사용되는 곳마다 같은 도출 로직이 반복되기도 한다.  
이른 도출 작업들을 한데로 모아두자. 모아두면 검색과 갱신을 일관된 장소에서 처리할 수 있고 로직 중복도 막을 수 있다.  

### 절차
1. 변환할 레코드를 입력받아서 값을 그대로 반환하는 변환 함수를 만든다.
2. 묶을 함수 중 함수 하나를 골라서 본문 코드를 변환 함수로 옮기고, 처리 결과를 레코드에서 새 필드로 기록한다. 그런 다음 클라이언트 코드가 이 필드를 사용하도록 수정한다.
3. 테스트한다. 
4. 나머지 관련 함수도 위 과정에 따라 처리한다.

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
이 코드에는 이와 같은 계산 코드가 여러 곳에 반복된다고 해보자. 

```JS
// 클라이언트3
const aReading = acquireReading();
const basicChargeAmount = calculateBaseCharge(aReading);

function calculateBaseCharge(aReading) { // 다른 곳에서 이미 함수로 만들어둠
	return baseRate(aReading.month, aReading.year) * aReading.quantity;
}
```

### 리팩터링 해보자.
#### 1. 우선 입력 객체를 그대로 복사해 반환하는 변환 함수를 만든다.
```JS
function enrichReading(original) {
	const result = _.cloneDeep(original);
	return result;
}
```

#### 2. 이제 변경하려는 계산 로직 중 하나를 고른다. 먼저 이 계산 로직에 측정값을 전달하기 전에 부가 정보를 덧붙이도록 수정한다.
```JS
// 클라이언트 3
const rawReading = acquireReading(); // 미가공 측정값
const aReading = enrichReading(rawReading);
const basicChargeAmount = calculateBaseCharge(aReading);
```
calculateBaseCharge()를 부가 정보를 덧붙이는 코드 근처로 옮긴다.
```JS
function enrichReading(original) {
	const result = _.cloneDeep(original);
	result.baseCharge = calculateBaseCharge(result); // 미가공 측정값에 기본 소비량을 부가 정보로 덧붙임
	return result;
}
```
변환 함수 안에서는 결과 객체를 매번 복제할 필요 없이 마음껏 변경해도 된다.  
이어서 이 삼루를 사용하던 클라이언트가 부가 정보를 담은 필드를 사용하도록 수정한다.
```JS
// 클라이언트 3
const rawReading = acquireReading();
const aReading = enrichReading(rawReading);
// const basicChargeAmount = calculateBaseCharge(aReading);
const basicChargeAmount = aReading.baseCharge;
```
calculateBaseCharge()를 호출하는 모든 코드를 수정했다면, 이 함수를 enrichReading()안에 중첩시킬 수 있다.  
그러면 '기본 요금을 이용하는 클라이언트는 변환된 레코드를 사용해야 한다'라는 의도를 명확히 표현할 수 있다.  
주의할 점은 enrichReading()처럼 정보를 추가해 반환할 때 원본 측정값 레코드는 변경하지 않아야 한다는 것이다. 따라서 테스트를 작성해두자

```JS
it('check reading unchanged', function() {
	const baseReading = { customer: "ivan", quantity: 15, month: 5, year: 2017 };
	const oracle = _.cloneDeep(baseReading);
	enrichReading(baseReading);
	assert.deepEqual(baseReading, oracle);
});
```
그런다음 클라이언트 1도 이 필드를 사용하도록 수정하자
```JS
// 클라이언트1
// const aReading = acquireReading();
const rawReading = acquireReading();
const aReading = enrichReading(rawReading);

// const baseCharge = baseRate(aReading.month, aReading.year) * aReading.quantity;
const baseCharge = aReading.baseCharge;
```
#### 4. 이제 세금을 부과할 소비량 계산으로 넘어가자. 가장 먼저 변환 함수부터 끼워 넣는다. 
```JS
// 클라이언트2
// const aReading = acquireReading();
const rawReading = acquireReading();
const aReading = enrichReading(rawReading);
const base = (baseRate(aReading.month, aReading.year) * aReading.quantity);
const taxableCharge = Math.max(0, base - taxThreshold(aReading.year));
```
여기서 기본 요금을 계산하는 부분을 앞에서 만든 필드로 교체할 수 있다.
```JS
// 클라이언트2
const rawReading = acquireReading();
const aReading = enrichReading(rawReading);
// const base = (baseRate(aReading.month, aReading.year) * aReading.quantity);
const base = aReading.baseCharge;
const taxableCharge = Math.max(0, base - taxThreshold(aReading.year));
```
테스트해서 문제가 없으면 변수를 인라인 하자

```JS
// 클라이언트2
const rawReading = acquireReading();
const aReading = enrichReading(rawReading);
// const base = aReading.baseCharge;
// const taxableCharge = Math.max(0, base - taxThreshold(aReading.year));
const taxableCharge = Math.max(0, aReading.baseCharge - taxThreshold(aReading.year));
```
그런 다음 계산 코드를 변환 함수로 옮긴다.
```JS
function enrichReading(original) {
	const result = _.cloneDeep(original);
	result.baseCharge = calculateBaseCharge(result);
	result.taxableCharge = Math.max(0, aReading.baseCharge - taxThreshold(aReading.year)); // 옮겨짐
	return result;
}
```
```JS
// 클라이언트2
const rawReading = acquireReading();
const aReading = enrichReading(rawReading);
// const taxableCharge = Math.max(0, aReading.baseCharge - taxThreshold(aReading.year));
const taxableCharge = aReading.taxableCharge;
```


































