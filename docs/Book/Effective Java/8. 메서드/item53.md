# Item53. 가변인수는 신중히 사용하라

가변인수를 메서드를 호출하면, 가장 먼저 인수의 개수와 길이가 같은 배열을 만들고 인수들을 이 배열에 저장하여 메서드에 건네준다.

만약, 인수가 0개 이상이 아닌 1개 이상이어야 한다면 다음처럼 구현하자.
```java
static int min(int firstArg, int... remainingArgs) {
    int min = firstArg;
    for (int arg : remainingArgs) {
        min = Math.min(min, arg);
    }
    return min;
}
```

가변 인수는 배열을 새로 만들고 초기화하기 때문에, 성능에 민감한 상황이라면 걸림돌이 될 수 있다.

메서드 호출의 95%가 인수를 3개 이하로 사용한다면, 다음 코드처럼 다중정의를 활용하자.
```java
public void foo() { }
public void foo(int a1) { }
public void foo(int a1, int a2) { }
public void foo(int a1, int a2, int a3) { }
public void foo(int a1, int a3, int a3, int... rest) { } // 호출의 5%만 담당
```
5%의 호출만 배열을 초기화하고 복사하기 때문에, 성능을 최적화할 수 있다. EnumSet의 정적 팩터리도 이 기법을 사용해 열거 타입 집합 생성 빋용을 최소화한다.

:::info 정리
인수 개수가 일정하지 않은 메서드는 가변 인수를 활용하자.

필수 매개변수는 가변인수 앞에 두자.

가변 인수의 성능 문제도 고려하자.
:::
