# 11. API 리팩터링
## 11.11 수정된 값 반환하기
```JS
let totalAscent = 0; 
calculateAscent(); 

function calculateAscent() { 
  for (let i = 1; i < points.length; i++) { 
    const verticalChange = points[i].elevation - points[i-1].elevation; 
    totalAscent += (verticalChange > 0) ? verticalChange : 0; 
  } 
}
```
->
```JS
const totalAscent = calculateAscent(); 

function calculateAscent() { 
  let result = 0; 
  for (let i = 1; i < points.length; i++) { 
    const verticalChange = points[i].elevation - points[i-1].elevation; 
    result += (verticalChange > 0) ? verticalChange : 0; 
  } 
  return result; 
}
```

### 배경
데이터가 어떻게 수정되는지를 추적하는 일은 코드에서 이해하기 가장 어려운 부분 중 하나이다.  
그래서 데이터가 수정된다면 그 사실을 명확히 알려주어서 함수가 무슨 일을 하는지 쉽게 알 수 있게 하는게 중요하다.  
가장 좋은 방법으로는 변수를 갱신하는 함수라면 수정된 값을 반환하게 하는 방법이 있다.

### 절차
1. 함수가 수정된 값을 반환하게 하여 호출자가 그 값을 자신의 변수에 저장하게 한다.
2. 테스트한다.
3. 피호출 함수 안에 반환할 값을 가리키는 새로운 변수를 선언한다.
4. 테스트한다.
5. 계산이 선언과 동시에 이루어지도록 통합한다(즉, 선언 시점에 계산 로직을 바로 실행해 대입한다.)
6. 테스트한다.
7. 피호출 함수의 변수 이름을 새 역할에 어울리도록 바꿔준다.
8. 테스트한다.
