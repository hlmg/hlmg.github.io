# Item10. equals는 일반 규약을 지켜 재정의하라

equals는 주의해서 재정의해야 한다. 다음 경우에 속하면 재정의하지 말자.

## 재정의 하지 말아야 하는 경우
1. 각 인스턴스가 본질적으로 고유하다.
   - 값이 아닌 동작하는 객체를 표현하는 클래스: `Thread`
2. 인스턴스의 논리적 동치성을 검사할 일이 없다.
3. 상위 클래스에서 재정의한 equals가 하위 클래스에도 적용된다.
4. 클래스가 private이거나 default고 equals 메서드를 호출할 일이 없다.

## 재정의는 언제할까?

물리적 동등함(동일성, `==`)이 아닌 논리적 동등함(동등성, `equals`)을 확인해야 하는 경우 `equals`가 동등성을 비교하도록 재정의해야 한다.  
동작을 가지지 않는 값 객체(DTO) 등이 주로 해당된다. equals를 재정의하면 Map의 키와, Set의 원소로 사용할 수 있다. 인스턴스 통제 클래스는 논리적으로 같은 인스턴스가 2개이상 만들어지지 않으니 equals를 재정의하지 않아도 된다.

equals를 재정의할 때는 반드시 Object 명세에 적힌 일반 규약을 따라야 한다.
```java
    private static void foo(Bar a, Bar b, Bar c) {
        assert a.equals(a); // 반사성
        assert a.equals(b) && b.equals(a); // 대칭성
        assert a.equals(b) && b.equals(c) && a.equals(c); // 추이성
        assert a.equals(b); // 일관성: 수정되지 않는 한 반복해서 호출해도 항상 같은값이 나온다.
        assert a.equals(null) == false; // null-아님
        }
```
:::tip Java assert
자바의 assert 예약어는 참이면 통과되고 거짓이면 AssertionError가 발생한다.  
기본적으로 동작하지 않고, JVM 옵션을 활성화해야 동작한다. (`java -ea` or `java -enableassertions`)
:::

구체 클래스를 확장해 새로운 값을 추가하면서 equals 규약을 만족시킬 방법은 존재하지 않는다. 상속말고 컴포지션을 사용하고, 의존하는 컴포넌트의 뷰를 반환하는 메서드를 추가하면 된다.
```java
public class Foo {
   private final Bar bar;
   ...
   // view 반환
   public Bar asBar() {
       return bar;
   }
   @Override public boolean equals(Object o) {
      if ((o instanceof Foo foo)) {
         return foo.asBar().equals(bar);
      }
      return false;
   }
}
```
float, double 필드는 각각 정적 메서드인 `Flot.compare(float, float)`와 `Double.compare(double, double)`을 사용하자. (특수한 부동소수 값 때문)  
nullable 필드는 `Object.equals(Object, Object)`로 비교하자.

:::info 정리
꼭 필요한 경우가 아니면 equals를 재정의하지 말자. 재정의할 땐 핵심 필드를 빠짐없이, 다섯 가지 규약을 지켜 비교해야 한다.  
equals를 재정의할 땐 hashCode도 재정의하자, @Override를 명시하자.
:::
