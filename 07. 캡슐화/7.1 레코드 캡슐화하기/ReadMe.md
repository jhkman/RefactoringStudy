# 07. 캡슐화

## 7.1 레코드 캡슐화하기
```JS
organization = {name: "에크미 구스베리", country: "GB"}
```
->
```JS
class organization{
  constructor(data){
     this._name = data.name;
     this._country = data.country;
  }
  
  get name()  {return this._name;}
  set name(arg)  {this._name = arg;}
  get country()  {return this._country;}
  set country(arg)  {this._country = arg;}
}
```
> 정의된 레코드를 직접 참조하는 코드가 많을때, 캡슐화를 해주는것이 좋다.


### 절차
1. 레코드를 담은 변수를 캡슐화한다.(레코드를 캡슐화하는 함수의 이름은 검색하기 쉽게 지어준다.)
2. 레코드를 감싼 단순한 클래스로 해당 변수의 내용을 교체한다. 이 클래스에 원본 레코드를 반환하는 접근자도 정의하고 변수를 캡슐화하는 함수들이 이 접근자를 사용하도록 수정한다.
3. 테스트한다.
4. 원본 레코드 대신 새로 정의한 클래스 타입의 객체를 반환하는 함수들을 새로 만든다.
5. 레코드를 반환하는 예전 함수를 사용하는 코드를 4에서 만든 새 함수를 사용하도록 바꾼다. 필드에 접근할 때는 객체의 접근자를 사용한다. 적절한 접근자가 없다면 추가한다. 한부분을 바꿀 때마다 테스트한다.
6. 클래스에서 원본 데이터를 반환하는 접근자와(1에서 검색하기 쉬운 이름을 붙여둔) 원본 레코드를 반환하는 함수들을 제거한다.
7. 테스트한다.
8. 레코드의 필드도 데이터 구조인 중첩 구조라면 레코드 캡슐화하기와 컬렉션 캡슐화하기를 재귀적으로 적용한다.

### 효과
1. 기존 코드를 클래스로 캡슐화하면서 입력 받는 데이터와의 직접적인 참조를 끊는다는 이점이 생긴다. 특히 이 레코드를 참조하여 캡슐화를 꺨 우려가 있는 코드가 많을 때 좋다.
2. _name, _country 로 접근하는 것이 아닌 get method를 통하여 name,country 접근 private #처리를 해주면 더욱 좋다.
3. 캡슐화를 했기 때문에 클래스 내부에서 어떠한 작업을 하는지 모르는채 우리는 그저 메소드만 사용하면 원하는 값을 가져올 수 있다는 장점이 있다.

### ex)간단한 레코드 캡슐화하기
> 프로그램 전체에서 사용되는 상수를 예로 살펴보자
```JS
const organization = {name: "에크미 구스베리", country: "GB"}

result += '<h1>${organization.name}</h1>';  //읽기 예
organization.name = newName;                //쓰기 예
```

1. 상수를 캡슐화해보자
```JS
function getRawDataOfOrganization() {return organization;}

result += '<h1>${getRawDataOfOrganization().name}</h1>';  //읽기 예
getRawDataOfOrganization().name = newName;                //쓰기 예
```

2. 레코드를 클래스로 변경후.
4. 새 클래스의 인스턴스를 반환하는 함수를 새로 만든다.
```JS
class Organization{
  constructor(data){
    this._data = data;
  }
}

const organization = new Organization({name: "에크미 구스베리", country: "GB"});
function getRawDataOfOrganization() {return organization._data;}
function getOrganization() {return organization;}

```

5. 객체로 만드는 작업이 끝났으니 레코드를 갱신하는 코드는 세터를 사용하도록, 읽는 코드는 게터를 사용하도록 변경한다.
```JS
set name(aString){this._data.name = aString;}
get name(){return this._data.name;}
```
6. 다 바꿨다면 임시함수를 제거한다.
```JS
//function getRawDataOfOrganization() {return organization._data;}  //제거
function getOrganization() {return organization;}
```

> _data의 필드들을 객체안에 바로 펼처놓으면
```JS
class organization{
  constructor(data){
     this._name = data.name;
     this._country = data.country;
  }
  
  get name()  {return this._name;}
  set name(arg)  {this._name = arg;}
  get country()  {return this._country;}
  set country(arg)  {this._country = arg;}
}
```
