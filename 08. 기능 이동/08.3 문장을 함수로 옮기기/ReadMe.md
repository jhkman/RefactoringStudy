# 08. 기능 이동
## 8.3 문장을 함수로 옮기기

```JS
result.push(` <p>제목: ${person.photo.title}</p>`)
result.concat(photoData(person.photo))

function photoData(aPhoto) {
	return [
	`<p>위치: ${aPhoto.location}</p>`,
	`<p>날짜: ${aPhoto.date.toDateString()}</p>`,
	]
}
```
-> 
```JS
result.concat(photoData(person.photo))

function photoData(aPhoto) {
	return [
	`<p>제목: ${aphoto.title}</p>`,
	`<p>위치: ${aPhoto.location}</p>`,
	`<p>날짜: ${aPhoto.date.toDateString()}</p>`,
	]
}
```

### 배경
중복 제거는 필수. 특정 함수를 호출하는 코드가 나올 때마다 그 앞이나 뒤에서 똑같은 코드가 추가로 실행되는 모습을 보면, 합치는 궁리를 해야한다.  
이렇게되면 추후 반복되는 부분에서 수정할 일이 생겼을 떄 단 한 곳만 수정하면 된다. 

### 절차
1. 반복되는 코드가 함수 호출 부분과 멀리 떨어져 있다면 문장 슬라이스하기를 적용해 근처로 옮긴다.
2. 타깃 함수를 호출하는 곳이 한 곳 뿐이면, 단순히 소스 위치에서 해당 코드를 잘라내어 피호출 함수로 복사하고 테스트한다. 이 경우라면 나머지 단계는 무시한다.
3. 호출자가 둘 이상이면 호출자 중 하나에서 '타깃 함수 호출 부분과 그 함수로 옮기려는 문장들을 함께' 다른 함수로 추출한다. 추출한 함수에 기억하기 쉬운 임시 이름을 지어준다.
4. 다른 호출자 모두가 방금 추출한 함수를 사용하도록 수정한다. 하나씩 수정할 때마다 테스트한다.
5. 모든 호출자가 새로운 함수를 사용하게 되면 원래 함수를 새로운 함수 안으로 인라인 한 후 원래 함수를 제거한다.
6. 새로운 함수의 이름을 원래 함수의 이름으로 바꿔준다.

### 예시
사진 관련 데이터를 HTML로 내보내는 코드
```JS
function renderPerson(outStream, person) {
	const result = []
	result.push(`<p>: ${person.name}</p>`)
	result.push(renderPhoto(person.photo))
	result.push(`<p>제목: ${person.photo.title}</p>`) // 제목 출력
	result.push(emitPhotoData(person.photo))
	return result.join("\n")
}

function photoDiv(p) {
	return [
		"<div>",
		`<p>제목: ${p.title}</p>`, // 제목 출력
		emitPhotoData(p),
		"</div>",
	].join("\n")
}

function emitPhotoData(aPhoto) {
	const result = []
	`<p>위치: ${aPhoto.location}</p>`,
	`<p>날짜: ${aPhoto.date.toDateString()}</p>`,
	return result.join("\n")
}
```
이 코드에서는 총 두곳에서 emitPhotoData()를 호출하며, 두 곳 모두 바로 앞에서는 제목(title) 출력 코드가 나온다. 제목을 출력하는 코드를 emitPhotoData()안으로 옮기자.  
3. 가장 먼저 호출자 중 하나에 함수 추출하기를 적용하자

```JS
function renderPerson(outStream, person) {
	const result = []
	result.push(`<p>: ${person.name}</p>`)
	result.push(renderPhoto(person.photo))
	result.push(`<p>제목: ${person.photo.title}</p>`)
	result.push(emitPhotoData(person.photo))
	return result.join("\n")
}

function photoDiv(p) {
	return [
		"<div>",
		`<p>제목: ${p.title}</p>`,
		emitPhotoData(p),
		"</div>",
	].join("\n")
}

function zznew(p) { // 추가된 함수
	return [
		`<p>제목: ${p.title}</p>`,
		emitPhotoData(p),
	].join("\n")
}

function emitPhotoData(aPhoto) {
	const result = []
	`<p>위치: ${aPhoto.location}</p>`,
	`<p>날짜: ${aPhoto.date.toDateString()}</p>`,
	return result.join("\n")
}
```
4. 이제 다르 ㄴ호출자들로 눈을 돌려서, 하나씩 차례로 새로운 함수를 호출하도록 수정한다.
```JS
function renderPerson(outStream, person) {
	const result = []
	result.push(`<p>: ${person.name}</p>`)
	result.push(renderPhoto(person.photo))
	// result.push(`<p>제목: ${person.photo.title}</p>`)
	result.push(zznew(person.photo))
	result.push(emitPhotoData(person.photo))
	return result.join("\n")
}

function photoDiv(p) {
	return [
		"<div>",
		`<p>제목: ${p.title}</p>`,
		emitPhotoData(p),
		"</div>",
	].join("\n")
}

function zznew(p) {
	return [
		`<p>제목: ${p.title}</p>`,
		emitPhotoData(p),
	].join("\n")
}

function emitPhotoData(aPhoto) {
	const result = []
	`<p>위치: ${aPhoto.location}</p>`,
	`<p>날짜: ${aPhoto.date.toDateString()}</p>`,
	return result.join("\n")
}
```
6. 그리고 함수 이름을 바꿔 마무리한다.
```JS
function renderPerson(outStream, person) {
	const result = []
	result.push(`<p>: ${person.name}</p>`)
	result.push(renderPhoto(person.photo))
	// result.push(zznew(person.photo))
	result.push(emitPhotoData(person.photo))
	return result.join("\n")
}

function photoDiv(p) {
	return [
		"<div>",
		`<p>제목: ${p.title}</p>`,
		emitPhotoData(p),
		"</div>",
	].join("\n")
}

// function zznew(p) {
// 	return [
// 		`<p>제목: ${p.title}</p>`,
// 		emitPhotoData(p),
// 	].join("\n")
// }

function emitPhotoData(aPhoto) {
	const result = []
	`<p>제목: ${p.title}</p>`,
	`<p>위치: ${aPhoto.location}</p>`,
	`<p>날짜: ${aPhoto.date.toDateString()}</p>`,
	return result.join("\n")
}
```


























