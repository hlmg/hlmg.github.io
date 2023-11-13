# 25일 차 회고

---

## 프리코스 25일 차 11/12

오늘은 크리스마스 미션 남은 기능 구현과 리팩토링을 했다. 필요 없어 보이는 클래스를 제거하고, 출력 결과가 다르게 나오는 버그를 수정했다.

출력 결과가 다르게 나왔던 이유는 이벤트에 기간 조건과 이벤트 적용 조건이 있는데, 기간 조건만 확인하고 이벤트를 적용해서 생기는 문제였다. 이벤트 적용 조건은 혜택을 가져올 때 적용을 했는데, 이 로직을 분리해서
이벤트 적용 여부를 확인할 때 사용하도록 아래와 같이 변경했다.

```java
public abstract class DecemberEvent implements Event {

    // 이벤트 기간: 2023.12.1 ~ 2023.12.31
    @Override
    public boolean isSatisfiedBy(VisitDate visitDate, Order order) {
        return isInEventPeriod(visitDate) && isSatisfiedCondition(visitDate, order);
    }

    private static boolean isInEventPeriod(VisitDate visitDate) {
        LocalDate startDate = LocalDate.of(2023, 12, 1);
        LocalDate endDate = LocalDate.of(2023, 12, 31);

        return visitDate.isIn(startDate, endDate);
    }

    protected abstract boolean isSatisfiedCondition(VisitDate visitDate, Order order);
}

public class PromotionEvent extends DecemberEvent {

    // 할인 전 총주문 금액이 12만 원 이상
    @Override
    protected boolean isSatisfiedCondition(VisitDate visitDate, Order order) {
        return order.getTotalOrderAmount() >= 120_000;
    }

    // 샴페인 1개 증정
    @Override
    public Benefit getBenefitFrom(VisitDate visitDate, Order order) {
        return Benefit.from("증정 이벤트", 0, List.of(Menu.CHAMPAGNE));
    }
}
```

클라이언트가 이벤트 만족 여부를 호출하면, DecemberEvent에서 기간 조건을 검사하고 추상 클래스 isSatisfiedCondition()를 호출한다. 자식 클래스는 isSatisfiedCondition()을
구현해서 개별 이벤트 조건을 확인한다.

이벤트 적용 부분은 어느정도 만족스럽게 구성이 된 것 같은데, 이벤트 혜택을 가져오는 방법이 뭔가 맘에 들지 않아서 어떻게 바꿔야 할지 고민이다. 위에 있는 프로모션 이벤트의 혜택을 가져오는 메서드를 보면 파라미터로
넘어오는 VisitDate와 Order를 사용을 하지 않는다. 그럼에도 있는 이유는 다른 이벤트에서 혜택을 가져올 때 VisitDate 또는 Order 가 필요하기 때문인데, 인터페이스로 정의해서 일괄적으로
처리하려다보니 생긴 문제다. 이벤트를 같은 타입으로 처리해야하기 때문에 인터페이스는 사용하되 더 적절한 구조를 고민해야겠다.

## 마치며

내일 적용하거나 고민할 내용 목록을 만들고 오늘을 마친다

적용할 내용

- service에 있는 뱃지 메서드 객체에 위임하기
- inputView, outputView 리팩토링하기
- 매직넘버 상수화하기
- 정규표현식 캐싱하기

고민할 내용

- 20줄이 넘는 컨트롤러의 run 메서드 분리하기
- 서비스가 어떤 기능을 해야하는지 생각해보기
