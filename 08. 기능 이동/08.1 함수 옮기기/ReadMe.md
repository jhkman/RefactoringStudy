# 08. 기능 이동
## 8.1 함수 옮기기

```JS
class Account {
	get overdraftChange() {...}
}
```
-> 
```JS
class AccountType {
	get overdraftChange() {...}
}
```
좋은 소프트웨어 설계의 핵심은 모듈화가 얼마나 잘 되어 있느냐를 뜻하는 모듈성이다.  
어떤 함수가 자신이 속한 모듈 A의 요소들보다 다른 모듈 B의 요소들을 더 많이 참조한다면 모듈 B로 옮겨야한다.  

### 절차
1. 선택한 함수가 현재 컨텍스트에서 사용 중인 모든 프로그램 요소를 살펴본다. 이 요소들 중에도 함꼐 옮겨야 할 게 있는지 고민해본다. 
2. 선택한 함수가 다형 메서드인지 확인한다. (객체 지향 언어에서는 같은 메서드가 슈퍼클래스나 서브클래스에도 선언되어 있는지까지 고려해야 한다.)
3. 선택한 함수를 타깃 컨텍스트로 복사한다. 타깃 함수가 새로운 터전에 잘 자리 잡도록 다듬는다.
4. 정적 분석을 수행한다.
5. 소스 컨텍스트에서 타깃 함수를 참조할 방법을 찾아 반영한다.
6. 소스 함수를 타깃 함수의 위임 함수가 되도록 수정한다.
7. 테스트한다.
8. 함수를 인라인 할지 고민해본다.

### 예시: 중첩 함수를 최상위로 옮기기
GPS 추적 기록의 총 거리를 계산하는 함수

```JS
function trackSummary(points) {
	const totalTime = calculateTime()
	const totalDistance = calculateDistanse()
	const pace = totalTime / 60 / totalDistance
	return {
		time: totalTime,
		distance: totalDistance,
		pace: pace
	};

	function calculateDistance() { // 총 거리 계산
		let result = 0
		for (let i = 1 ; i < points.length ; i++) {
			result += distance(points[i-1], points[i])
		}
		return result
	}

	function distance(p1, p2) { ... } // 두 지점의 거리 계산
	function radians(degrees) { ... } // 라디안 값으로 변환
	function calculateTime() { ... } // 총 시간 계산
}
```
이 함수에서 중첩 함수인 calculateDistance()를 최상위로 옮겨서 추적 거리를 다른 정보와는 독립적으로 계산하고 싶다.

#### 3. 가장 먼저 할 일은 이 함수를 최상위로 복사하는것

```JS
function trackSummary(points) {
	const totalTime = calculateTime()
	const totalDistance = calculateDistanse()
	const pace = totalTime / 60 / totalDistance
	return {
		time: totalTime,
		distance: totalDistance,
		pace: pace
	};

	function calculateDistance() {
		let result = 0
		for (let i = 1 ; i < points.length ; i++) {
			result += distance(points[i-1], points[i])
		}
		return result
	}

	function distance(p1, p2) { ... } 
	function radians(degrees) { ... } 
	function calculateTime() { ... }
}

function top_calculateDistance() { // 최상위로 복사하면서 새로운 (임시) 이름을 지어줌
	let result = 0
	for (let i = 1 ; i < points.length ; i++) {
		result += distance(points[i-1], points[i])
	}
	return result
}
```
-> 매개변수로 데이터를 넘기자.
```JS
// function top_calculateDistance() {
function top_calculateDistance(points) {
	let result = 0
	for (let i = 1 ; i < points.length ; i++) {
		result += distance(points[i-1], points[i])
	}
	return result
}
```
다음은 distance..
```JS
// trackSummery 함수...
function distance(p1, p2) {
	const EARTH_RADIUS = 3959 // 단위: 마일
	const dLat = radians(p2.lat) - radians(p1.lat)
	const dLon = radians(p2.lon) - radians(p1.lon)
	const a = Math.pow(Math.sin(dLat / 2), 2) + Math.cos(radians(p2.lat)) * Math.cos(radians(p1.lat)) * Mat.pow(Math.sin(dLon / 2), 2)
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
	return EARTH_RADIUS * c

	function radians(degrees) {
		return degrees * Math.PI / 180
	}
}
```
distance는 radians()만 사용하며, radians()는 현재 컨텍스트에 있는 어떤것도 사용하지 않는다. 매개변수로 넘기기 보다는 함꼐 옮겨버리자.

```JS
function trackSummary(points) {
	const totalTime = calculateTime()
	const totalDistance = calculateDistanse()
	const pace = totalTime / 60 / totalDistance
	return {
		time: totalTime,
		distance: totalDistance,
		pace: pace
	};

	function calculateDistance() {
		let result = 0
		for (let i = 1 ; i < points.length ; i++) {
			result += distance(points[i-1], points[i])
		}
		return result

		function distance(p1, p2) { ... } 
		function radians(degrees) { ... } 
	}

	// function distance(p1, p2) { ... } 
	// function radians(degrees) { ... } 
	function calculateTime() { ... }
}
```

같은 내용을 새로 만든 top_calculateDistance()에도 복사한다.
```JS
function top_calculateDistance(points) {
	let result = 0
	for (let i = 1 ; i < points.length ; i++) {
		result += distance(points[i-1], points[i])
	}
	return result

	function distance(p1, p2) { ... } // 복사
	function radians(degrees) { ... } // 복사
}
```

