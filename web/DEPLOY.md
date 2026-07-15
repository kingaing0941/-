# GitHub → Vercel 배포

공유 링크가 나오려면 **Neon(DB)** + **Vercel(호스팅)** 이 필요합니다.  
로컬에서 `npm run dev`를 켜 둘 필요는 없습니다.

## 1. Neon DB (무료, 1분)

1. https://console.neon.tech 가입
2. 프로젝트 생성
3. **Connect** → Connection pooling 켠 문자열 복사  
   (`...-pooler...neon.tech...` 형태)

## 2. Vercel에 GitHub 연결

1. https://vercel.com/new 접속 (GitHub로 로그인)
2. 저장소 `kingaing0941/-` Import
3. 설정:
   - **Root Directory**: `web`
   - Framework: Next.js (자동 감지)
4. Environment Variables:

| Name | Value |
|------|--------|
| `DATABASE_URL` | Neon 연결 문자열 |
| `NEIS_API_KEY` | 나이스 API 키 |

5. **Deploy**

끝나면 `https://xxxx.vercel.app` 주소가 생깁니다. 그 링크를 공유하면 됩니다.

## 참고

- `.env`는 Git에 올리지 않습니다. 키는 Vercel 환경변수에만 넣으세요.
- 이후 `main`에 push하면 Vercel이 자동으로 다시 배포합니다.
