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

### 예시
다음은 건강보험 애플리케이션에서 사용되는 점수 계산 함수다.
```JS
function score(candidate, medicalExam, scoringGuide){
  let result = 0;
  let healthLevel = 0;
  let highMedicalRiskFlag = false;
  
  if(medicalExam.isSmoker){
    healthLevel += 10;
    highMedicalRiskFlag = true;
  }
  
  let certufucatuibGrade = "regular";
  if(scoringGuide.stateWithCertification(candidate.originState)){
    certufucatuibGrade = "low";
    result -= 5;
  }
  
  result -= Math.max(healthLevel -5, 0);
  return result;
}
```
1. 시작은 빈 클래스를 만들고
2. 이 함수를 그 클래스로 옮기는 일부터다.
```JS
function score(candidate, medicalExam, scoringGuide){
  return new Scorer().execute(candidate, medicalExam, scoringGuide);
}

class Scorer{
  execute(candidate, medicalExam, scoringGuide){
    let result = 0;
    let healthLevel = 0;
    let highMedicalRiskFlag = false;

    if(medicalExam.isSmoker){
      healthLevel += 10;
      highMedicalRiskFlag = true;
    }

    let certufucatuibGrade = "regular";
    if(scoringGuide.stateWithCertification(candidate.originState)){
      certufucatuibGrade = "low";
      result -= 5;
    }

    result -= Math.max(healthLevel -5, 0);
    return result;
  }
}
```
이제 매개변수를 하나씩 옮기자
> Scorer 클래스
```JS
function score(candidate, medicalExam, scoringGuide){
  return new Scorer(candidate, medicalExam, scoringGuide).execute();
}


  //Scorer 클래스
  constructor(candidate){
    this._candidate = candidate;
  }

  execute(medicalExam, scoringGuide){   //candidate 제거
    let result = 0;
    let healthLevel = 0;
    let highMedicalRiskFlag = false;

    if(medicalExam.isSmoker){
      healthLevel += 10;
      highMedicalRiskFlag = true;
    }

    let certufucatuibGrade = "regular";
    if(scoringGuide.stateWithCertification(candidate.originState)){
      certufucatuibGrade = "low";
      result -= 5;
    }

    result -= Math.max(healthLevel -5, 0);
    return result;
  }
```
이런식으로 다른 매개변수들도 옮기자
```
이제 매개변수를 하나씩 옮기자
```JS
function score(candidate, medicalExam, scoringGuide){
  return new Scorer(candidate, medicalExam, scoringGuide).execute();
}

  //Scorer 클래스
  constructor(candidate, medicalExam, scoringGuide){
    this._candidate = candidate;
    this._medicalExam = medicalExam;
    this._scoringGuide = scoringGuide;
  }

  execute(){
    let result = 0;
    let healthLevel = 0;
    let highMedicalRiskFlag = false;

    if(medicalExam.isSmoker){
      healthLevel += 10;
      highMedicalRiskFlag = true;
    }

    let certufucatuibGrade = "regular";
    if(scoringGuide.stateWithCertification(candidate.originState)){
      certufucatuibGrade = "low";
      result -= 5;
    }

    result -= Math.max(healthLevel -5, 0);
    return result;
  }
```
