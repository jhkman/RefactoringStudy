# 06. 기본적인 리팩터링

## 6.6 변수 캡슐화하기

```JS
let defaultOwner = {firstName: "마틴", lastName: "파울러"}
```
-> 
```JS
let defaultOwnerData = {firstName: "마틴", lastName: "파울러"}
export function defaultOwnder() { return defaultOwnerData }
export function setDefaultOwner(arg) { defaultOwnerData = arg }
```
데이터는 참조하는 모든 부분을 한 번에 바꿔야 코드가 재대로 작동한다. 유효범위가 넓어질수록 다루기 어려워진다. 전역데이터가 똥인 이유도 이것.  
접근할 수 있는 범위가 넓은 데이터를 옮길 때는 먼저 그 데이터로의 접근을 독점하는 함수를 만드는 식으로 캡슐화 하는 것이 가장 좋은 방법일 때가 많다.  
  
또한 데이터 캡슐화는 데이터를 변경하고 사용하는 코드를 감시할 수 있는 확실한 통로가 되어준다.  

### 절차
 1. 변수로의 접근과 갱신을 전담하는 캡슐화 함수들을 만든다. 
 2. 정적 검사를 수행한다.
 3. 변수를 직접 참조하던 부분을 모두 적절한 캡슐화 함수 호출로 바꾼다. 하나씩 바꿀 때마다 테스트한다.
 4. 변수의 접근 범위를 제한한다.  
  -> 변수로의 직접 접근을 막을 수 없을 떄도 있다. 그럴 떄는 변수 이름을 바꿔서 테스트해보면 해당 변수를 참조하는 곳을 쉽게 찾아낼 수 있다.
 5. 테스트한다.
 6. 변수 값이 레코드라면 레코드 캡슐화하기를 적용할지 고려해본다.

### 예시
전역 변수에 중요한 데이터가 담겨 있는 경우를 생각해보자.  

```JS
let defaultOwner = {firstName: "마틴", lastName: "파울러"}
```
데이터라면 다음과 같이 참조하는 코드가 있을것이다.
```JS
spaceship.owner = defaultOwner
```
갱신하는 코드도 있을것이다.
```JS
defaultOwner = {firstName: "레베카", lastName: "파슨스"}
```
-> 리팩터링 시작
1. 기본적인 캡슐화를 위해 가장 먼저 데이터를 읽고 쓰는 함수부터 정의한다.

```JS
function getDefaultOwner() { return defaultOwner }
function setDefaultOwner(arg) { defaultOwner = arg }
```
3. 그런 다음 defaultOwner를 참조하는 코드를 찾아서 방금 만든 게터 함수를 호출하도록 고친다.

```JS
// spaceship.owner = defaultOwner
spaceship.owner = getDefaultOwner()
```
대입문은 세터 함수로 바꾼다.
```JS
// defaultOwner = {firstName: "레베카", lastName: "파슨스"}
setDefaultOwner({firstName: "레베카", lastName: "파슨스"})
```
하나씩 바꿀 때마다 테스트한다.  

4. 모든 참조를 수정했다면 이제 변수의 가시범위를 제한한다. 그러면 발견 못한 참조가 있는지 확인할 수 있고, 나중에 참조하는 코드도 방어할 수 있다. 
```JS
let defaultOwnerData = {firstName: "마틴", lastName: "파울러"}
export function defaultOwnder() { return defaultOwnerData }
export function setDefaultOwner(arg) { defaultOwnerData = arg }
```

#### 값 캡술화하기
위의 방법으로 캡슐화하면 구조로의 접근이나 구조 자체를 대입하는 행위는 제어할 수 있지만 필드 값을 변경하는 일은 제어할 수 없다.
```JS
const owner1 = defaultOwner()
assert.equal("파울러", owner1.lastName, "처음 값 확인")
const owner2 = defaultOwner()
owner2.lastName = "파슨스"
assert.equal("파슨스", owner1.lastName, "owner2를 변경한 후") // 성공할까?
```
> 기본 캡슐화 기법은 데이터 항목을 참조하는 부분만 캡슐화한다. 변수뿐 아니라 변수에 담긴 내용을 변경하는 행위까지 제어하고 싶을때가 있다.
-> 방법
##### 1. 그 값을 바꿀 수 없게 만든다.
```JS
let defaultOwnerData = {firstName: "마틴", lastName: "파울러"}
// export function defaultOwnder() { return defaultOwnerData }
export function defaultOwnder() { return Object.assign({}, defaultOwnerData) }
export function setDefaultOwner(arg) { defaultOwnerData = arg }
```
> 게터가 데이터의 복제본을 반환하도록. 주의할 점은 공유데이터(원본)를 변경하기를 원하는 클라이언트가 있을 수 있다.

##### 2. 레코드 캡슐화하기로 해결해보자. (위의 해결방안)
```JS
let defaultOwnerData = {firstName: "마틴", lastName: "파울러"}
// export function defaultOwnder() { return defaultOwnerData }
export function defaultOwnder() { return new Person(defaultOwnerData) }
export function setDefaultOwner(arg) { defaultOwnerData = arg }

class Person {
	constructor(data) {
		this._lastName = data.lastName
		this._firstName = data.firstName
	}
	get lastName() { return this._lastName }
	get firstName() { return this._firstName }
	// 다른 속성도 이런식으로 처리한다.
}
```
> 이렇게하면 defaultOwnerData의 속성을 다시 대입하는 연산은 모두 무시된다. // 이거 뭐지..? 그냥 Object로 만들어서 넘겨주는 거 아닌가 ㅡ,.ㅡ;???


































