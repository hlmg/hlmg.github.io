# 12일 차 회고

---

## 프리코스 12일 차 10/30

### 모각코

오늘은 오프라인 모각코에 가서 공부를 했다. 모임 장소가 전에 살던 동네랑 가까워서 이사오기 전이었으면 매일 갔을텐데, 지금은 좀 멀어서 그게 너무 아쉽다.

도착하니 이미 세 분이 코딩에 열중하고 계셨다. 같이 점심을 먹으면서 대화를 나눠보니 현업에서 프론트엔드로 일하다가 오신 분도 계시고, 전공자 분도 계셨다. 나는 비전공자에 부트캠프 3개월 하고 독학 중이라고
말했는데, 뭔가 주눅이 들었다 ㅠㅠ

밥 다먹고 자동차 경주 구현을 하다가 옆에를 봤는데 다른 분들이 1주차 미션 코드 보면서 대화하고 계셔서 나도 같이 껴서 구경했다. 코드가 정말 복잡하게 구성이 되어 있었는데 처음 보는 구조라 이해하기 힘들었다.
만드신 분이 이것저것 설명을 해주셔서 겨우 이해할 수 있었다. 나는 요구사항을 만족하는 간단한 구조로 작성을 하고 있는데, 학습 차원에서 이것저것 시도해보려면 다른 여러 사람의 코드를 보고 시각을 넓히는 것도
중요하다는 걸 새삼 느꼈다.

이후에 다른 분의 1주차 미션 PR에 코멘트도 남기고 남은 미션을 마저 구현했다.

### 자동차 경주

미션에 명시된 요구사항 외에 고려해볼 내용이 있어서 다음처럼 추가 요구사항을 정의했다.

:::details 추가한 요구사항

#### 시도 횟수

사용자가 입력한 경주를 진행할 횟수의 값은 1 이상이어야 한다.

- 0이면 경주를 진행하지 않은 것과 같다고 간주

#### 자동차 이름

경주에 참가하는 자동차 이름은 중복될 수 없다.

- 다른 자동차와 구분할 수 있는 유일한 식별자기 때문에 중복을 허용하지 않는다.
- 중복이 가능하다면 최종 우승자로 나오는 자동차가 어떤 자동차인지 알 수 없음

자동차 이름은 비어있을 수 없다.

- 자동차 이름이 공백으로만 구성되면 중복과 마찬가지로 구분이 불가능하다.

자동차 이름 양옆에 공백이 올 수 없다.

- 양옆 공백을 허용하면 다음 문제가 발생함
    - 이름은 같고 오른쪽에 있는 공백 개수만 다른 자동차가 입력되면 최종 우승자를 구별하기 어려움
    - 왼쪽 공백은 구분할 순 있지만, 공백 개수를 세어 가면서 어느 자동차인지 알아내야 하는 문제가 있음
- 사용자 입력 실수라고 판단하고 양옆 공백을 제거하고 정상 진행 or 예외 던지기 중 후자를 선택함

#### 자동차 대수

경주에 참가하는 자동차는 최소 두 대 이상이어야 한다.

- 자동차가 두 대보다 적으면 경주하는 의미가 없다고 생각되어 예외를 던지게 함

:::

이 외에도 고려사항이 많이 있었는데, 정상적인 자동차 경주를 할 수 있는 선에서 최소한의 요구사항만 추가했다.

### 마치며

내일 벌써 제출 날이다. 이번 미션은 코드 리뷰하는 시간도 있었고, 테스트 코드 작성이 어려워서 구조를 여러번 수정해서 그런지 시간적 여유가 너무 없었다. 소감문 작성도 해야하는데 큰일이다...