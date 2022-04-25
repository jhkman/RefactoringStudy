# 11. API 리팩터링
## 11.4 객체 통째로 넘기기
```JS
const low = aRoom.daysTempRange.low;
const high = aRoom.daysTempRange.high;

if (aPlan.withinRange(low, high)){
  ...
}
```
->
```JS
if (aPlan.withinRange(aRoom.daysTempRange)){
  ...
}
```

### 배경
레코드에서 값 두어 개를 가져와 인수로 넘기는 경우 레코드를 통채로 넘기는게 변화에 대응하기 쉽다.  
한편, 객체의 특정 기능을 사용하는 코드가 많다면, 그 기능만 따로 묶어서 클래스로 추출(7.5) 하라는 신호일 수 있다.

### 절차
1. 매개변수들을 원하는 형태로 받는 빈 함수를 만든다. -> 마지막 단계에서 이 함수의 이름을 변경하므로 검색하기 쉬운이름으로 지어준다.
2. 새 함수의 본문에서는 원래 함수를 호출하도록 하며, 새 매개변수와 원래 함수의 매개변수를 매핑한다.
3. 정적 검사를 수행한다.
4. 모든 호출자가 새함수를 사용하게 수정한다. 하나씩 수정하며 테스트하자.
5. 호출자를 모두 수정했다면 원래 함수를 인라인 한다.
6. 새 함수의 이름을 적절히 수정하고 모든 호출자에 반영한다.

### 예시
다음 코드는 실내온도 모니터링 시스템이다. 일일 최저·최고 기온이 난방계획(heating plan)에서 정한 범위를 벗어나는지 확인한다.
> 호출자
```JS
const low = aRoom.daysTempRange.low;
const high = aRoom.daysTempRange.high;

if(!aPlan.withinRange(low, high))
  arerts.push("방 온도가 지정 범위를 벗어났습니다.");
```
> HeatingPlan 클래스
```JS
withinRange(bottom, top){
  return (bottom >= this._tempearatureRange.low)
         && (top <= this._tempearatureRange.high);
}
```

1. 가장먼저 원하는 인터페이스를 갖춘 빈 메서드를 만든다. 기존 withinRange() 메서드를 대체할것이기 때문에 적당한 접두어를 붙이자.
> HeatingPlan 클래스
```JS
xxNEWwithinRange(aNumberRange){
}
```

2. 그런다음 새 메서드의 본문은 기존 withinRange()를 호출하는 코드로 채운다. 자연스럽게 새 매개변수를 기존 매개변수와 매핑하는 로직이 만들어진다.
> HeatingPlan 클래스
```JS
xxNEWwithinRange(aNumberRange){
  return this.withinRange(aNumberRange.low, aNumberRange.high);
}
```

4. 기존 함수를 호출하는 코드를 찾아서 새 함수를 호출하게 만들고, 기존코드중 더는 필요없는 부분은 제거한다.
> 호출자
```JS
//const low = aRoom.daysTempRange.low;        //필요없는 부분 제거
//const high = aRoom.daysTempRange.high;      //필요없는 부분 제거

if(!aPlan.xxNEWwithinRange(aRoom.daysTempRange))
  arerts.push("방 온도가 지정 범위를 벗어났습니다.");
```

이런식으로 한번에 하나씩 수정하면서 테스트한다.


