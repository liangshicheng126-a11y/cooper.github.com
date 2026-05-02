-- 已有库增量：执行一次即可（MySQL 5.7+ / 8.0）
USE activity_miniapp;

CREATE TABLE IF NOT EXISTS school_rosters (
  id                     BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  creator_openid         VARCHAR(100) NOT NULL COMMENT '导入人微信 openid',
  title                  VARCHAR(200) NOT NULL COMMENT '名册标题',
  source_filename        VARCHAR(255) NOT NULL DEFAULT '',
  row_success            INT NOT NULL DEFAULT 0,
  row_failed             INT NOT NULL DEFAULT 0,
  error_sample           JSON COMMENT '部分失败原因',
  created_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_creator_created (creator_openid, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS school_students (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  roster_id         BIGINT UNSIGNED NOT NULL,
  student_no        VARCHAR(80) NOT NULL DEFAULT '',
  name              VARCHAR(100) NOT NULL,
  grade             VARCHAR(80) NOT NULL DEFAULT '',
  clazz             VARCHAR(120) NOT NULL DEFAULT '',
  phone_enc         TEXT,
  memo              VARCHAR(500) NOT NULL DEFAULT '',
  extra             JSON COMMENT 'Excel 其它列',
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_roster (roster_id),
  INDEX idx_roster_student_no (roster_id, student_no),
  CONSTRAINT fk_school_student_roster FOREIGN KEY (roster_id) REFERENCES school_rosters(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
