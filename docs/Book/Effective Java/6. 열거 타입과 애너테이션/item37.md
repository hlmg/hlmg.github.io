# Item37. ordinal 인덱싱 대신 EnumMap을 사용하라

배열이나 리스트에서 원소를 꺼낼 떄 ordinal 메서드로 인덱스를 얻는 코드가 있다. 식물을 나타낸 다음 클래스를 예로 살펴보자.
```java
class Plant {
    enum LifeCycle {ANNUAL, PERENNIAL, BIENNIAL}

    final String name;
    final LifeCycle lifeCycle;
}
```
정원에 심은 식물들을 배열 하나로 관리하고, 이들을 생애주기 별로 묶어보자.
```java
// 코드 37-1 ordinal()을 배열 인덱스로 사용 - 따라 하지 말 것! (226쪽)
Set<Plant>[] plantsByLifeCycleArr = (Set<Plant>[]) new Set[Plant.LifeCycle.values().length];
for (int i = 0; i < plantsByLifeCycleArr.length; i++)
    plantsByLifeCycleArr[i] = new HashSet<>();
for (Plant p : garden)
    plantsByLifeCycleArr[p.lifeCycle.ordinal()].add(p);
// 결과 출력
for (int i = 0; i < plantsByLifeCycleArr.length; i++) {
    System.out.printf("%s: %s%n", Plant.LifeCycle.values()[i], plantsByLifeCycleArr[i]);
}
```
ordinal 값을 배열의 인덱스로 사용하면 동작은 하지만 문제가 한가득이다. 배열은 제네릭과 호환되지 않아(item 28) 비검사 형변환을 수행해야 하고 깔끔히 컴피알되지 않는다.

배열은 각 인덱스의 의미를 모르니 출력 결과에 직접 레이블을 달아야 하고 타입 안전하지 않기 때문에 잘못된 값을 사용하면 잘못된 동작을 하거나 ArrayIndexOutOfBoundsException을 던질 것이다.

여기서 배열은 열거 타입 상수를 값으로 매핑하는 일을 한다. 그러니 Map을 사용할 수 있을 것이다. 열거 타입을 키로 사용하도록 설계한 아주 빠른 Map구현체인 EnumMap을 사용하자.

```java
// 코드 37-2 EnumMap을 사용해 데이터와 열거 타입을 매핑한다. (227쪽)
Map<Plant.LifeCycle, Set<Plant>> plantsByLifeCycle = new EnumMap<>(Plant.LifeCycle.class);
for (Plant.LifeCycle lc : Plant.LifeCycle.values())
    plantsByLifeCycle.put(lc, new HashSet<>());
for (Plant p : garden)
    plantsByLifeCycle.get(p.lifeCycle).add(p);
System.out.println(plantsByLifeCycle);
```
더 짧고 명료하고 안전하고 성능도 원래 버전과 비등하다. EnumMap은 내부에서 배열을 사용하는데, 구현 방식을 안으로 숨겨서 Map의 타입 안정성과 배열의 성능을 모두 얻어냈다.

여기서 EnumMap의 생성자가 받는 키 타입의 Class 객체는 한정적 타입 토큰으로, 런타임 제네릭 타입 정보를 제공한다.(item 33)

스트림을 사용해 맵을 관리하면 코드를 더 줄일 수 있다. 다음은 앞 예의 동작을 모방한 단순한 형태의 스트림 기반 코드다.
```java
// 코드 37-3 스트림을 사용한 코드 1 - EnumMap을 사용하지 않는다! (228쪽)
System.out.println(Arrays.stream(garden)
        .collect(groupingBy(p -> p.lifeCycle)));
```
이 코드는 EnumMap이 아닌 고유한 맵 구현체를 사용해서 EnumMap을 써서 얻은 공간과 성능 이점이 사라진다. Collectors.groupingBy 메서드는 mapFactory 매개변수에 원하는 맵 구현체를 명시해 호출할 수 있다.

