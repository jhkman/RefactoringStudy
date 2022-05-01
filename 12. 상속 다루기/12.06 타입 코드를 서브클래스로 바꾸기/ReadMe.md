# 12. 상속 다루기
## 12.6 타입 코드를 서브클래스로 바꾸기

```JS
function createEmployee(name, type) {
	return new Employee(name, type)
}
```
-> 
```JS
function createEmployee(name, type) {
	switch(type) {
		case 'engineer': return new Engineer(name)
		case 'salesperson': return new Salesperson(name)
		case 'manager': return new Manager(name)
	}
}
```
### 배경
소프트웨어 시스템에는 비슷한 대상들을 특정 특성으로 분류해야 할 때가 많다.  
타입코드를 쓰기 보다는 클래스를 나눠버리자. 동작을 다르게 하는데도 용이하고 그냥 논리적으로 이게 맞음.  

### 절차
1. 타입 코드 필드를 자가 캡슐화한다.
2. 타입 코드 값 하나를 선택하여 그 값에 해당하는 서브클래스를 만든다. 타입 코드 게터 메서드를 오버라이드하여 해당 타입 코드의 리터럴 값을 반환하게 한다.
3. 매개변수로 받은 타입 코드와 방금 만든 서브클래스를 매필하는 선택 로직을 만든다.
4. 테스트한다.
5. 타입 코드 값 각각에 대해 서브클래스 생성과 선택 로직 추가를 반복한다. 클래스 하나가 완성될 때마다 테스트한다.
6. 타입 코드 필드를 제거한다.
7. 테스트한다.
8. 타입 코드 접근자를 이용하는 메서드 모두에 메서드 내리기와 조건부 로직을 다형성으로 바꾸기를 적용한다. 

### 예시: 직접 상속할 때

```JS
class Employee {
	constructor(name, type) {
		this.validateType(type)
		this._name = name
		this._type = type
	}
	validateType(arg) {
		if (!["engineer", "manager", "salesperson"].includes(arg))
			throw new Error(`${arg}라는 직원 유형은 없습니다.`)
	}
	toString() { return `${this._name} (${this._type})` }
}
```
1. 첫 번째로, 타입 코드 변수를 자가 캡슐화한다.
```JS
class Employee {
	constructor(name, type) {
		this.validateType(type)
		this._name = name
		this._type = type
	}
	validateType(arg) {
		if (!["engineer", "manager", "salesperson"].includes(arg))
			throw new Error(`${arg}라는 직원 유형은 없습니다.`)
	}
	get type() { return this._type } // 추가
	// toString() { return `${this._name} (${this._type})` }
	toString() { return `${this._name} (${this.type})` }
}
```
2. 타입 코드 중 하나, 여기서는 엔지니어를 선택해보자.
```JS
class Engineer extends Employee {
	get type() { return "engineer" }
}
```
생성자를 팩터리 함수로 바꿔서 선택 로직을 담을 별도 장소를 마련한다.
```JS
class Engineer extends Employee {
	get type() { return "engineer" }
}

function createEmployee(name, type) {
	return new Employee(name, type)
}
```
새로 만든 서브클래스를 사용하기 위한 선택 로직을 팩터리에 추가한다.
```JS
function createEmployee(name, type) {
	switch (type) {
		case "engineer": return new Engineer(name, type)
	}
	return new Employee(name, type)
}
```
4. 테스트한다. 5. 남은 유형에도 동일한 작업을 반복한다.
```JS
class Salesperson extends Employee {
	get type() { return "salesperson" }
}
class Manager extends Employee {
	get type() { return "manager" }
}
function createEmployee(name, type) {
	switch (type) {
		case "engineer": return new Engineer(name, type)
		case "salesperson": return new Salesperson(name, type)
		case "manager": return new Manager(name, type)
	}
	return new Employee(name, type)
}
```
6. 모든 유형에 적용했다면 타입 코드 필드와 슈퍼클래스의 게터(서브클래스들에서 재정의한 메서드)를 제거한다
```JS
class Engineer extends Employee {
	get type() { return "engineer" }
}
class Salesperson extends Employee {
	get type() { return "salesperson" }
}
class Manager extends Employee {
	get type() { return "manager" }
}

class Employee {
	constructor(name, type) {
		this.validateType(type)
		this._name = name
		// this._type = type
	}
	validateType(arg) {
		if (!["engineer", "manager", "salesperson"].includes(arg))
			throw new Error(`${arg}라는 직원 유형은 없습니다.`)
	}
	// get type() { return this._type }
	toString() { return `${this._name} (${this.type})` }

	function createEmployee(name, type) {
		switch (type) {
			case "engineer": return new Engineer(name, type)
			case "salesperson": return new Salesperson(name, type)
			case "manager": return new Manager(name, type)
		}
		return new Employee(name, type)
	}
}
```
7. 모든게 정상인지 테스트한 후 검증 로직도 제거한다. switch문이 사실상 똑같은 검증을 수행해주기 떄문!
```JS
class Engineer extends Employee {
	get type() { return "engineer" }
}
class Salesperson extends Employee {
	get type() { return "salesperson" }
}
class Manager extends Employee {
	get type() { return "manager" }
}

class Employee {
	constructor(name, type) {
		// this.validateType(type)
		this._name = name
	}

	// validateType(arg) {
	// 	if (!["engineer", "manager", "salesperson"].includes(arg))
	// 		throw new Error(`${arg}라는 직원 유형은 없습니다.`)
	// }

	toString() { return `${this._name} (${this.type})` }

	function createEmployee(name, type) {
		switch (type) {
			case "engineer": return new Engineer(name, type)
			case "salesperson": return new Salesperson(name, type)
			case "manager": return new Manager(name, type)
			default: throw new Error(`${arg}라는 직원 유형은 없습니다.`) // 이동..?
		}
		// return new Employee(name, type)
	}
}
```
이제 생성자에 건네는 타입 코드 인수는 쓰이지 않으니 없애버린다. 
```JS
class Engineer extends Employee {
	get type() { return "engineer" }
}
class Salesperson extends Employee {
	get type() { return "salesperson" }
}
class Manager extends Employee {
	get type() { return "manager" }
}

class Employee {
	// constructor(name, type) {
	constructor(name) {
		this._name = name
	}

	toString() { return `${this._name} (${this.type})` }

	function createEmployee(name, type) {
		switch (type) {
			case "engineer": return new Engineer(name, type)
			case "salesperson": return new Salesperson(name, type)
			case "manager": return new Manager(name, type)
			default: throw new Error(`${arg}라는 직원 유형은 없습니다.`)
		}
	}
}
```

