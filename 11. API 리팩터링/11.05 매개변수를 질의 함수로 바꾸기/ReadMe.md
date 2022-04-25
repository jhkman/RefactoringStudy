# 11. API 리팩터링
## 11.5 매개변수를 질의 함수로 바꾸기
```JS
availableVacation(anEmployee, anEmployee.grade); 
function availableVacation(anEmployee, grade) { 
  // 연휴 계산...
```
->
```JS
availableVacation(anEmployee) 
function availableVacation(anEmployee) { 
  const grade = anEmployee.grade; 
  // 연휴 계산...
```

### 배경
매개변수 목록에서 중복은 피하는게 좋고, 짧을수록 이해하기 쉽다.  
피호출 함수가 스스로 쉽게 결정할 수 있는 값을 매개변수로 건네는 것도 불필요한 작업이므로 일종의 중복이다.

### 절차
1. 필요하다면 대상 매개변수의 값을 계산하는 코드를 별도 함수로 추출한다.
2. 함수 본문에서 대상 매개변수로의 참조를 모두 찾아 그 매개변수의 값을 만들어주는 표현식을 참조하도록 변경한다. 하나 수정할때마다 테스트한다.
3. 함수 선언 바꾸기로 대상 매개변수를 없엔다.

### 예시

다른 리팩터링을 수행한뒤 특정 매개변수가 더는 필요 없어졌을 떄가 있다. 다음 코드를 보자
> Order 클래스
```JS
get finalPrice(){
  const basePrice = this.quantity * this.itemPrice;
  let discountLevel;
  
  if(this.quantity > 100) discountLevel = 2;
  else discountLevel = 1;
  
  return this.discountPrice(basePrice, discountLevel);
}

discountPrice(basePrice, discountLevel){
  switch(discountLevel){
    case 1: return basePrice * 0.95;
    case 2: return basePrice * 0.9;
  }
}
```
이 함수중 finalPrice() 함수를 간소화해보자 (임시변수를 질의 함수로 변경)
> Order 클래스
```JS
get finalPrice(){
  const basePrice = this.quantity * this.itemPrice;   
  return this.discountPrice(basePrice, this.discountLevel);
}

get discountLevel(){
  return (this.quantity > 100) ? 2 : 1;
}
```
이러한 결과를 통해 discountPrice() 함수에 discountLevel의 반환값을 보낼 이유가 사라졌다. 직접 호출하면 되기 때문이다.

1. 이 매개변수를 참조하는 코드를 모두 함수 호출로 변경하자.
> Order 클래스
```JS
discountPrice(basePrice, discountLevel){
  switch(this.discountLevel){
    case 1: return basePrice * 0.95;
    case 2: return basePrice * 0.9;
  }
}
```
2. 이제 함수 선언 바꾸기로 이 매개변수를 없앨 수 있다.
> Order 클래스
```JS
get finalPrice(){
  const basePrice = this.quantity * this.itemPrice;   
  return this.discountPrice(basePrice);
}

get discountLevel(){
  return (this.quantity > 100) ? 2 : 1;
}

discountPrice(basePrice){
  switch(this.discountLevel){
    case 1: return basePrice * 0.95;
    case 2: return basePrice * 0.9;
  }
}
```
