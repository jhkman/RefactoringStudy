# 11. API 리팩터링
## 11.10 명령을 함수로 바꾸기
```JS
class ChargeCalculator { 
  constructor (customer, usage){ 
    this._customer = customer; 
    this._usage = usage; 
  } 
  
  execute() { 
    return this._customer.rate * this._usage; 
  } 
}
```
->
```JS
function charge(customer, usage) { 
  return customer.rate * usage; 
}
```

### 배경
명령 객체는 복잡한 연산을 다를 수 있는 강력한 메커니즘을 제공한다.  
명령의 이런 능력은 공짜가 아니다, 로직이 크게 복잡하지 않다면 명령 객체는 장점보다 단점이 크니 평범한 함수로 바꿔주는 게 낫다.

### 절차
1. 명령을 생성하는 코드와 명령의 실행 메서드를 호출하는 코드를 함께 함수로 추출한다.
2. 명령의 실행 함수가 호출하는 보조 메서드들 각각을 인라인한다.
3. 함수 선언 바꾸기를 적용하여 생성자의 매개변수 모두를 명령의 실행 메서드로 옮긴다.
4. 명령의 실행 메서드에서 참조하는 필드들 대신 대응하는 매개변수를 사용하게끔 바꾼다. 하나씩 수정할때마다 테스트한다.
5. 생성자 호출과 명령의 실행 메서드 호출을 호출자(대체 함수) 안으로 인라인한다.
6. 테스트한다.
7. 죽은 코드 제거하기로 명령 클래스를 없엔다.
