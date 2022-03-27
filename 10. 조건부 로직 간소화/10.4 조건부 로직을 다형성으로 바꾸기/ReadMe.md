# 10 조건부 로직 간소화
## 10.4 조건부 로직을 다형성으로 바꾸기
```JS
switch (bird.type) {
	case '유럽 제비':
	return "보통이다"
	case '아프리카 제비':
	return (bird.numberOfCoconuts > 2) ? "지쳤다" : "보통이다"
	case '노르웨이 파랑 앵무':
	return (bird.voltage > 100) ? "그을렸다" : "예쁘다"
	default:
	return " 알 수 없다"
}
```
->
```JS
class EuropeanSwallow {
	get plumage() {
		return "보통이다"
	}
	...
}

class AfricanSwallow {
	get plumage() {
		return (this.numberOfCoconuts > 2) ? "지쳤다" : "보통이다"
	}
}

class NorwegianBlueParrot {
	get plumage() {
		return (this.voltage > 100) ? "그을렸다" : "예쁘다"
	}
}
```

### 배경
복잡한 조건부 로직은 프로그래밍에서 해석하기 가장 난해한 대상에 속한다. 클래스와 다형성을 이용해 이 문제를 해결하자.  

### 절차
1. 다형적 동작을 표현하는 클래스들이 아직 없다면 만들어준다. 이왕이면 적합한 인스턴스를 알아서 만들어 반환하는 팩터리 함수도 함께 만든다.
2. 호출하는 코드에서 팩터리 함수를 사용하게 한다.
3. 조건부 로직 함수를 슈퍼클래스로 옮긴다.
4. 서브클래스 중 하나를 선택한다. 서브클래스에서 슈퍼클래스의 조건부 로직 메서드를 오버라이드 한다. 조건부 문장 중 선택된 서브클래스에 해당하는 조건절을 서브클래스 메서드로 복사한 다음 적절히 수정한다.
5. 같은 방식으로 각 조건절을 해당 서브클래스에서 메서드로 구현한다.
6. 슈퍼클래스 메서드에는 기본 동작 부분만 남긴다. 혹은 슈퍼클래스가 추상 클래스여야 한다면, 이 메서드를 추상으로 선언하거나 서브클래스에서 처리해야 함을 알리는 에러를 던진다.

### 예시
새의 종에 따른 비행 속도와 깃털 상태를 구하는 프로그램

```JS
function plumage(bird) {
	return new Map(birds.map(b => [b.name, plumage(b)]))
}

function speeds(birds) {
	return new Map(birds.map(b => [b.name, airSpeedVelocity(b)]))
}

function plumage(bird) { // 깃털 상태
	switch (bird.type) {
		case '유럽 제비':
			return "보통이다"
		case '아프리카 제비':
			return (bird.numberOfCoconuts > 2) ? "지쳤다" : "보통이다"
		case '노르웨이 파랑 앵무':
			return (bird.voltage > 100) ? "그을렸다" : "예쁘다"
		default:
			return " 알 수 없다"
	}
}

function airSpeedVelocity(bird) { // 비행 속도
	switch (bird.type) {
		case '유럽 제비':
			return 35
		case '아프리카 제비':
			return 40 - 2 * bird.numberOfCoconuts
		case '노르웨이 파랑 앵무':
			return bird.isNailed ? 0 : 10 + bird.voltage / 10
		default:
			return null
	}
}
```
새 종류에 따라 다르게 동작하는 함수가 몇 개 보이니 종류별 클래스를 만들어서 각각에 맞는 동작을 표현하면 좋을 것 같다.  
3. 가장 먼저 airSpeedVelocity()와 plumage()를 Bird라는 클래스로 묶어보자.

