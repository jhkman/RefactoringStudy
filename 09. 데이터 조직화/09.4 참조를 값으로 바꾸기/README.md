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































