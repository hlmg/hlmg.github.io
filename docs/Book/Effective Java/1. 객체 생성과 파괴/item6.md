# Item6. 불필요한 객체 생성을 피하라

## 재사용

똑같은 기능의 객체를 매번 생성하기보다 객체 하나를 재사용하는 편이 좋다. 특히 불변 객체는 언제든 재사용할 수 있다.  

`String s = new String("apple");` 이 문장은 실행될 때마다 String 인스턴스를 새로 만든다. 생성자로 넘겨진 String과 생성된 String이 기능적으로 같기 때문에 완전히 쓸데없는 행위다.  
`String s = "apple"` 처럼 개선하자. 이 방식은 같은 JVM 안이라면 같은 객체를 재사용함이 보장된다.

## 정적 팩터리 매서드
불변 클래스에서 정적 팩터리 매서드를 사용해 불필요한 객체 생성을 피할 수 있다.
`Boolean(String)//deprecated` -> `Boolean.valueOf(String)`
생성자는 호출할 때마다 새로운 객체를 만들지만 팩터리 메서드는 그렇지 않다. 가변 객체도 변경되지 않는다면 재사용할 수 있다.

## `String.matches`
정규 표현식으로 문자열을 확인하는 `String.matches`는 성능이 중요한 상황에서 반복해 사용하기엔 적합하지 않다. 코드를 보면서 동작을 확인해보자.

matches는 Pattern.matches를 호출한다.
```java{2}
public boolean matches(String regex) {
    return Pattern.matches(regex, this);
}
```
Pattern.matches는 compile을 호출해서 Pattern을 받아온다.
```java{2}
public static boolean matches(String regex, CharSequence input) {
    Pattern p = compile(regex);
    Matcher m = p.matcher(input);
    return m.matches();
}
```
compile은 Pattern 생성자로 새로운 Pattern을 생성한다.
```java{2}
public static Pattern compile(String regex) {
    return new Pattern(regex, 0);
}
```

이를통해 matches는 매번 새로운 Pattern을 생성하는 걸 알 수 있다. Pattern은 유한 상태 머신을 만들기 때문에 인스턴스 생성 비용이 높다.

### 성능 개선: Pattern 객체 재사용

다음처럼 클래스 초기화 과정에서 Pattern 객체를 생성해 캐싱하고, 메서드가 호출될 때 객체를 재사용하자.
```java {2,5}
public class Foo() {
    private static final Pattern pattern = Pattern.compile("^[a-zA-Z]*$");
    
    static boolean bar(String s) {
        return pattern.matcher(s).matches();
    }
}
```

책의 예제를 실행해 속도를 비교해봤다. (1000000번 호출 10회 반복)
:::code-group
```text [개선 전]
1.19368596 μs.
0.814132966 μs.
0.881915901 μs.
0.855665101 μs.
0.821793037 μs.
0.791902804 μs.
0.805279714 μs.
0.812909898 μs.
0.867943395 μs.
0.780638943 μs.
```
```text [개선 후]
0.370402606 μs.
0.238373998 μs.
0.148311507 μs.
0.143848884 μs.
0.132939343 μs.
0.133231283 μs.
0.12887861 μs.
0.144675097 μs.
0.134369581 μs.
0.131969656 μs.
```
:::

## 오토박싱을 주의하자
오토 박싱은 primitive 타입과 wrapper 타입을 섞어 쓸 때 자동으로 변환해주는 기술이다. 매우 편리하지만, 불필요한 객체가 생성되어 성능 저하를 유발할 수 있다.
```java
// 끔찍하게 느린 메소드
private static long sum() {
    Long sum = 0L;
    for (long i = 0; i <= Integer.MAX_VALUE; i++) { 
        sum += i; // 오토박싱 //[!code hl]
    }
    return sum;
}
```
sum을 Long으로 선언해서 반복문을 돌 때마다 Long 인스턴스가 생성된다.

:::info 정리
정규표현식 사용할 때 `Pattern.compile`을 사용해 상수로 저장하자.  
wrapper 타입 대신 primitive 타입을 사용하고, 의도치 않은 오토 박싱을 주의하자.
:::
