# 07. 캡슐화

## 7.6 클래스 인라인하기

 - 클래스 인라인하기는 클래스 추출하기의 반대되는 리팩터링이라고 볼수 있다.
 - 특정 클래스에 남은 역할이 거의 없을 때 이런 현상이 자주 생긴다. 많이 사용되는 클래스로 몰아 넣고 인라인화 시킨다.

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
->
```JS
class Person 
{
    get officeAreaCode() {return this._telephoneNumber.areaCode;}
    get officeNumber() {return this._telephoneNumber.number;}
}
```

### 절차
1. 소스 클래스의 각 public 메서드에 대응하는 메서드들을 타깃 클래스에 생성한다. 이 메서드들은 단순히 작업을 소스 클래스로 위임해야 한다.
2. 소스 클래스의 메서드를 사용하는 코드를 모두 타깃 클래스의 위임 메서드를 사용하도록 바꾼다. 하나씩 바꿀때 마다 테스트한다.
3. 소스 클래스의 메서드와 필드를 모두 타깃 클래스로 옮긴다. 하나씩 옮길 때마다 테스트한다.
4. 소스 클래스를 삭제하고 R.I.P


