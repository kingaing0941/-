# 급식 로그

학교 급식 리뷰 웹앱입니다. 앱 코드는 [`web/`](./web) 폴더에 있습니다.

## 배포 (GitHub + Vercel)

1. 이 저장소를 [Vercel Import](https://vercel.com/new)에 연결
2. **Root Directory**를 `web`으로 설정
3. Environment Variables 추가
   - `DATABASE_URL` — [Neon](https://console.neon.tech) PostgreSQL 연결 문자열 (pooled 권장)
   - `NEIS_API_KEY` — 나이스 급식 API 키
4. Deploy

자세한 내용은 [`web/DEPLOY.md`](./web/DEPLOY.md)를 참고하세요.

## 로컬 실행

```bash
cd web
npm install
cp .env.example .env
# .env에 DATABASE_URL, NEIS_API_KEY 입력
npm run db:push
npm run dev
```
