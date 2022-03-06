# 06. 기본적인 리팩터링

## 6.8 매개변수 객체 만들기
```JS
function amountInvoiced(startDate, endDate) { ... }
function amountReceived(startDate, endDate) { ... }
function amountOverdue(startDate, endDate) { ... }
```
->
```JS
function amountInvoiced(aDateRange) { ... }
function amountReceived(aDateRange) { ... }
function amountOverdue(aDateRange) { ... }
```

### 배경
데이터 항목 여러개가 파라미터로 자주 묶여다니면 데이터 구조 하나로 모아주자.  
데이터 뭉치를 데이터 구조로 묶으면 데이터 사이의 관계가 명확해진다.  
더 중요한것은 이런 데이터 구조를 새로 발견하면 이 데이터 구조를 활용하는 형태로 프로그램 동작을 재구성한다는것에 있다.  

### 절차
1. 적당한 데이터 구조가 아직 마련되어 있지 않다면 새로 만든다.
2. 테스트한다.
3. 함수선언 바꾸기(6.5)로 새 데이터 구조를 매개변수로 추가한다.
4. 테스트한다.
5. 함수 호출시 새로운 데이터 구조 인스턴스를 넘기도록 수정한다. 하나씩 수정할 떄마다 테스트한다.
6. 기존 매개변수를 사용하던 코드를 새 데이터 구조의 원소를 사용하도록 바꾼다.
7. 다 바꿨다면 기존 매개변수를 제거하고 테스트한다.

### 예시
온도 측정값 배열에서 정상 작동 범위를 체크하는 기능
```JS
const station = { 
	name: "ZB1",
	readings: [
		{ temp: 47, time: "2016-11-10 09:10" },
		{ temp: 53, time: "2016-11-10 09:20" },
		{ temp: 58, time: "2016-11-10 09:30" },
		{ temp: 53, time: "2016-11-10 09:40" },
		{ temp: 51, time: "2016-11-10 09:50" }
	]
};
```
다음은 정상 범위를 벗어난 측정 값을 찾는 함수이다.
```JS
function readingsOutsideRange(station, min, max) {
	return station.readings.filter(r => r.temp < min || r.temp > max);
}
```
호출문
```JS
alerts = readingsOutsideRange(
	station,
	operatingPlan.temperatureFloor, // 최저온도
	operatingPlan.temperatureCeiling // 최고온도
);
```
최저온도와 최고온도를 묶는방식으로 리팩토링 해보자

#### 1. 묶는 데이터를 표현하는 클래스를 선언한다.
```JS
class NumberRange {
	constructor(min, max) {
		this._data = {min: min, max: max};
	}
	get min() { return this._data.min; }
	get max() { return this._data.max; }
}
```

#### 3. 새로 만든 객체를 readingsOutsideRange()의 매개변수로 추가하도록 함수 선언을 바꾼다(6.5)
```JS
function readingsOutsideRange(station, min, max, range) { // 추가
	return station.readings.filter(r => r.temp < min || r.temp > max);
}

// 호출문
alerts = readingsOutsideRange(
	station,
	operatingPlan.temperatureFloor,
	operatingPlan.temperatureCeiling,
	null // 추가
);
```

#### 4. 테스트는 성공할것이고, 5. 이제 온도 범위를 객체 형태로 전달하도록 호출문을 하나씩 바꾼다.
```JS
const range = new NumberRange(operatingPlan.temperatureFloor, operatingPlan.temperatureCeiling); // 객체 생성

alerts = readingsOutsideRange(
	station,
	operatingPlan.temperatureFloor,
	operatingPlan.temperatureCeiling,
	// null
	range // 추가
);
```

#### 6. 이제 기존 매개변수를 사용하는 부분을 변경한다. 하나씩 바꿔주자.
```JS
function readingsOutsideRange(station, /*min, max,*/ range) { // 변경
	// return station.readings.filter(r => r.temp < min || r.temp > max);
	return station.readings.filter(r => r.temp < range.min || r.temp > range.max);
}

alerts = readingsOutsideRange(
	station,
	// operatingPlan.temperatureFloor,
	// operatingPlan.temperatureCeiling,
	range // 추가
);
```






















