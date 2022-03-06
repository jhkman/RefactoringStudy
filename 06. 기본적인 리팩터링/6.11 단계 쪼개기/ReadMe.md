# 06. 기본적인 리팩터링

## 6.11 단계 쪼개기

```JS
const orderData = orderString.split(/\s+/);
const productPrice = priceList[orderData[0].split("-")[1]];
const orderPrice = parseInt(orderData[1]) * productPrice;
```
->
```JS
const orderRecord = parseOrder(order);
const orderPrice = price(orderRecord, priceList);

function parseOrder(aString) {
	const values = aString.split(/\s+/);
	return ({
		productId: values[0].split("-")[1], 
		quantity: parseInt(values[1]),
	});
}
function price(order, priceList) {
	return order.quantity * priceList[order.productID];
}
```

### 배경 
서로 다른 두 대상을 한꺼번에 다루는 코드를 발견하면 각각 별개 모듈로 나누자. 코드를 수정해야 할 때 두 대상을 동시에 생각할 필요 없이 하나에만 집중하기 위해서!  

### 절차
1. 두 번째 단계에 해당하는 코드를 독립 함수로 추출한다.
2. 테스트 한다. 
3. 중간 데이터 구조를 만들어서 앞에서 추출한 함수의 인수로 추가한다.
4. 테스트 한다. 
5. 추출한 두 번째 단계 함수의 매개변수를 하나씩 검토한다. 그중 첫 번쨰 단계에서 사용되는 것은 중간 데이터 구조로 옮긴다. 하나씩 옮길 때마다 테스트한다. 
6. 첫 번째 단계 코드를 함수로 추출하면서 중간 데이터 구조를 반환하도록 만든다. 

### 예시
상품의 결제 금액을 계산하는 코드
```JS
function priceOrder(product, quantity, shippingMethod) {
	const basePrice = product.basePrice * quantity;
	const discount = Math.max(quantity - product.discountThreshold, 0) * productPrice.basePrice * product.discountRate;
	const shippingPerCase = (basePrice > shippingMethod.discountThreshold) ? shippingMethod.discountFee : shippingMethod.feePerCase;
	const shippingCost = quantity * shoppingPerCase;
	const price = basePrice - discount + shippingCost;
	return price;
}
```
계산이 두 단계로 이루어진다.  
1. 상품 정보를 이용해서 결제 금액중 상품 가격을 계산하는 코드  
2. 배송 정보를 이용하여 결제 금액중 배송비를 계산하는 코드  
두단계로 나누자.

### 리팩터링
#### 1. 먼저 배송비 계산 부분을 함수로 추출한다.
```JS
function priceOrder(product, quantity, shippingMethod) {
	const basePrice = product.basePrice * quantity;
	const discount = Math.max(quantity - product.discountThreshold, 0) * productPrice.basePrice * product.discountRate;
	// const shippingPerCase = (basePrice > shippingMethod.discountThreshold) ? shippingMethod.discountFee : shippingMethod.feePerCase;
	// const shippingCost = quantity * shoppingPerCase;
	// const price = basePrice - discount + shippingCost;
	const price = applyShipping(basePrice, shippingMethod, quantity, discount);
	return price;
}

function applyShipping(basePrice, shippingMethod, quantity, discount) { // 두 번쨰 단계를 처리하는 함수
	const shippingPerCase = (basePrice > shippingMethod.discountThreshold) ? shippingMethod.discountFee : shippingMethod.feePerCase;
	const shippingCost = quantity * shoppingPerCase;
	const price = basePrice - discount + shippingCost;
	return price;
}
```

#### 3. 다음으로 첫 번째 단계와 두 번째 단계가 주고받을 중간 데이터 구조를 만든다. 

```JS
function priceOrder(product, quantity, shippingMethod) {
	const basePrice = product.basePrice * quantity;
	const discount = Math.max(quantity - product.discountThreshold, 0) * productPrice.basePrice * product.discountRate;
	const priceData = {}; // 중간 데이터 구조
	// const price = applyShipping(basePrice, shippingMethod, quantity, discount);
	const price = applyShipping(priceData, basePrice, shippingMethod, quantity, discount);
	return price;
}

// function applyShipping(basePrice, shippingMethod, quantity, discount) {
function applyShipping(priceData, basePrice, shippingMethod, quantity, discount) {
	const shippingPerCase = (basePrice > shippingMethod.discountThreshold) ? shippingMethod.discountFee : shippingMethod.feePerCase;
	const shippingCost = quantity * shoppingPerCase;
	const price = basePrice - discount + shippingCost;
	return price;
}
```

