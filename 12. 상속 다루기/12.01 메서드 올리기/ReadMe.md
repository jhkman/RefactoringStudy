# 12. 상속 다루기
## 12.1 메서드 올리기

```JS
class Employee {...}

class Salesperson extends Employee {
	get name() {...}
}

class Engineer extends Employee {
	get name() {...}
}
```
-> 
```JS
class Employee {
	get name() {...}
}

class Salesperson extends Employee {...}
class Engineer extends Employee {...}
```

### 배경
중복코드 제거는 중요하다. 메서드들의 본문 코드가 똑같을 땐 메서드 올리기를 적용해보자.  
메서드 올리기 리팩터링을 적용ㄹ하려면 선행 단계를 거쳐야 할 때가 많다. 예를들면 서로 다른 두 클래스의 두 메서드를 각각 매개변수화하면 궁극적으로는 같은 메서드가 되기도한다.  
메서드 올리기를 적용하기에 가장 이상하고 복잡한 상황은 해당 메서드의 본문에서 참조하는 필드들이 서브클래스에만 있는 경우다. 이런 경우라면 필드를 먼저 슈퍼클래스로 올린 후에 메서드를 올려야한다.  
두 메서드의 전체 흐름은 비슷하지만 세부 내용이 다르다면 템플릿 메서드 만들기를 고려해보자

### 절차
1. 똑같이 동작하는 메서드인지 면밀이 살펴본다.
2. 메서드 안에서 호출하는 다른 메서드와 참조하는 필드들은 슈퍼클래스에서도 호출하고 참조할 수 있는지 확인한다.
3. 메서드 시그니처가 다르다면 함수 선언 바꾸기로 슈퍼클래스에서 사용하고 싶은 형태로 통일한다.
4. 슈퍼클래스에 새로운 메서드를 생성하고, 대상 메서드의 코드를 복사해넣는다.
5. 정적 검사를 수행한다.
6. 서브클래스 중 하나의 메서드를 제거한다.
7. 테스트한다.
8. 모든 서브클래스의 메서드가 없어질 때까지 다른 서브클래스의 메서드를 하나씩 제거한다.

### 예시
1. 같은 일을 수행하는 메서드를 찾았다.
```JS
class Employee extends Party {
	get annualCost() {
		return this.monthlyCost * 12
	}
}

class Department extends Party {
	get totalAnnualCost() {
		return this.monthlyCost * 12
	}
}
```
2. 확인해보니 두 메서드에서 참조하는 monthlyCost()속성은 슈퍼클래스에는 정의되어있지는 않다. 수정해주자
3. 두 메서드의 이름이 다르므로 함수 선언 바꾸기로 이름을 통일한다.

```JS
class Department extends Party {
	// get totalAnnualCost() {
	get annualCost() {
		return this.monthlyCost * 12
	}
}
```
4. 서브클래스 중 하나의 메서드를 복사해 슈퍼클래스에 붙여넣는다.
```JS
class Party {
	get annualCost() {
		return this.monthlyCost * 12
	}
}
```


















