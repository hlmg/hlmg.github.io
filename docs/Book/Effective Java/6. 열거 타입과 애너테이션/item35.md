# Item35. ordinal 메서드 대신 인스턴스 필드를 사용하라

대부분의 열거 타입 상수는 자연스럽게 하나의 정숫값에 대응된다. 모든 열거 타입은 해당 상수가 그 열거 타입에서 몇 번째 위치인지를 반환하는 ordinal이라는 메서드를 제공한다.

이런 이유로 열거 타입 상수와 연결된 정수값이 필요하면 ordinal 메서드를 이용하고 싶은 유혹에 빠진다.
```java
// ordinal을 잘못 사용한 예
public enum Ensemble {
    SOLO, DUET, TRIO, QUARTET, QUINTET,
    SEXTET, SEPTET, OCTET, DOUBLE_QUARTET,
    NONET, DECTET, TRIPLE_QUARTET;
    
    public int numberOfMusicians() { return ordinal() + 1; } // [!code hl]
}
```
동작은 하지만 유지보수하기 힘든 코드다. 상수 선언 순서를 바꾸는 순간 오동작하고 이미 사용 중인 정수와 값이 같은 상수는 추가할 방법이 없다.

해결책은 간단하다. 열거 타입 상수에 연결된 값은 ordinal 메서드로 얻지 말고 인스턴스 필드에 저장하자.

```java
// 인스턴스 필드에 정수 데이터를 저장하는 열거 타입 (222쪽)
public enum Ensemble {
    SOLO(1), DUET(2), TRIO(3), QUARTET(4), QUINTET(5),
    SEXTET(6), SEPTET(7), OCTET(8), DOUBLE_QUARTET(8),
    NONET(9), DECTET(10), TRIPLE_QUARTET(12);

    private final int numberOfMusicians;
    Ensemble(int size) { this.numberOfMusicians = size; }
    public int numberOfMusicians() { return numberOfMusicians; }
}
```

:::info 정리
ordinal은 EnumSet과 EnumMap 같이 열거 타입 기반의 범용 자료구조에서 사용할 목적으로 설계되었다. 따라서 이런 용도가 아니라면 ordinal 메서드는 절대 사용하지 말자.
:::
