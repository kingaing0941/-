# GitHub → Vercel 배포

## 1. Neon (무료 DB) — 필수

1. https://console.neon.tech 가입/로그인
2. New Project 생성 (지역: Singapore 추천)
3. **Connect** 클릭 → **Connection pooling** 켠 문자열 복사

## 2. Vercel + GitHub

1. https://vercel.com/new 접속 (GitHub로 로그인)
2. 저장소 `kingaing0941/-` Import
3. 설정
   - **Root Directory**: `web`
   - Framework: Next.js
4. Environment Variables:

| Name | Value |
|------|--------|
| `DATABASE_URL` | Neon pooled 연결 문자열 |
| `NEIS_API_KEY` | 나이스 API 키 |

5. Deploy → 나온 `https://xxxx.vercel.app` 링크 공유

이후 `main` push 시 자동 재배포됩니다.