```JS
function plumage(bird) {
	// return new Map(birds.map(b => [b.name, plumage(b)]))
	return new Bird(bird).plumage
}

function speeds(birds) {
	// return new Map(birds.map(b => [b.name, airSpeedVelocity(b)]))
	return new Bird(bird).airSpeedVelocity
}

// function plumage(bird) { // 깃털 상태
// 	switch (bird.type) {
// 		case '유럽 제비':
// 			return "보통이다"
// 		case '아프리카 제비':
// 			return (bird.numberOfCoconuts > 2) ? "지쳤다" : "보통이다"
// 		case '노르웨이 파랑 앵무':
// 			return (bird.voltage > 100) ? "그을렸다" : "예쁘다"
// 		default:
// 			return " 알 수 없다"
// 	}
// }

// function airSpeedVelocity(bird) { // 비행 속도
// 	switch (bird.type) {
// 		case '유럽 제비':
// 			return 35
// 		case '아프리카 제비':
// 			return 40 - 2 * bird.numberOfCoconuts
// 		case '노르웨이 파랑 앵무':
// 			return bird.isNailed ? 0 : 10 + bird.voltage / 10
// 		default:
// 			return null
// 	}
// }
class Bird {
	// function plumage(bird) { // 깃털 상태
	get plumage() { // 깃털 상태
		switch (bird.type) {
		case '유럽 제비':
			return "보통이다"
		case '아프리카 제비':
			return (bird.numberOfCoconuts > 2) ? "지쳤다" : "보통이다"
		case '노르웨이 파랑 앵무':
			return (bird.voltage > 100) ? "그을렸다" : "예쁘다"
		default:
			return null
		}
	}

// function airSpeedVelocity(bird) { // 비행 속도
	get airSpeedVelocity() { // 비행 속도
		switch (bird.type) {
		case '유럽 제비':
			return 35
		case '아프리카 제비':
			return 40 - 2 * bird.numberOfCoconuts
		case '노르웨이 파랑 앵무':
			return bird.isNailed ? 0 : 10 + bird.voltage / 10
		default:
			return null
		}
	}
}
```
1. 이제 종별 서브 클래스를 만든다. 팩터리 함수도 곁들인.. 2. 그리고 나서 객체를 얻을 때 팩토리 함수를 사용한다.
```JS
function plumage(bird) {
	// return new Bird(bird).plumage
	return createBird(bird).plumage
}

function speeds(birds) {
	// return new Bird(bird).airSpeedVelocity
	return createBird(bird).airSpeedVelocity
}

class Bird {

	function createBird(bird) { // 팩터리 메서드 추가
		switch (bird.type) {
		case '유럽 제비':
			return new EuropeanSwallow(bird)
		case '아프리카 제비':
			return new AfricanSwallow(bird)
		case '노르웨이 파랑 앵무':
			return new NorwegianBlueParrot(bird)
		default:
			return new Bird(bird)
		}
	}

	get plumage() { 
		switch (bird.type) {
		case '유럽 제비':
			return "보통이다"
		case '아프리카 제비':
			return (bird.numberOfCoconuts > 2) ? "지쳤다" : "보통이다"
		case '노르웨이 파랑 앵무':
			return (bird.voltage > 100) ? "그을렸다" : "예쁘다"
		default:
			return null
		}
	}

	get airSpeedVelocity() { 
		switch (bird.type) {
		case '유럽 제비':
			return 35
		case '아프리카 제비':
			return 40 - 2 * bird.numberOfCoconuts
		case '노르웨이 파랑 앵무':
			return bird.isNailed ? 0 : 10 + bird.voltage / 10
		default:
			return null
		}
	}
}

class EuropeanSwallow extends Bird {

}

class AfricanSwallow extends Bird {

}

class NorwegianBlueParrot extends Bird {

}
```
필요한 클래스 구조가 준비되었으니 메서드를 처리해보자.
```JS
function plumage(bird) {
	return createBird(bird).plumage
}

function speeds(birds) {
	return createBird(bird).airSpeedVelocity
}

class Bird {

	function createBird(bird) {
		switch (bird.type) {
		case '유럽 제비':
			return new EuropeanSwallow(bird)
		case '아프리카 제비':
			return new AfricanSwallow(bird)
		case '노르웨이 파랑 앵무':
			return new NorwegianBlueParrot(bird)
		default:
			return new Bird(bird)
		}
	}

	get plumage() { 
		switch (bird.type) {
		case '유럽 제비':
			// return "보통이다"
			throw "오류 발생"
		case '아프리카 제비':
			return (bird.numberOfCoconuts > 2) ? "지쳤다" : "보통이다"
		case '노르웨이 파랑 앵무':
			return (bird.voltage > 100) ? "그을렸다" : "예쁘다"
		default:
			return "알 수 없다."
		}
	}

	get airSpeedVelocity() { 
		switch (bird.type) {
		case '유럽 제비':
			return 35
		case '아프리카 제비':
			return 40 - 2 * bird.numberOfCoconuts
		case '노르웨이 파랑 앵무':
			return bird.isNailed ? 0 : 10 + bird.voltage / 10
		default:
			return null
		}
	}
}

class EuropeanSwallow extends Bird {
	get plumage() { // 위에서 이동
		return "보통이다"
	}
}

class AfricanSwallow extends Bird {

}

class NorwegianBlueParrot extends Bird {

}
```
테스트를 해보고 정상작동하면 다음 조건절을 처리한다. (한개씩. 예제에서는 그냥 처리하겠음)
```JS
function plumage(bird) {
	return createBird(bird).plumage
}

function speeds(birds) {
	return createBird(bird).airSpeedVelocity
}

class Bird {

	function createBird(bird) {
		switch (bird.type) {
		case '유럽 제비':
			return new EuropeanSwallow(bird)
		case '아프리카 제비':
			return new AfricanSwallow(bird)
		case '노르웨이 파랑 앵무':
			return new NorwegianBlueParrot(bird)
		default:
			return new Bird(bird)
		}
	}

	get plumage() { 
		// switch (bird.type) {
		// case '유럽 제비':
		// 	throw "오류 발생"
		// case '아프리카 제비':
		// 	throw "오류 발생"
		// case '노르웨이 파랑 앵무':
		// 	throw "오류 발생"
		// default:
		// 	return null
		// }
		return "알 수 없다."
	}

	get airSpeedVelocity() { 
		switch (bird.type) {
		case '유럽 제비':
			return 35
		case '아프리카 제비':
			return 40 - 2 * bird.numberOfCoconuts
		case '노르웨이 파랑 앵무':
			return bird.isNailed ? 0 : 10 + bird.voltage / 10
		default:
			return null
		}
	}
}

class EuropeanSwallow extends Bird {
	get plumage() { // 위에서 이동
		return "보통이다"
	}
}

class AfricanSwallow extends Bird {
	get plumage() { // 위에서 이동
		return (this.numberOfCoconuts > 2) ? "지쳤다" : "보통이다"
	}
}

class NorwegianBlueParrot extends Bird {
	get plumage() { // 위에서 이동
		return (this.voltage > 100) ? "그을렸다" : "예쁘다"
	}
}
```
똑같은 과정을 airSpeedVelocity()에도 적용을 해주자.

