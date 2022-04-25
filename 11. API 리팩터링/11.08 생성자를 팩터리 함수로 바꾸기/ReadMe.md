# 11. API 리팩터링
## 11.8 생성자를 팩터리 함수로 바꾸기
```JS
leadEngineer = new Employee(document.leadEngineer, 'E');
```
->
```JS
leadEngineer = createEngineer(document.leadEngineer);
```

### 배경
기본 생성자는 반드시 그 인스턴스를 반환해야 하므로 서브클래스 등을 반환 시키거나 함수 이름을 변경할 수 없다.  
팩터리 함수는 제약없이 생성하고 다양한 처리를 수행할 수 있다.

### 절차
1. 팩터리 함수를 만든다. 팩터리 함수의 본문에서는 원래의 생성자를 호출한다.
2. 생성자를 호출하던 코드를 팩터리 함수 호출로 바꾼다.
3. 하나씩 수정할때마다 테스트한다.
4. 생성자의 가시 범위가 최소가 되도록 제한한다.

### 예시
직원 유형을 다루는, 간단하지만 이상한 예를 살펴보자
> Employee 클래스
```JS
constructor(name, typeCode){
  this._name = name;
  this._typeCode = typeCode;
}

get name() { return this._name; }
get type() { return Employee.legalTYpeCodes[this._typeCode]; }

static get legalTYpeCodes(){
  return {"E" : "Engineer", "M" : "Manager", "S" : "Salesperson"}
}
```
> 호출자
```JS
  candidate = new Employee(document.name, document.empType);
  
  const leadEngineer = new Employee(document.leadEngineer, 'E');
```

1. 첫번째로는 팩터리 함수 만들기다. 팩터리 본문은 단순히 생성자에 위임하는 방식으로 구현한다.
> 최상위
```JS
  function createEmployee(name, typeCode){
    return new Employee(name, typeCode);
  }
```
2. 그런다음 생성자를 호출하는 곳을 찾아 수정한다. 한번에 하나씩, 생성자 대신 팩터리 함수를 사용하게 바꾼다.
> 호출자
```JS
  candidate = createEmployee(document.name, document.empType);
  
  const leadEngineer = createEmployee(document.leadEngineer, 'E');
```

