// src/services/aiPosterService.js - AI 海报生成
const axios = require('axios')
const logger = require('../utils/logger')
const { queryOne } = require('../config/db')
const { formatDate } = require('../utils/dateUtil')

exports.generatePoster = async (req, res, next) => {
  try {
    const { activityId, style, color, extraText } = req.body

    const activity = await queryOne('SELECT * FROM activities WHERE id = ?', [activityId])
    if (!activity) return res.status(404).json({ code: 404, message: '活动不存在' })
    if (activity.creator_openid !== req.user.openid && !req.user.isAdmin) {
      return res.status(403).json({ code: 403, message: '无权限' })
    }

    const prompt = buildPrompt(activity, style, color, extraText)

    // 调用豆包（火山方舟）图像生成 API
    const response = await axios.post(
      process.env.AI_POSTER_API_URL || 'https://ark.cn-beijing.volces.com/api/v3/images/generations',
      {
        model: 'doubao-seedream-3-0-t2i-250415',
        prompt,
        size: '1024x1428',
        response_format: 'url',
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.AI_POSTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      }
    )

    const posterUrl = response.data?.data?.[0]?.url
    if (!posterUrl) throw new Error('AI 生成失败')

    // 内容安全检测海报图片
    const { checkImage } = require('./wxService')
    await checkImage(posterUrl)

    res.json({ code: 0, data: { posterUrl } })
  } catch (e) {
    logger.error('AI poster generation failed:', e.message)
    res.status(500).json({ code: 500, message: 'AI 海报生成失败，请重试' })
  }
}

function buildPrompt(activity, style, color, extraText) {
  const styles = {
    modern: '现代简约风格，干净背景，几何设计元素',
    colorful: '炫彩活泼风格，鲜艳色彩，动感设计',
    minimal: '极简主义黑白风格，留白充足',
    nature: '自然清新风格，绿色植物元素，柔和色调',
    tech: '科技感风格，深色背景，霓虹发光元素，数字元素',
    retro: '复古风格，做旧纹理，复古排版',
  }
  const styleDesc = styles[style] || styles.modern

  return `为活动设计一张精美的宣传海报，${styleDesc}。
主色调：${color}。
活动名称：${activity.name}
活动时间：${activity.start_time}
活动地点：${activity.location_name || '待定'}
${extraText ? '附加文案：' + extraText : ''}
要求：海报竖版（9:13比例），文字清晰，设计专业，适合微信朋友圈分享。使用中文。不要有任何违禁内容。`
}
