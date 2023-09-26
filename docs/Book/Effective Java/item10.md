# Item10. equals는 일반 규약을 지켜 재정의하라

equals는 주의해서 재정의해야 한다. 다음 경우에 속하면 재정의하지 말자.

## 재정의 하지 않아야 하는 경우

1. 각 인스턴스가 본질적으로 고유하다.
    - 값이 아닌 동작하는 객체를 표현하는 클래스: `Thread`
2. 인스턴스의 논리적 동치성을 검사할 일이 없다.
3. 상위 클래스에서 재정의한 equals가 하위 클래스에도 적용된다.
4. 클래스가 private이거나 default고 equals 메서드를 호출할 일이 없다.

## 재정의는 언제할까?

물리적 동등함(동일성, 주소비교)이 아닌 논리적 동등함(동등성)을 확인해야 하는 경우 `equals`가 동등성을 비교하도록 재정의해야 한다. (기본적으로 `equals`는 주소 비교, `==`이랑 같다.)  
동작을 가지지 않는 값 객체(DTO) 등이 주로 해당된다. equals를 재정의하면 Map의 키와, Set의 원소로 사용할 수 있다. 인스턴스 통제 클래스는 논리적으로 같은 인스턴스가 2개이상 만들어지지 않으니
equals를 재정의하지 않아도 된다.

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

## 주의점

추이성은 간단하지만 자칫하면 어기기 쉽다. 상위 클래스에 없는 새로운 필드를 하위 클래스에 추가하는 상황을 생각해보자.

:::code-group

```java [부모 클래스]
class Foo {
    int a;
    ...

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Foo foo)) {
            return false;
        }
        return a == foo.a;
    }
}
```

```java [자식 클래스]
class Bar extends Foo {
    int b;
    ...

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Bar bar)) {
            return false;
        }
        if (!super.equals(o)) {
            return false;
        }
        return b == bar.b;
    }
}
```

```java [대칭성 비교]
public static void main(String[] args) {
    Foo foo = new Foo(0);
    Bar bar = new Bar(0, 1);
    
    System.out.println(foo.equals(bar)); // true
    System.out.println(bar.equals(foo)); // false //[!code hl]
}
```

:::

위 코드는 대칭성을 위배한다. Foo의 equals는 Bar의 속성 b를 무시하고, Bar의 equals는 Foo를 받지 못한다.

그럼 Bar의 equals에서 Foo가 들어왔을 때 a 값만으로 비교하면 어떨까?

:::code-group

```java [자식 클래스]
class Bar extends Foo {
    int b;
    ...

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Foo)) {
            return false;
        }
        if (!(o instanceof Bar bar)) { //[!code hl]
            return o.equals(this); // o가 Foo면 foo의 equals로 비교 //[!code hl]
        }
        if (!super.equals(o)) {
            return false;
        }
        return b == bar.b;
    }
}
```

```java [추이성 비교]
public static void main(String[] args) {
    Bar bar1 = new Bar(0, 1);
    Foo foo = new Foo(0);
    Bar bar2 = new Bar(0, 2);

    System.out.println(bar1.equals(foo)); // true
    System.out.println(foo.equals(bar2)); // true
    System.out.println(bar1.equals(bar2)); // false //[!code hl]
}
```

:::

이 방식은 대칭성은 만족하나 추이성을 위배한다. 구체 클래스를 확장해 새로운 값을 추가하면서 equals 규약을 만족시킬 방법은 존재하지 않는다. 아래 코드처럼 상속대신 컴포지션을 사용하고, 의존하는 컴포넌트의 뷰를
반환하는 메서드를 추가하자.

```java
class Bar {
    private final Foo foo;
    private final B b;

    public Bar(int a, int b) {
        foo = new Foo(a);
        B = new B(b);
    }

    // view 반환
    public Foo asFoo() {
        return foo;
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Bar bar)) {
            return false;
        }
        return bar.foo.equals(foo) && bar.b.equals(b);
    }
}
```

> 추상 클래스의 하위 클래스는 equals 규약을 지키면서 값을 추가할 수 있다. 상위 클래스를 직접 인스턴스로 만드는 게 불가능하다면 지금까지 이야기한 문제는 일어나지 않는다.

## equals 메서드 구현 방법

1. == 연산자로 주소비교를 해서 같으면 true를 반환한다. (성능 최적화 용도)
2. instanceof 연산자로 입력이 올바른 타입인지 확인한다.
3. 입력을 올바른 타입으로 변환한다. (JDK 16 이상이면, [Pattern Matching](https://openjdk.org/jeps/394)을 사용하자)
4. 입력 객체와 자신의 핵심 필드들이 모두 일치하는지 하나씩 검사하고, 하나라도 다르면 false를 반환한다.
    - float, double 필드는 각각 정적 메서드인 `Flot.compare(float, float)`와 `Double.compare(double, double)`을 사용하자. (특수한 부동소수 값 때문)
    - nullable 필드는 `Object.equals(Object, Object)`로 비교하자.

:::info 정리
꼭 필요한 경우가 아니면 equals를 재정의하지 말자. 재정의할 땐 핵심 필드를 빠짐없이, 다섯 가지 규약을 지켜 비교해야 한다.  
equals를 재정의할 땐 hashCode도 재정의하자, @Override를 명시하자.
:::