#### 5. 이제 applyShipping()에 전달되는 매개변수를 수정해보자.

```JS
function priceOrder(product, quantity, shippingMethod) {
	const basePrice = product.basePrice * quantity;
	const discount = Math.max(quantity - product.discountThreshold, 0) * productPrice.basePrice * product.discountRate;
	// const priceData = {};
	const priceData = {basePrice: basePrice};
	// const price = applyShipping(priceData, basePrice, shippingMethod, quantity, discount);
	const price = applyShipping(priceData, shippingMethod, quantity, discount);
	return price;
}

// function applyShipping(priceData, basePrice, shippingMethod, quantity, discount) {
function applyShipping(priceData, shippingMethod, quantity, discount) {
	// const shippingPerCase = (basePrice > shippingMethod.discountThreshold) ? shippingMethod.discountFee : shippingMethod.feePerCase;
	const shippingPerCase = (priceData.basePrice > shippingMethod.discountThreshold) ? shippingMethod.discountFee : shippingMethod.feePerCase;
	const shippingCost = quantity * shoppingPerCase;
	// const price = basePrice - discount + shippingCost;
	const price = priceData.basePrice - discount + shippingCost;
	return price;
}
```

다음으로 shippingMethod를 보자. 이 매개변수는 첫 번째 단계에서는 사용하지 않으니 그대로 둔다.  
그 다음 quantity는 첫 번째 단계에서 사용하지만 거기서 생성된 것은 아니다. 그래서 내비둬도 되지만 옮기자.  

```JS
function priceOrder(product, quantity, shippingMethod) {
	const basePrice = product.basePrice * quantity;
	const discount = Math.max(quantity - product.discountThreshold, 0) * productPrice.basePrice * product.discountRate;
	// const priceData = {basePrice: basePrice};
	const priceData = {basePrice: basePrice, quantity: quantity};
	// const price = applyShipping(priceData, shippingMethod, quantity, discount);
	const price = applyShipping(priceData, shippingMethod, discount);
	return price;
}

// function applyShipping(priceData, shippingMethod, quantity, discount) {
function applyShipping(priceData, shippingMethod, discount) {
	const shippingPerCase = (priceData.basePrice > shippingMethod.discountThreshold) ? shippingMethod.discountFee : shippingMethod.feePerCase;
	// const shippingCost = quantity * shoppingPerCase;
	const shippingCost = priceData.quantity * shoppingPerCase;
	const price = priceData.basePrice - discount + shippingCost;
	return price;
}
```

discount도 처리해주자.

```JS
function priceOrder(product, quantity, shippingMethod) {
	const basePrice = product.basePrice * quantity;
	const discount = Math.max(quantity - product.discountThreshold, 0) * productPrice.basePrice * product.discountRate;
	// const priceData = {basePrice: basePrice, quantity: quantity};
	const priceData = {basePrice: basePrice, quantity: quantity, discount: discount};
	// const price = applyShipping(priceData, shippingMethod, discount);
	const price = applyShipping(priceData, shippingMethod);
	return price;
}

// function applyShipping(priceData, shippingMethod, discount) {
function applyShipping(priceData, shippingMethod) {
	const shippingPerCase = (priceData.basePrice > shippingMethod.discountThreshold) ? shippingMethod.discountFee : shippingMethod.feePerCase;
	const shippingCost = priceData.quantity * shoppingPerCase;
	// const price = priceData.basePrice - discount + shippingCost;
	const price = priceData.basePrice - priceData.discount + shippingCost;
	return price;
}
```

#### 매개 변수들을 모두 처리하면 중간 데이터 구조가 완성된다. 6. 이제 첫 번쨰 단계 코드를 함수로 추출하고 이 데이터 구조를 반환하게 한다.

