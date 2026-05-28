-- database/migrate-all.sql
-- 已有库增量升级：在 schema.sql 之后执行一次（可重复执行，已存在列/表会报错可忽略）
USE activity_miniapp;

SOURCE migration_activity_moderation.sql;
SOURCE migration_wx_group_chat.sql;
SOURCE migration_school_rosters.sql;
