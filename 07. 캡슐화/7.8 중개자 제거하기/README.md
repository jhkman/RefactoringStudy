# 07. 캡슐화

## 7.8 중개자 제거하기

 - 단순히 전달만하는 위임 메서드들만 계속해서 추가될 경우 점점 번거로워 지게 된다.
 - 이러한 경우 클래스가 단순 중개자 역할로 전락할 수 있게되어, 차라리 위임 객체를 직접 호출하는게 나아지게 될수 있다.

```JS
manager = aPerson.manager;

class Person
{
    get manager() {return this.department.manager;}
}
```
->
```JS
manger = aPerson.department.manager;
```

### 절차
1. 위임 객체를 얻는 게터를 만든다.
2. 위임 메서드를 호출하는 클라이언트가 모두 이 게터를 거치도록 수정한다. 하나씩 바꿀 때마다 테스트한다.
3. 모두 수정했다면 위임 메서드를 삭제한다.
