-- 活动公开展示前内容审核（与微信 msg_sec_check / img_sec_check 联动）
ALTER TABLE activities
  ADD COLUMN moderation_status ENUM('pending','passed','rejected') NOT NULL DEFAULT 'passed'
    COMMENT '仅 passed 在发现/搜索中公开展示'
    AFTER offline_at;
