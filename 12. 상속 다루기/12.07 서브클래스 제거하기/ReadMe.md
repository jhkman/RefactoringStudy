# 12. 상속 다루기
## 12.7 서브클래스 제거하기

```JS
class Person {
	get genderCode() { return "X" }
}
class Male extends Person {
	get genderCode() { return "M" }
}
class Female extends Person {
	get genderCode() { return "F" }
}
```
->
```JS
class Person {
	get genderCode() {
		return this._genderCode
	}
}
```

### 배경
더이상 쓰이지않는 서브클래스는 제거하자

### 절차
1. 서브클래스의 생성자를 팩터리 함수로 바꾼다.
2. 서브클래스의 타입을 검사하는 코드가 있다면 그 검사 코드에 함수 추출하기와 함수 옮기기를 차례로 적용하여 슈퍼클래스로 옮긴다. 하나 변경할 때마다 테스트한다.
3. 서브클래스의 타입을 나타내는 필드를 슈퍼클래스에 만든다.
4. 서브클래스를 참조하는 메서드가 방금 만든 타입 필드를 이용하도록 수정한다.
5. 서브클래스를 지운다.
6. 테스트한다.

### 예시
```JS
class Person {
	constructor(name) {
		this._name = name
	}
	get name() { return this._name }
	get genderCode { return "X" }
	// 생략
}

class Male extends Person {
	get genderCode() { return "M" }
}

class Female extends Person {
	get genderCode() { return "F" }
}

``` 
혹시라도 사용하고 있는 곳이 있나 찾아보자.. 없다면..?
```JS
// 클라이언트...
const numberOfMales = people.filter(p => p instanceof Male).length
```
1. 무언가의 표현 방법을 바꾸려 할 때면 현재의 표현을 캡슐화하여 이 변화가 클라이언트 코드에 주는 영향을 최소화 하자. 생성자를 팩토리 함수로 바꾸자  
가장 직관적인 방법은 팩터리 메서드를 생성자 하나당 하나씩 만드는 것이다.
```JS
function createPerson(name) {
	return new Person(name)
}
function createMale(name) {
	return new Male(name)
}
function createFemale(name) {
	return new Female(name)
}

```
직관적이긴 해도 이련류의 객체는 성별코드를 사용하는 곳에서 직접 생성될 가능성이 크다.
```JS
function loadFromInput(data) {
	const result = []
	data.forEach(aRecord => {
		let p
		switch (aRecord.gender) {
			case 'M': 
				p = new Male(aRecord.name)
				break
			case 'F': 
				p = new Female(aRecord.name)
				break
			default: 
				p = new Person(aRecord.name)
		}
		result.push(p)
	})
	return result
}
```
생성할 클래스를 선택하는 로직을 함수로 추출하고 함수를 팩터리 함수로 삼자
```JS
function createPerson(data) {
	let p
	switch (aRecord.gender) {
		case 'M': 
			p = new Male(aRecord.name)
			break
		case 'F': 
			p = new Female(aRecord.name)
			break
		default: 
			p = new Person(aRecord.name)
	}
	return p
}

function loadFromInput(data) {
	const result = []
	data.forEach(aRecord => {
		result.push(createPerson(aRecord))
	})
	return result
}
```
이제 두 함수를 청소해보자. createPerson()에서 변수 p를 인라인한다.  
그런 다음 loadFromInput()의 반복문을 파이프라인으로 바꾼다.
```JS
function createPerson(data) {
	// let p
	switch (aRecord.gender) {
		case 'M': 
			// p = new Male(aRecord.name)
			// break
			return new Male(aRecord.name)
		case 'F': 
			// p = new Female(aRecord.name)
			// break
			return new Female(aRecord.name)
		default: 
			// p = new Person(aRecord.name)
			return new Person(aRecord.name)
	}
	// return p
}

function loadFromInput(data) {
	// const result = []
	// data.forEach(aRecord => {
	// 	result.push(createPerson(aRecord))
	// })
	// return result
	return data.map(aRecord => createPerson(aRecord))
}
```
2. 이 팩터리가 서브클래스 생성을 캡슐화해주지만 코드의 다른 부분에선 instanceof를 사용하고있다. 안좋으니 타입 검사 코드를 함수로 추출한다.
```JS
// 클라이언트
const numberOfMales = people.filter(p => isMale(p)).length
function isMale(aPerson) { return aPerson instanceof Male }
```
그런 다음 추출한 함수를 Person으로 옮긴다.
```JS
class Person {
	...
	get isMale { return this instanceof Male}
	...
}

// 클라이언트
const numberOfMales = people.filter(p => p.isMale).length
```
3. 이제 서브클래스들의 차이(성별)를 나타낼 필드를 추가한다.
```JS
class Person {
	...
	get isMale { return this instanceof Male}
	...
	constructor(name, genderCode) {
		this._name = name
		this._genderCode = genderCode || "X"
	}

	get genderCode() { return this._genderCode }
}
```
4. 그런 다음 남성인 경우의 로직을 슈퍼클래스로 옮긴다. 이를 위해 팩터리는 Person을 반환하도록 수정하고 instanceof를 사용해 검사하던 코드는 성별 코드 필드를 이용하도록 수정한다.
```JS
// function createPerson(data) {
function createPerson(aRecord) {
	switch (aRecord.gender) {
		case 'M': 
			// return new Male(aRecord.name)
			return new Person(aRecord.name, "M")
		case 'F': 
			return new Female(aRecord.name)
		default: 
			return new Person(aRecord.name)
	}
}

class Person {
	...
	// get isMale { return this instanceof Male}
	get isMale { return "M" === this._genderCode }
	...
	constructor(name, genderCode) {
		this._name = name
		this._genderCode = genderCode || "X"
	}

	get genderCode() { return this._genderCode }
}
```
테스트해보고 성공하면 나머지 케이스도 동일하게 수정해주자.
```JS
function createPerson(aRecord) {
	switch (aRecord.gender) {
		case 'M': 
			return new Person(aRecord.name, "M")
		case 'F': 
			// return new Female(aRecord.name)
			return new Person(aRecord.name, "F")
		default: 
			// return new Person(aRecord.name)
			return new Person(aRecord.name, "X")
	}
}

class Person {
	...
	get isMale { return "M" === this._genderCode }
	...
	constructor(name, genderCode) {
		this._name = name
		// this._genderCode = genderCode || "X"
		this._genderCode = genderCode
	}

	get genderCode() { return this._genderCode }
}
```

































