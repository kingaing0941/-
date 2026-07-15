# Neon + Vercel 연결

## Vercel 환경변수 (따옴표 없이 한 줄로)

비밀번호만 본인 걸로 바꿔 넣으세요.

### DATABASE_URL
```text
postgresql://neondb_owner:비밀번호@ep-snowy-dew-azyvquh4-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=30&connection_limit=1
```

### DIRECT_URL
```text
postgresql://neondb_owner:비밀번호@ep-snowy-dew-azyvquh4.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=30
```

주의:
- 앞뒤에 `"` 따옴표 넣지 마세요
- 줄바꿈/공백 넣지 마세요
- Neon Connect에서 복사할 때 옵션을 이것저것 추가하지 말고, 위 형식만 쓰세요

### NEIS_API_KEY
나이스 API 키

## 테이블 (최초 1회)
Neon → SQL Editor → `web/prisma/init.sql` 실행

## 확인
https://geupsik-ashy.vercel.app/api/health
`{"ok":true}` 이면 성공
