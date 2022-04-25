# 11. API 리팩터링
## 11.2 함수 매개변수화 하기
```JS
function tenPercentRaise(aPerson) { 
  aPerson.salary = aPerson.salary.multiply(1.1); 
} 
function fivePercentRaise(aPerson) { 
  aPerson.salary = aPerson.salary.multiply(1.05); 
}
```
->
```JS
function raise(aPerson, factor) { 
  aPerson.salary = aPerson.salary.multiply(1 + factor); 
}
```

### 배경
두 함수의 로직이 비슷하고 단지 리터럴 값만 다른 경우, 그 다른 값만 매개변수로 만들어 함수를 하나로 합칠 수 있다

### 절차
1. 비숫한 함수 중 하나를 선택한다.
2. 함수 선언 바꾸기로 리터럴들을 매개변수로 추가한다.
3. 이 함수를 호출하는 곳 모두에 적절한 리터럴 값을 추가한다.
4. 테스트한다.
5. 매개 변수로 받은 값을 사용하도록 함수 본문을 수정한다. 하나 수정할 때마다 테스트한다.
6. 비슷한 다른 함수를 호출하는 코드를 찾아 매개변수화된 함수를 호출하도록 하나씩 수정한다. 하나 수정할 때마다 테스트한다.
 -> 매개 변수화 된 함수가 대체할 비슷한 함수와 다르게 동작한다면, 그 비슷한 함수의 동작도 처리할 수 있도록 본문 코드를 적절히 수정한 후 진행한다.

