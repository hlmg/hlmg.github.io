# 10일 차 회고

---

# 프리코스 10일 차 10/28

오늘은 자동차 경주 미션을 구현하고, 오브젝트 5장을 읽고 정리했다.

## 자동차 경주 구현

기능 목록을 보고 자동차(Car), 참가자들(Participants) 이렇게 두 가지 모델이 생각났다. 가장 먼저 자동차 움직이는 기능 구현을 했는데 고민되는 내용이 있었다.

미션에 `0에서 9 사이의 무작위 값이 4 이상이면 이동한다.`라는 요구사항이 있었는데, 단순히 기능 구현만 한다면 이렇게 간단하게 작성할 수 있다.

```java
public class Car {
    private int position;

    public Car() {
        this.position = 0;
    }

    public void moveForward() {
        int pickedRandomNumber = Randoms.pickNumberInRange(0, 9);
        if (pickedRandomNumber >= 4) {
            position++;
        }
    }
}
```

문제는 테스트를 어떻게 할지 고민이 됐다. moveForward를 호출하고 position 값으로 검증을 하고 싶었는데, 자동차가 랜덤하게 전진하기 때문에 expected position을 구할 수가 없었다.

오랜 고민 끝에 두 가지 방법이 생각났다. 첫번째는 mocking을 하는 방법이다.

```java
public void moveForward(){
    if(isMovable()){
        position++;
    }
}

public boolean isMovable(){
    int pickedRandomNumber=Randoms.pickNumberInRange(0,9);
    return pickedRandomNumber>=4;
}
```

이렇게 메서드를 분리하고 isMovable()이 항상 true를 반환하게 하면 position을 예상할 수 있기 때문에 moveForward()를 테스트 할 수 있다. 그런데 전에 어떤분이 mockito 라이브러리
사용 관련해서 우테코에 문의하고 답변받은 내용을 올려주신 적이 있는데 정확한 내용은 기억이 안나지만 학습 차원에서 권장하지 않는다는 내용이었던 걸로 기억한다. (정확한 내용을 다시 보려고 해당 댓글을 찾아보려 했지만
검색해도 나오지 않았음 ㅠㅠ)

그래서 mocking을 하지 않고 자동차의 이동을 제어할 방법을 이것 저것 시도해본 결과, 다음과 같이 이동하는 로직을 주입받는 구조가 나오게 되었다.

```java
public class Car {
    private final BooleanSupplier engine;
    private int position;

    public Car(String name) {
        this(name, new DefaultEngine());
    }

    public Car(String name, BooleanSupplier engine) {
        validateName(name);
        this.name = name;
        this.engine = engine;
        this.position = 0;
    }

    public void moveForward() {
        if (engine.getAsBoolean()) {
            position++;
        }
    }
}

public class DefaultEngine implements BooleanSupplier {
    @Override
    public boolean getAsBoolean() {
        int pickedRandomNumber = Randoms.pickNumberInRange(0, 9);
        return pickedRandomNumber >= 4;
    }
}
```

게임에서 사용되는 자동차는 new Car("name")을 사용해서 기본 엔진을 가지고 게임을 진행하면 되고, 테스트에서 사용하는 자동차는 new Car(name, () -> true) 로 항상 전진하는 자동차를
생성해서 결과를 예측할 수 있다. 테스트를 어떻게 할지 고민해서 이렇게 만들었는데, 자동차마다 이동 조건이 달라지는 요구사항이 생겨도 쉽게 수용할 수 있는 구조가 되었다.

만들고 보니 첫 번째 방법과 두 번째 방법의 트레이드 오프가 보였다.
첫 번째 방법은 단순한 구조로 현재 요구사항을 만족할 수 있으나 테스트 코드 작성이 복잡하다.
두 번째 방법은 테스트 코드 작성이 쉽고 자동차마다 이동 조건이 달라지는 요구사항이 생겨도 쉽게 수용할 수 있다. 하지만 구조가 첫 번째 방법보다 복잡하다.

현재 존재하지 않는 요구사항을 고려해서 구조가 복잡해지는 건 오버 엔지니어링이라고 생각해서, 1번 방법이 더 좋게 느껴지는데 앞서 말한 라이브러리 이슈 때문에 2번 방법으로 구현을 진행했다. 미션을 구현하고 시간이
남으면 mockito를 사용한 1번 방법으로도 리팩토링 해봐야겠다.

## 마치며

우테코 오픈 채팅방에 올라온 글을 보면, 얼마 안걸렸다는 분도 많이 계시고 저번 주 미션보다 쉽다는 얘기도 많이들 하셨는데, 나는 이번 미션이 더 어렵게 느껴졌다...

무엇보다 요구사항에 쓰여있지 않은 예외사항을 어떻게 판단하고 처리할지 고민을 한참 한것같다. 내가 생각나는 추가 요구사항은 다음과 같았다.

- 이름, 시도 횟수 입력 상한 정하기
    - readLine으로 입력 받을 수 있는 최대 길이 고려
    - 시도 횟수를 얼만큼으로 정할지
        - 지금 생각나는 건 한 줄에 출력할 수 있는 문자열의 길이 - 5(차동차 이름 최대길이) - 3(" : ")
- 시도 횟수 하한 정하기
    - 0이면 경주를 진행하지 않은 것과 같다고 간주, 최소 1 이상
- 이름 하한 정하기
    - 자동차가 1대면 경주 게임을 하는 의미가 없다고 생각해서 최소 2대는 돼야할 것 같다
- 자동차 이름 예외 조건 정하기
    - 공백으로 시작하거나 끝나는 경우: 예외 or trim or 그대로 받기
    - 중복된 이름: 예외 or distinct
    - 공백으로만 구성된 이름: 예외 or filter

아무래도 미션에 적혀있는 이름에 대한 요구사항이 `쉼표(,)를 기준으로 구분`, `5자 이하만 가능` 이 두 가지만 있어서 추가로 고려해볼 내용이 많았다.

아직 확실한 기준이 정해지지 않아서 일단은 기본 요구사항을 만족하는 코드를 작성하고 이후에 요구사항을 추가해야겠다.
