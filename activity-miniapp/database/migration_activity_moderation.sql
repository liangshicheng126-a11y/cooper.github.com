-- 活动公开展示前人工审核状态（activities.moderation_status）
-- 【必跑】升级到带「发布→待审→发现广场」逻辑的代码库前须在目标库执行本文件（执行一次）。
-- 若报错 Duplicate column name 'moderation_status'，说明已加过列，可忽略。
--
-- DEFAULT 'passed'：仅影响「迁移瞬间已存在的」历史行（保持当时即可在广场展示）。
-- 新发布活动仍由服务端 Insert 写入 pending / passed（依 AUTO_APPROVE_ACTIVITY_PUBLISH）。

ALTER TABLE activities
  ADD COLUMN moderation_status ENUM('pending','passed','rejected') NOT NULL DEFAULT 'passed'
    COMMENT '仅 passed 在发现/搜索中公开展示；pending 待人审'
    AFTER offline_at;
