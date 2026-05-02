// src/middleware/validate.js - 请求校验
const Joi = require('joi')

function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error } = schema.validate(req[source], { abortEarly: false })
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
    description: Joi.string().max(2000).allow(''),
    startTime: Joi.string().isoDate().required(),
    endTime: Joi.string().isoDate().required(),
    locationName: Joi.string().max(200).allow(''),
    locationAddress: Joi.string().max(500).allow(''),
    latitude: Joi.number().allow(null),
    longitude: Joi.number().allow(null),
    maxParticipants: Joi.number().integer().min(0).default(0),
    category: Joi.string().max(20).default('other'),
    coverImage: Joi.string().uri().allow('').allow(null),
    reminder: Joi.string().max(200).allow(''),
    customFields: Joi.array().default([]),
    subActivities: Joi.array().default([]),
  }),

  register: Joi.object({
    activityId: Joi.string().required(),
    subActivityId: Joi.string().allow(null).allow(''),
    customData: Joi.object().default({}),
    forceRegister: Joi.boolean().default(false),
  }),
}

module.exports = { validate, schemas }
