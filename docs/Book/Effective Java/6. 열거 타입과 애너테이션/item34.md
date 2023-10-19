# Item34. int 상수 대신 열거 타입을 사용하라
열거 타입은 일정 개수의 상수 값을 정의하고, 그 외의 값은 허용하지 않는 타입이다. 열거 타입 지원 이전엔 정수 상수를 한 묶음 선언한 정수 열거 패턴을 사용했다.

## 정수 열거 패턴
```java
// 정수 열거 패턴
public static final int APPLE_FUJI = 0;
public static final int APPLE_PIPPIN = 1;

public static final int ORANGE_NAVEL = 0;
public static final int ORANGE_TEMPLE = 1;
```
정수 열거 패턴은 단점이 많다. 타입 안전을 보장할 방법이 없고 표현력도 좋지 않다. 오렌지를 건네야 할 메서드에 사과를 보내고 `==` 연산자로 비교해도 컴파일러는 아무 오류를 내지 않는다.

정수 열거 패턴을 위한 별도 이름공간을 지원하지 않기 때문에 어쩔 수 없이 접두어를 써서 이름 충돌을 방지해야 한다. (`ELEMENT`_MERCURY, `PLANET`_MERCURY)

정수 열거 패턴을 사용한 프로그램은 깨지기 쉽다. 평범판 상수를 나열한 것뿐이라 컴파일하면 그 값이 클라이언트 파일에 그대로 새겨진다. 따라서 상수 값이 바뀌면 클라이언트도 반드시 다시 컴파일해야 한다.

정수 상수는 문자열로 출력하기가 까다롭다. 같은 정수 열거 그룹에 속한 모든 상수를 순회하는 방법도 없다. 심지어 그 안에 상수가 몇 개인지도 알 수 없다.

## 열거 타입
열거 타입은 열거 패턴의 단점을 말끔히 씻어주는 동시에 여러 장점을 안겨준다.
```java
// 열거 타입
public enum Apple { FUJI, PIPPIN }
public enum Orange { NAVEL, TEMPLE }
```
자바의 열거 타입은 완전한 현태의 클래스라서 다른 언어의 열거 타입보다 훨씬 강력하다. 열거 타입 자체는 클래스이며, 상수 하나당 자신의 인스턴스를 하나씩 만들어 public static final 필드로 공개한다.

열거 타입은 생성자를 제공하지 않으므로 사실상 final이다. 인스턴스를 직접 생성하거나 확장할 수 없으니 인스턴스는 딱 하나씩만 존재한다. 다시 말해 열거 타입은 인스턴스 통제된다.

열거 타입은 메서드나 필드를 추가할 수 있다. 각 상수와 연관된 데이터를 해당 상수 자체에 내재시킬 수 있다. 다음 예시를 살펴보자

```java
// 코드 34-3 데이터와 메서드를 갖는 열거 타입 (211쪽)
public enum Planet {
    MERCURY(3.302e+23, 2.439e6),
    VENUS  (4.869e+24, 6.052e6),
    EARTH  (5.975e+24, 6.378e6),
    MARS   (6.419e+23, 3.393e6),
    JUPITER(1.899e+27, 7.149e7),
    SATURN (5.685e+26, 6.027e7),
    URANUS (8.683e+25, 2.556e7),
    NEPTUNE(1.024e+26, 2.477e7);

    private final double mass;           // 질량(단위: 킬로그램)
    private final double radius;         // 반지름(단위: 미터)
    private final double surfaceGravity; // 표면중력(단위: m / s^2)

    // 중력상수(단위: m^3 / kg s^2)
    private static final double G = 6.67300E-11;

    // 생성자
    Planet(double mass, double radius) {
        this.mass = mass;
        this.radius = radius;
        surfaceGravity = G * mass / (radius * radius);
    }

    public double mass()           { return mass; }
    public double radius()         { return radius; }
    public double surfaceGravity() { return surfaceGravity; }

    public double surfaceWeight(double mass) {
        return mass * surfaceGravity;  // F = ma
    }
}

```
열거 타입 상수 각각을 특정 데이터와 연결지으려면 생성자에서 데이터를 받아 인스턴스 필드에 저장하면 된다. 열거 타입은 근본적으로 불면이라 모든 필드는 final이어야 한다.

