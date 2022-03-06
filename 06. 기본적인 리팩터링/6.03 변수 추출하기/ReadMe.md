# 06. 기본적인 리팩터링

## 6.3 변수 추출하기
반대 리팩터링: 변수 인라인하기

```JS
return order.quantity * order.itemPrice -
	Math.max(0, order.quantity - 500) * order.itemPrice * 0.05 + 
	Math.min(order.quantity * order.itemPrice * 0.1, 100)
```
->
```JS
const basePrice = order.quantity * order.itemPrice
const quantityDiscount = Math.max(0, order.quantity - 500) * order.itemPrice * 0.05
const shipping = Math.min(basePrice * 0.1, 100)
return basePrice - quantityDiscount + shipping
```
> 표현식이 너무 복잡해서 이해하기 어려울때는 지역 변수를 활용하면 표현식을 쪼개 관리하기 더 쉽게 만들 수 있다. 그러면 복잡한 로직을 구성하는 단계마다 이름을 붙일 수 있어서 코드의 목적을 훨씬 명확하게 드러낼 수 있다.

### 절차
1. 추출하려는 표현식에 부작용은 없는지 확인한다.
2. 불변 변수를 하나 선언하고 이름을 붙일 표현식의 복제본을 대입한다.
3. 원본 표현식을 새로 만든 변수로 교체한다.
4. 테스트한다.
5. 표현식을 여러 곳에서 사용한다면 각각을 새로 만든 변수로 교체한다. 하나 교체할 때마다 테스트한다.

### 예시
```JS
function price(order) {
	return order.quantity * order.itemPrice -
		Math.max(0, order.quantity - 500) * order.itemPrice * 0.05 + 
		Math.min(order.quantity * order.itemPrice * 0.1, 100)
}
```
#### 기본 가격은 상품가격(itemPrice)에 수량(quantity)를 곱한값이다.
```JS
function price(order) {
	return order.quantity * order.itemPrice -
		Math.max(0, order.quantity - 500) * order.itemPrice * 0.05 + 
		Math.min(order.quantity * order.itemPrice * 0.1, 100)
}
```
#### 이해 했다면 기본 가격을 담을 변수를 만들고 이름을 짓자
```JS
function price(order) {
	// 가격 = 기본가격 - 수량 + 배송비
	const basePrice = order.quantity * order.itemPrice
	return order.quantity * order.itemPrice -
		Math.max(0, order.quantity - 500) * order.itemPrice * 0.05 + 
		Math.min(order.quantity * order.itemPrice * 0.1, 100)
}
```
#### 교체
```JS
function price(order) {
	// 가격 = 기본가격 - 수량 + 배송비
	const basePrice = order.quantity * order.itemPrice
	// return order.quantity * order.itemPrice -
	return basePrice - // 교체
		Math.max(0, order.quantity - 500) * order.itemPrice * 0.05 + 
		// Math.min(order.quantity * order.itemPrice * 0.1, 100)
		Math.min(basePrice * 0.1, 100) // 교체
}
```
#### 수량할인
```JS
function price(order) {
	// 가격 = 기본가격 - 수량 + 배송비
	const basePrice = order.quantity * order.itemPrice
	const quantityDiscount = Math.max(0, order.quantity - 500) * order.itemPrice * 0.05 // 추가
	return basePrice - quantityDiscount + // 대체
		// Math.max(0, order.quantity - 500) * order.itemPrice * 0.05 + 
		Math.min(basePrice * 0.1, 100)
}
```
#### 배송
```JS
function price(order) {
	// 가격 = 기본가격 - 수량 + 배송비
	const basePrice = order.quantity * order.itemPrice
	const quantityDiscount = Math.max(0, order.quantity - 500) * order.itemPrice * 0.05
	const shipping = Math.min(basePrice * 0.1, 100)
	return basePrice - quantityDiscount + shipping
}
```

### ex) 클래스 안에서
```JS
class Order {
	constructor(aRecord) {
		this._data = aRecord
	}

	get quantity() { return this._data.quantity }
	get itemPrice() { return this._data.itemPrice }

	getPrice() {
		return this.quantity * this.itemPrice - 
			Math.max(0, this.quantity - 500) * this.itemPrice * 0.05 +
			Math.min(this.quantity * this.itemPrice * 0.1, 100)
	}
}
```
->
```JS
class Order {
	constructor(aRecord) {
		this._data = aRecord
	}

	get quantity() { return this._data.quantity }
	get itemPrice() { return this._data.itemPrice }

	// getPrice() {
	// 	return this.quantity * this.itemPrice - 
	// 		Math.max(0, this.quantity - 500) * this.itemPrice * 0.05 +
	// 		Math.min(this.quantity * this.itemPrice * 0.1, 100)
	// }
	get price() { // 변경
		return this.basePrice - this.quantityDiscount + this.shipping
	}
	get basePrice() { return this.quantity * this.itemPrice }
	get quantityDiscount() { return Math.max(0, this.quantity - 500) * this.itemPrice * 0.05 }
	get shipping() { return Math.min(this.basePrice * 0.1, 100) }
}
```
> 객체는 특정 로직과 데이터를 외부와 공유하려 할 때 공유할 정보를 설정해주는 적당한 크기의 문맥이 되어준다.























