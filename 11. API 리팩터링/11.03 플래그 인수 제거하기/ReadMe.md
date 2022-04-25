# 11. API 리팩터링
## 11.3 플래그 인수 제거하기
```JS
function setDimension(name, value) { 
  if (name === "height") { 
    this._height = value; return; 
  } 
  if (name === "width") {
    this._width = value; return; 
  } 
}
```
->
```JS
function setHeight(value) {this._height = value;} 
function setWidth (value) {this._width = value;}
```

### 배경
플래그 인수란 함수가 실행하는 로직을 선택하기 위해 전달하는 인수이다.  
플래그 인수가 있으면 함수들의 기능차이가 잘 드러나지 않으며, 불리언 플래그는 코드를 읽을때 뜻을 온전하게 전달하기 어렵다.  
만약 플래그 인수를 제거 하고 함수를 분리하는게 어려운 경우는, 플래그 별 래핑 함수를 독립적으로 만들도록 한다.

### 절차
1. 매개변수로 주어질 수 있는 값 각각에 대응하는 명시적 함수들을 생성한다.
2. 원래 함수를 호출하는 코드들을 모두 찾아서 각 리터럴 값에 대응되는 명시적 함수를 호출하도록 수정한다.
