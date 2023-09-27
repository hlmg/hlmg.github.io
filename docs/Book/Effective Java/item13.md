# Item13. clone 재정의는 주의해서 진행하라

Cloneable은 믹스인 인터페이스지만, 아무 메소드도 정의되지 않아서 인터페이스를 구현하는 것만으로는 clone 메서드를 호출할 수 없다.
  
clone 메서드는 Object에 protected로 정의되어 있고, Cloneable을 implement하지 않으면 clone 메서드를 실행할 때 CloneNotSupportedException이 발생한다.
  
그렇기 때문에 Cloneable을 구현하고 clone 메소드를 반드시 재정의해야 clone 메서드를 사용할 수 있다.

## clone의 문제점
1. Interface는 메소드 명세를 정의하고, 메소드 세부 구현을 강제할 수 있는데, 이런 점에서 clone이 Cloneable 인터페이스에 정의되어 있지 않는건 매우 아쉬운 점이다.
2. clone을 구현할 때 try-catch로 CloneNotSupportedException 처리를 하는데, Cloneable을 implementation 하면 절대로 발생할 수 없는 오류다. 그렇기 때문에 CloneNotSupportedException은 unchecked exception으로 정의됐어야 했다.
3. 아쉬운 점은 이뿐만이 아니다. 객체가 참조값을 가진다면, super.clone()을 한 뒤에 참조 객체에 들어있는 값을 모두 복사해서 새로운 참조 배열에 넣어야 한다. 이는 직렬화와 마찬가지로 Cloneable 아키텍처는 '가변객체를 참조하는 필드는 final로 선언하라'는 일반 용법과 충돌한다.  

## 복사 생성자, 복사 팩터리
상속용 클래스는 Cloneable을 구현하지 말자.
Cloneable을 이미 구현한 클래스를 확장한다면 어쩔 수 없이 clone을 구현해야 하지만, 그렇지 않다면 '복사 생성자'와 '복사 팩터리'를 사용하자.
```java
// 복사 생성자
public Foo(Foo foo) { ... };

// 복사 팩터리
public static Foo newInstance(Foo foo) { ... };
```
복사 생성자와 복사 팩터리는 언어 모순적인 객체 생성 메커니즘(생성자를 사용하지 않음)을 따르지 않고, 엉성하게 문서화된 규약에 기대지 않고, final 필드 용법과 충돌하지 않고, 불필요한 검사 예외를 던지지 않고, 형변환도 필요하지 않다.

더 나아가 해당 클래스가 구현한 '인터페이스'타입의 인스턴스를 인수로 받을 수 있는데, Java의 모든 범용 컬렉션 구현체가 Collection이나 Map을 받을 수 있는것과 같다. 이를 이용하면 clone은 불가능한 Collection 간 타입 변환을 다음처럼 간단하게 할 수 있다. (`new Treeset<>(hashSet)`)

:::info 정리
새로운 인터페이스를 만들 때는 절대 Cloneable을 확장하지 말고, 새로운 클래스도 이를 구현하지 말자.
  
기본 원칙은 '복제 기능은 생성자와 팩터리를 이용하는 게 최고'다. 단, 배열은 clone 메서드 방식이 가장 깔끔한, 이 규칙의 합당한 예외다.
:::
