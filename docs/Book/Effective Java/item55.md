# Item55. 옵셔널 반환은 신중히 하라

`Optional<T>` 는 null이 아닌 T 타입 참조를 담고 있거나, 아무것도 담지 않을 수 있다.

## 옵셔널을 반환하는 메서드 장점
- 예외를 던지는 메서드보다 유연하고 사용하기 쉽다.
- null을 반환하는 메서드보다 오류 가능성이 작다.

## 옵셔널 생성
정적 팩터리를 사용해 옵셔널을 생성할 수 있다.
- 빈 옵셔널: `Optional.empty()`
- 값이 든 옵셔널: `Optional.of(value)`
  - value에 null을 넣으면 NullPointerException이 발생한다.
  - null값 허용 옵셔널: `Optional.ofNullable(value)`

## 옵셔널 선택 기준
옵셔널은 검사 예외와 취지가 비슷하다.(item71) 즉, 반환 값이 없을 수도 있음을 API 사용자에게 명확히 알려준다.

결과가 없을 수 있고, 클라이언트가 이 상황을 특별하게 처리해야 한다면 `Optional<T>`를 반환하자.

메서드가 옵셔널을 반환하면 클라이언트는 값을 받지 못할 때 취할 행동을 선택해야 한다.
- 기본 값 가져오기: `foo().orElse("Default value");`
  - 기본 값 생성 비용이 크면, `Supplier<T>`를 인수로 받는 `orElseGet`을 사용하자.
- 예외 던지기: `foo().orElseThrow(IllegalArgumentException::new);`
- 항상 값이 있다고 가정하고 꺼내쓰기: `foo().get();`
  - 값이 없으면 NoSuchElementException 발생

## isPresent();
isPresent();는 옵셔널이 채워져있으면 true, 비어있으면 false를 반환한다.

isPresent(); 대신 다른 메서드를 사용하면 더 짧고 명확하고 용법에 맞는 코드를 작성할 수 있다.

```java
// isPresent를 적절치 못하게 사용했다.
Optional<ProcessHandle> parentProcess = ph.parent();
System.out.println("부모 PID: " + (parentProcess.isPresent() ?
        String.valueOf(parentProcess.get().pid()) : "N/A"));

// 같은 기능을 Optional의 map를 이용해 개선한 코드
System.out.println("부모 PID: " + ph.parent().map(h -> String.valueOf(h.pid())).orElse("N/A"));
```

스트림에 있는 옵셔널에서 값을 뽑아 처리하려면 다음처럼 하면 된다.
```java
streamOfOptionals
        .filter(Optional::isPresent)
        .map(Optional::get)

// Optional을 Stream으로 변환해주는 stream()을 사용한 코드
streamOfOptionals
        .flatMap(Optional::stream)
```

## 주의사항
박싱된 기본 타입을 담은 옵셔널을 반환하지 말고, OptionalInt, OptionalLong, OptionalDouble을 사용하자.

옵셔널을 컬렉션의 키, 값, 원소나 배열의 원소로 사용하지 말자.

필드의 값이 필수가 아니고 기본 타입이라 값이 없음을 나타낼 방법이 없다면 필드 자체를 옵셔널로 선언할 수도 있다.

:::info 정리
값을 반환하지 못할 가능성이 있는 메서드는 옵셔널을 반환하자.

다만, 성능에 민감한 메서드면 null을 반환하거나 예외를 던지는 게 나을수도 있다.

웬만하면 옵셔널을 반환값 이외의 용도로 사용하지 말자
:::
