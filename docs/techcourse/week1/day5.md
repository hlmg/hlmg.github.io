# 5일 차 회고

---

# 프리코스 5일 차 10/23

## 객체지향적인 사고

1일차 회고에 보면 기능 목록을 작성할 때 게임 흐름에 따라 기능을 쭉 나열하는 방법이 맘에 들지 않아서 객체를 먼저 작성했다고 썼었다.

오브젝트 3장에 이런 문구가 있다.
> 메시지가 객체를 결정한다

객체에게 책임을 할당하는 데 필요한 메시지를 먼저 식별하고 메시지를 처리할 객체를 나중에 선택해야 한다. 그래야 추상적이고 최소화된 인터페이스를 가질 수 있다.

프리코스 미션에서 구현 전 기능 목록을 작성하라고 한 이유도 메시지를 먼저 정의하고 적절한 객체에게 책임을 할당하라는 뜻이라는 걸 알게되었다.

미션에서 객체지향적인 사고를 유도하고 있었는데, 그걸 알아차리지 못한 점과 객체지향에 대한 이해도가 부족한 점이 합쳐저서 올바르지 않은 방식으로 미션을 진행했다.

미션이 끝나기 전에 잘못된 방식이란 걸 알게되어 다행이라고 생각됐다. 그리고 이렇게 실수했던 내용은 기억에 더 오래 남는다는 긍정적인 면도 있다.

앞으로는 요구사항이 어떤 방식을 유도하는지 꼼꼼히 살펴보고 확실하지 않은 개념을 도입할 때는 근거에 의해 논리적으로 진행해야겠다.

## 야구공 리팩토링

기존에 내가 작성한 야구공은 번호를 가지고 번호가 같은지 판단하기 위해 equals 메소드만 오버라이딩 했었다.

오브젝트 책을 읽고 숫자 야구게임에서 야구공이 가져야 할 책임에 대해 다시 생각해봤다. 야구 게임에서 볼, 스트라이크를 판단할 때 판단 기준은 야구공의 숫자와 야구공의 위치다.

야구공이 숫자와 위치를 가지고 볼, 스트라이크를 판단할 수 있으면 객체의 상태를 꺼내와서 비교하는 대신 야구공에게 메시지를 전달하면 된다.

볼과 스트라이크 판단이라는 책임을 적절한 데이터를 가지고 있는 야구공에게 할당하는 것이 객체지향적인 구조에 가깝다고 생각이 들어서 리팩토링을 진행했다.

## 마치며

프리코스를 진행하면서 객체지향적인 사고를 기르고 싶었다. 그래서 오브젝트라는 책을 구매해서 읽고 있는데, 새로 알게된 내용을 바로 미션에 적용할 수 있는 점이 프리코스의 큰 매력인 것 같다.

아직 일주일도 되지 않았는데 벌써 많은 것을 얻어간 것 같고, 프리코스가 끝난 이후 내가 얼마나 성장해 있을지 정말 궁금하다.

생각을 글로 정리하는 게 서툴러서 짧은 글 작성에도 많은 시간이 걸리지만, 새로 알게 된 내용, 적용한 것, 배운 점을 한번 더 정리할 수 있는 장점이 있는 것 같다.
