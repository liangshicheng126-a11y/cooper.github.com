-- 活动微信群二维码（发起人上传，报名者/发起人可见扫码）
ALTER TABLE activities
  ADD COLUMN wx_group_chat_name VARCHAR(200) NOT NULL DEFAULT '' COMMENT '群名称展示（默认可为活动名）' AFTER reminder,
  ADD COLUMN wx_group_chat_qrcode_url VARCHAR(800) NOT NULL DEFAULT '' COMMENT '微信群二维码图片 URL' AFTER wx_group_chat_name;
