# Item39. 명명 패턴보다 애너테이션을 사용하라

JUnit은 버전 3까지 테스트 메서드 이름을 test로 시작하게끔 했다. 이런 방식을 명명 패턴이라 하는데, 명명 패턴의 단점은 크게 3가지가 있다.

## 명명 패턴의 단점
1. 오타가 나면 안 된다.
2. 올바른 프로그램 요소에서만 사용되리라 보증할 방법이 없다. (메소드가 아닌 클래스에 test를 붙이는 경우 동작 안 함)
3. 프로그램 요소를 매개변수로 전달할 방법이 없다.

애너테이션은 이 모든 문제를 해결해주는 개념으로 JUnit도 버전 4부터 전면 도입했다.

## 테스트 프레임워크

간단한 마커 애너테이션을 추가하고, 이 애너테이션을 활용하는 프로그램을 만들어보자.

```java
/**
 * 테스트 메서드임을 선언하는 애너테이션이다.
 * 매개변수 없는 정적 메서드 전용이다.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Test {
}
```
`@Retention(RetentionPolicy.RUNTIME)`메타애너테이션은 @Test가 런타임에도 유지되어야 한다는 표시다. @Target(ElementType.METHOD)은 @Test가 반드시 메서드 선언에서만 사용돼야 한다고 알려준다.

다음 코드는 @Test 애너테이션을 실제 적용한 모습이다. 이처럼 아무 매개변수 없이 단순히 대상에 마킹하는 애너테이션을 마커 애너테이션이라 한다.
```java
// 코드 39-2 마커 애너테이션을 사용한 프로그램 예 (239쪽)
public class Sample {
    @Test
    public static void m1() { }        // 성공해야 한다.
    public static void m2() { }
    @Test public static void m3() {    // 실패해야 한다.
        throw new RuntimeException("실패");
    }
    public static void m4() { }  // 테스트가 아니다.
    @Test public void m5() { }   // 잘못 사용한 예: 정적 메서드가 아니다.
    public static void m6() { }
    @Test public static void m7() {    // 실패해야 한다.
        throw new RuntimeException("실패");
    }
    public static void m8() { }
}
```
@Test 애너테이션이 Sample 클래스의 의미에 직접적인 영향을 주지는 않는다. 그저 이 애너테이션이 관심 있는 프로그램에게 추가 정보를 제공할 뿐이다.
```java
// 코드 39-3 마커 애너테이션을 처리하는 프로그램 (239-240쪽)
import java.lang.reflect.*;

public class RunTests {
    public static void main(String[] args) throws Exception {
        int tests = 0;
        int passed = 0;
        Class<?> testClass = Class.forName(args[0]);
        for (Method m : testClass.getDeclaredMethods()) {
            if (m.isAnnotationPresent(Test.class)) {
                tests++;
                try {
                    m.invoke(null);
                    passed++;
                } catch (InvocationTargetException wrappedExc) {
                    Throwable exc = wrappedExc.getCause();
                    System.out.println(m + " 실패: " + exc);
                } catch (Exception exc) {
                    System.out.println("잘못 사용한 @Test: " + m);
                }
            }
        }
        System.out.printf("성공: %d, 실패: %d%n",
                passed, tests - passed);
    }
}
```
테스트 메서드가 예외를 던지면 리플렉션 메커니즘이 InvocationTargetException으로 감싸서 다시 던진다. 이 외의 예외가 발생한다면 @Test 애너테이션을 잘못 사용했다는 뜻이다. 아마도 인스턴스 메서드, 매개변수가 있는 메서드, 호출할 수 없는 메서드 등에 달았을 것이다.