```JS
function priceOrder(product, quantity, shippingMethod) {
	// const basePrice = product.basePrice * quantity;
	// const discount = Math.max(quantity - product.discountThreshold, 0) * productPrice.basePrice * product.discountRate;
	// const priceData = {basePrice: basePrice, quantity: quantity, discount: discount};
	const priceData = calculatePricingData(product, quantity);
	const price = applyShipping(priceData, shippingMethod);
	return price;
}

function calculatePricingData(product, quantity) { // 첫 번째 단계를 처리하는 함수
	const basePrice = product.basePrice * quantity;
	const discount = Math.max(quantity - product.discountThreshold, 0) * productPrice.basePrice * product.discountRate;
	return {basePrice: basePrice, quantity: quantity, discount: discount};
}

function applyShipping(priceData, shippingMethod) { // 두 번째 단계를 처리하는 함수
	const shippingPerCase = (priceData.basePrice > shippingMethod.discountThreshold) ? shippingMethod.discountFee : shippingMethod.feePerCase;
	const shippingCost = priceData.quantity * shoppingPerCase;
	const price = priceData.basePrice - priceData.discount + shippingCost;
	return price;
}
```

상수를 정리해주자

```JS
function priceOrder(product, quantity, shippingMethod) {
	const priceData = calculatePricingData(product, quantity);
	// const price = applyShipping(priceData, shippingMethod);
	// return price;
	return applyShipping(priceData, shippingMethod);
}

function calculatePricingData(product, quantity) {
	const basePrice = product.basePrice * quantity;
	const discount = Math.max(quantity - product.discountThreshold, 0) * productPrice.basePrice * product.discountRate;
	return {basePrice: basePrice, quantity: quantity, discount: discount};
}

function applyShipping(priceData, shippingMethod) {
	const shippingPerCase = (priceData.basePrice > shippingMethod.discountThreshold) ? shippingMethod.discountFee : shippingMethod.feePerCase;
	const shippingCost = priceData.quantity * shoppingPerCase;
	// const price = priceData.basePrice - priceData.discount + shippingCost;
	// return price;
	return priceData.basePrice - priceData.discount + shippingCost;
}
```

### 예시: 명령줄 프로그램 쪼개기(자바)
JSON 파일에 담긴 주문의 개수를 세는 자바 프로그램

```JAVA
public static void main(String[] args) {
	try {
		if (args.length == 0) throw new RuntimeException("파일명을 입력하세요.");
		String fileName = args[args.length - 1];
		File input = Paths.get(fileName).toFile();
		ObjectMapper mapper = new ObjectMapper();
		Order[] orders = mapper.readValue(input, Order[].class);
		if (Stream.of(args).anyMatch(arg -> "-r".equals(arg)))
			System.out.println(Stream.of(orders).filter(o -> "ready".equals(o.status)).count());
		else 
			System.out.println(orders.length);
	} catch (Exception e) {
		System.err.println(e);
		System.exit(1);
	}
}
```
이 프로그램은 명령줄에서 실행할 때 주문이 담긴 파일 이름을 인수로 받는다. 이떄 옵션인 -r 플래그를 지정하면 "ready" 상태인 주문만 센다.  
이 코드는 두가지 일을 한다.  
1. 주문 목록을 읽어서 개수를 센다.
2. 명령줄 인수를 담은 배열을 읽어서 프로그램의 동작을 결정한다.  
  
리팩터링 하자.

```JAVA
public static void main(String[] args) {
	try {
		// if (args.length == 0) throw new RuntimeException("파일명을 입력하세요.");
		// String fileName = args[args.length - 1];
		// File input = Paths.get(fileName).toFile();
		// ObjectMapper mapper = new ObjectMapper();
		// Order[] orders = mapper.readValue(input, Order[].class);
		// if (Stream.of(args).anyMatch(arg -> "-r".equals(arg)))
		// 	System.out.println(Stream.of(orders).filter(o -> "ready".equals(o.status)).count());
		// else 
		// 	System.out.println(orders.length);
		run(args);
	} catch (Exception e) {
		System.err.println(e);
		System.exit(1);
	}
}

static void run(String[] args) throws IOException {
	if (args.length == 0) throw new RuntimeException("파일명을 입력하세요.");
	String fileName = args[args.length - 1];
	File input = Paths.get(fileName).toFile();
	ObjectMapper mapper = new ObjectMapper();
	Order[] orders = mapper.readValue(input, Order[].class);
	if (Stream.of(args).anyMatch(arg -> "-r".equals(arg)))
		System.out.println(Stream.of(orders).filter(o -> "ready".equals(o.status)).count());
	else 
		System.out.println(orders.length);
}
```

