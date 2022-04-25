# 11. API 리팩터링
## 11.6 질의 함수를 매개변수로 바꾸기
```JS
targetTemperature(aPlan);
function targetTemperature(aPlan) { 
  currentTemperature = thermostat.currentTemperature;
  ...
```
->
```JS
targetTemperature(aPlan, thermostat.currentTemperature) 
function targetTemperature(aPlan, currentTemperature) {
  ...
```

### 배경
함수 안에서 전역 변수를 참조하거나, 제거 대상인 원소를 참조하는 경우에는 매개변수로 바꿀 필요가 있다.  
순수함수란 동일한 인자가 주어졌을 때 항상 동일한 결과를 반환하며, 외부의 상태를 변경하지 않는 함수이다.  
모듈을 개발할 때 순수 함수를 따로 구분하고, 입출력과 기타 가변 원소들을 다루는 로직으로 순수 함수를 감싸는 패턴을 많이 활용한다.  
단 질의함수를 매개변수로 바꾸면 어떤 값을 제공할지를 호출자가 알아내야 하므로 호출자가 복잡해 지기에 균형을 잘 잡아야 한다.

### 절차
1. 변수 추출하기로 질의 코드를 함수 본문의 나머지 코드와 분리한다.
2. 함수 본문 중 해당 질의를 호출하지 않는 코드들을 별도 함수로 추출한다.
3. 방금 만든 변수를 인라인하여 제거한다.
4. 원래 함수도 인라인한다.
5. 새 함수의 이름을 원래 함수의 이름으로 고쳐준다.
