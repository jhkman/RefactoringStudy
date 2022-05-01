# 12. 상속 다루기
## 12.10 서브클래스를 위임으로 바꾸기

```JS
class Order {
	get daysToShip() {
		return this._warehouse.daysToShip
	}
}

class PriorityOrder extends Order {
	get daysToShip() {
		return this._priorityPlan.daysToShip
	}
}
```
-> 
```JS
class Order {
	get daysToShip() {
		return (this._priorityDelegate) ? this._priorityDelegate.daysToShip : this._warehouse.daysToShip
	}
}

class PriorityOrderDelegate {
	get daysToShip() {
		return this._priorityPlan.daysToShip
	}
}
```

### 배경
속한 갈래에 따라 동작이 달라지는 객체들은 상속을 통해 표현하는게 일반적으로 좋다.  
하지만 상속에는 단점이 있는데 가장 명확한 단점은 한 번만 쓸 수 있는 카드라는 것이다.  
또다른 문제로, 상속은 클래스들의 관계를 아주 긴밀하게 결합한다.  
위임은 위의 문제를 모두 해결해준다.  
유명한 원칙이 하나 있다. "(클래스) 상속보다는 (객체) 컴포지션을 사용하라!" 여기서 컴포지션은 위임과 같은말이다.  
'디자인 패턴'책에 익숙한 사람이라면 이 리팩터링을 '서브클래스 상태패턴이나 전략 패턴으로 대체'한다고 생각하면 도움이 될것이다.  

### 절차
1. 생성자를 호출하는 곳이 많다면 생성자를 팩터리 함수로 바꾼다.
2. 위임으로 활용할 빈 클래스를 만든다. 이 클래스의 생성자는 서브클래스에 특화된 데이터를 전부 받아야 하며, 보통은 슈퍼클래스를 가리키는 역참조도 필요하다.
3. 위임을 저장할 필드를 슈퍼클래스에 추가한다.
4. 서브클래스 생성 코드를 수정하여 위임 인스턴스를 생성하고 위임 필드에 대입해 초기화한다.
5. 서브클래스의 메서드 중 위임 클래스로 이동할 것을 고른다.
6. 함수 옮기기를 적용해 위임 클래스로 옮긴다. 원래 메서드에서 위임하는 코드는 지우지 않는다.
7. 서브클래스 외부에도 원래 메서드를 호출하는 코드가 있다면 서브클래스의 위임 코드를 슈퍼클래스로 옮긴다. 이떄 위임이 존재하는지를 검사하는 보호 코드로 감싸야 한다. 호출하는 외부 코드가 없다면 원래 메서드는 죽은 코드가 되므로 제거한다.
8. 테스트한다 
9. 서브클래스의 모든 메서드가 옮겨질 때까지 5-8과정을 반복한다.
10. 서브클래스들의 생성자를 호출하는 코드를 찾아서 슈퍼클래스의 생성자를 사용하도록 수정한다.
11. 테스트한다.
12. 서브클래스를 삭제한다.

### 예시: 서브클래스가 하나일 때
```JS
class Booking {
	constructor(show, date) {
		this._show = show 
		this._date = date
	}
}

class PremiumBooking extends Booking {
	constructor(show, date, extras) {
		super(show, date)
		this._extras = extras
	}
}
```

간단한 오버라이드 메서드가 하나 있다. 다음 코드처럼 일반 예약은 공연 후 관객과의 대화 시간을 성수기가 아닐떄만 제공한다.
```JS
class Booking {
	constructor(show, date) {
		this._show = show 
		this._date = date
	}

	get hasTalkback() {
		return this._show.hasOwnProperty('talkback') && !this._isPeakDay
	}

	get basePrice() {
		let result = this._show.price
		if (this.isPeakDay)
			result += Math.round(result * 0.15)
		return result
	}
}

class PremiumBooking extends Booking {
	constructor(show, date, extras) {
		super(show, date)
		this._extras = extras
	}
	get hasTalkback() { // 프리미엄 예약은 이를 오버라이드하여 항시 관객과의 대화 시간을 마련한다.
		return this._show.hasOwnProperty('talkback')
	}

	get basePrice() { // 가격결정 오버라이딩
		return Math.round(super.basePrice + this._extras.PremiumFee)
	}

	get hasDinner() { // 프리미엄 예약의 고유기능
		return this.extras.hasOwnProperty('dinner') && !this.isPeakDay
	}
}
```
이 예는 상속이 잘 들어맞는다.  
그런데 왜 서브클래스를 위임으로 바꿔야할까?  
데이터 구조를 수정해야할 떄 등등... 인스턴스를 교체하기 어려울 때   