```JS
function plumage(bird) {
	return createBird(bird).plumage
}

function speeds(birds) {
	return createBird(bird).airSpeedVelocity
}

class Bird {

	function createBird(bird) {
		switch (bird.type) {
		case '유럽 제비':
			return new EuropeanSwallow(bird)
		case '아프리카 제비':
			return new AfricanSwallow(bird)
		case '노르웨이 파랑 앵무':
			return new NorwegianBlueParrot(bird)
		default:
			return new Bird(bird)
		}
	}

	get plumage() {
		return "알 수 없다."
	}

	get airSpeedVelocity() { 
		// switch (bird.type) {
		// case '유럽 제비':
		// 	return 35
		// case '아프리카 제비':
		// 	return 40 - 2 * bird.numberOfCoconuts
		// case '노르웨이 파랑 앵무':
		// 	return bird.isNailed ? 0 : 10 + bird.voltage / 10
		// default:
		// 	return null
		// }
		return null
	}
}

class EuropeanSwallow extends Bird {
	get plumage() { 
		return "보통이다"
	}

	get airSpeedVelocity() { // 위에서 이동
		return 35
	}
}

class AfricanSwallow extends Bird {
	get plumage() { 
		return (this.numberOfCoconuts > 2) ? "지쳤다" : "보통이다"
	}

	get airSpeedVelocity() { // 위에서 이동
		return 40 - 2 * this.numberOfCoconuts
	}
}

class NorwegianBlueParrot extends Bird {
	get plumage() { 
		return (this.voltage > 100) ? "그을렸다" : "예쁘다"
	}

	get airSpeedVelocity() { // 위에서 이동
		return this.isNailed ? 0 : 10 + bird.voltage / 10
	}
}
```

