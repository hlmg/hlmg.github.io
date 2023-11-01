# 13일 차 회고

---

## 프리코스 13일 차 10/31

오늘은 자동차 경주 미션 리팩토링을 진행했다.

### 검증 로직 분리

자동차 클래스의 검증 로직이 많아지니까 객체가 너무 커지는 문제가 있었다.

검증과 비즈니스 로직이 많다보니까 관련된 것 끼리 잘 모아놔도 보기 힘든 문제가 있었다. 그래서 inner class를 만들어서 검증을 담당하게 변경했다.

:::details Inner class

```java
private static class NameValidator {
    private static final String NOT_BLANK_NAME = "자동차 이름은 비어있을 수 없습니다";
    private static final String NO_WHITESPACE_AROUND_NAME = "자동차 이름 양 옆에 공백이 올 수 없습니다";
    private static final Pattern WHITE_SPACE_AROUND_STRING = Pattern.compile("^\\s+|\\s+$");
    private static final String INVALID_NAME_LENGTH_FORMAT = "자동차 이름은 %d자 이하여야 합니다";
    private static final int MAX_NAME_LENGTH = 5;

    private static void validate(String name) {
        validateBlank(name);
        validateWhiteSpaceAround(name);
        validateLength(name);
    }

    private static void validateBlank(String name) {
        if (name.isBlank()) {
            throw new IllegalArgumentException(NOT_BLANK_NAME);
        }
    }

    private static void validateWhiteSpaceAround(String name) {
        if (WHITE_SPACE_AROUND_STRING.matcher(name).find()) {
            throw new IllegalArgumentException(NO_WHITESPACE_AROUND_NAME);
        }
    }

    private static void validateLength(String name) {
        if (name.length() > MAX_NAME_LENGTH) {
            throw new IllegalArgumentException(String.format(INVALID_NAME_LENGTH_FORMAT, MAX_NAME_LENGTH));
        }
    }
}
```

:::

검증에 필요한 상수와 메서드가 이너 클래스 안에 모여져 있어서 보기 편한 느낌이 들었다. 그런데 클래스 파일이 크다는 문제는 여전히 존재해서 어떻게 검증 로직을 밖으로 분리할지 고민이었다.

이너 클래스를 일반 클래스로 분리하고 Car 클래스가 static field로 Validator를 가지게 변경했다.

### 생성 로직 분리

Car 클래스 안에 여러 생성자가 나열되어 있었다. 테스트 클래스에서 쉽게 사용하고 싶어서 만든 생성자들이 대부분이었고 Participants 클래스에는 변환 로직도 존재했다. 검증 로직을 분리한 것 처럼 생성을
담당하는 클래스를 만들어서 Car 클래스가 간단히 비즈니스 로직만 들고있게 만들고 싶었다.

CarFactory라는 걸 만들고 그 안에 기본 위치, 기본 엔진을 넣어 자동차를 생성할 때 추가로 명시하지 않아도 쉽게 차를 만들 수 있게 변경했다.

:::details CarFactory
```java
public class CarFactory {
private static final int DEFAULT_CAR_POSITION = 0;

    private final BooleanSupplier engine;

    public CarFactory(BooleanSupplier intSupplier) {
        this.engine = intSupplier;
    }

    public Car create(String name) {
        return new Car(name, DEFAULT_CAR_POSITION, engine);
    }
}
```
:::

## 마치며

제출 테스트가 통과하는지 확인하기 위해 PR을 날렸는데 다행히 통과가 되었다. 제출 기간이 끝나기 전에 소감문을 잘 작성하고, 코드를 검수하는 시간을 가져야겠다.