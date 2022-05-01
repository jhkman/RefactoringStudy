# 12. 상속 다루기
## 12.8 슈퍼클래스 추출하기

```JS
class Department {
	get totalAnnualCost() {...}
	get name() {...}
	get headCount() {...}
}

class Employee {
	get annualCost() {...}
	get name() {...}
	get id() {...}
}

```
->
```JS
class Party {
	get name() {...}
	get annualCost() {...}
}

class Department extends Party {
	get annualCost() {...}
	get headCount() {...}
}

class Employee extends Party {
	get annualCost() {...}
	get id() {...}
}
```

### 배경
비슷한 일을 수행하는 두 클래스가 보이면 상속 메커니즘을 이용해서 비슷한 부분을 공통의 슈퍼클래스로 옮겨 담을 수 있다.  

### 절차
1. 빈 슈퍼클래스를 만든다. 원래의 클래스들이 새 클래스를 상속하도록 한다.
2. 테스트한다.
3. 생성자 본문 올리기, 메서드 올리기, 필드 올리기를 차례로 적용하여 공통 원소를 슈퍼클래스로 옮긴다.
4. 서브클래스에 남은 메서드들을 검토한다. 공통되는 부분이 있다면 함수로 추출한 다음 메서드 올리기를 적용한다.
5. 원래 클래스들을 사용하는 코드를 검토하여 슈퍼클래스의 인터페이스를 사용하게 할지 고민해본다.

### 예시
공통된 기능이 있다. 연간 비용과 월간 비용, 이름
```JS
class Employee {
	constructor(name, id, monthlyCost) {
		this._id = id
		this._name = name
		this._monthlyCost = monthlyCost
	}
	get monthlyCost() { return this._monthlyCost } // 월간 비용
	get name() { return this._name } // 이름
	get id() { return this._id }

	get annualCost() { // 연간비용
		return this._monthlyCost * 12
	}
}

class Department {
	constructor(name, staff) {
		this._name = name
		this._staff = staff
	}

	get staff() { return this._staff.slice() }
	get name() { return this._name } // 이름

	get totalAnnualCost() { // 총 월간 비용
		return this.staff
		.map(e => e.monthlyCost)
		.reduce((sum, cost) => sum + cost)
	}
	get headCount() {
		return this.staff.length
	}
	get totalAnnualCost() { // 총 연간 비용
		return this.totalMonthlyCost * 12
	}

}

```
두 클래스로부터 슈퍼클래스를 추출하면 이 공통된 동작들을 더 명확하게 드러낼 수 있다. 1. 우선 빈 슈퍼클래스를 만들고, 두 클래스가 이를 확장하도록 한다.

```JS
class Party { }

// class Employee {
class Employee extends Party {
	constructor(name, id, monthlyCost) {
		this._id = id
		this._name = name
		this._monthlyCost = monthlyCost
	}
	get monthlyCost() { return this._monthlyCost }
	get name() { return this._name }
	get id() { return this._id }

	get annualCost() {
		return this._monthlyCost * 12
	}
}

// class Department {
class Department extends Party {
	constructor(name, staff) {
		this._name = name
		this._staff = staff
	}

	get staff() { return this._staff.slice() }
	get name() { return this._name }

	get totalAnnualCost() {
		return this.staff
		.map(e => e.monthlyCost)
		.reduce((sum, cost) => sum + cost)
	}
	get headCount() {
		return this.staff.length
	}
	get totalAnnualCost() {
		return this.totalMonthlyCost * 12
	}

}

```

3. 이름 속성을 위로 올리자. + 메서드들도

```JS
class Party { 
	constructor(name) {
		this._name = name
	}

	get name() { return this._name }

}

class Employee extends Party {
	constructor(name, id, monthlyCost) {
		super(name) // 추가
		this._id = id
		// this._name = name
		this._monthlyCost = monthlyCost
	}
	get monthlyCost() { return this._monthlyCost }
	// get name() { return this._name }
	get id() { return this._id }

	get annualCost() {
		return this._monthlyCost * 12
	}
}

class Department extends Party {
	constructor(name, staff) {
		// this._name = name
		super(name) // 추가
		this._staff = staff
	}

	get staff() { return this._staff.slice() }
	// get name() { return this._name }

	get totalAnnualCost() {
		return this.staff
		.map(e => e.monthlyCost)
		.reduce((sum, cost) => sum + cost)
	}
	get headCount() {
		return this.staff.length
	}
	get totalAnnualCost() {
		return this.totalMonthlyCost * 12
	}

}
// totalMonthlyCost
```
다음으로, 구현 로직이 비슷한 메서드가 두 개 보인다.
```JS
get annualCost() {
	return this._monthlyCost * 12
}
get totalAnnualCost() {
	return this.totalMonthlyCost * 12
}
```
함수 선언 바꾸기를 통해 의도가 같은 두 함수의 이름을 먼저 바꾼다.

```JS
class Party { 
	constructor(name) {
		this._name = name
	}

	get name() { return this._name }

}

class Employee extends Party {
	constructor(name, id, monthlyCost) {
		super(name)
		this._id = id
		this._monthlyCost = monthlyCost
	}
	get monthlyCost() { return this._monthlyCost }
	get id() { return this._id }

	get annualCost() {
		return this._monthlyCost * 12
	}
}

class Department extends Party {
	constructor(name, staff) {
		super(name)
		this._staff = staff
	}

	get staff() { return this._staff.slice() }
	
	get headCount() {
		return this.staff.length
	}
	// get totalAnnualCost() {
	get annualCost() {
		// return this.totalMonthlyCost * 12
		return this.monthlyCost * 12
	}

	get monthlyCost() { ... } // 이름 변경

}

```
이제 메서드 올리기를 적용하자.

```JS
class Party { 
	constructor(name) {
		this._name = name
	}

	get name() { return this._name }

	get annualCost() { // 올리기
		return this.monthlyCost * 12
	}

}

class Employee extends Party {
	constructor(name, id, monthlyCost) {
		super(name)
		this._id = id
		this._monthlyCost = monthlyCost
	}
	get monthlyCost() { return this._monthlyCost }
	get id() { return this._id }

	// get annualCost() {
	// 	return this._monthlyCost * 12
	// }
}

class Department extends Party {
	constructor(name, staff) {
		super(name)
		this._staff = staff
	}

	get staff() { return this._staff.slice() }

	get headCount() {
		return this.staff.length
	}

	// get annualCost() {
	// 	return this.monthlyCost * 12
	// }

	get monthlyCost() { ... }

}




