### 예시: 변형 동작을 다형성으로 표현하기
거의 똑같은 객체지만 다른 부분도 있음을 표현할 경우에도 상속을 사용한다.
신용 평가 기관에서 선박의 항해 투자 등급을 계산하는 코드. A와 B로 나누며 기준은 항해경로의 자연조건과 선장의 항해이력을 참조한다.

```JS
function rating(voyage, history) { // 투자 등급
	const vpf = voyageProfitFactor(voyage, history)
	const vr = voyageRisk(voyage)
	const chr = captainHistoryRisk(voyage, history)
	if (vpf * 3 > (vr + chr * 2)) 
		return "A"
	else 
		return "B"
}

function voyageRisk(voyage) { // 항해 경로 위험요소
	let result = 1
	if (voyage.length > 4)
		result += 2
	if (voyage.length > 8)
		result += voyage.length - 8
	if (["중국", "동인도"].includes(voyage.zone))
		result += 4
	return Math.max(result, 0)
}

function captainHistoryRisk(history) { // 선장의 항해 이력 위험요소
	let result = 1
	if (history.length < 5) 
		result += 4
	result += history.filter(v => v.profit < 0).length
	if (voyage.zone === "중국" && hasChina(history)) 
		result -= 2
	return Math.max(result, 0)
}

function hasChina(history) { // 중국을 경유하는가?
	return history.some(v => "중국" === v.zone)
}

function voyageProfitFactor(voyage, history) { // 수익 요인
	let result = 2
	if (voyage.zone === "중국")
		return += 1
	if (voyage.zone === "동인도")
		return += 1
	if (voyage.zone === "중국" && hasChina(history)) {
		return += 3
		if (history.length > 10)
			result += 1
		if (history.length > 12)
			result += 1
		if (history.length > 18)
			result -= 1
	}
	else {
		if (history.length > 8)
			result += 1
		if (history.length > 14)
			result -= 1
	}
	return result
}

```
voyageRisk()와 captainHistoryRisk()의 점수는 위험요소에, voyageProfitFactor() 점수는 잠재 수익에 반영된다. rating()함수는 두 값을 종합하여 요청한 항애의 최종 등급을 계산한다.  
호출하는 코드는 아래와 같다.
```JS
const voyage = {zone: "서인도", length: 10}
const history = [
	{zone: "동인도", profit: 5},
	{zone: "서인도", profit: 15},
	{zone: "중국", profit: -2},
	{zone: "서아프리카", profit: 7},
]

const myRating = rating(voyage, history)
```
여기서 주목할 부분은 두 곳으로, 중국까지 항해해본 선장이 중국을 경유해 항해할 때를 다루는 조건부 로직들이다.
```JS
function rating(voyage, history) { // 투자 등급
	const vpf = voyageProfitFactor(voyage, history)
	const vr = voyageRisk(voyage)
	const chr = captainHistoryRisk(voyage, history)
	if (vpf * 3 > (vr + chr * 2)) 
		return "A"
	else 
		return "B"
}

function voyageRisk(voyage) { // 항해 경로 위험요소
	let result = 1
	if (voyage.length > 4)
		result += 2
	if (voyage.length > 8)
		result += voyage.length - 8
	if (["중국", "동인도"].includes(voyage.zone))
		result += 4
	return Math.max(result, 0)
}

function captainHistoryRisk(history) { // 선장의 항해 이력 위험요소
	let result = 1
	if (history.length < 5) 
		result += 4
	result += history.filter(v => v.profit < 0).length
	if (voyage.zone === "중국" && hasChina(history)) //여기랑 
		result -= 2
	return Math.max(result, 0)
}

function hasChina(history) { // 중국을 경유하는가?
	return history.some(v => "중국" === v.zone)
}

function voyageProfitFactor(voyage, history) { // 수익 요인
	let result = 2
	if (voyage.zone === "중국")
		return += 1
	if (voyage.zone === "동인도")
		return += 1
	if (voyage.zone === "중국" && hasChina(history)) { // 여기
		return += 3
		if (history.length > 10)
			result += 1
		if (history.length > 12)
			result += 1
		if (history.length > 18)
			result -= 1
	}
	else {
		if (history.length > 8)
			result += 1
		if (history.length > 14)
			result -= 1
	}
	return result
}
```
이 특수한 상황을 다루는 로직들은 기본 동작에서 분리하기 위해 상속과 다형성을 이용할 것이다.  
다형성을 적용하려면 클래스를 만들어야 하니 여러 함수를 클래스로 묶기부터 적용할 것이다.

