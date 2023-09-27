# Item14. Comparable을 구현할지 고려하라

Comparable을 구현한 객체는 비교를 활용하는 클래스를 사용할 수 있다. 비교를 활용하는 알고리즘은 정렬된 컬렉션인 TreeSet, TreeMap 과 정렬 알고리즘을 활용하는 유틸리티 클래스인 Collections, Arrays가 있다.
  
## compareTo 메서드
Comparable을 구현한 객체는 compareTo 메서드를 정의해야 하는데, compareTo의 일반 규약은 equals의 규약과 비슷하다, 그래서 주의사항도 같은데 equals의 주의사항은 다음과 같았다.
> 구체 클래스를 확장해 새로운 값을 추가하면서 equals 규약을 만족시킬 방법은 존재하지 않는다.

equals와 마찬가지로 상속해서 값을 추가하지 말고, 원래 클래스의 인스턴스를 가리키는 필드를 두고 뷰를 반환하는 메서드를 추가하자.

compareTo의 마지막 규약은 다음과 같은데
> `(x.compareTo(y) == 0) == (x.equals(y))`

compareTo로 수행한 동치성 테스트의 결과가 equals와 같아야 한다는 것이다. 이를 지키면 compareTo로 줄지은 순서와 equals의 결과가 일관되게 된다.

compareTo의 순서와 equals의 순서가 일관되지 않은 클래스도 동작은 하지만 이 클래스의 객체를 정렬된 컬렉션에 넣으면 아래처럼 해당 컬렉션이 구현한 인터페이스에 정의된 동작과 다른 동작을 할 것이다.
```java
public static void main(String[] args) {
    Set<BigDecimal> set1 = new TreeSet<>();
    Set<BigDecimal> set2 = new HashSet<>();
    BigDecimal d1 = new BigDecimal("1.0");
    BigDecimal d2 = new BigDecimal("1.00");
    set1.add(d1);
    set1.add(d2);
    set2.add(d1);
    set2.add(d2);
    System.out.println(set1.size()); // 1
    System.out.println(set2.size()); // 2
}
```
HashSet은 동치성을 비교할 때 Objects.equals로 비교를 하지만 정렬된 컬렉션인 TreeSet은 compareTo를 사용해서 발생하는 차이다.

## compareTo 작성 요령
compareTo 메서드는 각 필드가 동치인지를 비교하는 게 아니라 그 순서를 비교한다. 객체 참조 필드를 비교하려면 compareTo 메서드를 재귀적으로 호출한다. Comparable을 구현하지 않은 필드나 표준이 아닌 순서로 비교해야 한다면 비교자(Comparator)를 대신 사용한다.

비교자는 직접 만들거나 자바가 제공하는 것 중에 골라 쓰면 된다.
```java
// 자바가 제공하는 비교자 사용 예
public final class CaseInsensitiveString implements Comparable<CaseInsensitiveString> {
    public int compareTo(CaseInsensitiveString cis) {
        return String.CASE_INSENSITIVE_ORDER.compare(s, cis.s);
    }
}
```
compareTo 메서드에서 필드를 비교할때는 관계 연산자 `<`, `>` 대신 박싱 클래스들에 있는 정적 메서드인 `compare`를 이용하자.

클래스에 핵심 필드가 여러 개라면 가장 핵심적인 필드부터 비교하고, 비교 결과가 0이 아니면 그 결과를 곧장 반환하자.
```java
// 기본 타입 필드가 여럿일 때의 비교자
public int compareTo(PhoneNumber pn) {
    int result = Short.compare(areaCode, pn.areaCode); // 가장 중요한 필드
    if (result == 0) {
        result = Short.compare(prefix, pn.prefix); // 두 번째로 중요한 필드
        if (result == 0)
            result = Short.compare(lineNum, pn.lineNum); // 세 번째로 중요한 필드
    }
}
```
자바 8에선 비교자 생성 메서드를 사용해 메서드 연쇄 방식으로 비교자를 생성할 수 있다.
```java
// 코드 14-3 비교자 생성 메서드를 활용한 비교자 (92쪽)
private static final Comparator<PhoneNumber> COMPARATOR =
        comparingInt((PhoneNumber pn) -> pn.areaCode)
        .thenComparingInt(pn -> pn.prefix)
        .thenComparingInt(pn -> pn.lineNum);

public int compareTo(PhoneNumber pn) {
        return COMPARATOR.compare(this, pn);
}
```
이 방식은 간결하지만, 약간의 성능 저하가 뒤따른다.

이따금 '값의 차'를 기준으로 첫 번째 값이 두 번째 값보다 작으면 음수를, 두 값이 같으면 0을, 첫 번째 값이 크면 양수를 반환하는 compareTo나 compare 를 볼 수 있다.
```java
static Comparator<Object> hashCodeOrder = new Comparator<>() {
    public int compare(Object o1, Object o2) {
        return o1.hashCode() - o2.hashCode(); // 추이성 위배
    }
}
```
이 방식은 사용하면 안 된다. 이 방식은 정수 오버플로를 일으키거나 IEEE754 부동소수점 계산 방식에 따른 오류를 낼 수 있다. 대신 다음 두 방식 중 하나를 사용하자.
```java
// 정적 compare 메서드 활용
static Comparator<Object> hashCodeOrder = new Comparator<>() {
    public int compare(Object o1, Object o2) {
        return Integer.compare(o1.hashCode(), o2.hashCode());
    }
}
```
```java
// 비교자 생성 메서드 활용
static Comparator<Object> hashCodeOrder = Comparator.comparingInt(o -> o.hashCode());
```
:::info 정리
순서를 고려해야 하는 값 클래스를 작성한다면 꼭 Comparable 인터페이스를 구현하자. (알파벳, 숫자, 연대 ...)

compareTo 메서드에서 필드의 값을 비교할 때 <, > 연산자 대신 박싱타입의 정적 compare 메서드(`Double.compare()`)나 Comparator 인터페이스가 제공하는 비교자 생성 메서드(`Comparator.comparing()`)를 사용하자.
:::
