## 무엇을 / 왜

<!-- Task 번호와 함께. 예: T-03 enrollment 상태 전이 추가 -->

## 확인 방법

<!-- 실행한 명령 또는 확인한 화면. 리뷰어가 그대로 따라 할 수 있게 -->

```bash

```

## 체크리스트

- [ ] `main`에 직접 push 하지 않고 브랜치 → PR 로 올렸다
- [ ] 담당 디렉터리 밖의 파일을 고쳤다면 팀 채널에 알렸다
- [ ] 엔티티를 고쳤다면 `init-db/01_init.sql` 도 함께 고쳤다
- [ ] 스키마를 고쳤다면 `docker compose down -v` 후 기동을 확인했다
- [ ] API 경로가 5개 prefix(`/api/users` `/api/courses` `/api/enrollments` `/api/payments` `/api/recommend`) 안에 있다

<!--
 ⚠️ 게이트웨이는 소스 없는 완성 이미지라 라우트를 추가할 수 없다.
    5개 prefix 밖의 경로는 404 가 난다.
-->