```JS
// function rating(voyage, history) { // 투자 등급
// 	const vpf = voyageProfitFactor(voyage, history)
// 	const vr = voyageRisk(voyage)
// 	const chr = captainHistoryRisk(voyage, history)
// 	if (vpf * 3 > (vr + chr * 2)) 
// 		return "A"
// 	else 
// 		return "B"
// }
function rating(voyage, history) {
	return new Rating(voyage, history).value
}

class Rating {
	constructor(voyage, history) {
		this.voyage = voyage
		this.history = history
	}

	get value() {
		const vpf = voyageProfitFactor(voyage, history)
		const vr = voyageRisk(voyage)
		const chr = captainHistoryRisk(voyage, history)
		if (vpf * 3 > (vr + chr * 2)) 
			return "A"
		else 
			return "B"
	}

	// function voyageRisk(voyage) {
	get voyageRisk() {
		let result = 1
		if (voyage.length > 4)
			result += 2
		if (voyage.length > 8)
			result += voyage.length - 8
		if (["중국", "동인도"].includes(voyage.zone))
			result += 4
		return Math.max(result, 0)
	}

	// function captainHistoryRisk(history) {
	get captainHistoryRisk() {
		let result = 1
		if (history.length < 5) 
			result += 4
		result += history.filter(v => v.profit < 0).length
		if (voyage.zone === "중국" && hasChina(history)) 
			result -= 2
		return Math.max(result, 0)
	}

	// function hasChina(history) { 
	get hasChinaHistory() {
		return history.some(v => "중국" === v.zone)
	}

	// function voyageProfitFactor(voyage, history) { 
	get voyageProfitFactor() { 
		let result = 2
		if (voyage.zone === "중국")
			return += 1
		if (voyage.zone === "동인도")
			return += 1
		if (voyage.zone === "중국" && this.hasChinaHistory) {
			return += 3
			if (history.length > 10)
				result += 1
			if (history.length > 12)
				result += 1
			if (history.length > 18)
				result -= 1
		}
		else {
			if (history.length > 8)
				result += 1
			if (history.length > 14)
				result -= 1
		}
		return result
	}
}
```
기본 동작을 담당할 클래스가 만들어 졌으니 변형 동작을 담을 빈 서브 클래스를 만들자.