run() 메서드를 테스트코드에서 쉽게 호출할 수 있도록 접근 범위를 패키지로 설정했다.  
이 메서드를 자바 프로세스 안에서 호출할 수 있지만, 결과를 받아보려면 표준 출력으로 보내는 방식을 수정해야한다.  
이 문제는 System.out을 호출하는 문장을 호출한 곳으로 옮겨 해결한다. 

```JAVA
public static void main(String[] args) {
	try {
		// run(args);
		System.out.println(run(args));
	} catch (Exception e) {
		System.err.println(e);
		System.exit(1);
	}
}

static void run(String[] args) throws IOException {
	if (args.length == 0) throw new RuntimeException("파일명을 입력하세요.");
	String fileName = args[args.length - 1];
	File input = Paths.get(fileName).toFile();
	ObjectMapper mapper = new ObjectMapper();
	Order[] orders = mapper.readValue(input, Order[].class);
	if (Stream.of(args).anyMatch(arg -> "-r".equals(arg)))
		// System.out.println(Stream.of(orders).filter(o -> "ready".equals(o.status)).count());
		return Stream.of(orders).filter(o -> "ready".equals(o.status)).count();
	else 
		// System.out.println(orders.length);
		return orders.length;
}
```
이렇게 하면 JUnit 테스트를 작성할 수 있다.

#### 이제 단계를 쪼개자. 가장먼저 할 일은 두 번째 단계에 해당하는 코드를 독립된 메서드로 추출하는 것이다.

```JAVA
public static void main(String[] args) {
	try {
		System.out.println(run(args));
	} catch (Exception e) {
		System.err.println(e);
		System.exit(1);
	}
}

static void run(String[] args) throws IOException {
	if (args.length == 0) throw new RuntimeException("파일명을 입력하세요.");
	String fileName = args[args.length - 1];
	// File input = Paths.get(fileName).toFile();
	// ObjectMapper mapper = new ObjectMapper();
	// Order[] orders = mapper.readValue(input, Order[].class);
	// if (Stream.of(args).anyMatch(arg -> "-r".equals(arg)))
	// 	return Stream.of(orders).filter(o -> "ready".equals(o.status)).count();
	// else 
	// 	return orders.length;
	return countOrders(args, fileName);
}

private static long countOrders(String[] args, String fileName) throws IOException { // 분리
	File input = Paths.get(fileName).toFile();
	ObjectMapper mapper = new ObjectMapper();
	Order[] orders = mapper.readValue(input, Order[].class);
	if (Stream.of(args).anyMatch(arg -> "-r".equals(arg)))
		return Stream.of(orders).filter(o -> "ready".equals(o.status)).count();
	else 
		return orders.length;
}
```

#### 3. 다음으로 중간 데이터 구조를 추가한다.

```JAVA
public static void main(String[] args) {
	try {
		System.out.println(run(args));
	} catch (Exception e) {
		System.err.println(e);
		System.exit(1);
	}
}

static void run(String[] args) throws IOException {
	if (args.length == 0) throw new RuntimeException("파일명을 입력하세요.");
	CommandLine commandLine = new CommandLine(); // 중간 데이터 구조 추가
	String fileName = args[args.length - 1];
	// return countOrders(args, fileName);
	return countOrders(commandLine, args, fileName);
}

// private static long countOrders(String[] args, String fileName) throws IOException {
private static long countOrders(CommandLine commandLine, String[] args, String fileName) throws IOException {
	File input = Paths.get(fileName).toFile();
	ObjectMapper mapper = new ObjectMapper();
	Order[] orders = mapper.readValue(input, Order[].class);
	if (Stream.of(args).anyMatch(arg -> "-r".equals(arg)))
		return Stream.of(orders).filter(o -> "ready".equals(o.status)).count();
	else 
		return orders.length;
}

private static class CommandLine {} // 추가
```

#### 5. 이제 두 번째 단계인 countOrders()로 전달되는 다른 인수들을 살펴보자.  
args는 첫 번째 단계에서 사용하는데, 이를 두 번째 단계까지 노출하는 건 적절치 않다.  
args를 처리하기 위해 가장 먼저 할 일은 이 값을 사용하는 부분을 찾아서 그 결과를 추출하는 것이다. (변수로 추출)

