# Item1. 생성자 대신 정적 팩터리 메서드를 고려하라

## 정적 팩터리 메서드란?

클래스의 인스턴스를 반환하는 단순한 정적 메서드를 말한다. 디자인 패턴의 팩터리 메서드와 다르니 주의하자.

```java
public static Boolean valueOf(boolean b) {
    return b ? Boolean.TRUE : Boolean.FALSE;
}
```

## 정적 팩터리 메서드 장점

정적 팩터리 메서드가 생성자보다 좋은 장점 다섯가지는 다음과 같다.

### 1. 이름을 가질 수 있다.

정적 팩터리 메서드는 이름만 잘 지으면 반환될 객체의 특성을 쉽게 묘사할 수 있다.    
`BigInteger(int, int, Random)`과 `BigInteger.probablePrime` 중 어느 쪽이 '값이 소수인 BigInteger를 반환한다'는 의미를 더 잘 설명할 것 같은지 생각해보자  

### 2. 호출될 때마다 인스턴스를 새로 생성하지 않아도 된다.

불변 클래스는 인스턴스를 미리 만들어 놓거나 새로 생성한 인스턴스를 캐싱하여 재활용하는 식으로 불필요한 객체 생성을 피할 수 있다. 따라서 큰 객체가 자주 요청되는 상황에서 성능을 끌어올릴 수 있다. 플라이웨이트 패턴도 이와 비슷한 기법이다.

반복되는 요청에 같은 객체를 반환하는 식으로 인스턴스를 통제할 수 있다. 인스턴스를 통제하면 싱글턴으로 만들수도, 인스턴스화 불가로 만들수도 있다. 또한 불변 값 클래스에서 동치인 인스턴스가 단 하나뿐임을 보장할 수 있다.(a==b 일 때만 a.equals(b)가 성립)  
인스턴스 통제는 플라이웨이트 패턴의 근간이 되며, 열거 타입은 인스턴스가 하나만 만들어짐을 보장한다.

### 3. 반환 타입의 하위 타입 객체를 반환할 수 있는 능력이 있다.

반환할 객체의 클래스를 자유롭게 선택할 수 있게 하는'엄청난 유연성'을 선물한다. 구현 클래스를 공개하지 않고도 그 객체를 반환할 수 있어 API를 작게 유지할 수 있다.  
Java의 Collections는 수정 불가나 동기화 등의 기능을 덧붙인 45개의 유틸리티 구현체를 정적 팩터리 메서드를 통해 얻도록 했다.

### 4. 입력 매개변수에 따라 매번 다른 클래스의 객체를 반환할 수 있다.

반환 타입의 하위 타입이기만 하면 어떤 클래스의 객체를 반환하든 상관없다. 가령 EnumSet 클래스는 public 생성자 없이 오직 정적 팩터리만 제공하는데, OpenJDK에서는 원소의 수에 따라 두 가지 하위 클래스 중 하나의 인스터스를 반환한다.
```java
public static <E extends Enum<E>> EnumSet<E> noneOf(Class<E> elementType) {
    ...
    if (universe.length <= 64)
        return new RegularEnumSet<>(elementType, universe);
    else
        return new JumboEnumSet<>(elementType, universe);
}
```
클라이언트는 이 두 클래스의 존재를 모르며 다음 릴리스 때 성능을 개선한 하위 클래스를 추가하더라도 클라이언트 코드는 변동이 없다.

### 5. 정적 팩터리 메서드를 작성하는 시점에는 반환할 객체의 클래스가 존재하지 않아도 된다.

서비스 제공자 프레임워크를 만드는 근간이 된다. 대표적인 서비스 제공자 프레임워크는 JDBC가 있다. 서비스 제공자 프레임워크에서 제공자는 서비스의 구현체다. 그리고 이 구현체를 클라이언트에 제공하는 역할을 프레임워크가 통제하여, 클라이언트를 구현체로부터 분리해준다.  
서비스 제공자 프레임워크는 다음 3개의 핵심 컴포넌트로 이뤄진다.

- 서비스 인터페이스: Connection  
- 제공자 등록 API: DriverManager.registerDriver  
- 서비스 접근 API: DriverManager.getConnection