```JS
function rating(voyage, history) {
	// return new Rating(voyage, history).value
	return new createRating(voyage, history).value
}

class Rating {
	constructor(voyage, history) {
		this.voyage = voyage
		this.history = history
	}

	get value() {
		const vpf = voyageProfitFactor(voyage, history)
		const vr = voyageRisk(voyage)
		const chr = captainHistoryRisk(voyage, history)
		if (vpf * 3 > (vr + chr * 2)) 
			return "A"
		else 
			return "B"
	}

	get voyageRisk() {
		let result = 1
		if (voyage.length > 4)
			result += 2
		if (voyage.length > 8)
			result += voyage.length - 8
		if (["중국", "동인도"].includes(voyage.zone))
			result += 4
		return Math.max(result, 0)
	}

	get captainHistoryRisk() {
		let result = 1
		if (history.length < 5) 
			result += 4
		result += history.filter(v => v.profit < 0).length
		if (voyage.zone === "중국" && hasChina(history)) 
			result -= 2
		return Math.max(result, 0)
	}

	get hasChinaHistory() {
		return history.some(v => "중국" === v.zone)
	}

	get voyageProfitFactor() { 
		let result = 2
		if (voyage.zone === "중국")
			return += 1
		if (voyage.zone === "동인도")
			return += 1
		if (voyage.zone === "중국" && this.hasChinaHistory) {
			return += 3
			if (history.length > 10)
				result += 1
			if (history.length > 12)
				result += 1
			if (history.length > 18)
				result -= 1
		}
		else {
			if (history.length > 8)
				result += 1
			if (history.length > 14)
				result -= 1
		}
		return result
	}
}

class ExperiencedChinaRating extends Rating {

}

function createRating(voyage, history) { // 팩토리 추가
	if (voyage.zone === "중국" && history.some(v => "중국" === v.zone))
		return new ExperiencedChinaRating(voyage.history)
	else 
		return new Rating(voyage, history)
}
```

서브클래스로 옮길 동작은 두가지다. captainHistoryRisk안의 로직부터 하자
```JS
function rating(voyage, history) {
	return new createRating(voyage, history).value
}

class Rating {
	constructor(voyage, history) {
		this.voyage = voyage
		this.history = history
	}

	get value() {
		const vpf = voyageProfitFactor(voyage, history)
		const vr = voyageRisk(voyage)
		const chr = captainHistoryRisk(voyage, history)
		if (vpf * 3 > (vr + chr * 2)) 
			return "A"
		else 
			return "B"
	}

	get voyageRisk() {
		let result = 1
		if (voyage.length > 4)
			result += 2
		if (voyage.length > 8)
			result += voyage.length - 8
		if (["중국", "동인도"].includes(voyage.zone))
			result += 4
		return Math.max(result, 0)
	}

	get captainHistoryRisk() {
		let result = 1
		if (history.length < 5) 
			result += 4
		result += history.filter(v => v.profit < 0).length
		// if (voyage.zone === "중국" && hasChina(history)) 오버라이드해서 처리할것임
		// 	result -= 2
		return Math.max(result, 0)
	}

	get hasChinaHistory() {
		return history.some(v => "중국" === v.zone)
	}

	get voyageProfitFactor() { 
		let result = 2
		if (voyage.zone === "중국")
			return += 1
		if (voyage.zone === "동인도")
			return += 1
		if (voyage.zone === "중국" && this.hasChinaHistory) {
			return += 3
			if (history.length > 10)
				result += 1
			if (history.length > 12)
				result += 1
			if (history.length > 18)
				result -= 1
		}
		else {
			if (history.length > 8)
				result += 1
			if (history.length > 14)
				result -= 1
		}
		return result
	}
}

class ExperiencedChinaRating extends Rating {
	get captainHistoryRisk() { // 오버라이드
		const result = super.captainHistoryRisk - 2 
		return Math.max(result, 0)
	}
}

function createRating(voyage, history) {
	if (voyage.zone === "중국" && history.some(v => "중국" === v.zone))
		return new ExperiencedChinaRating(voyage.history)
	else 
		return new Rating(voyage, history)
}
```
이제 voyageProfitFactor() ㄱ  
우선 해당 조건부 블록 전체를 함수로 추출한다.

