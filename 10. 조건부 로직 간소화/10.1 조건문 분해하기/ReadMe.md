# 10 조건부 로직 간소화
## 10.1 조건문 분해하기

```JS
if (!aDate.isBefore(plan.summerStart) && !aDate.isAfter(plan.summerEnd))
	charge = quantity * plan.summerRate
else 
	charge = quantity * plan.regularRate + plan.regularServiceCharge
```
-> 
```JS
if (summer())
	charge = summerCharge()
else 
	charge = regularCharge()
```

### 배경 
복잡한 조건부 로직은 프로그램을 복잡하게 만드는 가장 흔한 원흉에 속한다.  
조건을 검사하고 그 결과에 따른 동작을 만들어줄때는 '왜' 일어나는지 명시해주자.  

### 절차
1. 조건식과 그 조건식에 딸린 조건절 각각을 함수로 추출한다.

### 예시
여름철이면 할인율이 달라지는 서비스의 요금 계산
```JS
if (!aDate.isBefore(plan.summerStart) && !aDate.isAfter(plan.summerEnd))
	charge = quantity * plan.summerRate
else 
	charge = quantity * plan.regularRate + plan.regularServiceCharge
```
1. 우선 조건 부분(조건식)을 별도 함수로 추출한다.
```JS
// if (!aDate.isBefore(plan.summerStart) && !aDate.isAfter(plan.summerEnd))
if (summer())
	charge = quantity * plan.summerRate
else 
	charge = quantity * plan.regularRate + plan.regularServiceCharge

function summer() { // 함수로 추출
	return !aDate.isBefore(plan.summerStart) && !aDate.isAfter(plan.summerEnd)
}
```
그런 다음 조건이 만족했을 때의 로직도 또 다른 함수로 추출한다.
```JS
if (summer())
	// charge = quantity * plan.summerRate
	charge = summerCharge()
else 
	charge = quantity * plan.regularRate + plan.regularServiceCharge

function summer() {
	return !aDate.isBefore(plan.summerStart) && !aDate.isAfter(plan.summerEnd)
}

function summerCharge() { // 함수로 추출
	return quantity * plan.summerRate
}
```
-> 
```JS
if (summer())
	charge = summerCharge()
else 
	// charge = quantity * plan.regularRate + plan.regularServiceCharge
	regularCharge()

function summer() {
	return !aDate.isBefore(plan.summerStart) && !aDate.isAfter(plan.summerEnd)
}

function summerCharge() {
	return quantity * plan.summerRate
}

function regularCharge() {
	return quantity * plan.regularRate + plan.regularServiceCharge
}
```




























