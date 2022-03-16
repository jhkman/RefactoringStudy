# 08. 기능 이동
## 8.4 문장을 호출한 곳으로 옮기기

```JS
emitPhotoData(outStream, person.photo)

function emitPhotoData(outStream, photo) {
	outStream.write(`<p>제목: ${photo.title}</p>\n`)
	outStream.write(`<p>위치: ${photo.location}</p>\n`)
}
```
-> 
```JS
emitPhotoData(outStream, person.photo)
outStream.write(`<p>위치: ${photo.location}</p>\n`)

function emitPhotoData(outStream, photo) {
	outSteam.write((`<p>제목: ${photo.title}</p>\n`)
}
```

### 배경
함수는 프로그래머가 쌓아 올리는 추상화의 기본 빌딩 블록이다.  
코드베이스의 기능 범위가 달라지면 추상화의 경계도 움직인다. 함수 관점에서 생각해보면, 초기에는 응집도 높고 한 가지 일만 수행하던 함수가 어느새 둘 이상의 다른 일을 수행하게 바뀔 수 있다는 뜻이다.  
리팩토링 해보자.

### 절차
1. 호출자가 한두 개뿐이고 피호출 함수도 간단한 단순한 상황이면, 피호출 함수의 처음(혹은 마지막)줄(들)을 잘라내어 호출자로 복사해 넣는다. 테스트만 통과하면 이번 리팩터링은 끝이다.
2. 더 복잡한 상황에서는 이동하지 '않길'원하는 모든 문장을 함수로 추출한 다음 검색하기 쉬운 임시 이름을 지어준다.
3. 원래 함수를 인라인 한다.
4. 추출된 함수의 이름을 원래 함수의 이름으로 변경한다.

### 예시
호출자가 둘뿐인 단순한 상황을 살펴보자.
```JS
function renderPerson(outStream, person) {
	outStream.write(`<p>${person.name}</p>\n`)
	renderPhoto(outStream, person.photo)
	emitPhotoData(outStream, person.photo)
}

function listRecentPhotos(outStream, photos) {
	photos
	.filter(p => p.date > renderDateCutoff())
	.forEach(p => {
		outStream.write("<div>\n")
		emitPhotoData(outStream, p)
		outStream.write("</div>\n")
	})
}

function emitPhotoData(outStream, photo) {
	outStream.write(`<p>제목: ${photo.title}</p>`)
	outStream.write(`<p>날짜: ${photo.date.toDateString()}</p>`)
	outStream.write(`<p>위치: ${photo.location}</p>`)
}
```
이 소프트웨어를 수정하여 renderPerson()은 그대로 둔 채 listRecentPhotos()가 위치 정보를 다르게 랜더링 하도록 만들어보자.  
1. 사실 이렇게 단순한 상황에서는 renderPerson()의 마지막 줄을 잘라내어 두 호출 코드 아래에 붙여 넣으면 끝이다. 하지만 더 안전한 길로 ㄱ
2. 첫 단계로 emitPhotoData()에 남길 코드를 함수로 추출한다.
```JS
function renderPerson(outStream, person) {
	outStream.write(`<p>${person.name}</p>\n`)
	renderPhoto(outStream, person.photo)
	emitPhotoData(outStream, person.photo)
}

function listRecentPhotos(outStream, photos) {
	photos
	.filter(p => p.date > renderDateCutoff())
	.forEach(p => {
		outStream.write("<div>\n")
		emitPhotoData(outStream, p)
		outStream.write("</div>\n")
	})
}

function emitPhotoData(outStream, photo) {
	// outStream.write(`<p>제목: ${photo.title}</p>`)
	// outStream.write(`<p>날짜: ${photo.date.toDateString()}</p>`)
	zztmp(outStream, photo) // 추가
	outStream.write(`<p>위치: ${photo.location}</p>`)
}

function zztmp(outStream, photo) { // 이동하지 않을 코드
	outStream.write(`<p>제목: ${photo.title}</p>`)
	outStream.write(`<p>날짜: ${photo.date.toDateString()}</p>`)
}
```
3. 다음으로 피호출 함수를 호출자들로 한 번에 하나씩 인라인 한다. renderPerson()부터 시작하자.
```JS
function renderPerson(outStream, person) {
	outStream.write(`<p>${person.name}</p>\n`)
	renderPhoto(outStream, person.photo)
	// emitPhotoData(outStream, person.photo)
	zztmp(outStream, photo) // 이동
	outStream.write(`<p>위치: ${photo.location}</p>`) // 이동
}

function listRecentPhotos(outStream, photos) {
	photos
	.filter(p => p.date > renderDateCutoff())
	.forEach(p => {
		outStream.write("<div>\n")
		emitPhotoData(outStream, p)
		outStream.write("</div>\n")
	})
}

function emitPhotoData(outStream, photo) {
	zztmp(outStream, photo)
	outStream.write(`<p>위치: ${photo.location}</p>`)
}

function zztmp(outStream, photo) {
	outStream.write(`<p>제목: ${photo.title}</p>`)
	outStream.write(`<p>날짜: ${photo.date.toDateString()}</p>`)
}
```

이 호출이 올바로 동작하는지 테스트 한 후 다음 함수에도 인라인 한다.
```JS
function renderPerson(outStream, person) {
	outStream.write(`<p>${person.name}</p>\n`)
	renderPhoto(outStream, person.photo)
	zztmp(outStream, photo)
	outStream.write(`<p>위치: ${photo.location}</p>`)
}

function listRecentPhotos(outStream, photos) {
	photos
	.filter(p => p.date > renderDateCutoff())
	.forEach(p => {
		outStream.write("<div>\n")
		// emitPhotoData(outStream, p)
		zztmp(outStream, p) // 인라인
		outStream.write(`<p>위치: ${p.location}</p>`) // 인라인
		outStream.write("</div>\n")
	})
}

function emitPhotoData(outStream, photo) {
	zztmp(outStream, photo)
	outStream.write(`<p>위치: ${photo.location}</p>`)
}

function zztmp(outStream, photo) {
	outStream.write(`<p>제목: ${photo.title}</p>`)
	outStream.write(`<p>날짜: ${photo.date.toDateString()}</p>`)
}
```
원래 함수를 지우고 함수이름을 바꾸자.
```JS
function renderPerson(outStream, person) {
	outStream.write(`<p>${person.name}</p>\n`)
	renderPhoto(outStream, person.photo)
	// zztmp(outStream, photo)
	emitPhotoData(outStream, photo)
	outStream.write(`<p>위치: ${photo.location}</p>`)
}

function listRecentPhotos(outStream, photos) {
	photos
	.filter(p => p.date > renderDateCutoff())
	.forEach(p => {
		outStream.write("<div>\n")
		// zztmp(outStream, p)
		emitPhotoData(outStream, p)
		outStream.write(`<p>위치: ${p.location}</p>`)
		outStream.write("</div>\n")
	})
}

// function emitPhotoData(outStream, photo) {
// 	zztmp(outStream, photo)
// 	outStream.write(`<p>위치: ${photo.location}</p>`)
// }

// function zztmp(outStream, photo) {
function emitPhotoData(outStream, photo) {
	outStream.write(`<p>제목: ${photo.title}</p>`)
	outStream.write(`<p>날짜: ${photo.date.toDateString()}</p>`)
}
```





















