# Item3. private 생성자나 열거 타입으로 싱글턴임을 보증하라

## 싱글턴이란?
인스턴스를 오직 하나만 생성할 수 있는 클래스로 만드는 방식은 크게 두가지가 있다.

## public static final 필드 방식의 싱글턴
```java
public class Foo {
    public static final foo INSTANCE = new Foo();
    private Foo() {}
}
```
private 생성자는 Elvis.INSTANCE를 초기화할 때 딱 한번만 호출된다.

## 정적 팩터리 메서드 방식의 싱글턴
```java
public class Foo {
    private static final Foo INSTANCE = new Foo();
    private Foo() {}
    public static Foo getInstance() {
        return INSTANCE;
    }
}
```

첫 번째 방식의 장점은 간결하고, 해당 클래스가 싱글턴임이 API에 명백히 드러난다. 두 번째 방식의 장점은 API를 바꾸지 않고도 싱글턴이 아니게 변경할 수 있고, 호출하는 스레드별로 다른 인스턴스를 넘겨줄 수 있고(제네릭 싱글턴 팩터리), 메서드 참조를 supplier로 사용할 수 있다.
두 번째 방식의 장점이 필요하지 않으면 간단한 첫 번째 방식을 사용하자.

두 방식으로 만든 싱글턴 클래스를 직렬화하려면 Serializable을 선언하는 것만으로는 부족하다. 모든 인스턴스 필드를 transient로 선언하고 readResolve 메서드를 제공해야 한다. 
```java
private Object readResolve() {
    return INSTANCE;
}
```

### 열거 타입 싱글턴
```java
public enum Foo {
    INSTANCE
}
```
첫 번째 방식보다 더 간결하고, 직렬화할 수 잇고, 리플렉션 공격도 막을 수 있다. 

::: info 정리
만들려는 싱글턴이 Enum외의 클래스를 상속하는 경우가 아니라면 Enum으로 구현하자.
:::
