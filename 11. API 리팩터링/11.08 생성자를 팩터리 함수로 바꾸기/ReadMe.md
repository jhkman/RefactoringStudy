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

### 절차
1. 팩터리 함수를 만든다. 팩터리 함수의 본문에서는 원래의 생성자를 호출한다.
2. 생성자를 호출하던 코드를 팩터리 함수 호출로 바꾼다.
3. 하나씩 수정할때마다 테스트한다.
4. 생성자의 가시 범위가 최소가 되도록 제한한다.
