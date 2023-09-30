# Item36. 비트 필드 대신 EnumSet을 사용하라

열거한 값들이 주로 집합으로 사용될 경우 비트 필드를 사용하지 말고 EnumSet을 사용하자.

java.util 패키지의 EnumSet 클래스는 열거 타입 상수의 값으로 구성된 집합을 효과적으로 표현해준다. Set 인터페이스를 완벽히 구현하며 타입 안전하고 다른 어떤 Set 구현체와도 함께 사용할 수 있다.

EnumSet의 내부는 비트 벡터로 구현되었다. 원소가 총 64개 이하라면, EnumSet 전체를 long 변수 하나로 표현하여 비트 필드에 비견되는 성능을 보여준다. removeAll과 retainAll 같은 대량 작업은 비트를 효율적으로 처리할 수 있는 산술 연산을 써서 구현했다.

그러면서도 비트를 직접 다룰 때 흔히 겪는 오류들에서 해방된다. 난해한 작업을 EnumSet이 다 처리해주기 때문이다.

```java
// 코드 36-2 EnumSet - 비트 필드를 대체하는 현대적 기법 (224쪽)
public class Text {
    public enum Style {BOLD, ITALIC, UNDERLINE, STRIKETHROUGH}

    // 어떤 Set을 넘겨도 되나, EnumSet이 가장 좋다.
    public void applyStyles(Set<Style> styles) {
        System.out.printf("Applying styles %s to text%n", Objects.requireNonNull(styles));
    }

    // 사용 예
    public static void main(String[] args) {
        Text text = new Text();
        text.applyStyles(EnumSet.of(Style.BOLD, Style.ITALIC)); // [!code hl]
    }
}
```
:::info 정리
EnumSet 클래스는 비트 필드 수준의 명료함과 성능을 제공하고 열거 타입의 장점까지 제공한다.

불변 EnumSet을 사용하려면 Collections.unmodifiableSet으로 EnumSet을 감싸 사용하자.
:::
