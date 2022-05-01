# 12. 상속 다루기
## 12.3 생성자 본문 올리기

```JS
class Party {...}

class Employee extends Party {
	constructor(name, id, monthlyCost) {
		super()
		this._id = id
		this._name = name
		this._monthlyCost = monthlyCost
	}
}
```
-> 
```JS
class Party {
	constructor(name) {
		this._name = name
	}
}

class Employee extends Party {
	constructor(name, id, monthlyCost) {
		super()
		this._id = id
		this._name = name
		this._monthlyCost = monthlyCost
	}
}
```
### 배경
생성자는 다루기 까다롭다. 일반 메서드와는 많이 달라서, 생성자에서 하는 일에 제약을 두면 좋다.  

### 절차
1. 슈퍼클래스에서 생성자가 없다면 하나 정의한다. 서브클래스의 생성자들에서 이 생성자가 호출되는지 확인한다.
2. 문장 슬라이드하기로 공통 문장 모두를 super() 호출 직후로 옮긴다.
3. 공통 코드를 슈퍼클래스에 추가하고 서브클래스들에서는 제거한다. 생성자 매개 변수 중 공통 코드에서 참조하는 값들을 모두 super()로 건넨다.
4. 테스트한다.
5. 생성자 시작 부분으로 옮길 수 없는 공통 코드에는 함수 추출하기와 메서드 올리기를 차례로 적용한다.

### 예시
```JS
class Party {}

class Employee extends Party {
	constructor(name, id, monthlyCost) {
		super()
		this._id = id
		this._name = name
		this._monthlyCost = monthlyCost
	}
	// 생략
}

class Department extends Party {
	constructor(name, staff) {
		super()
		this._name = name
		this._staff = staff
	}
	// 생략
}
```
여기서 공통 코드는 this~ 이다 2.Employee에서 이 대입문을 슬라이스하여 super()호출 바로 아래로 옮긴다. 

```JS
class Party {}

class Employee extends Party {
	constructor(name, id, monthlyCost) {
		super()
		this._name = name // 문장 슬라이스해서 옮김
		this._id = id
		// this._name = name
		this._monthlyCost = monthlyCost
	}
	// 생략
}

class Department extends Party {
	constructor(name, staff) {
		super()
		this._name = name
		this._staff = staff
	}
	// 생략
}
```
테스트가 성공하면 이 공통코드를 슈퍼클래스로 옮긴다. 이 코드가 생성자의 인수인 name을 참조하므로 이 인수를 슈퍼클래스 생성자에 매개변수로 건낸다. 
```JS
class Party {
	//추가
	constructor(name) {
		this._name = name
	}
}

class Employee extends Party {
	constructor(name, id, monthlyCost) {
		// super()
		super(name)
		this._name = name
		this._id = id
		this._monthlyCost = monthlyCost
	}
	// 생략
}

class Department extends Party {
	constructor(name, staff) {
		// super()
		super(name)
		this._name = name
		this._staff = staff
	}
	// 생략
}
```
4. 테스트를 돌려 모두 통과하면 리팩터링이 끝난다. 

### 예시: 공통 코드가 나중에 올 때
```JS
class Employee {
	constructor(name) {...}
	get isPrivileged() {...}
	assignCar() {...}
}

class Manager extends Employee {
	constructor(name, grade) {
		super(name)
		this._grade = grade
		if (this.isPrivileged) 
			this.assignCar() // 모든 서브클래스가 수행한다
	}

	get isPrivileged() {
		return this._grade > 4
	}
}
```
이렇게 될 수밖에 없는 이유는 isPrivileged()는 grade 필드에 값이 대입된 후에야 호출될 수 있고, 서브클래스만이 이 필드에 값을 대입할 수 있기때문  
5. 이런 경우라면 먼저 공통 코드를 함수로 추출하자.
```JS
class Manager extends Employee {
	constructor(name, grade) {
		super(name)
		this._grade = grade
		// if (this.isPrivileged) 
		// 	this.assignCar()
		this.finishConstruction()
	}

	finishConstruction() {
		if (this.isPrivileged)
			this.assignCar()
	}

	get isPrivileged() {
		return this._grade > 4
	}
}
```
그런 다음 추출한 메서드를 슈퍼클래스로 옮긴다.
```JS
class Employee {
	constructor(name) {...}
	get isPrivileged() {...}
	assignCar() {...}

	finishConstruction() { // 이동
		if (this.isPrivileged)
			this.assignCar()
	}
}

class Manager extends Employee {
	constructor(name, grade) {
		super(name)
		this._grade = grade
		this.finishConstruction()
	}

	// finishConstruction() {
	// 	if (this.isPrivileged)
	// 		this.assignCar()
	// }

	get isPrivileged() {
		return this._grade > 4
	}
}
```

























