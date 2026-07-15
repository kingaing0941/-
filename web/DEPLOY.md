# Neon + Vercel 연결 (P1001 해결)

## 원인

Neon이 잠들었다가 깨는 데 시간이 걸리는데, Prisma 기본 대기 시간(5초)이 짧아서
`P1001: Can't reach database server` 가 납니다.
또 빌드할 때 DB에 붙으려다 실패하면 배포 전체가 깨집니다.

## Vercel 환경변수 (2개)

비밀번호는 Neon Connect에서 확인하세요.

### DATABASE_URL (앱용 · pooler 필수)

```text
postgresql://neondb_owner:비밀번호@ep-snowy-dew-azyvquh4-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=15&pool_timeout=15&connection_limit=1
```

### DIRECT_URL (스키마 작업용 · pooler 없음)

```text
postgresql://neondb_owner:비밀번호@ep-snowy-dew-azyvquh4.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=15
```

둘 다 Production / Preview에 넣고 **Save → Redeploy**.

## 테이블 만들기 (최초 1회)

1. Neon Console → SQL Editor
2. `web/prisma/init.sql` 내용 붙여넣기 → Run

## 점검

1. Neon 대시보드에서 프로젝트가 **Active**(초록)인지 확인. Idle이면 아무 쿼리나 한 번 실행해 깨우기
2. https://geupsik-ashy.vercel.app/api/health
3. `{"ok":true,"db":"connected"}` 나오면 닉네임 설정 다시 시도

공식 주소는 `geupsik-ashy.vercel.app` 를 쓰세요.
`geupsik-git-main-...` 는 미리보기 배포라 실패했을 수 있습니다.
