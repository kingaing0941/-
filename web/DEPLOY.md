# Neon + Vercel

Vercel에서는 Neon **HTTP 드라이버**를 씁니다. (`:5432` TCP P1001 회피)

## 환경변수 (따옴표 없이)

### DATABASE_URL (pooler)
```text
postgresql://neondb_owner:비밀번호@ep-snowy-dew-azyvquh4-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

### DIRECT_URL (pooler 없음)
```text
postgresql://neondb_owner:비밀번호@ep-snowy-dew-azyvquh4.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

### NEIS_API_KEY
나이스 키

## 최초 1회: 테이블
Neon SQL Editor → `web/prisma/init.sql` 실행

## Neon 깨우기
대시보드에서 프로젝트가 Idle이면 SQL Editor에서 `SELECT 1;` 한 번 실행

## 확인
https://geupsik-ashy.vercel.app/api/health
