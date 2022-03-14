# 07. 캡슐화

## 7.7 위임 숨기기
```JS
manager = aPerson.department.manager;
```
->
```JS
manager = aPerson.manager;

class Person
{
    get manager() {return this.department.manager;}
}
```

### 절차
1. 위임 객체의 각 메서드에 해당하는 위임 메서드를 서버에 생성한다.
2. 클라이언트가 위임 객체 대신 서버를 호출하도록 수정한다. 하나씩 바꿀때마다 테스트한다.
3. 모두 수정했다면, 서버로부터 위임 객체를 얻는 접근자를 제거한다.
4. 테스트한다.
