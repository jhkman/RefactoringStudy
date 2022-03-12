# 08. 기능 이동
## 8.2 필드 옮기기

```JS
class Customer {
	get plan() { return this._paln }
	get discountRate() { return this._discountRate }
}
```
-> 
```JS
class Customer {
	get plan() { return this._paln }
	get discountRate() { return this.plan.discountRate }
}
```
프로그램의 진짜 힘은 데이터 구조에서 나온다.  
올바르게 데이터 구조를 선택하면 단순하고 직관적인 코드가 나오고 그렇지 않다면 이상한 코드가 나온다.  
데이터 구조가 적절치 않은것을 깨닫게 되면 수정해야한다.  
한 레코드를 변경하려 할 떄 다른 레코드의 필드까지 변경해야하면 필드의 위치가 잘못되었다는 신호다.  
구조체 여러 개에 정의된 똑같은 필드들을 갱신해야 한다면 한 번만 갱신해도 되는 다른 위치로 옮기라는 신호다.  

### 절차
1. 소스 필드가 캡슐화되어 있지 않다면 캡슐화한다.
2. 테스트한다.
3. 타깃 객체에 필드(와 접근자 메서드들)를 생성한다.
4. 정적 검사를 수행한다.
5. 소스 객체에서 타깃 객체를 참조할 수 있는지를 확인한다.
6. 접근자들이 타깃 필드를 사용하도록 수정한다.
7. 테스트한다.
8. 소스 필드를 제거한다.
9. 테스트한다.

### 예시
고객 클래스(Customer)와 계약 클래스(CustomerContract)에서 시작하자.

```JS
class Customer {
	constructor(name, discountRate) {
		this._name = name
		this._discountRate = discountRate
		this._contract = new CustomerContract(dateToday())
	}

	get discountRate() { return this._discountRate }
	beomePerferred() {
		this._discountRate += 0.03
		
		...
	}
	applyDiscount(amount) {
		return amount.subtract(amount.multiply(this._discountRate))
	}
}
```

```JS
class CustomerContract {
	constructor(startDate) {
		this._startDate = startDate
	}
}
```

여기서 할인율을 뜻하는 discountRate 필드를 Customer에서 CustomerContract로 옮기고 싶다고 해보자.
1. 캡슐화 하기부터 하자

```JS
class Customer {
	constructor(name, discountRate) {
		this._name = name
		// this._discountRate = discountRate
		this._setDiscountRate(discountRate)
		this._contract = new CustomerContract(dateToday())
	}

	get discountRate() { return this._discountRate }
	_setDiscountRate(aNumber) { this._discountRate = aNumber } // 추가

	beomePerferred() {
		// this._discountRate += 0.03
		this._setDiscountRate(this.discountRate)

		...
	}
	applyDiscount(amount) {
		// return amount.subtract(amount.multiply(this._discountRate))
		return amount.subtract(amount.multiply(this.discountRate))
	}
}
```
할인율을 수정하는 public 세터를 만들고 싶지 않아서 세터 속성이 아니라 메서드를 이용했다.  
3. 이제 CustomCOntract 클래스에 필드 하나와 접근자들을 추가한다.
```JS
class CustomerContract {
	// constructor(startDate) {
	constructor(startDate, discountRate) {
		this._startDate = startDate
		this._discountRate = discountRate // 추가
	}

	get discountRate() { return this._discountRate } // 추가 
	set discountRate(arg) { this._discountRate = arg } // 추가
}
```
6. 그런 다음 Customer의 접근자들이 새로운 필드를 사용하도록 수정한다.

```JS
class Customer {
	constructor(name, discountRate) {
		this._name = name
		this.contract = new CustomerContract(dateToday()) // 추가
		this._setDiscountRate(discountRate)
		// this._contract = new CustomerContract(dateToday())
	}

	// get discountRate() { return this._discountRate }
	get discountRate() { return this._contract.discountRate }
	// _setDiscountRate(aNumber) { this._discountRate = aNumber }
	_setDiscountRate(aNumber) { this._contract.discountRate = aNumber }

	beomePerferred() {
		this._setDiscountRate(this.discountRate)

		...
	}
	applyDiscount(amount) {
		return amount.subtract(amount.multiply(this.discountRate))
	}
}
```

### 예시: 공유 객체로 이동하기
다음 코드는 이자율을 계좌별로 설정하고 있다.
```JS
class Account {
	constructor(number, type, interestRate) {
		this._number = number
		this._type = type
		this._interestRate = interestRate
	}

	get interestRate() { return this._interestRate }
}
```
```JS
class AccountType {
	constructor(nameString) {
		this._name = nameString
	}
}
```
이 코드를 수정하여 이자율이 계좌 종류에 따라 정해지도록 하려고 한다.  
1. 이자율 필드는 캡슐화 되어있으니 3. 타깃인 AccountType에 이자율 필드와 필요한 접근자 메서드를 생성해보자.

```JS
class AccountType {
	// constructor(nameString) {
	constructor(nameString, interestRate) {
		this._name = nameString
		this._interestRate = interestRate
	}

	get interestRate() { return this._interestRate }
}
```
4. Account가 AccountType의 이자율을 가저오도록 수정하면 문제가 생길 수 있다. 

```JS
class Account {
	constructor(number, type, interestRate) {
		this._number = number
		this._type = type
		assert(interestRate === this._type.interestRate) // 추가
		this._interestRate = interestRate
	}

	get interestRate() { return this._interestRate }
}
```
> 이렇게 어셔션을 추가하고 오류가 생기나 지켜봐보자..
  
6. 시스템 겉보기 동작이 달라지지 않는다는 확신이 서면 이자율을 가져오는 부분을 변경하고 8. Account에서 이자율을 직접 수정하던 코드를 완전히 제거한다.

```JS
class Account {
	constructor(number, type, interestRate) {
		this._number = number
		this._type = type
		// assert(interestRate === this._type.interestRate) 
		// this._interestRate = interestRate
	}

	// get interestRate() { return this._interestRate }
	get interestRate() { return this._type.interestRate }
}
```




















