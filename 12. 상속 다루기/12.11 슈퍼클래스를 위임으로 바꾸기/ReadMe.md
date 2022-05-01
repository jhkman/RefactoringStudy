# 12. 상속 다루기
## 12.11 슈퍼클래스를 위임으로 바꾸기

```JS
class List {...}
class Stack extends List {...}
```
-> 
```JS
class Stack {
	constuctor() {
		this._storage = new List()
	}
}
class List {...}
```

### 배경
상속을 사용해 의도하지 않은 기능이 상속되버림  

### 절차
1. 슈퍼클래스 객체를 참조하는 필드를 서브클래스에 만든다(이번 리팩터링을 끝마치면 슈퍼클래스가 위임 객체가 될 것이므로 이 필드를 '위임 참조'라 부르자.). 위임 참조를 새로운 슈퍼클래스 인스턴스로 초기화한다.
2. 슈퍼클래스의 동작 각가에 대응하는 전달 함수를 서브클래스에 만든다(물론 위임 참조로 전달한다). 서로 관련된 함수끼리 그룹으로 묶어 진행하며, 그룹을 하나씩 만들 때마다 테스트한다
3. 슈퍼클래스의 동작 모두가 전달 함수로 오버라이드되었다면 상속 관계를 끊는다.

### 예시
```JS
class CatalogItem {
	constuctor(id, title, tags) {
		this._id = id
		this._title = title
		this._tag = tags
	}

	get id() { return this._id }
	get title() { return this._title } 
	hasTag(arg) { return this._tag.includes(arg)}
}
```
스크롤에는 정기 세척 이력이 필요했다. 
```JS
class Scroll extends CatalogItem {
	constuctor(id, title, tags, dateLastCleaned) {
		super(id, title, tags)
		this._lastCleaned = dateLastCleaned
	}

	needsCleaning(targetDate) {
		const threshold = this.hasTag("revered") ? 700 : 1500
		return this.daySinceLastCleaning(targetDate) > threshold
	}

	daySinceLastCleaning(targetDate) {
		return this._lastCleaned.until(targetDate, ChronoUnit.DAYS)
	}
} 
```

-> 


```JS
// class Scroll extends CatalogItem {
class Scroll {
	constuctor(id, title, tags, dateLastCleaned) {
		// super(id, title, tags)
		this._catalogItem = new CatalogItem(id, title, tags) // 추가
		this._lastCleaned = dateLastCleaned
	}

	get id() { return this._catalogItem.id} // 추가
	get title() { return this._catalogItem.title} // 추가
	get hasTag() { return this._catalogItem.hasTag(aString)} // 추가

	needsCleaning(targetDate) {
		const threshold = this.hasTag("revered") ? 700 : 1500
		return this.daySinceLastCleaning(targetDate) > threshold
	}

	daySinceLastCleaning(targetDate) {
		return this._lastCleaned.until(targetDate, ChronoUnit.DAYS)
	}
} 
```















