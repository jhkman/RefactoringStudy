# 07. 캡슐화

## 7.9 알고리즘 교체하기

 - 목적을 달성하는법은 다양하게 존재하며 그중 더 쉬운방법, 더 간명한 방법을 찾아내면 기존의 복잡한 코드를 간단하고 명확하게 리팩터링 할 수 있게 된다.
 - 이 작업에 착수하려면 반드시 메서드를 가능한 한 잘게 나누어 간소화하는 작업이 진행되어야 교체가 쉬워진다.


```JS
function foundPerson(people) { 
  for(let i = 0; i < people.length; i++) { 
    if (people[i] === "Don") { 
      return "Don"; 
    } 
    
    if (people[i] === "John") { 
      return "John"; 
    } 
    
    if (people[i] === "Kent") { 
      return "Kent"; 
    } 
  } 
  return ""; 
}
```
->
```JS
function foundPerson(people) { 
  const candidates = ["Don", "John", "Kent"]; 
  return people.find(p => candidates.includes(p)) || ''; 
}
```

### 절차
1. 교체할 코드를 함수 하나에 모은다.
2. 이 함수만을 이용해 동작을 검증하는 테스트를 마련한다.
3. 대체할 알고리즘을 준비한다.
4. 정적검사를 수행한다.
5. 기존 알고리즘과 새 알고리즘의 결과를 비교하는 테스트를 수행한다. 두 결과가 같다면 리팩터링이 끝난다. 그렇지 않다면 기존 알고리즘을 참고해서 새 알고리즘을 테스트하고 디버깅한다.