```JS
function rating(voyage, history) {
	return new createRating(voyage, history).value
}

class Rating {
	constructor(voyage, history) {
		this.voyage = voyage
		this.history = history
	}

	get value() {
		const vpf = voyageProfitFactor(voyage, history)
		const vr = voyageRisk(voyage)
		const chr = captainHistoryRisk(voyage, history)
		if (vpf * 3 > (vr + chr * 2)) 
			return "A"
		else 
			return "B"
	}

	get voyageRisk() {
		let result = 1
		if (voyage.length > 4)
			result += 2
		if (voyage.length > 8)
			result += voyage.length - 8
		if (["중국", "동인도"].includes(voyage.zone))
			result += 4
		return Math.max(result, 0)
	}

	get captainHistoryRisk() {
		let result = 1
		if (history.length < 5) 
			result += 4
		result += history.filter(v => v.profit < 0).length
		return Math.max(result, 0)
	}

	get hasChinaHistory() {
		return history.some(v => "중국" === v.zone)
	}

	get voyageProfitFactor() { 
		let result = 2
		if (voyage.zone === "중국")
			return += 1
		if (voyage.zone === "동인도")
			return += 1
		// if (voyage.zone === "중국" && this.hasChinaHistory {
		// 	return += 3
		// 	if (history.length > 10)
		// 		result += 1
		// 	if (history.length > 12)
		// 		result += 1
		// 	if (history.length > 18)
		// 		result -= 1
		// }
		// else {
		// 	if (history.length > 8)
		// 		result += 1
		// 	if (history.length > 14)
		// 		result -= 1
		// }
		result += this.voyageAndHistoryLengthFactor
		return result
	}

	get voyageAndHistoryLengthFactor() { // 추출됨
		let result = 0
		// if (voyage.zone === "중국" && this.hasChinaHistory) {
		// 	return += 3
		// 	if (history.length > 10)
		// 		result += 1
		// 	if (history.length > 12)
		// 		result += 1
		// 	if (history.length > 18)
		// 		result -= 1
		// }
		// else {
			if (history.length > 8)
				result += 1
			if (history.length > 14)
				result -= 1
		// }
		return result
	}
}

class ExperiencedChinaRating extends Rating {
	get captainHistoryRisk() {
		const result = super.captainHistoryRisk - 2 
		return Math.max(result, 0)
	}

	get voyageAndHistoryLengthFactor() { // 상속
		let result = 0
		return += 3  // 이부분만 뜯어옴
		if (history.length > 10)
			result += 1
		if (history.length > 12)
			result += 1
		if (history.length > 18)
			result -= 1
		return result
	}
}

function createRating(voyage, history) {
	if (voyage.zone === "중국" && history.some(v => "중국" === v.zone))
		return new ExperiencedChinaRating(voyage.history)
	else 
		return new Rating(voyage, history)
}
```
이제 And를 없애보자

