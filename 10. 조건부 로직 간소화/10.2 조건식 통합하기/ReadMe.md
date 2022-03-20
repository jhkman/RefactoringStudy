# 10 조건부 로직 간소화
## 10.2 조건식 통합하기

```JS
if (anEmployee.seniority < 2) return 0;
if (anEmployee.monthsDisabled > 12) return 0;
if (anEmployee.isPartTime) return 0;
```
->
```JS
if (isNotEligibleForDisability()) return 0;

function isNotEligibleForDisability() {
	return ((anEmployee.seniority < 2)
		|| (anEmployee.monthsDisabled > 12) 
		|| (anEmployee.isPartTime));
}
```

### 배경
비교하는 조건은 다르지만 그 결과로 수행하는 동작은 똑같은 코드들이 있는데 이럴땐 조건 검사도 하나로 통일하자.  
1. 여러 조각으로 나뉜 조건들을 하나로 통합함으로써 내가 하려는 일이 더 명확해진다.
2. 이 작업이 함수 추출하기까지 이어질 가능성이 높기떄문에  
함수 추출하기는 '무엇'을 하는지를 기술하던 코드를 '왜'하는지를 말해주는 코드로 바꿔주는 효과적인 도구임을 기억하자.  

### 절차
1. 해당 조건식들 모두에 부수효과가 없는지 확인한다.
2. 조건문 두 개를 선택하여 두 조건문의 조건식들을 논리 연산자로 결합한다.
3. 테스트한다.
4. 조건이 하나만 남을 때까지 2 ~ 3 과정을 반복한다.
5. 하나로 합쳐진 조건식을 함수로 추출할지 고려해본다.

### 예시: or 사용하기

```JS
function disabilityAmount(anEmployee) {
	if (anEmployee.seniority < 2) return 0;
	if (anEmployee.monthsDisabled > 12) return 0;
	if (anEmployee.isPartTime) return 0;
	// 장애수단 계산
}
```
합쳐주자. 2. 결과로 행하는 동작이 같으므로 통합한다. 이처럼 순차적인 경우엔 or연산자를 이용하면 된다.
```JS
function disabilityAmount(anEmployee) {
	if (anEmployee.seniority < 2) || (anEmployee.monthsDisabled > 12) || (anEmployee.isPartTime) return 0;
	// 장애수단 계산
}
```
5. 모든 조건을 통합했다면 최종 조건식을 함수로 추출해볼 수 있다.
```JS
function disabilityAmount(anEmployee) {
	// if (anEmployee.seniority < 2) || (anEmployee.monthsDisabled > 12) || (anEmployee.isPartTime) return 0;
	if (isNotEligibleForDisability()) return 0;
	// 장애수단 계산

	function isNotEligibleForDisability() {
	return ((anEmployee.seniority < 2)
		|| (anEmployee.monthsDisabled > 12) 
		|| (anEmployee.isPartTime));
	}
}
```

### 예시: and 사용하기
앞에서는 식들을 or로 결합하는 예를 보여줬는데, if문이 중첩되어 나오면 and를 사용해야 한다.
```JS
if (anEmployee.onVacation)
	if (anEmployee.seniority > 10)
		return 1;
	return 0.5;
```
이 조건들을 and 연산자로 결합해보자.
```JS
if (anEmployee.onVacation) && (anEmployee.seniority > 10)
		return 1;
	return 0.5;
```





























