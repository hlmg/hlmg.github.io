# Item48. 스트림 병렬화는 주의해서 적용하라

## 스트림 병렬화
스트림은 parallel 메서드를 호출해 파이프라인을 병렬로 실행할 수 있다. 하지만 스트림 병렬화는 주의해서 사용해야 한다.

데이터 소스가 Stream.iterate거나 중간 연산으로 limit을 쓰면 파이프라인 병렬화로는 성능 개선을 기대할 수 없다.

대체로 스트림의 소스가 `ArrayList`, `HashMap`, `HashSet`, `ConcurrentHashMap`의 인스턴스거나 `배열`, `int 범위`, `long 범위`일 때 병렬화의 효과가 가장 좋다.

- 이 자료구조들은 모두 데이터를 원하는 크기로 정확하고 손쉽게 나눌 수 있어서 일을 다수의 스레드에 분배하기 좋은 특징이 있다. 
- 또 다른 공통점은 원소를 순차적으로 실행할 때 참조 지역성(연관된 데이터가 메모리에 이웃해 있음)이 뛰어나서 캐시 적중률이 높다. 

스트림 파이프라인의 종단 연산 동작 방식 역시 병렬 수행 효율에 영향을 준다. 종단 연산이 순차적이라면 병렬 수행의 효과는 제한될 수밖에 없다. 다음은 병렬화에 적합한 종단 연산이다.
- reduction: stream의 reduce 메서드, 혹은 min, max, count, sum 같은 메서드 
- anyMath, allMatch, noneMath처럼 조건에 맞으면 바로 반환되는 메서드

반면, 가변축소를 수행하는 Stream의 collect 메서드는 병렬화에 적합하지 않다. 컬렉션들을 합치는 부담이 크기 때문이다.

스트림을 잘못 병렬화하면 성능이 나빠질 뿐만 아니라 결과 자체가 잘못되거나 예상 못한 동작이 발생할 수 있다. 이를 안전 실패(safety failure)라 한다. 안전 실패는 병렬화한 파이프라인이 사용하는 함수 객체가 명세대로 동작하지 않을 때 벌어진다.

## 성능
데이터 소스 스트림이 효율적으로 나눠지고, 적절한 종단 연산을 사용하고, 함수 객체들이 간섭하지 않아도, 파이프라인이 수행하는 작업이 병렬화에 드는 추가 비용을 상쇄하지 못한다면 성능 향상은 미미할 수 있다.

스트림 안의 원소 수와 원소당 수행되는 코드 줄 수를 곱한 값이 최소 수십만은 되어야 성능 향상을 볼 수 있다.

스트림 병렬화는 오직 성능 최적화 수단임을 기억해야한다. 변경 전후로 반드시 성능을 테스트하여 병렬화를 사용할 가치가 있는지 확인해야 한다(item 67).

조건이 잘 갖춰지면 parallel 메서드 호출 하나로 거의 프로세서 코어 수에 비례하는 성능 향상을 볼 수 있다.

## Random
무작위 수로 이뤄진 스트림을 병렬화하려거든 SplittableRandom 인스턴스를 이용하자. 한편 ThreadLocalRandom은 단일 스레드에서 쓰고자 만들어졌다. 병렬 스트림 데이터 소스로도 사용할 수는 있지만 SplittableRandom만큼 빠르진 않을 것이다. 그냥 Random은 모든 연산을 동기화하기 때문에 병렬 처리하면 최악의 성능을 보일 것이다.

:::info 정리
올바른 계산 수행 + 성능 향상을 확신한다면 스트림을 사용하고 아니면 사용하지 말자.

스트림을 잘못 병렬화하면 프로그램이 오동작하거나 성능이 떨어진다.

수정 후의 코드가 정확한지 확인하고 운영 환경과 유사한 조건에서 수행해보며 성능지표를 유심히 관찰하자. 그리고 관찰 결과가 좋을 때만 병렬화 버전 코드를 운영 코드에 반영하자.
:::