```JS
// 클라이언트(일반 예약)
aBooking = new Booking(show, date)

// 클라이언트(프리미 예약)
aBooking = new PremiumBooking(show, date, extras)
```
1. 서브클래스를 제거하려면 수정할 게 많으니 먼저 생성자를 팩터리 함수로 바꿔서 생성자 호출 부분을 캡슐화하자
```JS
// 최상위
function createBooking(show, date) {
	return new Booking(show, date)
}
function createPremiumBooking(show, date, extras) {
	return new PremiumBooking(show, date, extras)
}

// aBooking = new Booking(show, date)
aBooking = createBooking(show, date)

// aBooking = new PremiumBooking(show, date, extras)
aBooking = createPremiumBooking(show, date, extras)
```

이제 위임클래스를 만든다.
```JS
class PremiumBookingDelegate {
	constructor(hostBooking, extras) {
		this._host = hostBooking
		this._extras = extras
	}
}
```
3,4 이제 새로운 위임을 예약 객체와 연결할 차례다. 프리미엄 예약을 생성하는 팩터리 함수를 수정하면 된다.
```JS
// 최상위
function createBooking(show, date) {
	return new Booking(show, date)
}
function createPremiumBooking(show, date, extras) {
	const result = new PremiumBooking
	// return new PremiumBooking(show, date, extras)
	result = new PremiumBooking(show, date, extras)
	result._bePremium(extras)
	return result
}

aBooking = createBooking(show, date)

aBooking = createPremiumBooking(show, date, extras)

class Booking {
	constructor(show, date) {
		this._show = show 
		this._date = date
	}

	_bePremium(extras) {
		this._premiu,Delegate = new PremiumBookingDelegate(this, extras)
	}

	get hasTalkback() {
		return this._show.hasOwnProperty('talkback') && !this._isPeakDay
	}

	get basePrice() {
		let result = this._show.price
		if (this.isPeakDay)
			result += Math.round(result * 0.15)
		return result
	}
}

class PremiumBooking extends Booking {
	constructor(show, date, extras) {
		super(show, date)
		this._extras = extras
	}
	get hasTalkback() { // 프리미엄 예약은 이를 오버라이드하여 항시 관객과의 대화 시간을 마련한다.
		return this._show.hasOwnProperty('talkback')
	}

	get basePrice() { // 가격결정 오버라이딩
		return Math.round(super.basePrice + this._extras.PremiumFee)
	}

	get hasDinner() { // 프리미엄 예약의 고유기능
		return this.extras.hasOwnProperty('dinner') && !this.isPeakDay
	}
}
```
5. 구조가 갖춰졌으니 다음은 기능을 옮길 차례다. 가장 먼저 고민할 부분은 hasTalkback()의 오버라이드 메서드다.
```JS
	get hasTalkback() {
		return this._show.hasOwnProperty('talkback') && !this._isPeakDay
	}

	get hasTalkback() { // 프리미엄 예약은 이를 오버라이드하여 항시 관객과의 대화 시간을 마련한다.
		return this._show.hasOwnProperty('talkback')
	}
```
6. 먼저 함수 옮기기를 적용해 서브클래스의 메서드를 위임으로 옮긴다.

```JS
class PremiumBookingDelegate {
	constructor(hostBooking, extras) {
		this._host = hostBooking
		this._extras = extras
	}

	get hasTalkback() { // 이동
		return this._host._show.hasOwnProperty('talkback')
	}
}

class PremiumBooking extends Booking {
	constructor(show, date, extras) {
		super(show, date)
		this._extras = extras
	}
	get hasTalkback() {
		// return this._show.hasOwnProperty('talkback')
		return this._priorityDelegate.hasTalkback
	}

	get basePrice() {
		return Math.round(super.basePrice + this._extras.PremiumFee)
	}

	get hasDinner() {
		return this.extras.hasOwnProperty('dinner') && !this.isPeakDay
	}
}
```
7. 모든 기능이 잘 동작하는지 테스트한 후 서브클래스의 메서드를 삭제한다.
```JS
class PremiumBooking extends Booking {
	constructor(show, date, extras) {
		super(show, date)
		this._extras = extras
	}
	// get hasTalkback() {
	// 	return this._priorityDelegate.hasTalkback
	// }

	get basePrice() {
		return Math.round(super.basePrice + this._extras.PremiumFee)
	}

	get hasDinner() {
		return this.extras.hasOwnProperty('dinner') && !this.isPeakDay
	}
}
```
테스트를 한 후 슈퍼클래스에 분배로직을 넣자.

