# 10 조건부 로직 간소화
## 10.6 어서션 추가하기

```JS
if (this.discountRate)
	base = base - (this.discountRate * base)
```
-> 
```JS
assert(this.discountRate >= 0)
if (this.discountRate)
	base = base - (this.discountRate * base)
```

### 배경
특정 조건이 참일 떄만 제대로 동작하는 코드가 있을 수 있다. 어서션을 코드 자체이 넣어놓자.  
어서션은 프로그램이 어떤 상태임을 가정한 채 실행되는지를 알려주는 도구가 된다.

### 절차
1. 참이라고 가정하는 조건이 보이면 그 조건을 명시하는 어서션을 추가한다

### 예시
```JS
class Customer {
	applyDiscount(aNumber) {
		return (this.discountRate) ? aNumber - (this.discountRate * aNumber) : aNumber
	}
}
```
-> 먼저 if-then으로 변경해보자
```JS
class Customer {
	applyDiscount(aNumber) {
		// return (this.discountRate) ? aNumber - (this.discountRate * aNumber) : aNumber
		if (!this.discountRate) 
			return aNumber
		else 
			return aNumber - (this.discountRate * aNumber)
	}
}
```
1. 이제 어서션을 추가해줄 수 있다.
```JS
class Customer {
	applyDiscount(aNumber) {
		if (!this.discountRate) 
			return aNumber
		else {
			assert(this.discountRate >= 0)
			return aNumber - (this.discountRate * aNumber)
		}
	}
}
```
아니면
```JS
class Customer {
	applyDiscount(aNumber) {
		assert(null === aNumber || aNumber >= 0)
		this._discountRate = aNumber
	}
}
```
































