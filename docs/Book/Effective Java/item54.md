# Item54. null이 아닌, 빈 컬렉션이나 배열을 반환하라

null을 반환하면 클라이언트는 null을 처리하는 코드를 추가로 작성해야한다.

빈 컬렉션과 배열은 새로 할당하지 않고도 반환할 수 있다. 대부분의 상황엔 다음처럼 사용하면 된다.
```java
public List<Cheese> getCheeses() {
    return new ArrayList<>(cheesesInStock);
}
```
사용 패턴에 따라 빈 컬렉션 할당이 성능을 눈에 띄게 떨어트린다면 매번 빈 불변 컬렉션을 반환하자.
```java
public List<Cheese> getCheeses() {
    return cheesesInStock.isEmpty() ? Collections.emptyList() : new ArrayList<>(cheesesInStock);
}
```
Set이 필요하면 emptySet, 맵이 필요하면 emptyMap을 사용하면 된다.

배열도 마찬가지로 절대 null을 반환하지 말고 길이가 0인 배열을 반환하자.
```java
public Cheese[] getCheeses() {
    return cheesesInStock.toArray(new Cheese[0]);
}
```
이 방법도 다음처럼 최적화할 수 있다.
```java
private static final Cheese[] EMPTY_CHEESE_ARRAY = new Cheese[0];

public Cheese[] getCheeses() {
    return cheesesInStock.toArray(EMPTY_CHEESE_ARRAY);
}
```
cheesesInStock이 비어있으면 언제나 EMPTY_CHEESE_ARRAY를 반환한다.
- `<T> T[] List.toArray(T[] a)` 메서드는 주어진 배열 a가 충분히 크면 a에 원소를 담고 그렇지 않으면 T[] 타입 배열을 새로 만들어 그 안에 원소를 담는다.

다음처럼 성능 향상 목적으로 toArray에 넘기는 배열을 미리 할당하는 건 추천하지 않는다. 오히려 성능이 떨어질 수도 있다.
```java
public Cheese[] getCheeses() {
    return cheesesInStock.toArray(new Cheese[cheesesInStock.size()]);
}
```
:::info 정리
null이 아닌 빈 배열이나 컬렉션을 반환하자.
:::