```JS
class Booking {
	constructor(show, date) {
		this._show = show 
		this._date = date
	}

	_bePremium(extras) {
		this._premiu,Delegate = new PremiumBookingDelegate(this, extras)
	}

	get hasTalkback() {
		// return this._show.hasOwnProperty('talkback') && !this._isPeakDay
		return (this._premiumDelegate) ? this._priorityDelegate.hasTalkback : this._show.hasOwnProperty('talkback') && !this.isPeakDay
	}

	get basePrice() {
		let result = this._show.price
		if (this.isPeakDay)
			result += Math.round(result * 0.15)
		return result
	}
}
```
9. 기본가격도 동일하게 작업
```JS
class Booking {
	constructor(show, date) {
		this._show = show 
		this._date = date
	}

	_bePremium(extras) {
		this._premiu,Delegate = new PremiumBookingDelegate(this, extras)
	}

	get hasTalkback() {
		return (this._premiumDelegate) ? this._priorityDelegate.hasTalkback : this._show.hasOwnProperty('talkback') && !this.isPeakDay
	}

	get basePrice() {
		let result = this._show.price
		if (this.isPeakDay)
			result += Math.round(result * 0.15)
		// return result
		return (this._premiumDelegate) ? this._priorityDelegate.extendBasePrice(result) : result
	}
}

class PremiumBooking extends Booking {
	constructor(show, date, extras) {
		super(show, date)
		this._extras = extras
	}

	get basePrice() {
		return Math.round(super.basePrice + this._extras.PremiumFee)
	}

	get hasDinner() {
		return this.extras.hasOwnProperty('dinner') && !this.isPeakDay
	}

	extendBasePrice(base) {
		return Math.round(base + this._extras.PremiumFee)
	}
}
```
9. 마지막으로, 서브클래스에만 존재하는 메서드도 있을 것이다. 이 메서드는 위임으로 옮긴다.

```JS
class Booking {
	constructor(show, date) {
		this._show = show 
		this._date = date
	}

	_bePremium(extras) {
		this._premiu,Delegate = new PremiumBookingDelegate(this, extras)
	}

	get hasTalkback() {
		return (this._premiumDelegate) ? this._priorityDelegate.hasTalkback : this._show.hasOwnProperty('talkback') && !this.isPeakDay
	}

	get basePrice() {
		let result = this._show.price
		if (this.isPeakDay)
			result += Math.round(result * 0.15)
		// return result
		return (this._premiumDelegate) ? this._priorityDelegate.extendBasePrice(result) : result
	}

	get hasDinner() {
		return (this._premiumDelegate) ? this._premiumDelegate.hasDinner : undefined
	}
}

class PremiumBookingDelegate {
	constructor(hostBooking, extras) {
		this._host = hostBooking
		this._extras = extras
	}

	get hasTalkback() { // 이동
		return this._host._show.hasOwnProperty('talkback')
	}

	get hasDinner() {
		return this._extras.hasOwnProperty('dinner') && !this._host.isPeakDay
	}
}

class PremiumBooking extends Booking {
	constructor(show, date, extras) {
		super(show, date)
		this._extras = extras
	}

	get basePrice() {
		return Math.round(super.basePrice + this._extras.PremiumFee)
	}

	get hasDinner() {
		return this.extras.hasOwnProperty('dinner') && !this.isPeakDay
	}

	extendBasePrice(base) {
		return Math.round(base + this._extras.PremiumFee)
	}
}
```
10. 서브클래스의 동작을 모두 옮겼다면 팩터리 메서드가 슈퍼클래스를 반환하도록 수정한다.
11. 그리고 모든 기능이 잘 동작하는지 테스트한 다음 12. 서브클래스를 삭제한다.
```JS
// 최상위
// function createBooking(show, date) {
function createBooking(show, date, extras) {
	// return new Booking(show, date)
	const result = new Booking(show, date, extras)
	result._bePremium(extras)
	return result
}

// function createPremiumBooking(show, date, extras) {
// 	const result = new PremiumBooking
// 	result = new PremiumBooking(show, date, extras)
// 	result._bePremium(extras)
// 	return result
// }

```

























