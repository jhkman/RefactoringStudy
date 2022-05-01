# 12. 상속 다루기
## 12.2 필드 올리기
```Java
class Employee {...}

class Salesperson extends Employee {
	private String name;
}

class Engineer extends Employee {
	private String name;
}
```
-> 
```Java
class Employee {
	protected String name;
}

class Salesperson extends Employee {
	...
}

class Engineer extends Employee {
	...
}
```

### 배경 
서브클래스들이 독립적으로 개발되었거나 뒤늦게 하나의 계층구조로 리팩터링된 경우라면 일부 기능이 중복되어 있을 떄가 있다. 필드도 마찬가지.  
분석해보고 그 결과가 필드들이 비슷한 방식으로 쓰인다고 판단되면 슈퍼클래스로 끌어올리자.  
이렇게 하면 두 가지 중복을 줄일 수 있다.
1. 데이터 중복 선언을 없앨 수 있다.
2. 해당 필드를 사용하는 동작을 서브클래스에서 슈퍼클래스로 옮길 수 있다.  

### 절차
1. 후보 필드들을 사용하는 곳 모두가 그 필드들을 똑같은 방식으로 사용하는지 면밀히 살핀다.
2. 필드들의 이름이 각기 다르면 똑같은 이름으로 바꾼다.
3. 슈퍼클래스에 새로운 필드를 생성한다.
4. 서브클래스의 필드들을 제거한다.
5. 테스트한다.




