열거 타입은 정의된 상수들의 값을 배열에 담아 반환하는 정적 메서드인 values를 제공한다. 값들은 선언된 순서로 저장된다. 각 열거 타입 값의 toString 메서드는 상수 이름을 문자열로 반환하므로 println과 printf로 출력하기에 안성맞춤이다.
:::code-group
```java [code]
public static void main(String[] args) {
    double earthWeight = Double.parseDouble(args[0]);
    double mass = earthWeight / Planet.EARTH.surfaceGravity();
    for (Planet p : Planet.values()) {
        System.out.printf("%s에서의 무게는 %f이다.%n", p, p.surfaceWeight(mass));
    }
}
```
``` [출력]
// 입력: 10
MERCURY에서의 무게는 3.779067이다.
VENUS에서의 무게는 9.050510이다.
EARTH에서의 무게는 10.000000이다.
MARS에서의 무게는 3.796040이다.
JUPITER에서의 무게는 25.296794이다.
SATURN에서의 무게는 10.655141이다.
URANUS에서의 무게는 9.048555이다.
NEPTUNE에서의 무게는 11.362635이다.
```
:::

## 스위치 표현식
Planet 상수들은 서로 다른 데이터와 연결되는 데 그쳤지만, 한 걸음 더 나아가 상수마다 동작이 달라져야 하는 상황도 있을 것이다. 계산기의 연산 종류를 열거 타입으로 선언하고 실제 연산까지 열거 타입 상수가 직접 수행해보자.

