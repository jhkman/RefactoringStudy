# 07. 캡슐화

## 7.4 임시 변수를 질의 함수로 바꾸기

> 질의함수란? 연산을 통해 값을 계산하여 반환하는 함수. 질의는 내부, 외부의 값을 변경시켜서 부수효과를 만들어선 안된다.

```JS
const basePrice = this._quantity * this._itemPrice;
if (basePrice > 1000)
    return basePrice * 0.95;
else
    return basePrice * 0.98;
```
->
```JS
get basePrice = {this._quantity * this._tiemPrice;}
...
if (basePrice > 1000)
    return basePrice * 0.95;
else
    return basePrice * 0.98;
```

### 절차
1. 변수가 사용되기 전에 값이 확실히 결정되는지, 변수를 사용할 때마다 계산 로직이 매번 다른 결과를 내지는 않는지 확인한다.
2. 읽기전용으로 만들수 있는 변수는 읽기전용으로 만든다.
3. 테스트한다.
4. 변수 대입문을 함수로 추출한다.
5. 테스트한다.
6. 변수 인라인하기로 임시변수를 제거한다.


### 효과
1. 비슷한 계산 처리를 재 사용할 수 있어 코드 중복이 줄어든다.
2. 코드간에 부자연스러운 의존관계나 부수효과를 찾아내어 제거할 수 있다.
