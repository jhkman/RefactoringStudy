# 11. API 리팩터링
## 11.9 함수를 명령으로 바꾸기
```JS
function score(candidate, medicalExam, scoringGuide) { 
  let result = 0;
  let healthLevel = 0; 
  // 생략...
}
```
->
```JS
class Scorer { 
  constructor(candidate, medicalExam, scoringGuide) { 
    this._candidate = candidate; 
    this._medicalExam = medicalExam; 
    this._scoringGuide = scoringGuide; 
  } 
  
  execute() { 
    this._result = 0; 
    this._healthLevel = 0; 
    // 생략...
  } 
}
```

### 배경
단독 함수만을 위한 객체 안으로 캡슐화 하는 객체를 '명령 객체' 혹은 명령이라고 한다.  
명령은 평범한 함수 메커니즘보다 훨씬 유연하게 함수를 제어하고 표현할 수 있다.  
단, 유연성은 (언제나 그렇듯) 복잡성을 키우고 얻는 대가임을 잊지 말아야 한다.

### 절차
1. 대상 함수의 기능을 옮길 빈 클래스를 만든다. 클래스 이름은 함수 이름에 기초해 짓는다.
2. 빈 클래스로 함수를 옮긴다.
3. 함수의 인수들 각각은 명령의 필드로 만들어 생성자를 통해 설정할지 고민해본다.
