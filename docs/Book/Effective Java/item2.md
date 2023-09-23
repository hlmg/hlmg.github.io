# Item2. 생성에 매개변수가 많다면 빌더를 고려하라

## 정적 팩터리와 생성자의 단점
선택적 매개변수가 많을 때 적절히 대응하기 어렵다.

## 해결방안 1: 점층적 생성자 패턴
```java
public class Foo {
    private final String name; // 필수
    private final int age; // 필수
    private final int opt1;
    private final int opt2;
    
    public Foo(String name, int age) {
        this(name, age, 0);
    }

    public Foo(String name, int age, int opt1) {
        this(name, age, 0, 0);
    }

    public Foo(String name, int age, int opt1, int opt2) {
        this.name = name;
        this.age = age;
        this.opt1 = opt1;
        this.opt2 = opt2;
    }
}
```
점층적 생성자 패턴 또한 매개변수 개수가 많아지면 클라이언트 코드를 작성하거나 읽기 어렵다.

## 해결방안 2: 자바빈즈 패턴
매개변수 없는 생성자로 객체를 만들고 세터 메서드를 호출해 매개변수 값을 설정하는 방식이다. 이 패턴은 객체 하나를 만들기 위해 메서드를 여러 개 호출해야 하고, 객체가 완전히 생성되기 전까지 일관성이 무너진 상태에 놓이게 된다. 이 문제 때문에 자바빈즈 패턴은 클래스를 불변으로 만들 수 없다.

## 빌더 패턴
점층적 생성자 패턴의 안전성과 자바 빈즈 패턴의 가독성을 겸비한 패턴이다. 클라이언트는 필수 매개변수만으로 생성자를 호출해 빌더 객체를 얻고 세터 메서드로 원하는 선택 매개변수를 설정한다.

```java
public class Foo {
    private final String name; // 필수
    private final int age; // 필수
    private final int opt1;
    private final int opt2;

    public static class Builder {
        // 필수 매개변수
        private final String name;
        private final int age;

        // 선택 매개변수 - 기본값으로 초기화.
        private final int opt1 = 0;
        private final int opt2 = 0;
        
        public Builder(String name, int age) {
            this.name = name;
            this.age = age;
        }

        public Builder opt1(int opt1) {
            this.opt1 = opt1;
            return this;
        }
        
        public Builder opt2(int opt2) {
            this.opt2 = opt2;
            return this;
        }
        
        public Foo build() {
            return new Foo(this);
        }
        
        private Foo(Builder builder) {
            this.name = builder.name;
            this.age = builder.age;
            this.opt1 = builder.opt1;
            this.opt2 = builder.opt2;
        }
    }
} 
```

빌더 패턴을 사용하는 클라이언트 코드는 다음과 같다.
```java
Foo foo = new Foo.Builder("a", 1).opt1(1).opt2(2).build();
```

잘못된 매개변수를 최대한 일찍 발견하려면 빌더의 생성자와 메서드에서 입력 매개변수를 검사하고, build 메서드가 호출하는 생성자에서 여러 매개변수에 걸친 불변식을 검사하자.

::: info 불변과 불변식
불변은 어떤 변경도 허용하지 않는 뜻으로 가변 객체와 구분하는 용도로 사용한다. 대표적으로 String 객체가 있다.
불변식은 프로그램이 실행되는 동안, 혹은 정해진 기간 동안 반드시 만족해야 하는 조건이다. 예컨대 리스트의 크기는 반드시 0 이상이어야 하니 한순간이라도 음수 값이 된다면 불변식이 깨진 것이다.
:::

::: info 정리
생성자나 정적 팩터리가 처리해야 할 매개변수가 많다면 빌더 패턴을 선택하자. 매개변수 중 다수가 필수가 아니거나 같은 타입이면 특히 더 그렇다.
:::
