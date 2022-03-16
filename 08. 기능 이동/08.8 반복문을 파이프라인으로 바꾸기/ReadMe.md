# 08. 기능 이동
## 8.8 반복문을 파이프라인으로 바꾸기

```JS
const names = []
for (const i of input) {
	if (i.job === "programmer")
		names.push(i.name)
}
```
-> 
```JS
const names = input
				.filter(i => i.job === "programmer")
				.map(i => i.name)
```

### 배경
반복문을 파이프라인으로 처리하면 처리 과정을 일련의 연산으로 표현할 수 있다.

### 절차
1. 반복문에서 사용하는 컬렉션을 가리키는 변수를 하나 만든다.
2. 반복문의 첫 줄부터 시작해서, 각각의 단위 행위를 적절한 컬렉션 파이프라인 연산으로 대체한다. 이때 컬렉션 파이프라인 연산은 1.에서 만든 반복문 컬렉션 변수에서 시작하여, 이전 연산의 결과를 기초로 연쇄적으로 수행된다. 하나를 대체할 때마다 테스트한다.
3. 반복문의 모든 동작을 대체했다면 반복문 자체를 지운다.

### 예시
내 회사의 지점 사무실 정보를 CSV형태로 정리

```JS
office, country, telephone
Chicago, USA, +1 312 373 1000
Banglaore, India, +91 80 4064 9570
Porto Alegre, Brazil, +55 3079 3550
Chennai, India, +91 44 660 44766

... (더 많은 데이터)
```
다음 함수는 인도에 자리한 사무실을 찾아서 도시명과 전화번호를 반환한다.

```JS
function acquireData(input) {
	const lines = input.split("\n") // <- 컬렉션
	let firstLine = true
	const result = []
	for (const line of lines) { // <- 반복문
		if (firstLine) {
			firstLine = false
			continue
		}
		if (line.trim() === "") 
			continue
		const record = line.split(",")
		if (record[1].trim() === "India") {
			result.push({city: record[0].trim(), phone: record[2].trim()})
		}
	}
	return result
}
```
이 코드의 반복문을 컬렉션 파이프라인으로 바꿔보자.  
1. 반복문에서 사용하는 컬렉션을 가리키는 별도 변수를 새로 만들자. 이 변수를 루프 변수라 하겠다.
```JS
function acquireData(input) {
	const lines = input.split("\n")
	let firstLine = true
	const result = []
	const loopItems = lines // 추가
	// for (const line of lines) {
	for (const line of loopItems) {
		if (firstLine) {
			firstLine = false
			continue
		}
		if (line.trim() === "") 
			continue
		const record = line.split(",")
		if (record[1].trim() === "India") {
			result.push({city: record[0].trim(), phone: record[2].trim()})
		}
	}
	return result
}
```
2. 이 코드의 반복문에서 첫 if문은 CSV데이터의 첫 줄을 건너뛰는 역할이다. 이 작업은 slice()로 바꿔보자.
```JS
function acquireData(input) {
	const lines = input.split("\n")
	// let firstLine = true
	const result = []
	// const loopItems = lines
	const loopItems = lines
						.slice(1)
	for (const line of loopItems) {
		// if (firstLine) {
		// 	firstLine = false
		// 	continue
		// }
		if (line.trim() === "") 
			continue
		const record = line.split(",")
		if (record[1].trim() === "India") {
			result.push({city: record[0].trim(), phone: record[2].trim()})
		}
	}
	return result
}
```
반복문에서 수행하는 다음 작업은 빈줄 지우기다. 이 작업은 filter()연산으로 대체하자.
```JS
function acquireData(input) {
	const lines = input.split("\n")
	const result = []
	// const loopItems = lines
	// 					.slice(1)
	const loopItems = lines
						.slice(1)
						.filter(line => line.trim() !== "")
	for (const line of loopItems) {
		// if (line.trim() === "") 
			// continue
		const record = line.split(",")
		if (record[1].trim() === "India") {
			result.push({city: record[0].trim(), phone: record[2].trim()})
		}
	}
	return result
}
```
다음으로 map()연산을 사용해서 여러 줄짜리 CSV데이터를 문자열 배열로 변환하자.
```JS
function acquireData(input) {
	const lines = input.split("\n")
	const result = []
	// const loopItems = lines
	// 					.slice(1)
	// 					.filter(line => line.trim() !== "")
	const loopItems = lines
						.slice(1)
						.filter(line => line.trim() !== "")
						.map(line => line.split(","))
	for (const line of loopItems) {
		// const record = line.split(",")
		if (record[1].trim() === "India") {
			result.push({city: record[0].trim(), phone: record[2].trim()})
		}
	}
	return result
}
```
다시 한번 filter()연산을 수행하여 인도에 위치한 사무실 레코드를 뽑아낸다.

```JS
function acquireData(input) {
	const lines = input.split("\n")
	const result = []
	// const loopItems = lines
	// 					.slice(1)
	// 					.filter(line => line.trim() !== "")
	// 					.map(line => line.split(","))
	const loopItems = lines
						.slice(1)
						.filter(line => line.trim() !== "")
						.map(line => line.split(","))
						.filter(record => record[1].trim() === "India")
	for (const line of loopItems) {
		// if (record[1].trim() === "India") {
			result.push({city: record[0].trim(), phone: record[2].trim()})
		// }
	}
	return result
}
```
map()을 사용해 결과 레코드를 생성한다.

```JS
function acquireData(input) {
	const lines = input.split("\n")
	const result = []
	// const loopItems = lines
	// 					.slice(1)
	// 					.filter(line => line.trim() !== "")
	// 					.map(line => line.split(","))
	// 					.filter(record => record[1].trim() === "India")
	const loopItems = lines
						.slice(1)
						.filter(line => line.trim() !== "")
						.map(line => line.split(","))
						.filter(record => record[1].trim() === "India")
						.map(record => ({city: record[0].trim(), phone: record[2].trim()}))
	for (const line of loopItems) {
		// result.push({city: record[0].trim(), phone: record[2].trim()})
		const record = line
		result.push(line)
	}
	return result
}
```
3. 파이프라인의 결과를 누적변수에 대입해주자.
```JS
function acquireData(input) {
	const lines = input.split("\n")
	// const result = []
	// const loopItems = lines
	// 					.slice(1)
	// 					.filter(line => line.trim() !== "")
	// 					.map(line => line.split(","))
	// 					.filter(record => record[1].trim() === "India")
	// 					.map(record => ({city: record[0].trim(), phone: record[2].trim()}))
	const result = lines
					.slice(1)
					.filter(line => line.trim() !== "")
					.map(line => line.split(","))
					.filter(record => record[1].trim() === "India")
					.map(record => ({city: record[0].trim(), phone: record[2].trim()}))
	// for (const line of loopItems) {
	// 	const record = line
	// 	result.push(line)
	// }
	return result
}
```

