서비스 인터페이스는 구현체의 동작을 정의하고, 제공자 등록 API는 구현체를 등록하고, 서비스 접근 API는 인스턴스를 얻을 때 사용한다.
추가로 서비스 제공자 인터페이스라는 네 번째 컴포넌트가 쓰이기도 한다.

- 서비스 제공자 인터페이스: Driver

이 컴포넌트는 서비스 인터페이스의 인스턴스를 생성하는 팩터리 객체를 설명한다. 이 컴포넌트가 없다면 각 구현체를 인스턴스로 만들 때 리플렉션을 사용해야 한다.

Driver는 Class.forName(driverName)으로 등록할 수 있다. Class.forName(String name)은 파라미터로 받은 name에 해당하는 클래스를 로딩하며, 클래스가 로드 될 때 static 필드의 내용이 실행되는 걸 이용해 자기 자신을 DriverManager 클래스에 등록한다.

자바 6부터는 `ServiceLoader`라는 범용 서비스 제공자 프레임워크가 제공되어 프레임워크를 직접 만들 필요가 거의 없다.

## 정적 팩터리 메서드 단점

### 1. 하위 클래스를 만들 수 없다.

상속을 하려면 public이나 protected 생성자가 필요하다. 따라서 정적 팩터리 메서드만 제공하면 하위 클래스를 만들 수 없다. 어찌 보면 이 제약은 상속보다 컴포지션을 사용하도록 유도하고 불변타입으로 만들려면 이 제약을 지켜야 한다는 점에서 오히려 장점으로 받아들일 수도 있다.

### 2. 프로그래머가 찾기 어렵다

생성자처럼 API설명에 명확히 드러나지 않으니 사용자는 정적 팩터리 메서드 방식 클래스를 인스턴스화할 방법을 알아내야 한다. 따라서 API 문서를 잘 써놓고 메서드 이름도 널리 알려진 규약을 따라 짓는 식으로 문제를 완화해야 한다. 다음은 흔히 사용하는 명명 방식들이다.

| 이름                    | 설명                                                                                                                            |
|-----------------------|-------------------------------------------------------------------------------------------------------------------------------|
| from                  | 매개변수 하나 받아서 해당 타입의 인스턴스를 반환하는 형변환 메서드<br/> `Date d = Date.from(instant);`                                                     |
| of                    | 여러 매개변수를 받아 적합한 타입의 인스턴스를 반환하는 집계 메서드 <br/> `Set<Rank> faceCards = EnumSet.of(JACK, QUEEN, KING);`                            |
| valueOf               | from과 of의 더 자세한 버전 <br/> `BigInteger prime = BigInteger.valueOf(Integer.MAX_VALUE);`                                          |
| instance, getInstance | (매개변수를 받는다면) 매개변수로 명시한 인스턴스를 반환하지만, 같은 인스턴스임을 보장하지는 않는다. <br/> `StarWalker luke = StarWalker.getInstance(options);`           |
| create, newInstance   | instance 혹은 getInstace와 같지만, 매번 새로운 인스턴스를 생성해 반환함을 보장한다. <br/>  `Object newArray = Array.newInstance(classObject, arrayLen);` |
| getType               | getInstance와 같으나, 생성할 클래스가 아닌 다른 클래스에 팩터리 메서드를 정의할 때 쓴다. <br/> `FileStor fs = Files.getFileStore(path)`                       |
| newType               | newInstance와 같으나, 생성할 클래스가 아닌 다른 클래스에 팩터리 메서드를 정의할 때 쓴다. <br/> `BufferedReader br = Files.newBufferedReader(path);`           |
| type                  | getType과 newType의 간결한 버전 <br/> `List<Complaint> litany = Collections.list(legacyLitany);`                                     |

::: info 정리
정적 팩터리 메서드와 public 생성자 각자 쓰임새가 있으니 상대적인 장단점을 이해하고 사용해야 한다. 그러나 정적 팩터리를 사용하는 게 유리한 경우가 많으므로 무작정 public 생성자를 제공하던 습관이 있다면 고치자.
:::