```JAVA
public static void main(String[] args) {
	try {
		System.out.println(run(args));
	} catch (Exception e) {
		System.err.println(e);
		System.exit(1);
	}
}

static void run(String[] args) throws IOException {
	if (args.length == 0) throw new RuntimeException("파일명을 입력하세요.");
	CommandLine commandLine = new CommandLine();
	String fileName = args[args.length - 1];
	return countOrders(commandLine, args, fileName);
}

private static long countOrders(CommandLine commandLine, String[] args, String fileName) throws IOException {
	File input = Paths.get(fileName).toFile();
	ObjectMapper mapper = new ObjectMapper();
	Order[] orders = mapper.readValue(input, Order[].class);
	boolean onlyCountReady = Stream.of(args).anyMatch(arg -> "-r".equals(arg)); // 추출
	// if (Stream.of(args).anyMatch(arg -> "-r".equals(arg)))
	if (onlyCountReady)
		return Stream.of(orders).filter(o -> "ready".equals(o.status)).count();
	else 
		return orders.length;
}

private static class CommandLine {}
```

그런 다음 이 값을 중간 데이터 구조로 옮긴다.
```JAVA
public static void main(String[] args) {
	try {
		System.out.println(run(args));
	} catch (Exception e) {
		System.err.println(e);
		System.exit(1);
	}
}

static void run(String[] args) throws IOException {
	if (args.length == 0) throw new RuntimeException("파일명을 입력하세요.");
	CommandLine commandLine = new CommandLine();
	String fileName = args[args.length - 1];
	return countOrders(commandLine, args, fileName);
}

private static long countOrders(CommandLine commandLine, String[] args, String fileName) throws IOException {
	File input = Paths.get(fileName).toFile();
	ObjectMapper mapper = new ObjectMapper();
	Order[] orders = mapper.readValue(input, Order[].class);
	// boolean onlyCountReady = Stream.of(args).anyMatch(arg -> "-r".equals(arg));
	commandLine.onlyCountReady = Stream.of(args).anyMatch(arg -> "-r".equals(arg));
	if (onlyCountReady)
		return Stream.of(orders).filter(o -> "ready".equals(o.status)).count();
	else 
		return orders.length;
}

private static class CommandLine {
	boolean onlyCountReady; // 추가
}
```

다음으로 onlyCountReady에 값을 설정하는 문장을 호출한 곳으로 옮긴다. 
```JAVA
public static void main(String[] args) {
	try {
		System.out.println(run(args));
	} catch (Exception e) {
		System.err.println(e);
		System.exit(1);
	}
}

static void run(String[] args) throws IOException {
	if (args.length == 0) throw new RuntimeException("파일명을 입력하세요.");
	CommandLine commandLine = new CommandLine();
	String fileName = args[args.length - 1];
	commandLine.onlyCountReady = Stream.of(args).anyMatch(arg -> "-r".equals(arg)); // 이동
	return countOrders(commandLine, args, fileName);
}

private static long countOrders(CommandLine commandLine, String[] args, String fileName) throws IOException {
	File input = Paths.get(fileName).toFile();
	ObjectMapper mapper = new ObjectMapper();
	Order[] orders = mapper.readValue(input, Order[].class);
	// commandLine.onlyCountReady = Stream.of(args).anyMatch(arg -> "-r".equals(arg));
	if (onlyCountReady)
		return Stream.of(orders).filter(o -> "ready".equals(o.status)).count();
	else 
		return orders.length;
}

private static class CommandLine {
	boolean onlyCountReady;
}
```

이어서 fileName 매개변수를 중간 데이터 구조인 CommandLine 객체로 옮긴다.

```JAVA
public static void main(String[] args) {
	try {
		System.out.println(run(args));
	} catch (Exception e) {
		System.err.println(e);
		System.exit(1);
	}
}

static void run(String[] args) throws IOException {
	if (args.length == 0) throw new RuntimeException("파일명을 입력하세요.");
	CommandLine commandLine = new CommandLine();
	// String fileName = args[args.length - 1];
	commandLine.fileName = args[args.length - 1];
	commandLine.onlyCountReady = Stream.of(args).anyMatch(arg -> "-r".equals(arg));
	// return countOrders(commandLine, args, fileName);
	return countOrders(commandLine);
}

// private static long countOrders(CommandLine commandLine, String[] args, String fileName) throws IOException {
private static long countOrders(CommandLine commandLine) throws IOException {
	File input = Paths.get(fileName).toFile();
	ObjectMapper mapper = new ObjectMapper();
	Order[] orders = mapper.readValue(input, Order[].class);
	if (onlyCountReady)
		return Stream.of(orders).filter(o -> "ready".equals(o.status)).count();
	else 
		return orders.length;
}

private static class CommandLine {
	boolean onlyCountReady;
	String fileName; // 추가
}
```

