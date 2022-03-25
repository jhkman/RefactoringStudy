# 10 조건부 로직 간소화
## 10.7 제어 플래그를 탈출문으로 바꾸기
```JS
for (const p of people) {
	if (!found) {
		if (p === "조커") {
			sendAlert()
			found = true
		}
	}
}
```
->
```JS
for (const p of people) {
	if (p === "조커") {
		sendAlert()
		break
	}
}
```
### 배경
제어플레그를 간소화 할 수 있으면 간소화 해주자.

### 절차
1. 제어 플래그를 사용하는 코드를 함수로 추출할지 고려한다.
2. 제어 플래그를 갱신하는 코드 각각을 적절한 제어문으로 바꾼다. 하나 바꿀 때마다 테스트한다.
3. 모두 수정했다면 제어 플래그를 제거한다.

### 예시
다음은 사람 목록을 훑으면서 악당을 찾는 코드다. 악당 이름은 하드코딩되어 있다.
```JS
// 생략(중요하지 않은 코드)
let found = false
for (const p of people) {
	if (! found) {
		if (p === "조커") {
			sendAlert()
			found = true
		}
		if (p === "사루만") {
			sendAlert()
			found = true
		}
	}
}
// 생략
```

1. 여기서 제어 플래그는 found변수이도, 제어 흐름을 변경하는 데 쓰인다.  
정리해야 할 코드양이 제법 된다면 가장 먼저 함수 추출하기를 활용해서 밀접한 코드만 담은 함수를 뽑아보자.

```JS
// 생략(중요하지 않은 코드)
checkForMiscreants(people)

function checkForMiscreants(people) {
	let found = false
	for (const p of people) {
		if (! found) {
			if (p === "조커") {
				sendAlert()
				found = true
			}
			if (p === "사루만") {
				sendAlert()
				found = true
			}
		}
	}
}

// 생략
```
2. 제어 플래그가 참이면 반복문에서는 더 이상 할 일이 없다. break, return 문으로 빠져나오자

```JS
// 생략(중요하지 않은 코드)
checkForMiscreants(people)

function checkForMiscreants(people) {
	// let found = false
	for (const p of people) {
		// if (! found) {
			if (p === "조커") {
				sendAlert()
				// found = true
				return
			}
			if (p === "사루만") {
				sendAlert()
				// found = true
				return 
			}
		// }
	}
}

// 생략
```































