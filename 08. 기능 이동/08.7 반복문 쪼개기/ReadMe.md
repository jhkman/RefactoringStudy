# 08. 기능 이동
## 8.7 반복문 쪼개기
```JS
let avarageAge = 0
let totalSalary = 0
for (const p of people) {
	avarageAge += p.age
	totalSalary += p.salary
}
avarageAge = avarageAge / people.length
```
->
```JS
let totalSalary = 0
for (const p of people) {
	totalSalary += p.salary
}

let avarageAge = 0
for (const p of people) {
	avarageAge += p.age
}
avarageAge = avarageAge / people.length
```

### 배경
종종 반복문 하나에서 두 가지 일을 수행하는 모습을 보게 된다.  
쪼개자.

### 절차 
1. 반복문을 복제해 두 개로 만든다.
2. 반복문이 중복되어 생기는 부수효과를 파악해서 제거한다.
3. 테스트한다.
4. 완료됐으면, 각 반복문을 함수로 추출할지 고민해본다.

### 예시
전체 급여와 가장 어린 나이를 계산하는 코드

```JS
let youngest = people[0] ? people[0].age : Infinity
let totalSalary = 0
for (const p of people) {
	if (p.age < youngest) youngest = p.age
		totalSalary += p.salary
}

return `최연소: ${youngest}, 총 급여: ${totalSalary}`
```
반복문에서 관련없는 두가지를 계산한다.. 1. 반복문을 복제하자.
```JS
let youngest = people[0] ? people[0].age : Infinity
let totalSalary = 0
for (const p of people) {
	if (p.age < youngest) youngest = p.age
		totalSalary += p.salary
}

for (const p of people) { // 복제
	if (p.age < youngest) youngest = p.age
		totalSalary += p.salary
}

return `최연소: ${youngest}, 총 급여: ${totalSalary}`
```
2. 반복문이 복제됐으면 잘못된 결과를 초래할 수 있는 중복을 제거하자

```JS
let youngest = people[0] ? people[0].age : Infinity
let totalSalary = 0
for (const p of people) {
	// if (p.age < youngest) youngest = p.age // 부수효과가 있는 코드는 한쪽만 남기고 제거
		totalSalary += p.salary
}

for (const p of people) { // 복제
	if (p.age < youngest) youngest = p.age
		// totalSalary += p.salary // // 부수효과가 있는 코드는 한쪽만 남기고 제거
}

return `최연소: ${youngest}, 총 급여: ${totalSalary}`
```

### 더 가다듬기
반복문 쪼개기의 묘미는 그 자체가 아닌 다음단계로 가는 디딤돌 역할이다.  
지금의 경우라면 코드 일부에 문장 슬라이드하기부터 적용해야 한다.
```JS
// let youngest = people[0] ? people[0].age : Infinity
let totalSalary = 0
for (const p of people) {
	totalSalary += p.salary
}

let youngest = people[0] ? people[0].age : Infinity // 슬라이드
for (const p of people) {
	if (p.age < youngest) 
		youngest = p.age
}

return `최연소: ${youngest}, 총 급여: ${totalSalary}`
```
그런 다음 각 반복문을 함수로 추출한다.
```JS
// let totalSalary = 0
// for (const p of people) {
// 	totalSalary += p.salary
// }
function totalSalary() { // 추출
	let totalSalary = 0
	for (const p of people) {
		totalSalary += p.salary
	}
	return totalSalary
}

// let youngest = people[0] ? people[0].age : Infinity
// for (const p of people) {
// 	if (p.age < youngest) 
// 		youngest = p.age
// }
function youngestAge() { // 추출
	let youngest = people[0] ? people[0].age : Infinity
	for (const p of people) {
		if (p.age < youngest) 
			youngest = p.age
	}
	return youngest
}

return `최연소: ${youngest}, 총 급여: ${totalSalary}`
```
추출된 총 급여 계산 함수의 코드를 반복문을 파이프라인으로 바꾸고 최연소 계산코드에는 알고리즘을 바꾸자
```JS
function totalSalary() {
	// let totalSalary = 0
	// for (const p of people) {
	// 	totalSalary += p.salary
	// }
	// return totalSalary
	return people.reduce((total, p) => total + p.salary, 0)
}

function youngestAge() {
	// let youngest = people[0] ? people[0].age : Infinity
	// for (const p of people) {
	// 	if (p.age < youngest) 
	// 		youngest = p.age
	// }
	// return youngest
	return Math.min(...people.map(p => p.age))
}

return `최연소: ${youngest}, 총 급여: ${totalSalary}`
```



