매개 변수 처리가 다 끝났으니 6. 이제 첫 번째 단계의 코드를 메서드로 추출한다.

```JAVA
public static void main(String[] args) {
	try {
		System.out.println(run(args));
	} catch (Exception e) {
		System.err.println(e);
		System.exit(1);
	}
}

static void run(String[] args) throws IOException {
	// if (args.length == 0) throw new RuntimeException("파일명을 입력하세요.");
	// CommandLine commandLine = new CommandLine();
	// commandLine.fileName = args[args.length - 1];
	// commandLine.onlyCountReady = Stream.of(args).anyMatch(arg -> "-r".equals(arg));
	CommandLine commandLine = parseCommandLine(args);
	return countOrders(commandLine);
}

private static CommandLine parseCommandLine(String[] args) {
	if (args.length == 0) throw new RuntimeException("파일명을 입력하세요.");
	CommandLine commandLine = new CommandLine();
	commandLine.fileName = args[args.length - 1];
	commandLine.onlyCountReady = Stream.of(args).anyMatch(arg -> "-r".equals(arg));
	return commandLine;
}

private static long countOrders(CommandLine commandLine) throws IOException {
	File input = Paths.get(fileName).toFile();
	ObjectMapper mapper = new ObjectMapper();
	Order[] orders = mapper.readValue(input, Order[].class);
	if (onlyCountReady)
		return Stream.of(orders).filter(o -> "ready".equals(o.status)).count();
	else 
		return orders.length;
}

private static class CommandLine {
	boolean onlyCountReady;
	String fileName;
}
```

마저 정리해주자.

```JAVA
public static void main(String[] args) {
	try {
		System.out.println(run(args));
	} catch (Exception e) {
		System.err.println(e);
		System.exit(1);
	}
}

static void run(String[] args) throws IOException {
	// CommandLine commandLine = parseCommandLine(args);
	// return countOrders(commandLine);
	return countOrders(parseCommandLine(args));
}

private static CommandLine parseCommandLine(String[] args) {
	if (args.length == 0) throw new RuntimeException("파일명을 입력하세요.");
	// CommandLine commandLine = new CommandLine();
	CommandLine result = new CommandLine();
	// commandLine.fileName = args[args.length - 1];
	result.fileName = args[args.length - 1];
	// commandLine.onlyCountReady = Stream.of(args).anyMatch(arg -> "-r".equals(arg));
	result.onlyCountReady = Stream.of(args).anyMatch(arg -> "-r".equals(arg));
	// return commandLine;
	return result;
}

private static long countOrders(CommandLine commandLine) throws IOException {
	File input = Paths.get(fileName).toFile();
	ObjectMapper mapper = new ObjectMapper();
	Order[] orders = mapper.readValue(input, Order[].class);
	if (onlyCountReady)
		return Stream.of(orders).filter(o -> "ready".equals(o.status)).count();
	else 
		return orders.length;
}

private static class CommandLine {
	boolean onlyCountReady;
	String fileName;
}
```

### 예시: 첫 번째 단계에 변환기 사용하기(자바)
앞 예시에서 명령줄 인수를 담은 문자열 배열을 두 번째 단계에 적합한 인터페이스로 바꿔주는 변환기 객체를 만들어도 된다.

```JAVA
public static void main(String[] args) {
	try {
		System.out.println(run(args));
	} catch (Exception e) {
		System.err.println(e);
		System.exit(1);
	}
}

static void run(String[] args) throws IOException {
	if (args.length == 0) throw new RuntimeException("파일명을 입력하세요.");
	CommandLine commandLine = new CommandLine();
	String fileName = args[args.length - 1];
	return countOrders(commandLine, args, fileName);
}

private static long countOrders(CommandLine commandLine, String[] args, String fileName) throws IOException {
	File input = Paths.get(fileName).toFile();
	ObjectMapper mapper = new ObjectMapper();
	Order[] orders = mapper.readValue(input, Order[].class);
	boolean onlyCountReady = Stream.of(args).anyMatch(arg -> "-r".equals(arg));
	if (onlyCountReady)
		return Stream.of(orders).filter(o -> "ready".equals(o.status)).count();
	else 
		return orders.length;
}

private static class CommandLine {}
```
앞 예시에서는 동작을 포함할 수 있는 객체 대신 레코드 구조를 만들었기 때문에, 내부 클래스를 만들고 나중에 public 데이터를 맴버를 채웠지만 다음과 같이 변경할 수 도 있다.

