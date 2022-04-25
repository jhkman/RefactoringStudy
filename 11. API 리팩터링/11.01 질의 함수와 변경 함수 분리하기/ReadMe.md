# 11. API 리팩터링
## 11.1 질의 함수와 변경 함수 분리하기
```JS
function getTotalOutstandingAndSendBill() { 
  const result = customer.invoices.reduce((total, each) => each.amount + total, 0); 
  sendBill(); return result; 
}
```
->
```JS
function totalOutstanding() { 
  return customer.invoices.reduce((total, each) => each.amount + total, 0); 
} 
function sendBill() { 
  emailGateway.send(formatBill(customer)); 
}
```
## 배경
우리는 외부에서 관찰할 수 있는 겉보기 부수효과(observable side effect)가 전혀 없이 값을 반환해주는 함수를 추구해야 한다.  
겉보기 부수효과란 외부에 영향을 주는 네트워크 통신, 입출력 변경, 데이터 변형 등을 의미한다.  
보통 질의 함수에 부수효과가 포함된 경우 제거하는게 일반적이다.

## 절차
1. 대상 함수를 복제하고 질의 목적에 충실한 이름을 짓는다. -> 함수내부를 살펴 무엇을 반환하는지를 찾고, 어떤 변수의 값을 반환한다면 그 변수 이름이 훌륭한 단초가 될것이다.
2. 새 질의 함수에서 부수효과를 모두 제거한다.
3. 정적 검사를 수행한다.
4. 원래 함수(변경함수)를 호출하는 곳을 모두 찾아낸 후, 호출하는 곳에서 반환값을 사용한다면 질의 함수를 호출하도록 바꾸고, 원래 함수를 호출하는 코드를 아래줄에 새로 추가한다. 하나 수정할때마다 테스트한다.
5. 원래 함수에서 질의 관련 코드를 제거한다.
6. 테스트한다.
