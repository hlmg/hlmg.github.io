# Item52. 다중정의는 신중히 사용하라

다중정의(overloading)한 메서드는, 컴파일타입에 어느 메서드를 호출할지 결정하게 된다.

따라서 런타임에 타입이 달라지는 건 아무 의미가 없는데 이를 생각하고 아래 코드의 출력을 예상해보자.

```java
public class CollectionClassifier {
    public static String classify(Set<?> s) {
        return "집합";
    }

    public static String classify(List<?> lst) {
        return "리스트";
    }

    public static String classify(Collection<?> c) {
        return "그 외";
    }

    public static void main(String[] args) {
        Collection<?>[] collections = {
                new HashSet<String>(),
                new ArrayList<BigInteger>(),
                new HashMap<String, String>().values()
        };

        for (Collection<?> c : collections)
            System.out.println(classify(c));
    }
}
```
컴파일 타임에 반복문 안의 c는 항상 Collection<?> 타입이다 따라서 세번째 classify만 3번 호출되게 된다.

런타임에 동적으로 선택되는 재정의(overriding)와 다르게 동작하기 때문에 직관과 어긋나는 결과를 보여준다.

따라서, 위의 classify를 다음과 같이 수정해서 사용자가 혼동을 일으키는 상황을 피해야 한다.

```java
// 수정된 컬렉션 분류기 (314쪽)
public static String classify(Collection<?> c) {
    return c instanceof Set  ? "집합" :
            c instanceof List ? "리스트" : "그 외";
}
```
## 다중정의 주의점

안전하고 보수적으로 가려면 매개변수 수가 같은 다중정의는 만들지 말자. 가변 인수를 사용하는 메서드라면 다중정의를 아예 하지 말아야 한다.(item 53)

지키기 어렵다면, 다중정의 대신 메서드 이름을 다르게 지어서 혼동을 방지하자.

생성자는 이름을 다르게 지을 수 없으니 매개변수 수가 같은 다중정의를 할 수도 있다. 이럴땐 정적 팩터리를 사용하는 게 가장 좋고, 매개변수 수가 같더라도 그 중 어느 것이 주어진 매개변수 집합을 처리할지가 명확히 구분될때만 다중정의를 사용하자.

자바의 제네릭과 오토박싱도 다중정의할 때 주의해야하는 사항이다. List를 사용할 때 `list.remove(3)`을 하면 3번째 인덱스의 원소가 제거된다. 만약 3이라는 Integer 객체를 지우고 싶다면, `list.remove((Integer)3)`을 사용해야 한다.

람다와 메서드 참조 역시 다중 정의 시 혼란을 키웠다. 다중정의된 메서드가 함수형 인터페이스를 인수로 받을 때, 서로 다른 함수형 인터페이스라도 인수 위치가 같으면 혼란이 생긴다. 따라서 메서드를 다중정의할 때, 서로 다른 함수형 인터페이스라도 같은 위치의 인수로 받지 말자.

:::info 정리
매개변수 수가 같으면 다중정의를 피하자. 불가능한 경우 헷갈릴 만한 매개변수는 형변환하여 정확한 다중정의 메서드가 선택되도록 하자.
:::