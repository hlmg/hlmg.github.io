# Item4. 인스턴스화를 막으려면 private 생성자를 사용하라

::: info 유틸리티 클래스
정적 메서드와 정적 필드만 가진 클래스 (`java.lang.Math`, `java.util.Arrays`)
:::

유틸리티 클래스는 인스턴스화가 필요하지 않지만 의도치 않게 인스턴스화하는 경우가 있다.

## 생성자 자동 생성
컴파일러는 기본 생성자가 명시되지 않으면 자동으로 기본 생성자를 만들어준다.
```java
public class Foo {
    // 컴파일러가 자동으로 기본 생성자를 만들어준다.
    // public Foo() {
    // }

    public static void main(String[] args) {
        Foo foo = new Foo(); // 자동 생성된 기본 생성자 사용
    }
}
```

## 추상 클래스
추상 클래스도 인스턴스화를 막을 수 없다. 하위 클래스를 만들어 인스턴스화할 수 있기 때문이다. 사용자는 추상 클래스를 보고 상속해서 사용하는 걸로 오해할 가능성도 생긴다.

```java
public class Foo {
    // 인스턴스화 방지
    private Foo() {
    }

    public static void main(String[] args) {
        Foo foo = new Foo(); // Compile Error
    }
}
```
## private 생성자
클라이언트가 생성자를 호출하지 못하므로 인스턴스화를 막을 수 있고, 자식이 부모의 생성자를 호출하지 못하기 때문에 상속을 불가능하게 하는 효과도 있다. 
