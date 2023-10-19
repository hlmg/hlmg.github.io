# Item47. 반환 타입으로는 스트림보다 컬렉션이 낫다

스트림은 반복을 지원하지 않는다. 따라서 스트림과 반복을 알맞게 조합해야 좋은 코드가 나온다. API를 스트림만 반환하도록 짜놓으면 반환된 스트림을 for-each로 반복하길 원하는 사용자는 당연히 불만을 토로할 것이다.

API가 스트림, Iterable 중 하나의 타입으로만 반환하면, 사용자는 적절한 어댑터를 구현해서 문제를 해결해야 한다.
```java
// 스트림 <-> 반복자 어댑터 (285-286쪽)
public class Adapters {
    // 코드 47-3 Stream<E>를 Iterable<E>로 중개해주는 어댑터 (285쪽)
    public static <E> Iterable<E> iterableOf(Stream<E> stream) {
        return () -> stream.iterator();
    }

    // 코드 47-4 Iterable<E>를 Stream<E>로 중개해주는 어댑터 (286쪽)
    public static <E> Stream<E> streamOf(Iterable<E> iterable) {
        return StreamSupport.stream(iterable.spliterator(), false);
    }
}
```
Collection 인터페이스는 Iterable의 하위 타입이고 stream 메서드도 제공하니 반복과 스트림을 동시에 지원한다. 따라서 원소 시퀀스를 반환하는 공개 API의 반환 타입에는 Collection이나 그 하위 타입을 쓰는 게 최선이다. (Arrays도 가능)

반환하는 시퀀스의 크기가 메모리에 올려도 안전할 만큼 작다면 ArrayList나 HashSet 같은 표준 컬렉션 구현체를 반환하자. 시퀀스 크기가 큰 경우 표현을 간결하게 할 수 있다면 전용 컬렉션을 구현하자.

:::info 정리
원소 시퀀스를 반환하는 메서드를 작성할 때는, 이를 스트림으로 처리하기를 원하는 사용자와 반복으로 처리하길 원하는 사용자가 모두 있을 수 있음을 떠올리고, 양쪽을 다 만족시키려 노력하자.

컬렉션을 반환할 수 있으면 그렇게 하자. 단, 원소가 많은 경우 전용 컬렉션 구현을 고민해야 한다.

컬렉션을 반환하는 게 불가능하면 스트림과 Iterable 중 더 자연스러운 것을 반환하자.
:::