```java
// 코드 37-4 스트림을 사용한 코드 2 - EnumMap을 이용해 데이터와 열거 타입을 매핑했다. (228쪽)
System.out.println(Arrays.stream(garden)
        .collect(groupingBy(p -> p.lifeCycle,
                () -> new EnumMap<>(LifeCycle.class), toSet())));
```
스트림을 사용하면 EnumMap만 사용했을 때와 살짝 다르게 동작한다. EnumMap은 식물의 생애주기당 하나의 중첩 맵을 만들지만, 스트림 버전에서는 해당 생애주기에 속하는 식물이 있을 때만 만든다. 예컨대 정원에 두해살이가 없다면, 
EnumMap 버전은 맵을 3개 만들고 스트림 버전은 2개만 만든다.

두 열거 타입 값을 매핑하느라 ordinal을 두 번이나 쓴 배열들의 배열을 본 적이 있을 것이다. 다음은 이 방식을 적용해 두 가지 상태를 전이와 매핑하도록 구현한 프로그램이다.

```java
public enum Phase {
    SOLID, LIQUID, GAS;
    public enum Transition {
        MELT, FREEZE, BOIL, CONDENSE, SUBLIME, DEPOSIT;

        // 행은 from, 열은 to의 ordinal을 인덱스로 사용
        private static final Transition[][] TRANSITIONS = {
                { null, MELT, SUBLIME },
                { FREEZE, null, BOIL },
                { DEPOSIT, CONDENSE, null}
        };
        // 상태 전이를 반환한다.
        public static Transition from(Phase from, Phase to) {
            return TRANSITIONS[from.ordinal()][to.ordinal()];
        }
    }
}
```
정우너 예제와 마찬가지로 컴파일러는 ordinal과 배열 인덱스의 관계를 모른다. 즉, 열거 타입을 수정하면서 상 전이 표를 수정하지 않으면 오류가 나거나 이상하게 동작할 것이다.

상전이 표의 크기도 상태의 가짓수의 제곱에 비례해 커지게 될 것이다.

전이 하나를 얻으러면 이전 상태와 이후 상태가 필요하니, EnumMap 두개를 중첩해서 해결할 수 있다.

```java
// 코드 37-6 중첩 EnumMap으로 데이터와 열거 타입 쌍을 연결했다. (229-231쪽)
public enum Phase {
    SOLID, LIQUID, GAS;
    public enum Transition {
        MELT(SOLID, LIQUID), FREEZE(LIQUID, SOLID),
        BOIL(LIQUID, GAS), CONDENSE(GAS, LIQUID),
        SUBLIME(SOLID, GAS), DEPOSIT(GAS, SOLID);

        private final Phase from;
        private final Phase to;
        Transition(Phase from, Phase to) {
            this.from = from;
            this.to = to;
        }

        // 상전이 맵을 초기화한다.
        private static final Map<Phase, Map<Phase, Transition>>
                m = Stream.of(values()).collect(groupingBy(t -> t.from,
                () -> new EnumMap<>(Phase.class),
                toMap(t -> t.to, t -> t,
                        (x, y) -> y, () -> new EnumMap<>(Phase.class))));
        
        public static Transition from(Phase from, Phase to) {
            return m.get(from).get(to);
        }
    }

    // 간단한 데모 프로그램 - 깔끔하지 못한 표를 출력한다.
    public static void main(String[] args) {
        for (Phase src : Phase.values()) {
            for (Phase dst : Phase.values()) {
                Transition transition = Transition.from(src, dst);
                if (transition != null)
                    System.out.printf("%s에서 %s로 : %s %n", src, dst, transition);
            }
        }
    }
}

```
상전이 맵은 Map<from, Map<to, Transition>>이다. 맵을 초기화하기 위해 Collector 2개를 차례로 사용했다. 처음엔 이전 상태를 기준으로 묶고, 두 번째 수집기인 toMap에서는 이후 상태를 전이에 대응시키는 EnumMap을 생성한다.

두 번째 수집기의 병합 함수인 (x, y) -> y는 선언만 하고 실제로 쓰이지 않는데, 이는 단지 EnumMap을 얻으려면 맵 팩터리가 필요하고 수집기들은 점층적 팩터리를 제공하기 때문이다.

낭비되는 공간과 시간도 거의 없고, 이전 방식에 비해 명확하고 안전하고 유지보수하기 좋다.

:::info 정리
배열의 인덱스를 얻기 위해 ordinal을 쓰지 말고 EnumMap을 사용하자.

다차원 관계는 EnumMap<..., EnumMap<...>> 로 표현하자.
:::
