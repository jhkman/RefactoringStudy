# 06. 기본적인 리팩터링

## 6.7 변수 이름 바꾸기
```JS
let a = height * width
```
-> 
```JS
let area = height * width
```
명확한 프로그래밍의 핵심은 이름 짓기다.

### 절차
 1. 폭넓게 쓰이는 변수라면 변수 캡슐화하기를 고려한다.
 2. 이름을 바꿀 변수를 참조하는 곳을 모두 찾아서, 하나씩 변경한다.  
  -> 다른 코드베이스에서 참조하는 변수는 외부에 공개된 변수이므로 이 리팩터링을 적용할 수 없다.  
  -> 변수 값이 변하지 않는다면 다른 이름으로 복제본을 만들어서 하나씩 점진적으로 변경한다. 하나씩 바꿀때마다 테스트한다.
 3. 테스트한다.

### 예시

```JS
let tpHd = "untitled"
```
어떤 참조는 다음과 같이 변수를 읽기만 한다.
```JS
result += `<h1>${tpHd}</h1>`
```
값을 수정하는 곳도 있다고 해보자.
```JS
tpHd = obj['articleTitle']
```
1. 변수 캡슐화하기
```JS
// result += `<h1>${tpHd}</h1>`
result += `<h1>${title()}</h1>`


// tpHd = obj['articleTitle']
setTitle(obj['articleTitle'])

function title() { return tpHd } // tpHd 변수의 게터
function setTitle(arg) { tpHd = arg } // tpHd 변수의 세터
```
캡술화 후에는 변수의 이름을 바꿔도 된다.
```JS
// let tpHd = "untitled"
let title = "untitled"

// function title() { return tpHd }
function title() { return title }
// function setTitle(arg) { tpHd = arg }
function setTitle(arg) { title = arg }
```

### 예시: 상수 이름 바꾸기
```JS
const cpyNm = "애크미 구스베리"
```
먼저 원본의 이름을 바꾼 후, 원본의 원래 이름(기존 이름)과 같은 복제본을 만든다.
```JS
const companyName = "애크미 구스베리"
const cpyNm = companyName
```
이제 기존 이름(복제본)을 참조하는 코드들을 새 이름으로 점진적으로 바꿀 수 있다.
































