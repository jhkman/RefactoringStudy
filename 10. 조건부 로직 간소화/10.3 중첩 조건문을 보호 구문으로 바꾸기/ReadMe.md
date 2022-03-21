# 10 조건부 로직 간소화
## 10.3 중첩 조건문을 보호 구문으로 바꾸기

```JS
function getPayAmount() {
	let result
	if (isDead)
		result = deadAmount()
	else {
		if (isSeparated)
			result = separatedAmount()
		else {
			if (isRetired)
				result = retiredAmount()
			else 
				result = normalPayAmount()
		}
	}
	return result
}
```
-> 
```JS
function getPayAmount() {
	if (isDead) return deadAmount();
	if (isSeparated) return separatedAmount();
	if (isRetired) return retiredAmount();
	return normalPayAmount();
}
```

### 배경
조건문은 주로 두가지 형태로 쓰인다.
1. 참인 경로화 거짓인 경로 모두 정상 동작으로 이어지는 형태
2. 한쪽만 정상인 형태  

두 형태는 의도하는 바가 다르므로 후자라면 **보호구문** 을 사용하자.  
코드가 명확해진다.

### 절차
1. 교체해야 할 조건 중 가장 바깥 것을 선택하여 보호 구문으로 바꾼다.
2. 테스트한다.
3. 1 ~ 2 과정을 필요한 만큼 반복한다.
4. 모든 보호 구문이 같은 결과를 반환한다면 보호 구문들의 조건식을 통합한다.

### 예시
직원 급여를 계산하는 코드
```JS
function payAmount(employee) {
	let result
	if (employee.isSeparated) { // 퇴사한 직원인가?
		result = { amount: 0, reasonCode: "SEP" }
	} else {
		if (employee.isRetired) { // 은퇴한 직원인가?
			result = { amount: 0, reasonCode: "RET" }
		} else {
			// 급여 계산 로직
			lorem.ipsum(dolor.sitAmet)
			...
		}
	}
	return result
}
```
이 코드가 진짜 의도한 일은 모든 조건이 거짓일 때만 실행된다. 보호코드를 사용해보자 1. 최상위 조건부터 보호구문으로 바꿔보자
```JS
function payAmount(employee) {
	let result
	// if (employee.isSeparated) { // 퇴사한 직원인가?
	// 	result = { amount: 0, reasonCode: "SEP" }
	// } else {
		if (employee.isSeparated) return { amount: 0, reasonCode: "SEP" }
		if (employee.isRetired) { // 은퇴한 직원인가?
			result = { amount: 0, reasonCode: "RET" }
		} else {
			// 급여 계산 로직
			lorem.ipsum(dolor.sitAmet)
			...
		}
	// }
	return result
}
```
2. 변경 후 테스트하고 3. 다음조건으로 넘어간다.
```JS
function payAmount(employee) {
	let result
	if (employee.isSeparated) return { amount: 0, reasonCode: "SEP" }
	// if (employee.isRetired) { // 은퇴한 직원인가?
	// 	result = { amount: 0, reasonCode: "RET" }
	// } else {
		if (employee.isRetired) return { amount: 0, reasonCode: "RET" }
		// 급여 계산 로직
		lorem.ipsum(dolor.sitAmet)
		...
	// }
	return result
}
```
여기 까지 왔다면 result 변수는 아무일도 하지 않는다.
```JS
function payAmount(employee) {
	// let result
	if (employee.isSeparated) return { amount: 0, reasonCode: "SEP" }
	if (employee.isRetired) return { amount: 0, reasonCode: "RET" }
	// 급여 계산 로직
	lorem.ipsum(dolor.sitAmet)
	...
	// return result
	return someFinalComputation()
}
```

### 예시: 조건 반대로 만들기

```JS
function adjustedCapital(anInstrumnet) {
	let result = 0
	if (anInstrumnet.capital > 0) {
		if (anInstrumnet.interestRate > 0 && anInstrumnet.duration > 0) {
			result = (anInstrumnet.income / anInstrumnet.duration) * anInstrumnet.adjustmentFactor
		}
	}
	return result
}
```
한번에 하나씩 수정한다. 다만 이번에는 보호 구문을 추가하면서 조건을 역으로 바꾼다.
```JS
function adjustedCapital(anInstrumnet) {
	let result = 0
	// if (anInstrumnet.capital > 0) {
	if (anInstrumnet.capital <= 0) return result
		if (anInstrumnet.interestRate > 0 && anInstrumnet.duration > 0) {
			result = (anInstrumnet.income / anInstrumnet.duration) * anInstrumnet.adjustmentFactor
		}
	// }
	return result
}
```
-> 
```JS
function adjustedCapital(anInstrumnet) {
	let result = 0
	if (anInstrumnet.capital <= 0) return result
	// if (anInstrumnet.interestRate > 0 && anInstrumnet.duration > 0) {
	if (!(anInstrumnet.interestRate > 0 && anInstrumnet.duration > 0) return result
		result = (anInstrumnet.income / anInstrumnet.duration) * anInstrumnet.adjustmentFactor
	// }
	return result
}
```
```JS
function adjustedCapital(anInstrumnet) {
	let result = 0
	if (anInstrumnet.capital <= 0) return result
	// if (!(anInstrumnet.interestRate > 0 && anInstrumnet.duration > 0) return result 조건문에 !가 있으면 별로다..
	if ((anInstrumnet.interestRate <= 0 || anInstrumnet.duration <= 0) return result
	result = (anInstrumnet.income / anInstrumnet.duration) * anInstrumnet.adjustmentFactor
	
	return result
}
```
통합한다.
```JS
function adjustedCapital(anInstrumnet) {
	let result = 0
	// if (anInstrumnet.capital <= 0) return result
	// if ((anInstrumnet.interestRate <= 0 || anInstrumnet.duration <= 0) return result
	if ((anInstrumnet.interestRate <= 0 || anInstrumnet.duration <= 0 || anInstrumnet.capital <= 0) return result
	result = (anInstrumnet.income / anInstrumnet.duration) * anInstrumnet.adjustmentFactor
	
	return result
}
```
여기서 result 변수는 두 가지 일을 한다. 처음 설정한 값 0은 보호구문이 발동했을때만 반환한다. 두번쨰로 설정한 값은 계산의 결과이다. 고치자
```JS
function adjustedCapital(anInstrumnet) {
	// let result = 0
	// if ((anInstrumnet.interestRate <= 0 || anInstrumnet.duration <= 0 || anInstrumnet.capital <= 0) return result
	if ((anInstrumnet.interestRate <= 0 || anInstrumnet.duration <= 0 || anInstrumnet.capital <= 0) return 0
	// result = (anInstrumnet.income / anInstrumnet.duration) * anInstrumnet.adjustmentFactor
	
	// return result
	return (anInstrumnet.income / anInstrumnet.duration) * anInstrumnet.adjustmentFactor
}
```























