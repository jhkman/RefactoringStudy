# 04. 테스트 구축하기
리팩터링을 제대로 하려면 불가피하게 저지르는 실수를 잡아주는 견고한 테스트 스위트(test suite)가 뒷받침 되어야 한다.  
리팩터링을 하지 않더라도 좋은 테스트를 작성하는 일은 개발 효율을 높여준다.

## 4.1 자가 테스트 코드의 가치
 - 실제 코드를 작성하는 시간의 비중은 그리 크지 않다. 대부분의 시간은 디버깅에 사용하게 된다.
 - 모든 테스트를 완전히 자동화하고 그 결과까지 스스로 검사하게 만들자. 컴파일할 때마다 테스트도 함께 실행하면 생산성이 급상승 하고, 디버깅 시간이 크게 줄어들게 된다.
 - 테스트 스위트(test suite)는 강력한 버그 검출 도구로, 버그를 찾는 데 걸리는 시간을 대폭 줄여준다.
 - 테스트를 작성하기 가장 좋은 시점으로는 프로그래밍을 시작하기 전이다.
 - 기능을 추가해야할 때 테스트부터 작성하도록 한다.
 - 테스트를 작성하다보면, 원하는 기능을 추가하기 위해 무엇이 필요한지 고민하게 되고 구현보다 인터페이스에 집중하게 된다는 장점이 있다.
 - 테스트를 모두 통과한 시점이 바로 코드를 완성한 시점이라고 할수 있다.
 - 켄트백의 TDD(Test Driven Development : 테스트 주도 개발)

> TDD?
 - 처음에는 통과하지 못할 테스트를 작성한다.
 - 이 테스트를 통과하게끔 코드를 작성한다.
 - 그 후 코드를 최대한 깔끔하게 리팩터링한다.
 - 위 과정을 짧은 주기로 반복한다.
 - 테스트 - 코딩 - 리팩터링 과정을 한 시간에도 여러 차례 진행하기 때문에 코드를 대단히 생산적이면서도 차분하게 작성 가능해진다.

## 4.2 테스트할 샘플 코드
예제 코드 참조..

## 4.3 첫번째 테스트

> 생산부족분을 제대로 계산하는지 확인하는 테스트 예제
```TS
descrube('province', function(){
  it('shortfall', function(){
    const asia = new Province(sampleProvinceData());  //1.픽스처 설정
    assert.equal(asia.shortfall, 5);                  //2.검증
  });
});
```
 - 테스트에 필요한 데이터와 객체를 뜻하는 픽스처를 설정한다.
 - 픽스처의 속성들을 검증하는데, 여기서는 주어진 초깃값에 기초하여 생산부족분을 정확히 계산했는지 확인한다.
 - 실행 결과로는 수행한 테스트와 통과한 테스트의 수만 간략히 보여주게 된다.

```TS
1 passing(61ms)
```

테스트를 실행했음에도 실패한것이 없다면 테스트가 내 의도와는 다른 방식으로 코드를 다루는건 아닌지 불안해진다.  
그래서 실패하는 모습을 한번씩은 확인해보자. 예를들어 일시적으로 코드에 오류를 주입하여 확인한다.

```TS
get shortfall(){
  return this._demand - this.totalProduction * 2;   //오류 주입
}
```
이후 테스트를 실행해보면

```TS
0 passing(72ms)
1 failing
1) province shortfall:
   AssertionError: expected -20 to equal 5
    as Context.<anonymous> (src/tester.js:10:12)
```
이처럼 테스트를 실패했을시 문제가 생겼는지 즉시 알수있고, 실패 원인을 추론할수 있는 단서도 제공한다.

## 4.4 테스트 추가하기

 - 테스트는 위험 요인을 중심으로 작성해야한다. 단순히 데이터를 읽고 쓰기만 하는 접근자는 테스트할 필요가 없다.
 - 완벽하게 만드느라 테스트를 수행하지 못하는니, 불완전한 테스트라도 작성해 실행하는게 낫다.
 - 공유 픽스처를 생성시키면, 픽스처를 사용하는 또 다른 테스트가 실패할 수도 있다.
```TS
descrube('province', function(){
  it('shortfall', function(){
    const asia = new Province(sampleProvinceData());  //픽스처 설정
    assert.equal(asia.shortfall, 5);
  });
  
  it('profit', function(){
    const asia = new Province(sampleProvinceData());  //픽스처 설정
    assert.equal(asia.profit, 230);
  });
});
```

공통된 두 픽스처를 둘다 접근할수 있는 장소로 옮겨보자
```TS
descrube('province', function(){
  const asia = new Province(sampleProvinceData());  //이런식으로 작성하면 안된다.
  it('shortfall', function(){    
    assert.equal(asia.shortfall, 5);
  });
  
  it('profit', function(){
    assert.equal(asia.profit, 230);
  });
});
```


```TS
descrube('province', function(){
  let asia;
  beforeEach(function(){
    asia = new Province(sampleProvinceData());    //beforeEach 구문을 통해 각각의 테스트 바로 전에 실행되어 asia를 초기화 하고 실행할수 있도록 구성한다.
  });
  
  it('shortfall', function(){    
    assert.equal(asia.shortfall, 5);
  });
  
  it('profit', function(){
    assert.equal(asia.profit, 230);
  });
});
```


## 4.5 픽스처 수정하기
```TS
descrube('province', function(){
  let asia;
  beforeEach(function(){
    asia = new Province(sampleProvinceData());
  });
  
  it('change production', function(){    
    asia.producers[0].production = 20;
    assert.equal(asia.shortfall, -6);
    assert.equal(asia.profit, 292);
  });
});
```
 - 이 테스트는 it 구문 하나에서 두가지 속성을 검증하고 있다.
 - 일반적으로 it 구문 하나당 검증도 하나씩만 하는게 좋다.
 - 만약 앞쪽 검증을 통과하지 못하면 나머지 검증은 실행해보지 못하고 테스트가 실패하는데, 그러면 실패 원인을 파악하는데 정보를 놓치기 쉽기 때문이다.


## 4.6 경계조건 검사하기

만약 이번 예시의 producers와 같은 컬렉션과 마주하면 그 컬렉션이 비었을 때 어떤 일이 일어나게 될까? 숫자형이라면 0이거나 음수의 경우일 때는 어떠할까?  
수요가 음수일때 수익이 음수가 나온다는게 과연 고객의 관점에서 말이 되는 소리일까? 수요의 최소값은 0이어야 하지 않을까?  
이러한 지적들을 경계를 확인하는 테스트를 작성해보면서 프로그램에서 이런 특이 상황을 어떻게 처리하는게 좋을지 생각해볼수 있다.

> 문제가 생길 가능성이 있는 경계 조건을 생각해보고 집중적으로 테스트하자.

## 4.7 끝나지 않은 여정
이 장에서 보여준 테스트는 단위 테스트에 해당한다.
 - 단위테스트란? : 코드의 작은 영역만을 대상으로 빠르게 실행되도록 설계된 테스트.
 - 이 외에도 컴포넌트 사이의 상호작용에 집중하는 테스트, 스프트웨어의 다양한 계층의 연동을 검사하는 테스트, 성능 문제를 다루는 테스트 등이 있다.
 - 제품 코드보다 테스트 코드를 수정하는 데 시간이 걸리면, 테스트를 과하게 작성한 것이지만 보통 테스트가 너무 적은 경우가 훨씬 많다.