```java
// 값에 따라 분기하는 열거 타입, 스위치 표현식 사용
public enum Operation {
    PLUS, MINUS, TIMES, DIVIDE;

    public double apply(double x, double y) {
        return switch (this) {
            case PLUS -> x + y;
            case MINUS -> x - y;
            case TIMES -> x * y;
            case DIVIDE -> x / y;
        };
    }
}
```
JDK14에 릴리즈 된 [스위치 표현식](https://openjdk.org/jeps/361)을 사용하면, 책에 나온 단점(실제 도달할 일 없는 throw 문 작성 + 깨지기 쉬운 코드)이 모두 해소된다.

앞으로 설명할 상수별 메서드 구현을 활용한 방법보다 훨씬 깔끔해 보이기도 한다. JDK14 이후 버전에서 구현부가 복잡하지 않으면 switch 방식도 괜찮은 것 같고, 이전 버전이라면 메서드 구현 방식을 사용하자.

## 상수별 메서드 구현

```java
// 코드 34-5 상수별 메서드 구현을 활용한 열거 타입
public enum Operation {
    PLUS {public double apply(double x, double y) {return x + y;}},
    MINUS {public double apply(double x, double y) {return x - y;}},
    TIMES {public double apply(double x, double y) {return x * y;}},
    DIVIDE {public double apply(double x, double y) {return x / y;}};

    public abstract double apply(double x, double y);
}
```
apply가 추상 메서드이므로 재정의하지 않았다면 컴파일 오류로 알려준다. apply 메서드의 시그니처를 보면 double 두 개를 받아서 double을 반환하는데, 자바에서 제공하는 함수형 인터페이스인 BinaryOperator와 시그니처가 동일하다.
```java
// 함수형 인터페이스 사용
public enum Operation {
    PLUS((x, y) -> x + y),
    MINUS((x, y) -> x - y),
    TIMES((x, y) -> x * y),
    DIVIDE((x, y) -> x / y);

    final DoubleBinaryOperator operator;

    Operation(DoubleBinaryOperator operator) {
        this.operator = operator;
    }

    public double apply(double x, double y) {
        return this.operator.applyAsDouble(x, y);
    }
}
```
상수별 메서드 구현 방식에 비해 메서드 시그니처를 중복해서 작성하지 않아서 간결해 보이는 장점이 있다. 그러나 함수형 인터페이스를 생성할 때 열거형 내부의 상수는 접근하지 못하는 제약사항이 있다.

열거 타입은 상수 이름을 입력받아 그 이름에 해당하는 상수를 반환하는 valueOf(String) 메서드가 자동 생성된다. 같은 의미로, toString 메서드를 재정의할 때 toString이 반환하는 문자열을 열거 타입 상수로 변환하는 fromString 메서드도 함께 제공하는 걸 고려해보자.
```java
public enum Operation {
    PLUS("+") {public double apply(double x, double y) { return x + y; }},
    MINUS("-") {public double apply(double x, double y) { return x - y; }},
    TIMES("*") {public double apply(double x, double y) { return x * y; }},
    DIVIDE("/") {public double apply(double x, double y) { return x / y; }};

    private final String symbol;

    Operation(String symbol) { this.symbol = symbol; }

    @Override public String toString() { return symbol; }

    public abstract double apply(double x, double y);

    // 코드 34-7 열거 타입용 fromString 메서드 구현하기 (216쪽) // [!code focus:4]
    private static final Map<String, Operation> stringToEnum = 
            Stream.of(values()).collect(
                    toMap(Operation::toString, e -> e));

    // 지정한 문자열에 해당하는 Operation을 (존재한다면) 반환한다. // [!code focus:3]
    public static Optional<Operation> fromString(String symbol) { 
        return Optional.ofNullable(stringToEnum.get(symbol));
    }
}
```
Operation 상수가 stringToEnum 맵에 추가되는 시점은 열거 타입 상수 생성 후 정적 필드가 초기화될 때다. 열거 타입 상수 생성이 먼저 이루어지기 때문에 생성자에서 자신의 인스턴스를 맵에 추가할 수 없다. 정적 필드 중 
열거 타입의 생성자에서 접근할 수 있는 것은 상수 변수뿐이다. (static 상수 -> 열거 타입 상수 -> static 필드 초기화)

## 전략 열거 타입 패턴

한편, 상수별 메서드 구현에는 열거 타입 상수끼리 코드를 공유하기 어렵다는 단점이 있다. 직원의 기본 임금과 일한 시간이 주어지면 일당을 계산하는 열거 타입을 생각해보자.
```java
enum PayrollDay {
    MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY;

    private final PayType payType;
    private static final int MINS_PER_SHIFT = 8 * 60;

    PayrollDay(PayType payType) { this.payType = payType; }

    int pay(int minutesWorked, int payRate) {
        int basePay = minutesWorked * payRate;
        int overtimePay = switch (this) {
            case SATURDAY, SUNDAY -> basePay / 2;
            default -> minutesWorked <= PayType.MINS_PER_SHIFT ? 0 : (minutesWorked - PayType.MINS_PER_SHIFT) * payRate / 2;
        };
        return basePay + overtimePay;
    }
}

```
간결하지만 관리 관점에서는 위험한 코드다. 휴가와 같은 새로운 값을 열거 타입에 추가하려면 그 값을 처리하는 case 문을 잊지 말고 쌍으로 넣어줘야 한다. 자칫 깜빡하면 휴가 기간에 열심히 일해도 평일과 똑같은 임금을 받게된다.

상수별 메서드 구현으로 급여를 정확히 계산하는 방법은 두 가지다. 첫째, 계산 코드를 모든 상수에 중복해서 넣는다. 둘째, 계산 코드를 평일용과 주말용으로 나눠 메서드를 작성하고 각 상수가 자신에게 필요한 메서드를 호출하면 된다. 두 방식 모두 코드가 장황해져 가독성이 크게 떨어지고 오류 발생 가능성이 높아진다.

PayrollDay에 평일 잔업수당 계산용 메서드인 overtimePay를 구현하고, 주말 상수에서만 재정의해 쓰면 장황한 부분은 줄일 수 있다. 하지만 switch문을 썼을 때와 똑같은 단점이 나타난다. (메서드를 재정의하지 않으면 평일용 코드를 그대로 물려받음)

가장 깔끔한 방법은 새로운 상수를 추가할 때 잔업수당 '전략'을 선택하는 것이다. 잔업수당 계산을 private 중첩 열거 타입으로 옮기고 생성자에서 적절한 전략을 선택하면 된다.

```java
// 코드 34-9 전략 열거 타입 패턴 (218-219쪽)
enum PayrollDay {
    MONDAY(WEEKDAY), TUESDAY(WEEKDAY), WEDNESDAY(WEEKDAY),
    THURSDAY(WEEKDAY), FRIDAY(WEEKDAY),
    SATURDAY(WEEKEND), SUNDAY(WEEKEND);

    private final PayType payType;

    PayrollDay(PayType payType) { this.payType = payType; }
    
    int pay(int minutesWorked, int payRate) {
        return payType.pay(minutesWorked, payRate);
    }

    // 전략 열거 타입
    enum PayType {
        WEEKDAY {
            int overtimePay(int minsWorked, int payRate) {
                return minsWorked <= MINS_PER_SHIFT ? 0 :
                        (minsWorked - MINS_PER_SHIFT) * payRate / 2;
            }
        },
        WEEKEND {
            int overtimePay(int minsWorked, int payRate) {
                return minsWorked * payRate / 2;
            }
        };

        abstract int overtimePay(int mins, int payRate);
        private static final int MINS_PER_SHIFT = 8 * 60;

        int pay(int minsWorked, int payRate) {
            int basePay = minsWorked * payRate;
            return basePay + overtimePay(minsWorked, payRate);
        }
    }

    public static void main(String[] args) {
        for (PayrollDay day : values())
            System.out.printf("%-10s%d%n", day, day.pay(8 * 60, 1));
    }
}
```

기존 열거 타입에 상수별 동작을 혼합해 넣을 때는 switch 문이 좋은 선택이 될 수 있다. 서드파티에서 가져온 Operation 열거 타입이 있는데, 각 연산의 반대 연산을 반환하는 메서드가 필요한 경우 다음과 같은 정적 메서드를 제공할 수 있다.
```java
// 코드 34-10 switch 문을 이용해 원래 열거 타입에 없는 기능을 수행한다. (219쪽)
public class Inverse {
    public static Operation inverse(Operation op) {
        return switch (op) {
            case PLUS -> Operation.MINUS;
            case MINUS -> Operation.PLUS;
            case TIMES -> Operation.DIVIDE;
            case DIVIDE -> Operation.TIMES;
        };
    }
}
```
직접 만든 열거 타입이라도 추가하려는 메서드가 `의미상 열거 타입에 속하지 않거나` 열거 타입에 포함할 만큼 `유용하지 않은 경우` 이 방식을 적용하는 게 좋다.

## 열거 타입은 언제 사용하나?
필요한 원소를 컴파일타임에 다 알 수 있는 상수 집합이라면 항상 열거 타입을 사용하자. 예) 태양계 행성, 한 주의 요일, 체스 말, 연산 코드, 메뉴 아이템

열거 타입에 정의된 상수 개수가 영원히 고정 불변일 필요는 없다.
:::info 정리
열거 타입은 정수 상수보다 뛰어나다. 더 읽기 쉽고 안전하고 강력하다.

하나의 메서드가 상수별로 다르게 동작해야 한다면, switch 문 대신 상수별 메서드 구현을 사용하자.

열거 타입 상수 일부가 같은 동작을 공유한다면 전략 열거 타입 패턴을 사용하자.
:::