### 간접 상속할 떄
```JS
class Employee {
	constructor(name, type) {
		this.validateType(type)
		this._name = name
		this._type = type
	}
	validateType(arg) {
		if (!["engineer", "manager", "salesperson"].includes(arg))
			throw new Error(`${arg}라는 직원 유형은 없습니다.`)
	}
	get type() { return this._type }
	set type(arg) { this._type = arg } 

	get capitalizedType() {
		return this._type.charAt(0).toUpperCase() + this._type.substr(1).toLowerCase()
	}

	toString() { return `${this._name} (${this.capitalizedType})` }
}
```
1. 첫 번쨰로 할 일은 타입 코드를 객체로 바꾸기
```JS
class EmployeeType {
	constructor(aString) {
		this._value = aString
	}
	toString() { return this._value }
}
class Employee {
	constructor(name, type) {
		this.validateType(type)
		this._name = name
		this._type = type
	}
	validateType(arg) {
		if (!["engineer", "manager", "salesperson"].includes(arg))
			throw new Error(`${arg}라는 직원 유형은 없습니다.`)
	}
	get typeString() { return this._type.toString() } // 추가
	get type() { return this._type }
	set type(arg) { this._type = arg } 

	get capitalizedType() {
	// 	return this._type.charAt(0).toUpperCase() + this._type.substr(1).toLowerCase()
		return this.typeString.charAt(0).toUpperCase() + this.typeString.substr(1).toLowerCase()
	}

	toString() { return `${this._name} (${this.capitalizedType})` }
}
```
이제 직원 유형을 리팩터링하자
```JS
class EmployeeType {
	constructor(aString) {
		this._value = aString
	}
	toString() { return this._value }
}
class Employee {
	constructor(name, type) {
		this.validateType(type)
		this._name = name
		this._type = type
	}
	validateType(arg) {
		if (!["engineer", "manager", "salesperson"].includes(arg))
			throw new Error(`${arg}라는 직원 유형은 없습니다.`)
	}
	get typeString() { return this._type.toString() } 
	get type() { return this._type }
	// set type(arg) { this._type = arg } 
	set type(arg) { this._type = Employee.createEmployeeType(arg) } 

	static createEmployeeType(aString) {
		switch(aString) {
			case "engineer": return new Engineer()
			case "salesperson": return new Salesperson()
			case "manager": return new Manager()
			default: throw new Error(`${arg}라는 직원 유형은 없습니다.`)
		}
	}

	get capitalizedType() {
		return this.typeString.charAt(0).toUpperCase() + this.typeString.substr(1).toLowerCase()
	}

	toString() { return `${this._name} (${this.capitalizedType})` }
}
class Engineer extends Employee {
	get type() { return "engineer" }
}
class Salesperson extends Employee {
	get type() { return "salesperson" }
}
class Manager extends Employee {
	get type() { return "manager" }
}
```
























