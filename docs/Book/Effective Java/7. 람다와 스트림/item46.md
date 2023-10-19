# Item46. 스트림에서는 부작용 없는 함수를 사용하라

스트림 패러다임의 핵심은 계산을 일련의 변환으로 재구성하는 부분이다. 이때 각 변환 단계는 가능한 한 이전 단계의 결과를 받아 처리하는 순수 함수(입력만이 결과에 영향을 주는 함수)여야 한다.

스트림 연산에 건내는 함수 객체는 모두 side effect가 없어야 한다.

다음은 스트림을 잘 못 사용한 코드로, 텍스트 파일에서 단어별 수를 세어 빈도표로 만드는 일을 한다.
```java
// 코드 46-1 스트림 패러다임을 이해하지 못한 채 API만 사용했다 - 따라 하지 말 것! (277쪽)
Map<String, Long> freq = new HashMap<>();
try (Stream<String> words = new Scanner(file).tokens()) {
    words.forEach(word -> freq.merge(word.toLowerCase(), 1L, Long::sum));
}
```
스트림을 가장한 반복적 코드다. 스트림 API의 이점을 살리지 못하여 같은 기능의 반복적 코드보다 길고, 읽기 어렵고, 유지보수에 좋지 않다. 종단 연산인 forEach에서 외부 상태(빈도표)를 수정하는 람다를 실행해서 문제가 생겼다.

forEach가 그저 스트림이 수행한 연산 결과를 보여주는 일 이상을 하는 것을 보니 나쁜 코드일 것 같은 냄새가 난다. 코드를 올바르게 수정해보자.
```java
// 코드 46-2 스트림을 제대로 활용해 빈도표를 초기화한다. (278쪽)
Map<String, Long> freq;
try (Stream<String> words = new Scanner(file).tokens()) {
    freq = words.collect(groupingBy(String::toLowerCase, counting()));
}
```
앞선 코드보다 짧고 명확하고 스트림 API를 제대로 사용했다. forEach 종단 연산은 반복문과 비슷하게 생겼다. forEach 연산은 종단 연산 중 기능이 가장 적고 가장 덜 스트림답다. 대놓고 반복적이라서 병렬화할 수도 없다. forEach 연산은 스트림 계산 결과를 보고할 때만 사용하고, 계산하는 데는 쓰지 말자.

## Collector
스트림은 수집기를 사용하는데 java.util.stream.Collectors 클래스에 기본 수집기가 정의되어 있다. 수집기가 생성하는 객체는 일반적으로 컬렉션이며, 그래서 "collector"라는 이름을 쓴다.

수집기를 사용하면 스트림의 원소를 손쉽게 컬렉션으로 모을 수 있다. (toList(), toSet(), toCollection(collectionFactory))

대부분의 기본 메서드는 스트림을 맵으로 취합하는 기능으로, 진짜 컬렉션에 취합한느 것보다 훨씬 복잡하다.

### toMap
가장 간단한 맵 수집기는 toMap(keyMapper, valueMapper)로 원소를 키에 매핑하는 함수와 값에 매핑하는 함수를 인수로 받는다.
```java
Map<String, Operation> stringToEnum = Sream.of(values()).collect(toMap(Object::toString, e -> e));
```
toMap은 스트림의 각 원소가 고유한 키에 매핑되어 있을 때 적합하다. 다수가 같은 키를 사용한다면 IllegalStateException을 던진다.

복잡한 형태의 toMap이나 groupingBy는 이런 충돌을 다루는 다양한 전략을 제공한다. 인수 3개를 받는 toMap은 병합 함수를 추가로 받으며 같은 키를 공유하는 값은 이 병합 함수를 사용해 처리된다.

```java
Map<Artist, Album> topHits = albums.collect(toMap(Album::artist, a->a, maxBy(comparing(Album::sales))));
```
인수가 3개인 toMap은 충돌이 나면 마지막 값을 취하는 수집기를 만들 때도 유용하다.
```java
toMap(keyMapper, valueMapper, (oldVal, newVal) -> newVal)
```
마지막 toMap은 네 번째 인수로 맵 팩터리를 받는다. 이 인수로 EnumMap이나 TreeMap처럼 원하는 특정 맵 구현체를 직접 지정할 수 있다.

### groupingBy
이 메서드는 입력으로 분류 함수를 받고 출력으로 원소들을 카테고리별로 모아 놓은 맵을 담은 수집기를 반환한다. 가장 간단한 groupingBy는 분류 함수 하나를 인수로 받아 맵을 반환한다.
```java
words.collect(groupingBy(word -> alphabetize(word)));
```
groupingBy가 반환하는 수집기가 리스트 외의 값을 갖는 맵을 생성하게 하려면, 분류 함수와 함께 다운스트림 수집기도 명시해야 한다.

toSet()을 넘기면 value로 List가 아닌 Set을 갖는 맵을 만든다. toSet() 대신 toCollection(collectionFactory)를 건너면 원하는 컬렉션을 값으로 갖는 맵을 생성한다.

counting()을 건내면 카테고리에 속하는 원소의 개수와 매핑한 맵을 얻는다.
```java
Map<String, Long> freq = words.collect(groupingBy(String::toLowerCase, counting()));
```
인수 3개짜리 groupingBy는 맵 팩터리를 추가로 받는다. 맵과 그 안에 담긴 컬렉션의 타입을 모두 지정할 수 있다.

### partitioningBy

분류 함수 자리에 predicate를 받고 키가 Boolean인 맵을 반환한다. downstream을 받는 버전도 다중정의되어있다.

Collectors에는 Collectors.counting 말고도 다운스트림 전용 수집기를 반환하는 메서드가 여러 개 정의되어 있는데 summing, averaging, summarizing, minBy, maxBy가 그 예다.

### joining
이 메서드는 문자열 등의 CharSequence 인스턴스의 스트림에만 적용할 수 있다. 이 중 매개변수가 없는 joining은 단순히 원소를 연결하는 수집기를 반환한다. 한편 인수 하나짜리 joining은 CharSequence 타입의 구분문자를 매개변수로 받는다.

인수 세개짜리 joining은 delimiter, prefix, suffix를 받는다.
```java
String[] words = {"a", "b", "c"};
String collect = Arrays.stream(words).collect(joining(",", "[", "]"));
System.out.println(collect); // [a,b,c]
```

:::info 정리
스트림 파이프라인 프로그래밍의 핵심은 부작용 없는 함수 객체에 있다. 스트림에 건네지는 모든 함수 객체가 부작용이 없어야 한다.

종단 연산 중 forEach는 스트림이 수행한 계산 결과를 보고할 때만 이용하고 계산 자체에는 이용하지 말자.
:::
