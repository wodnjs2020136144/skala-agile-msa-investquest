-- 주식 종목 시드 데이터
-- courses.instructor_id가 NOT NULL/FK이므로 시드 데이터 소유 계정을 먼저 생성한다.

INSERT IGNORE INTO users (email, password, name, role, money, created_at, updated_at)
VALUES ('stock-seed@local', 'seed-account-not-for-login', '종목 데이터', 'INSTRUCTOR', 0, NOW(6), NOW(6));

INSERT INTO courses (
    title,
    description,
    category,
    price,
    instructor_id,
    enrollment_count,
    temp_price,
    status,
    created_at,
    updated_at
)
SELECT
    seed.title,
    NULL,
    seed.category,
    seed.price,
    users.id,
    0,
    seed.temp_price,
    seed.status,
    NOW(6),
    NOW(6)
FROM (
    SELECT '제주반도체(080220)' AS title, '반도체' AS category, 76500.00 AS price, 81000.00 AS temp_price, 'HIGH' AS status
    UNION ALL
    SELECT '삼성전자(005930)', '반도체', 267000.00, 269000.00, 'LOW'
    UNION ALL
    SELECT 'HLB(028300)', '바이오', 35900.00, 32000.00, 'HIGH'
    UNION ALL
    SELECT '삼성바이오로직스(207940)', '바이오', 1587000.00, 1600000.00, 'LOW'
    UNION ALL
    SELECT '스페코(013810)', '방산', 1559.00, 1720.00, 'HIGH'
    UNION ALL
    SELECT '한국항공우주(047810)', '방산', 135600.00, 137500.00, 'LOW'
) AS seed
JOIN users ON users.email = 'stock-seed@local'
WHERE NOT EXISTS (
    SELECT 1
    FROM courses
    WHERE courses.title = seed.title
);
