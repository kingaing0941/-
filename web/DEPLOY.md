# GitHub → Vercel 배포

## Neon DATABASE_URL (중요)

Connect 화면에서:

1. **Connection pooling** 켜기 (hostname에 `-pooler` 포함)
2. 복사한 주소 끝에 아래가 없으면 추가:

```text
?sslmode=require
```

이미 `?`가 있으면:

```text
&sslmode=require
```

예시:

```text
postgresql://USER:PASSWORD@ep-xxxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

Vercel Environment Variables:

| Name | Value |
|------|--------|
| `DATABASE_URL` | 위 Neon pooled 주소 |
| `NEIS_API_KEY` | 나이스 API 키 |

Root Directory = `web`

배포 후 점검: `https://사이트주소/api/health`  
`{"ok":true,"db":"connected"}` 이면 정상입니다.
