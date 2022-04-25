# 11. API 리팩터링
## 11.5 매개변수를 질의 함수로 바꾸기
```JS
availableVacation(anEmployee, anEmployee.grade); 
function availableVacation(anEmployee, grade) { 
  // 연휴 계산...
```
->
```JS
availableVacation(anEmployee) 
function availableVacation(anEmployee) { 
  const grade = anEmployee.grade; 
  // 연휴 계산...
```

### 배경
매개변수 목록에서 중복은 피하는게 좋고, 짧을수록 이해하기 쉽다.  
피호출 함수가 스스로 쉽게 결정할 수 있는 값을 매개변수로 건네는 것도 불필요한 작업이므로 일종의 중복이다.

### 절차
1. 필요하다면 대상 매개변수의 값을 계산하는 코드를 별도 함수로 추출한다.
2. 함수 본문에서 대상 매개변수로의 참조를 모두 찾아 그 매개변수의 값을 만들어주는 표현식을 참조하도록 변경한다. 하나 수정할때마다 테스트한다.
3. 함수 선언 바꾸기로 대상 매개변수를 없엔다.