#### 6. 소스 함수인 calculateDistance()의 본문을 수정하여 top_calculateDistance()를 호출하게 하자.
```JS
function trackSummary(points) {
	const totalTime = calculateTime()
	const totalDistance = calculateDistanse()
	const pace = totalTime / 60 / totalDistance
	return {
		time: totalTime,
		distance: totalDistance,
		pace: pace
	};

	function calculateDistance() {
		// let result = 0
		// for (let i = 1 ; i < points.length ; i++) {
		// 	result += distance(points[i-1], points[i])
		// }
		// return result

		// function distance(p1, p2) { ... } 
		// function radians(degrees) { ... } 
		top_calculateDistance(points) // 추가
	}

	function calculateTime() { ... }
}

function top_calculateDistance(points) {
	let result = 0
	for (let i = 1 ; i < points.length ; i++) {
		result += distance(points[i-1], points[i])
	}
	return result

	function distance(p1, p2) { ... }
	function radians(degrees) { ... }
}
```

#### 7. 이 시점에서 반드시 모든 테스트를 수행해야 한다. 가장 먼저 소스함수를 대리자 역할로 그대로 둘지 결정해야한다. 지금은 지우자.

```JS
function trackSummary(points) {
	const totalTime = calculateTime()
	// const totalDistance = calculateDistanse()
	const totalDistance = top_calculateDistance(points)
	const pace = totalTime / 60 / totalDistance
	return {
		time: totalTime,
		distance: totalDistance,
		pace: pace
	};

	// function calculateDistance() {
	// 	top_calculateDistance(points)
	// }

	function calculateTime() { ... }
}

function top_calculateDistance(points) {
	let result = 0
	for (let i = 1 ; i < points.length ; i++) {
		result += distance(points[i-1], points[i])
	}
	return result

	function distance(p1, p2) { ... }
	function radians(degrees) { ... }
}
```

이제 새 함수 이름을 지어주자.
```JS
function trackSummary(points) {
	const totalTime = calculateTime()
	// const totalDistance = top_calculateDistance(points)
	// const pace = totalTime / 60 / totalDistance
	const pace = totalTime / 60 / totalDistance(points)
	return {
		time: totalTime,
		distance: totalDistance,
		pace: pace
	};

	function calculateTime() { ... }
}

// function top_calculateDistance(points) {
function totalDistance(points) {
	let result = 0
	for (let i = 1 ; i < points.length ; i++) {
		result += distance(points[i-1], points[i])
	}
	return result

	function distance(p1, p2) { ... }
	function radians(degrees) { ... }
}
```

### 예시: 다른 클래스로 옮기기

```JS
class Account {
	get bankCharge() { // 은행 이자 계산
		let result = 4.5
		if (this._daysOverdrawn > 0) result += this.overdraftChange
			return result
	}

	get overdraftChange() { // 초과 인출 이자 계산
		if (this.type.isPremium) {
			const baseCharge = 10
			if (this.daysOverdrawn <= 7)
				return baseCharge
			else 
				return baseCharge + (this.daysOverdrawn - 7) * 0.85
		} else {
			return this.daysOverdrawn * 1.75
		}
	}
}
```
계좌 종류에 따라 이자 정책 알고리즘이 달라지도록 수정하자.  
마이너스 통장의 초과 인출 이자를 계산하는 overdraftCharge()를 계좌 종류 클래스인 AccountType으로 옮기자  
1. overdraftCharge() 메서드가 사용하는 기능을 살표보고 옮길만한 가치가 있나 고민해보자.  
3. 다음으로 overdraftCharge() 메서드 본문을 AccountType 클래스로 복사한 후 새 보금자리에 맞게 정리한다.
```JS
class AccountType {

	// get overdraftChange() {
	get overdraftChange(daysOverdrawn) {
		// if (this.type.isPremium) {
		if (this.isPremium) {
			const baseCharge = 10
			// if (this.daysOverdrawn <= 7)
			if (daysOverdrawn <= 7)
				return baseCharge
			else 
				// return baseCharge + (this.daysOverdrawn - 7) * 0.85
				return baseCharge + (daysOverdrawn - 7) * 0.85
		} else {
			// return this.daysOverdrawn * 1.75
			return daysOverdrawn * 1.75
		}
	}
}
```

-> 
```JS
class Account {

	get overdraftChange(daysOverdrawn) {
		// if (this.isPremium) {
		// 	const baseCharge = 10
		// 	if (daysOverdrawn <= 7)
		// 		return baseCharge
		// 	else 
		// 		return baseCharge + (daysOverdrawn - 7) * 0.85
		// } else {
		// 	return daysOverdrawn * 1.75
		// }
		return this.type.overdraftChange(this.daysOverdrawn)
	}
}
```
-> 

```JS
class Account {
	get bankCharge() {
		let result = 4.5
		if (this._daysOverdrawn > 0) result += this.overdraftChange
			// return result
			result += this.type.overdraftChange(this.daysOverdrawn)
		return result
	}

	get overdraftChange(daysOverdrawn) {
		return this.type.overdraftChange(this.daysOverdrawn)
	}
}
```






























