# 급식 로그

학교 검색 → 당일/선택일 급식 확인 → 별점·한줄평 → XP/레벨 → 프로필 분석

모바일 우선 반응형 웹앱입니다.  
로그인 없이 브라우저 쿠키로 게스트를 구분합니다.

공유용 배포는 [DEPLOY.md](./DEPLOY.md)를 보세요. (Vercel + Neon)

## 주요 경로

| 경로 | 화면 |
|------|------|
| `/start` | 닉네임 설정 |
| `/schools` | 학교 검색·선택 |
| `/today` | 급식·리뷰 |
| `/me` | 프로필·월별 리뷰 |

## 시작하기

```bash
cd web
npm install
cp .env.example .env
```

`.env`에 `DATABASE_URL`(Neon PostgreSQL)과 `NEIS_API_KEY`를 넣은 뒤:

```bash
npm run db:push
npm run dev
```

[http://localhost:3000](http://localhost:3000)

## 주요 기능

- NEIS 학교 검색 / 급식 조회
- 날짜별 리뷰 (별점 1–5 + 한줄평, 하루 1회)
- 리뷰 작성 시 +20 XP, 누적 XP로 레벨업
- 프로필: 월별 평균 별점, 별점 분포, 리뷰 히스토리