```JS
function rating(voyage, history) {
	return new createRating(voyage, history).value
}

class Rating {
	constructor(voyage, history) {
		this.voyage = voyage
		this.history = history
	}

	get value() {
		const vpf = voyageProfitFactor(voyage, history)
		const vr = voyageRisk(voyage)
		const chr = captainHistoryRisk(voyage, history)
		if (vpf * 3 > (vr + chr * 2)) 
			return "A"
		else 
			return "B"
	}

	get voyageRisk() {
		let result = 1
		if (voyage.length > 4)
			result += 2
		if (voyage.length > 8)
			result += voyage.length - 8
		if (["중국", "동인도"].includes(voyage.zone))
			result += 4
		return Math.max(result, 0)
	}

	get captainHistoryRisk() {
		let result = 1
		if (history.length < 5) 
			result += 4
		result += history.filter(v => v.profit < 0).length
		return Math.max(result, 0)
	}

	get hasChinaHistory() {
		return history.some(v => "중국" === v.zone)
	}

	get voyageProfitFactor() { 
		let result = 2
		if (voyage.zone === "중국")
			return += 1
		if (voyage.zone === "동인도")
			return += 1
		result += this.voyageAndHistoryLengthFactor
		return result
	}

	get voyageAndHistoryLengthFactor() {
		let result = 0
		// if (history.length > 8)
		// 	result += 1
		result += this.historyLengthFactor
		if (history.length > 14)
			result -= 1
		return result
	}

	get historyLengthFactor() { // 추출
		(history.length > 8) ? 1 : 0
	}
}

class ExperiencedChinaRating extends Rating {
	get captainHistoryRisk() {
		const result = super.captainHistoryRisk - 2 
		return Math.max(result, 0)
	}

	get voyageAndHistoryLengthFactor() {
		let result = 0
		return += 3
		// if (history.length > 10)
		// 	result += 1
		result += this.historyLengthFactor
		if (history.length > 12)
			result += 1
		if (history.length > 18)
			result -= 1
		return result
	}

	get historyLengthFactor() { // 추출
		(history.length > 10) ? 1 : 0
	}
}

function createRating(voyage, history) {
	if (voyage.zone === "중국" && history.some(v => "중국" === v.zone))
		return new ExperiencedChinaRating(voyage.history)
	else 
		return new Rating(voyage, history)
}
```
이제 슈퍼클래스에서는 문장을 호출한 곳으로 옮기기를 적용할 수 있다.
```JS
function rating(voyage, history) {
	return new createRating(voyage, history).value
}

class Rating {
	constructor(voyage, history) {
		this.voyage = voyage
		this.history = history
	}

	get value() {
		const vpf = voyageProfitFactor(voyage, history)
		const vr = voyageRisk(voyage)
		const chr = captainHistoryRisk(voyage, history)
		if (vpf * 3 > (vr + chr * 2)) 
			return "A"
		else 
			return "B"
	}

	get voyageRisk() {
		let result = 1
		if (voyage.length > 4)
			result += 2
		if (voyage.length > 8)
			result += voyage.length - 8
		if (["중국", "동인도"].includes(voyage.zone))
			result += 4
		return Math.max(result, 0)
	}

	get captainHistoryRisk() {
		let result = 1
		if (history.length < 5) 
			result += 4
		result += history.filter(v => v.profit < 0).length
		return Math.max(result, 0)
	}

	get hasChinaHistory() {
		return history.some(v => "중국" === v.zone)
	}

	get voyageProfitFactor() { 
		let result = 2
		if (voyage.zone === "중국")
			return += 1
		if (voyage.zone === "동인도")
			return += 1
		// result += this.voyageAndHistoryLengthFactor
		result += historyLengthFactor
		result += voyageLengthFactor
		return result
	}

	// get voyageAndHistoryLengthFactor() {
	// 	let result = 0
		// result += this.historyLengthFactor
		// if (history.length > 14)
		// 	result -= 1
	// 	return result
	// }

	get historyLengthFactor() {
		(this.history.length > 8) ? 1 : 0
	}

	get voyageLengthFactor() {
		return (this.voyage.length > 14) ? -1 : 0
	}
}

class ExperiencedChinaRating extends Rating {
	get captainHistoryRisk() {
		const result = super.captainHistoryRisk - 2 
		return Math.max(result, 0)
	}

	// get voyageAndHistoryLengthFactor() {
	// 	let result = 0
	// 	return += 3
	// 	// result += this.historyLengthFactor
	// 	if (history.length > 12)
	// 		result += 1
	// 	if (history.length > 18)
	// 		result -= 1
	// 	return result
	// }

	get voyageProfitFactor() {
		return super.voyageProfitFactor + 3
	}

	get historyLengthFactor() {
		(this.history.length > 10) ? 1 : 0
	}

	get voyageLengthFactor() {
		let result = 0
		// result += 3
		if (history.length > 12)
			result += 1
		if (history.length > 18)
			result -= 1
		return result
	}
}

function createRating(voyage, history) {
	if (voyage.zone === "중국" && history.some(v => "중국" === v.zone))
		return new ExperiencedChinaRating(voyage.history)
	else 
		return new Rating(voyage, history)
}
```


