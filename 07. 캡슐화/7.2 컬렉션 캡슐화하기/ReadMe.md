# 07. 캡슐화

## 7.2 컬렉션 캡슐화하기
```JS
class Person{
  get courses() {return this._courses;}
  set courses(aList) {this._courses = aList}
  ...
}
```
->
```JS
class Person{
  get courses() {return this._courses.slice()}
  addCourse(aCourse) {...}
  removeCourse(aCoures){...}
}
```

### 절차
1. 아직 컬렉션을 캡슐화하지 않았다면 변수 캡슐화하기 부터 한다.
2. 컬렉션에 원소를 추가/제거하는 함수를 추가한다(컬렉션 자체를 통쨰로 바꾸는 세터는 제거한다. 세터를 제거할 수 없다면 인수로 받은 컬렉션을 복제해 저장하도록 만든다.)
3. 정적 검사를 수행한다.
4. 컬렉션을 참조하는 부분을 모두 찾는다. 컬렉션의 변경자를 호출하는 코드가 모두 앞에서 추가한 추가/제거 함수를 호출하도록 수정한다. 하나씩 수정할 때마다 테스트한다.
5. 컬렉션 게터를 수정해서 원본 내용을 수정할 수 없는 읽기전용 프락시나 복제본을 반환하게 한다.
6. 테스트한다.

### 효과
1. 컬렉션 원본을 외부에서 직접 변경할 수 없도록 하는 리팩터링 하며, 모듈 밖에서 컬렉션이 수정되어 발생하는 문제를 예방할수 있다.
2. 중요한 점은 코드베이스에서 컬렉션 접근 함수의 처리 방식이 통일되도록 해야 한다.

### 예시
> 수업목록(course)을 필드로 지니고 있는 Person 클래스를 예로 들어보자
```JS
class Person{
  constructor(name){
    this._name = name;
    this._courses = [];
  }
  
  get name() {return this._name;}
  get courses() {return this._courses}
  set courses(aList) {this._courses = aList;}
}

class Courses{
  constructor(name){
    this._name = name;
    this._isAdvanced = [];
  }
  get name() {return this._name;}
  get isAdvanced() {return this._isAdvanced;}
}
```
클라이언트는 Person이 제공하는 수업컬렉션에서 수업정보를 얻는다.
```JS
numAdvancedCourses = aPerson.courses
  .filter(c => c.isAdvanced)
  .length;
```

2. 클라이언트가 수업을 하나씩 추가하고 제거하는 메서드를 Person에 추가해보자
```JS
class Person{
  ...
  addCourse(aCourse){
    this._couses.push(aCourses);
  }
  
  removeCourses(aCourses, fnIfAbsent = () => {throw new RangeError();}){
    const index = this._courses.indexOf(aCourse);
    if(index === -1) fnIfAbsent();
    else this._cousrses.splice(index, 1);
  }
}
```

4. 그 후 컬렉션의 변경자를 직접 호출하는 코드를 방금 추가한 메서드를 사용하도록 변경한다.
```JS
for(const name of readBasicCourseNames(filename)){
  aPerson,addCourse(new Course(name, false))
}
```

2. 위와같이 개별원소를 추가하고 제거하는 메서드를 제공하기에 setCourses()룰 사용할 일이 없어졌으니 제거한다.
