# Item38. 확장할 수 있는 열거 타입이 필요하면 인터페이스를 사용하라

대부분 상황에서 열거 타입을 확장하는건 좋지 않은 생각이다. 확장성을 높이려면 고려할 요소가 늘어나 설계와 구현이 더 복잡해진다.

그런데 확장할 수 잇는 열거 타입이 어울리는 쓰임이 최소한 하나는 있다. 바로 연산코드다. 이따금 API가 제공하는 기본 연산 외에 사용자 확장 연산을 추가할 수 있도록 열어줘야 할 때가 있다.

열거 타입은 임의의 인터페이스를 구현할 수 있으니, 연산 코드용 인터페이스를 정의하고 열거 타입이 이 인터페이스를 구현하면 된다.
```java
// 연산 코드 인터페이스
public interface Operation {
    double apply(double x, double y);
}
```
```java
// 연산 코드 인터페이스를 이용해 확장 가능 열거 타입을 흉내 냈다. - 기본 구현 (233쪽)
public enum BasicOperation implements Operation {
    PLUS("+") {
        public double apply(double x, double y) { return x + y; }
    },
    MINUS("-") {
        public double apply(double x, double y) { return x - y; }
    },
    TIMES("*") {
        public double apply(double x, double y) { return x * y; }
    },
    DIVIDE("/") {
        public double apply(double x, double y) { return x / y; }
    };

    private final String symbol;

    BasicOperation(String symbol) {
        this.symbol = symbol;
    }

    @Override public String toString() {
        return symbol;
    }
}
```
```java
// 코드 38-2 확장 가능 열거 타입 (233-235쪽)
public enum ExtendedOperation implements Operation {
    EXP("^") {
        public double apply(double x, double y) {
            return Math.pow(x, y);
        }
    },
    REMAINDER("%") {
        public double apply(double x, double y) {
            return x % y;
        }
    };
    private final String symbol;

    ExtendedOperation(String symbol) {
        this.symbol = symbol;
    }

    @Override
    public String toString() {
        return symbol;
    }
}
```
새로 작성한 연산은 기존 연산을 쓰던 곳이면 어디든 쓸 수 있다.

개별 인스턴스 수준에서뿐 아니라 타입 수준에서도, 기본 열거 타입 대신 확장된 열거 타입을 넘겨 확장된 열거 타입의 원소 모두를 사용하게 할 수도 있다.
```java
// 열거 타입의 Class 객체를 이용해 확장된 열거 타입의 모든 원소를 사용하는 예 (234쪽)
public static void main(String[] args) {
    double x = Double.parseDouble(args[0]);
    double y = Double.parseDouble(args[1]);
    test(ExtendedOperation.class, x, y);
}
private static <T extends Enum<T> & Operation> void test(
        Class<T> opEnumType, double x, double y) {
    for (Operation op : opEnumType.getEnumConstants())
        System.out.printf("%f %s %f = %f%n", x, op, y, op.apply(x, y));
}
```
class 리터럴은 한정적 타입 토큰(item 33) 역할을 한다. opEnumType 매개변수의 선언은 Class 객체가 열거 타입인 동시에 Operation의 하위 타입이어야 한다는 뜻이다.

두 번째 방법은 Class 객체 대신 한정적 와일드카드 타입(item 31)인 Collection<? extends Operation>을 넘기는 방법이다.

```java
// 컬렉션 인스턴스를 이용해 확장된 열거 타입의 모든 원소를 사용하는 예 (235쪽)
public static void main(String[] args) {
    double x = Double.parseDouble(args[0]);
    double y = Double.parseDouble(args[1]);
    test(Arrays.asList(ExtendedOperation.values()), x, y);
}
private static void test(Collection<? extends Operation> opSet,
    double x, double y) {
    for (Operation op : opSet)
        System.out.printf("%f %s %f = %f%n", x, op, y, op.apply(x, y));
}
```
여러 구현 타입의 연산을 조합해 호출할 수 있게 되었다.

인터페이스를 이용한 확장 방식에도 문제점이 있다. 바로 열거 타입끼리 구현을 상속할 수 없다는 점이다. Operation 예는 연산 기호를 저장하고 찾는 로직이 BasicOperation과 extendedOperation 모두에 들어가야 한다.

공유하는 기능이 많다면 그 부분을 별도의 도우미 클래스나 정적 도우미 메서드로 분리해 코드 중복을 없애자.

:::info 정리
인터페이스를 활용해 열거 타입을 확장할 수 있다.

클라이언트는 이 인터페이스를 구현해 자신만의 열거 타입을 만들 수 있다.
:::
