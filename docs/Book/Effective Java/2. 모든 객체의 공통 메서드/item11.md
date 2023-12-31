# Item11. equals를 재정의하려거든 hashCode도 재정의하라
equals를 재정의한 클래스 모두에서 hashCode도 재정의해야 한다.

Object의 hashCode 명세에 다음 규약이 명시되어 있다.
> If two objects are equal according to the equals method, then calling the hashCode method on each of the two objects must produce the same integer result.

즉, 논리적으로 같은 객체는 같은 해시코드를 반환해야 한다. 하지만 hashCode 기본 구현은 같은 메모리 주소가 아니면 다른 해시 코드가 나오게 된다.(같을 수도 있음)

## 기본 해시코드 값 
해시코드 값을 계산하는 방법은 알고리즘에 따라 다르며, JDK에 설정된 옵션에 따라 알고리즘이 선택된다.  

현재 설정된 hashCode 알고리즘은 JVM 옵션을 추가하여 확인할 수 있다.
```
-XX:+UnlockExperimentalVMOptions
-XX:+PrintFlagsFinal
// 출력: intx hashCode                                 = 5                                    {experimental} {default}
```

기본으로 설정된 hashCode 옵션을 변경할 수도 있다.
```
-XX:+UnlockExperimentalVMOptions
-XX:hashCode=2 // 0~5의 값을 설정할 수 있고, 각 숫자가 의미하는 건 아래 링크를 참고하자. 
```
https://stackoverflow.com/questions/25111131/whats-the-default-hash-value-of-an-object-on-64-bit-jvm

## HashMap, HashSet 사용
HashMap, HashSet 같은 Hash 자료구조는, hashCode()를 사용해 객체가 어떤 버킷에 들어갈지 결정한다. 따라서 hashCode() 값이 같아야 정상 동작한다.  
equals는 재정의하고 hashCode는 재정의하지 않으면 다음과 같은 문제가 발생한다.
```java
    static class Foo {
    int a;
    int b;

    Foo(int a, int b) {
        this.a = a;
        this.b = b;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Foo foo)) {
            return false;
        }
        return a == foo.a && b == foo.b;
    }

    public static void main(String[] args) {
        Foo foo1 = new Foo(0, 1);
        Foo foo2 = new Foo(0, 1);
        System.out.println(foo1.equals(foo2)); // true, 둘은 논리적으로 '같은 객체' //[!code hl]

        HashSet<Foo> set = new HashSet<>();
        set.add(foo1);
        set.add(foo2);
        System.out.println(set.size() == 1); // false, set에 '같은 객체'가 중복해서 들어감, 비정상 //[!code hl]
    }
}
```
:::info 정리
equals를 재정의하면 hashCode도 재정의하자.  
IDE의 generate equals() and hashcode()를 사용하자.  
직접 hashCode를 구현할 떈 Object의 hashCode 명세를 위반하지 말자.
:::