```JAVA

static void run(String[] args) throws IOException {
	if (args.length == 0) throw new RuntimeException("파일명을 입력하세요.");
	CommandLine commandLine = new CommandLine();
	String fileName = args[args.length - 1];
	return countOrders(commandLine, args, fileName);
}

private static long countOrders(CommandLine commandLine, String[] args, String fileName) throws IOException {
	File input = Paths.get(fileName).toFile();
	ObjectMapper mapper = new ObjectMapper();
	Order[] orders = mapper.readValue(input, Order[].class);
	boolean onlyCountReady = Stream.of(args).anyMatch(arg -> "-r".equals(arg));
	if (onlyCountReady)
		return Stream.of(orders).filter(o -> "ready".equals(o.status)).count();
	else 
		return orders.length;
}

// private static class CommandLine {}
public class CommandLine {
	String[] args;

	public CommandLine(String[] args) {
		this.args = args;
	}
}
```
이 클래스는 생성자에서 인수 배열을 받아서 첫 단계 로직이 할 일을 수행한다. 이를 위해 fileName을 임시 변수를 질의 함수로 바꾸기(7.4)를 이용해보자

```JAVA

static void run(String[] args) throws IOException {
	if (args.length == 0) throw new RuntimeException("파일명을 입력하세요.");
	CommandLine commandLine = new CommandLine();
	// String fileName = args[args.length - 1];
	// return countOrders(commandLine, args, fileName);
	return countOrders(commandLine, args, fileName(args));
}

private static long countOrders(CommandLine commandLine, String[] args, String fileName) throws IOException {
	File input = Paths.get(fileName).toFile();
	ObjectMapper mapper = new ObjectMapper();
	Order[] orders = mapper.readValue(input, Order[].class);
	boolean onlyCountReady = Stream.of(args).anyMatch(arg -> "-r".equals(arg));
	if (onlyCountReady)
		return Stream.of(orders).filter(o -> "ready".equals(o.status)).count();
	else 
		return orders.length;
}

private static String fileName(String[] args) { // 추가
	return args[args.length - 1];
}

public class CommandLine {
	String[] args;

	public CommandLine(String[] args) {
		this.args = args;
	}
}
```

바로 이어서 질의 메서드를 CommandLine 클래스로 옮긴다(함수 옮기기 8.1)

```JAVA

static void run(String[] args) throws IOException {
	if (args.length == 0) throw new RuntimeException("파일명을 입력하세요.");
	CommandLine commandLine = new CommandLine();
	// return countOrders(commandLine, args, fileName(args));
	return countOrders(commandLine, args, commandLine.fileName());
}

private static long countOrders(CommandLine commandLine, String[] args, String fileName) throws IOException {
	File input = Paths.get(fileName).toFile();
	ObjectMapper mapper = new ObjectMapper();
	Order[] orders = mapper.readValue(input, Order[].class);
	boolean onlyCountReady = Stream.of(args).anyMatch(arg -> "-r".equals(arg));
	if (onlyCountReady)
		return Stream.of(orders).filter(o -> "ready".equals(o.status)).count();
	else 
		return orders.length;
}

// private static String fileName(String[] args) {
// 	return args[args.length - 1];
// }

public class CommandLine {
	String[] args;

	public CommandLine(String[] args) {
		this.args = args;
	}

	String fileName(String[] args) { // 이동
		return args[args.length - 1];
	}
}
```

