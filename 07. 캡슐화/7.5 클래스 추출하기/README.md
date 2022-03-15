# 07. 캡슐화

## 7.5 클래스 추출하기

 -  클래스는 명확하게 추상화하고 소수의 주어진 역할만 처리해야 한다.
 -  메서드와 데이터가 너무 많은 클래스는 이해하기가 쉽지 않으니 잘 살펴보고 적절히 분리하는것이 중요하다.

```JS
class Person 
{
    get officeAreaCode() {return this._officeAreaCode;}
    get officeNumber() {return this.officeNumber;}
}
```
->
```JS
class Person 
{
    get officeAreaCode() {return this._telephoneNumber.areaCode;}
    get officeNumber() {return this._telephoneNumber.number;}
}
class TelephoneNumber
{
    get areaCode() {return this._areaCode;}
    get number() {return this._number;}
}
```

### 절차
1. 클래스의 역할을 분리할 방법을 정한다.
2. 분리될 역할을 담당할 클래스를 새로 만든다.
3. 원래 클래스의 생성자에서 새로운 클래스의 인스턴스를 생성하여 필드에 저장해둔다.
4. 분리될 역할에 필요한 필드들을 새 클래스로 옮긴다. 하나씩 옮길때마다 테스트한다.
5. 메스드들도 새 클래스로 옮긴다. 이때 저수준 메서드, 즉 다른 메서드를 호출하기보다는 호출을 당하는 일이 많은 메서드부터 옮긴다. 하나씩 옮길때마다 테스트한다.
6. 양쪽 클래스의 인터페이스를 살펴보면서 불필요한 메서드를 제거하고, 이름도 새로운 환경에 맞게 바꾼다.
7. 새 클래스를 외부로 노출할지 정한다. 노출하려거든 새 클래스에 참조를 값으로 바꾸기를 적용할지 고민해본다.

