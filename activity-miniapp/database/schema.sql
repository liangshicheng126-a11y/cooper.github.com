-- database/schema.sql - 数据库建表 SQL
-- 字符集：utf8mb4（支持 emoji）

CREATE DATABASE IF NOT EXISTS activity_miniapp
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE activity_miniapp;

-- ============================================================
-- 用户表
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  openid        VARCHAR(100) NOT NULL UNIQUE COMMENT '微信 openid',
  nickname      VARCHAR(100) NOT NULL DEFAULT '' COMMENT '昵称',
  avatar_url    VARCHAR(500) NOT NULL DEFAULT '' COMMENT '头像 URL',
  phone_enc     TEXT COMMENT '加密手机号（AES-256）',
  privacy_agreed_at  DATETIME COMMENT '同意隐私协议时间',
  deleted_at    DATETIME COMMENT '注销时间（软删除）',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_openid (openid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 活动主表
-- ============================================================
CREATE TABLE IF NOT EXISTS activities (
  id               VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  creator_openid   VARCHAR(100) NOT NULL COMMENT '创建者 openid',
  name             VARCHAR(100) NOT NULL COMMENT '活动名称',
  description      TEXT COMMENT '活动描述',
  start_time       DATETIME NOT NULL COMMENT '开始时间',
  end_time         DATETIME NOT NULL COMMENT '结束时间',
  location_name    VARCHAR(200) NOT NULL DEFAULT '' COMMENT '地点名称',
  location_address VARCHAR(500) NOT NULL DEFAULT '' COMMENT '详细地址',
  location_country VARCHAR(10)  NOT NULL DEFAULT 'CN' COMMENT 'CN=国内 INTL=海外',
  latitude         DECIMAL(10, 6) COMMENT '纬度',
  longitude        DECIMAL(10, 6) COMMENT '经度',
  max_participants INT NOT NULL DEFAULT 0 COMMENT '人数限制（0=不限）',
  require_invite   TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1=需要邀请码',
  invite_code      VARCHAR(20) NULL DEFAULT NULL COMMENT '邀请码',
  category         VARCHAR(30) NOT NULL DEFAULT 'other' COMMENT '分类',
  cover_image      VARCHAR(500) NOT NULL DEFAULT '' COMMENT '封面图 URL',
  reminder         VARCHAR(300) NOT NULL DEFAULT '' COMMENT '温馨提示',
  custom_fields    JSON COMMENT '自定义报名字段模板',
  status           ENUM('upcoming','active','ended','full','cancelled','offline','frozen')
                   NOT NULL DEFAULT 'upcoming' COMMENT '活动状态',
  offline_reason   VARCHAR(500) COMMENT '下架理由',
  offline_at       DATETIME COMMENT '下架时间',
  reminded_24h     TINYINT(1) NOT NULL DEFAULT 0 COMMENT '已发送24小时提醒',
  reminded_1h      TINYINT(1) NOT NULL DEFAULT 0 COMMENT '已发送1小时提醒',
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_creator  (creator_openid),
  INDEX idx_start    (start_time),
  INDEX idx_status   (status),
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 子活动/场次表
-- ============================================================
CREATE TABLE IF NOT EXISTS sub_activities (
  id               VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  activity_id      VARCHAR(36) NOT NULL COMMENT '主活动 ID',
  name             VARCHAR(100) NOT NULL COMMENT '场次名称',
  start_time       DATETIME NOT NULL COMMENT '场次开始时间',
  end_time         DATETIME NOT NULL COMMENT '场次结束时间',
  location_name    VARCHAR(200) NOT NULL DEFAULT '' COMMENT '场次地点',
  max_participants INT NOT NULL DEFAULT 0 COMMENT '场次人数限制（0=不限）',
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_activity (activity_id),
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 报名记录表
-- ============================================================
CREATE TABLE IF NOT EXISTS registrations (
  id               VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  activity_id      VARCHAR(36) NOT NULL COMMENT '活动 ID',
  sub_activity_id  VARCHAR(36) COMMENT '子活动 ID（可选）',
  user_openid      VARCHAR(100) NOT NULL COMMENT '用户 openid',
  custom_data      JSON COMMENT '报名字段数据（敏感字段 AES 加密）',
  force_registered TINYINT(1) NOT NULL DEFAULT 0 COMMENT '强制报名（知晓时间冲突）',
  checkin_time     DATETIME COMMENT '签到时间',
  cancelled_at     DATETIME COMMENT '取消时间',
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_activity    (activity_id),
  INDEX idx_user        (user_openid),
  INDEX idx_sub         (sub_activity_id),
  INDEX idx_created     (created_at),
  UNIQUE KEY uk_user_activity (user_openid, activity_id, sub_activity_id),
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 审计日志表
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  operator_openid  VARCHAR(100) NOT NULL COMMENT '操作人 openid',
  action_type      VARCHAR(50) NOT NULL COMMENT '操作类型（REVEAL_DATA/EXPORT_DATA/OFFLINE等）',
  target_id        VARCHAR(100) COMMENT '目标 ID（报名记录 ID 或活动 ID）',
  content          VARCHAR(500) COMMENT '操作内容摘要',
  ip               VARCHAR(50) COMMENT '操作 IP',
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_operator (operator_openid),
  INDEX idx_action   (action_type),
  INDEX idx_created  (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 举报表
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  activity_id      VARCHAR(36) NOT NULL COMMENT '被举报活动 ID',
  reporter_openid  VARCHAR(100) NOT NULL COMMENT '举报人 openid',
  reason           VARCHAR(200) NOT NULL COMMENT '举报原因',
  handled          TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已处理',
  handler_openid   VARCHAR(100) COMMENT '处理人 openid',
  handled_at       DATETIME COMMENT '处理时间',
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_activity (activity_id),
  INDEX idx_handled  (handled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 验证码表（用于导出等操作的二次验证）
-- ============================================================
CREATE TABLE IF NOT EXISTS verify_codes (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  openid       VARCHAR(100) NOT NULL,
  code_type    VARCHAR(30) NOT NULL COMMENT '验证类型（export/delete等）',
  code         VARCHAR(10) NOT NULL,
  used         TINYINT(1) NOT NULL DEFAULT 0,
  expires_at   DATETIME NOT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_openid_type (openid, code_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 学校名册（Excel 导入学生底库）
-- ============================================================
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
