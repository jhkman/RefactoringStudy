# 09. 데이터 조직화
## 09.4 참조를 값으로 바꾸기
```JS
Class Product{
  applyDiscount(arg) {this._price.amount -= arg;}
```
->
```JS
Class Product{
  applyDiscount(arg) {
    this._price = new Money(this._price.amount - arg, this._price.currency);
  }
```

### 배경
객체를 다른 객체에 중첩하면 내부 객체를 참조 혹은 값으로 취급할 수 있다.
값으로 다루는 경우에는 새로운 속성을 담은 객체로 기존 내부 객체를 통째로 대체한다.
필드를 값으로 다룬다면 내부 객체의 클래스를 수정하여 값 객체로 만들수 있고, 이런 값 객체는 불변이기 때문에, 다른 곳에서 값을 변경하지 않을까 걱정할 필요가 없다.

### 절차
1. 후보 클래스가 불변인지, 혹은 불변이 될 수 있는지 확인한다.
2. 각각의 세터를 하나씩 제거한다.
3. 이 값 객체의 필드들을 사용하는 동치성 비교 메서드를 만든다.

### 예시
Person 객체가 있고, 이 객체는 다음 코드처럼 생성 시점에는 전화번호가 올바로 설정되지 못하게 짜여져 있다고 해보자
```JS
//Person 클래스..
constructor() {
  this._telephoneNumber = new TelephoneNumber();
}

get officeAreaCode() {return this._telephoneNumber.areaCode;}
set officeAreaCode(arg) {this._telephoneNumber.areaCode = arg;}
get officeNumber() {return this._telephoneNumber.number;}
set officeNumber(arg) {this._telephoneNumber.number = arg;}


//TelephoneNumber 클래스..
get areaCode() {return this._areaCode;}
set areaCode(arg) {this._areaCode = arg;}
get number() {return this._number;}
set number(arg) {this._number = arg;}
```
추출해서 새로 만들어진 객체(TelephoneNumber)를 갱신하는 메서드들은 여전히 추출 전 클래스(Person)에 존재할 것이다.  
새 클래스를 가리키는 참조가 하나뿐이므로 참조를 값으로 바꾸기에 좋은 상황이다.  
1. 가장 먼저 할일은 전화번호를 불변으로 만들기다.
2. 필드들의 세터들만 제거 하면 된다. 세터 제거의 첫단계로 세터로 설정하던 두 필드를 생성자에서 입력받아 설정하게 한다.

```JS
//TelephoneNumber 클래스..
constructor(areaCode, number) {
  this._areaCode = areaCode;
  this._number = number;
}

//제거
//get areaCode() {return this._areaCode;}       
//set areaCode(arg) {this._areaCode = arg;}
//get number() {return this._number;}
//set number(arg) {this._number = arg;}
```
세터를 호출하던쪽을 살펴서 전화번호를 매번 다시 대입하도록 바꾸자
```JS
//Person 클래스..
get officeAeaCode() {return this._telephoneNumber.areaCode;}
set officeAeaCode(arg) {
  this._telephoneNumber = new TelephoneNumber(arg, this.officeNumber);
}
get officeNumber() {return this._telephoneNumber.number;}
set officeNumber(arg) {
  this._telephoneNumber = new TelephoneNumber(this.officeAreaCode, arg);
}
```
3. 이제 전화번호는 불변이 되었으니 진짜 '값'이 될 준비가 끝났다. 값 객체로 인정받으려면 동치성을 값 기반으로 평가해야 한다. 자바스크립트에서는 라이브러리 차원에서 지원해 주는 부분이 없으므로 equals 메서드를 직접 작성해서 비교해보자
```JS
//TelephoneNumber 클래스..
equals(other){
  if(!(other instanceof TelephoneNumber)) return false;
  return this.areaCode === other.areaCode &&
         this.number === other.number;
}
```
그리고 다음과 같이 테스트 해주자
```JS
it('telephone equals', function(){
  assert(new TelephoneNumber("312", "555-0142").equals(
         new TelephoneNumber("312", "555-0142")));
});
equals(other){
  if(!(other instanceof TelephoneNumber)) return false;
  return this.areaCode === other.areaCode &&
         this.number === other.number;
}
```
이 테스트의 핵심은 독립된 객체를 두개 생성하여 동치성 검사를 수행했다는 점이다.

























