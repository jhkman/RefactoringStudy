# 07. 캡슐화

## 7.3 기본형을 객체로 바꾸기
```JS
orders.filter(o => "high"=== o.priority | "rush" === o.priority)
```
->
```JS
orders.filter(o => o.priority.higherThan(new Priority("normal")))
```

### 절차
1. 변수를 캡슐화 하지않았다면 캡슐화 한다.
2. 단순한 값 클래스를 만든다 생성자는 기존 값을 인수로 받아서 저장하고, 이 값을 반환하는 게터를 추가한다.
3. 정적 검사를 수행한다
4. 값 클래스의 인스턴스를 새로 만들어서 필드에 저장하도록 세터를 수정한다. 이미 있다면 필드의 타입을 적절히 변경한다.
5. 새로만든 클래스의 게터를 호출한 결과를 반환하도록 게터를 수정한다.
6. 테스트한다.
7. 함수 이름을 바꾸면 원본 접근자의 동작을 더 잘 드러낼수 있는지 검토한다.


### 효과
1. 시작은 기본형 데이터를 감싼 것과 큰 차이가 없으나 나중에 특별한 동작이 필요해지면 유용한 도구가 될수 있다.

### 예시
```JS
//Order 클래스
constructor(data){
  this.priority = data.priority;
  //나머지 초기화 코드 생략
}

//클라이언트에서 사용
highPriorityCount = orders.filter(o => "high" === o.priority
                                    || "rush" === o.priority).length;
```
1. 변수를 캡슐화한다.
2. 
```JS
//Order 클래스
get priority() {return this._priority;}
set priority(aString) {this._priority = aString;}
//나머지 캡슐화 코드 생략
```
2. 우선순위 속성을 표현하는 값 클래스 Priority를 만든다.
```JS
Class Priority{
  constructor(value){
    this._value = value;
  }
  toString() {return this._value;}
}
```
4. 그 후 방금만든 Priority 클래스를 사용하도록 접근자들을 수정한다.
```JS
//Order 클래스
get priority() {return this._priority.toString();}
set priority(aString) {this._priority = new Priority(aString);}
```
7. Priority 클래스를 만들고 나면 Order 클래스의 게터가 이상해진다. 게터가 반환하는 값은 우선순위가 아니라 우선순위를 표현하는 문자열이기에 함수이름을 바꾸어준다.
```JS
//Order 클래스
get priorityString() {return this._priority.toString();}
set priority(aString) {this._priority = new Priority(aString);}

//클라이언트에서 사용
highPriorityCount = orders.filter(o => "high" === o.priorityString
                                    || "rush" === o.priorityString).length;
```
