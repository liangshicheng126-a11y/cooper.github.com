// src/middleware/validate.js - 请求校验
const Joi = require('joi')

function validate(schema, source = 'body') {
  return (req, res, next) => {
    // stripUnknown：未在 schema 声明的字段不触发 400（兼容缺 locationCountry 等旧版）；不把 value 写回 body，原字段仍留给控制器
    const { error } = schema.validate(req[source], { abortEarly: false, stripUnknown: true })
    if (error) {
      const message = error.details.map(d => d.message).join('; ')
      return res.status(400).json({ code: 400, message })
    }
    next()
  }
}

const schemas = {
  createActivity: Joi.object({
    name: Joi.string().min(2).max(60).required(),
    description: Joi.string().max(5000).allow(''),
    startTime: Joi.string().isoDate().required(),
    endTime: Joi.string().isoDate().required(),
    locationName: Joi.string().max(200).allow(''),
    locationAddress: Joi.string().max(500).allow(''),
    // 海外纯文本地址无坐标；部分客户端会传 "" 而非 null，需 empty 否则 Joi 报 number 类型错误
    latitude: Joi.number().allow(null).empty(''),
    longitude: Joi.number().allow(null).empty(''),
    locationCountry: Joi.string().max(10).default('CN'),
    maxParticipants: Joi.number().integer().min(0).default(0),
    category: Joi.string().max(20).default('other'),
    coverImage: Joi.string().uri().allow('').allow(null),
    reminder: Joi.string().max(200).allow(''),
    customFields: Joi.array().default([]),
    subActivities: Joi.array().default([]),
    requireInvite: Joi.boolean().default(false),
    inviteCode: Joi.string().max(20).allow('').allow(null),
  }),

  register: Joi.object({
    activityId: Joi.string().required(),
    subActivityId: Joi.string().allow(null).allow(''),
    customData: Joi.object().default({}),
    forceRegister: Joi.boolean().default(false),
    inviteCode: Joi.string().max(20).allow('').allow(null),
  }),
}

module.exports = { validate, schemas }