만약 인스턴스 메소드에도 Test를 허용하게 하려면 m.invoke에 Test 인스턴스를 넣어주면 된다. [참고](https://www.baeldung.com/java-method-reflection)

이제 특정 예외를 던저야만 성공하는 테스트를 지원해보자.
```java
/**
 * 명시한 예외를 던져야만 성공하는 테스트 메서드용 애너테이션
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface ExceptionTest {
    Class<? extends Throwable> value();
}

```
이 애너테이션은 Throwable을 확장한 클래스의 Class 객체를 매개변수로 받는다. 다음은 이 애너테이션을 실제 활용하는 모습이다.
```java
// 코드 39-5 매개변수 하나짜리 애너테이션을 사용한 프로그램 (241쪽)
public class Sample {
    @ExceptionTest(ArithmeticException.class)
    public static void m1() {  // 성공해야 한다.
        int i = 0;
        i = i / i;
    }
    @ExceptionTest(ArithmeticException.class)
    public static void m2() {  // 실패해야 한다. (다른 예외 발생)
        int[] a = new int[0];
        int i = a[1];
    }
    @ExceptionTest(ArithmeticException.class)
    public static void m3() { }  // 실패해야 한다. (예외가 발생하지 않음)
}
```
테스트 도구도 수정해보자.
```java
// 마커 애너테이션과 매개변수 하나짜리 애너태이션을 처리하는 프로그램 (241-242쪽)
public class RunTests {
    public static void main(String[] args) throws Exception {
        int tests = 0;
        int passed = 0;
        Class<?> testClass = Class.forName(args[0]);
        for (Method m : testClass.getDeclaredMethods()) {
            if (m.isAnnotationPresent(Test.class)) {
                tests++;
                ... // 기존 처리 코드
            }

            if (m.isAnnotationPresent(ExceptionTest.class)) {
                tests++;
                try {
                    m.invoke(null);
                    System.out.printf("테스트 %s 실패: 예외를 던지지 않음%n", m);
                } catch (InvocationTargetException wrappedEx) {
                    Throwable exc = wrappedEx.getCause(); // [!code hl:5]
                    Class<? extends Throwable> excType = 
                            m.getAnnotation(ExceptionTest.class).value();
                    if (excType.isInstance(exc)) {
                        passed++;
                    } else {
                        System.out.printf(
                                "테스트 %s 실패: 기대한 예외 %s, 발생한 예외 %s%n",
                                m, excType.getName(), exc);
                    }
                } catch (Exception exc) {
                    System.out.println("잘못 사용한 @ExceptionTest: " + m);
                }
            }
        }

        System.out.printf("성공: %d, 실패: %d%n",
                passed, tests - passed);
    }
}
```
애너테이션 매개변수 값을 추출하여(`m.getAnnotation(...).value()`) 테스트 메서드가 올바른 예외를 던지는지 확인한다.

한 걸은 더 나아가, 예외를 여러 개 명시하고 그중 하나가 발생하면 성공하게 만들 수도 있다.
```java
// 코드 39-6 배열 매개변수를 받는 애너테이션 타입 (242쪽)
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface ExceptionTest {
    Class<? extends Exception>[] value();
}
```
원소가 여럿인 배열을 지정할 때는 다음과 같이 원소들을 중괄호로 감싸고 쉼표로 구분해주기만 하면 된다.
```java
// 배열 매개변수를 받는 애너테이션을 사용하는 프로그램 (242-243쪽)
public class Sample {
    // 이 변형은 원소 하나짜리 매개변수를 받는 애너테이션도 처리할 수 있다. (241쪽 Sample2와 같음)
    @ExceptionTest(ArithmeticException.class)
    public static void m1() {  // 성공해야 한다.
        int i = 0;
        i = i / i;
    }
    @ExceptionTest(ArithmeticException.class)
    public static void m2() {  // 실패해야 한다. (다른 예외 발생)
        int[] a = new int[0];
        int i = a[1];
    }
    @ExceptionTest(ArithmeticException.class)
    public static void m3() { }  // 실패해야 한다. (예외가 발생하지 않음)

    // 코드 39-7 배열 매개변수를 받는 애너테이션을 사용하는 코드 (242-243쪽)
    @ExceptionTest({ IndexOutOfBoundsException.class,
                     NullPointerException.class })
    public static void doublyBad() {   // 성공해야 한다.
        List<String> list = new ArrayList<>();

        // 자바 API 명세에 따르면 다음 메서드는 IndexOutOfBoundsException이나
        // NullPointerException을 던질 수 있다.
        list.addAll(5, null);
    }
}
```
다음은 @ExceptionTest를 지원하도록 테스트 러너를 수정한 모습니다.
```java
// 마커 애너테이션과 배열 매개변수를 받는 애너테이션을 처리하는 프로그램 (243쪽)
public class RunTests {
    public static void main(String[] args) throws Exception {
        int tests = 0;
        int passed = 0;
        Class<?> testClass = Class.forName(args[0]);
        for (Method m : testClass.getDeclaredMethods()) {
            if (m.isAnnotationPresent(Test.class)) {
                tests++;
                ... // @Test 처리 코드
            }

            // 배열 매개변수를 받는 애너테이션을 처리하는 코드 (243쪽)
            if (m.isAnnotationPresent(ExceptionTest.class)) {
                tests++;
                try {
                    m.invoke(null);
                    System.out.printf("테스트 %s 실패: 예외를 던지지 않음%n", m);
                } catch (Throwable wrappedExc) {
                    Throwable exc = wrappedExc.getCause();
                    int oldPassed = passed; // [!code hl:11]
                    Class<? extends Throwable>[] excTypes = 
                            m.getAnnotation(ExceptionTest.class).value();
                    for (Class<? extends Throwable> excType : excTypes) {
                        if (excType.isInstance(exc)) {
                            passed++;
                            break;
                        }
                    }
                    if (passed == oldPassed)
                        System.out.printf("테스트 %s 실패: %s %n", m, exc);
                }
            }
        }
        System.out.printf("성공: %d, 실패: %d%n",
                passed, tests - passed);
    }
}
```
자바 8에서는 배열 매개변수 대신 @Repeatable 메타 애너테이션을 다는 방식도 있다.
```java
// 코드 39-8 반복 가능한 애너테이션 타입 (243-244쪽)
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@Repeatable(ExceptionTestContainer.class) // [!code hl]
public @interface ExceptionTest {
    Class<? extends Throwable> value();
}
```
애너테이션에 @Repeatable을 달고 컨테이너 애너테이션의 class 객체를 넘겨줘야 한다.
```java
// 반복 가능한 애너테이션의 컨테이너 애너테이션 (244쪽)
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface ExceptionTestContainer {
    ExceptionTest[] value(); // [!code hl]
}
```
@Repeatable을 단 애너테이션을 반환하는 컨테이너 애너테이션이다. 컨테이너 애너테이션은 내부 애너테이션 타입의 배열을 반환하는 value 메서드를 정의해야 한다.

배열 방식 대신 반복 가능 애너테이션을 적용해보자.
```java
// 반복 가능한 애너테이션을 사용한 프로그램 (244쪽)
public class Sample {
    @ExceptionTest(ArithmeticException.class)
    public static void m1() {  // 성공해야 한다.
        int i = 0;
        i = i / i;
    }

    @ExceptionTest(ArithmeticException.class)
    public static void m2() {  // 실패해야 한다. (다른 예외 발생)
        int[] a = new int[0];
        int i = a[1];
    }

    @ExceptionTest(ArithmeticException.class)
    public static void m3() { }  // 실패해야 한다. (예외가 발생하지 않음)

    // 코드 39-9 반복 가능 애너테이션을 두 번 단 코드 (244쪽)
    @ExceptionTest(IndexOutOfBoundsException.class)
    @ExceptionTest(NullPointerException.class)
    public static void doublyBad() {
        List<String> list = new ArrayList<>();

        // 자바 API 명세에 따르면 다음 메서드는 IndexOutOfBoundsException이나
        // NullPointerException을 던질 수 있다.
        list.addAll(5, null);
    }
}
```
반복 가능 애너테이션은 처리할 때 주의를 요한다. 반복 가능 애너테이션을 여러 개 달면 하나만 달았을 때와 구분하기 위해 해당 '컨테이너' 애너테이션 타입이 적용된다.

getAnnotationsByType 메서드는 이 둘을 구분하지 않지만 isAnnotationPresent 메서드는 둘을 명확히 구분한다. 그래서 달려 있는 수와 상관없이 모두 검사하려면 둘을 따로따로 확인해야 한다.
```java
// 마커 애너테이션과 반복 가능 애너테이션을 처리하는 프로그램 (244-245쪽)
public class RunTests {
    public static void main(String[] args) throws Exception {
        int tests = 0;
        int passed = 0;
        Class testClass = Class.forName(args[0]);
        for (Method m : testClass.getDeclaredMethods()) {
            if (m.isAnnotationPresent(Test.class)) {
                tests++;
                ... // @Test 처리 코드
            }

            // 코드 39-10 반복 가능 애너테이션 다루기 (244-245쪽)
            if (m.isAnnotationPresent(ExceptionTest.class) // Repeatable과 컨테이너를 구분하므로 둘 다 확인해야 한다 // [!code hl:2]
                    || m.isAnnotationPresent(ExceptionTestContainer.class)) {
                tests++;
                try {
                    m.invoke(null);
                    System.out.printf("테스트 %s 실패: 예외를 던지지 않음%n", m);
                } catch (Throwable wrappedExc) {
                    Throwable exc = wrappedExc.getCause();
                    int oldPassed = passed;
                    ExceptionTest[] excTests = // [!code hl:3]
                            m.getAnnotationsByType(ExceptionTest.class); // 구분하지 않으므로 Repeatable만 가져오면 된다
                    for (ExceptionTest excTest : excTests) {
                        if (excTest.value().isInstance(exc)) {
                            passed++;
                            break;
                        }
                    }
                    if (passed == oldPassed)
                        System.out.printf("테스트 %s 실패: %s %n", m, exc);
                }
            }
        }
        System.out.printf("성공: %d, 실패: %d%n",
                          passed, tests - passed);
    }
}
```
이 방식으로 코드 가독성을 개선할 수 있다면 이 방식을 사용하자. 하지만 애너테이션을 선언하고 이를 처리하는 부분에서 코드 양이 늘어나고, 특히 처리 코드가 복잡해져 오류가 날 가능성이 커짐을 명심하자.

:::info 정리
다른 프로그래머가 소스코드에 추가 정보를 제공할 수 있는 도구를 만드는 일을 한다면 적당한 애너테이션 타입도 함께 정의해 제공하자. 애너테이션으로 할 수 있는 일을 명명 패턴으로 처리할 이유는 없다.

자바 프로그래머라면 예외 없이 자바가 제공하는 애너테이션 타입을 사용하자.
:::