이제 함수 선언 바꾸기(6.5)로 countOrders()가 새로 만든 메서드를 사용하도록 고치자
```JAVA

static void run(String[] args) throws IOException {
	if (args.length == 0) throw new RuntimeException("파일명을 입력하세요.");
	CommandLine commandLine = new CommandLine();
	// return countOrders(commandLine, args, commandLine.fileName());
	return countOrders(commandLine, args);
}

// private static long countOrders(CommandLine commandLine, String[] args, String fileName) throws IOException {
private static long countOrders(CommandLine commandLine, String[] args) throws IOException {
	// File input = Paths.get(fileName).toFile();
	File input = Paths.get(commandLine.fileName()).toFile();

	ObjectMapper mapper = new ObjectMapper();
	Order[] orders = mapper.readValue(input, Order[].class);
	boolean onlyCountReady = Stream.of(args).anyMatch(arg -> "-r".equals(arg));
	if (onlyCountReady)
		return Stream.of(orders).filter(o -> "ready".equals(o.status)).count();
	else 
		return orders.length;
}

public class CommandLine {
	String[] args;

	public CommandLine(String[] args) {
		this.args = args;
	}

	String fileName(String[] args) {
		return args[args.length - 1];
	}
}
```
아직 args는 제거하면 안 된다. 조건문에서 사용하고 있기 떄문에.. 조건식을 추출해보자
```JAVA

static void run(String[] args) throws IOException {
	if (args.length == 0) throw new RuntimeException("파일명을 입력하세요.");
	CommandLine commandLine = new CommandLine();
	return countOrders(commandLine, args);
}

private static long countOrders(CommandLine commandLine, String[] args) throws IOException {
	File input = Paths.get(commandLine.fileName()).toFile();

	ObjectMapper mapper = new ObjectMapper();
	Order[] orders = mapper.readValue(input, Order[].class);
	// boolean onlyCountReady = Stream.of(args).anyMatch(arg -> "-r".equals(arg));
	// if (onlyCountReady)
	if (onlyCountReady(args))
		return Stream.of(orders).filter(o -> "ready".equals(o.status)).count();
	else 
		return orders.length;
}

private static boolean onlyCountReady(String[] args) { // 조건식 추출
	return Stream.of(args).anyMatch(arg -> "-r".equals(arg));
}

public class CommandLine {
	String[] args;

	public CommandLine(String[] args) {
		this.args = args;
	}

	String fileName(String[] args) {
		return args[args.length - 1];
	}
}
```
그런 다음 이 메서드를 CommandLine 클래스로 옮기고 args 매개변수를 삭제한다.
```JAVA

static void run(String[] args) throws IOException {
	if (args.length == 0) throw new RuntimeException("파일명을 입력하세요.");
	CommandLine commandLine = new CommandLine();
	// return countOrders(commandLine, args);
	return countOrders(commandLine);
}

// private static long countOrders(CommandLine commandLine, String[] args) throws IOException {
private static long countOrders(CommandLine commandLine) throws IOException {
	File input = Paths.get(commandLine.fileName()).toFile();

	ObjectMapper mapper = new ObjectMapper();
	Order[] orders = mapper.readValue(input, Order[].class);
	// if (onlyCountReady(args))
	if (commandLine.onlyCountReady())
		return Stream.of(orders).filter(o -> "ready".equals(o.status)).count();
	else 
		return orders.length;
}

// private static boolean onlyCountReady(String[] args) {
// 	return Stream.of(args).anyMatch(arg -> "-r".equals(arg));
// }

public class CommandLine {
	String[] args;

	public CommandLine(String[] args) {
		this.args = args;
	}

	String fileName(String[] args) {
		return args[args.length - 1];
	}

	boolean onlyCountReady(String[] args) { // 이동
		return Stream.of(args).anyMatch(arg -> "-r".equals(arg));
	}
}
```
명령줄 인수가 존재하는지 검사하는 부분도 옮겨주자
```JAVA

static void run(String[] args) throws IOException {
	// if (args.length == 0) throw new RuntimeException("파일명을 입력하세요.");
	CommandLine commandLine = new CommandLine();
	return countOrders(commandLine);
}

private static long countOrders(CommandLine commandLine) throws IOException {
	File input = Paths.get(commandLine.fileName()).toFile();

	ObjectMapper mapper = new ObjectMapper();
	Order[] orders = mapper.readValue(input, Order[].class);
	if (commandLine.onlyCountReady())
		return Stream.of(orders).filter(o -> "ready".equals(o.status)).count();
	else 
		return orders.length;
}

public class CommandLine {
	String[] args;

	public CommandLine(String[] args) {
		this.args = args;
		if (args.length == 0) throw new RuntimeException("파일명을 입력하세요."); // 이동 됨
	}

	String fileName(String[] args) {
		return args[args.length - 1];
	}

	boolean onlyCountReady(String[] args) {
		return Stream.of(args).anyMatch(arg -> "-r".equals(arg));
	}
}
```














