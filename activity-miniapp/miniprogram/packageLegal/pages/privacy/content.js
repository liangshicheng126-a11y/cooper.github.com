/**
 * 隐私政策正文（与首次弹窗摘要一致并可展开为完整说明）
 */

const ZH = [
  {
    title: '一、引言',
    paragraphs: [
      '欢迎使用「活动报名」微信小程序（下称「本小程序」）。本《隐私协议》（下称「本协议」）旨在向您说明：我们如何收集、使用、存储、共享与保护您的个人信息，以及您所享有的权利。',
      '请您在使用本小程序前仔细阅读并充分理解本协议，特别是以加粗或下划线等形式提示与您权益有重大关系的条款。您点击同意或实际使用我们的服务，即表示您已阅读并同意接受本协议的约束。',
    ],
  },
  {
    title: '二、适用范围',
    paragraphs: [
      '本协议适用于您通过本小程序注册账户、浏览与报名活动、使用签到／海报等与活动相关的全部功能。',
      '若本小程序内含跳转至第三方服务的链接（如地图导航、外部网页），相关第三方将按照其单独的隐私政策处理信息，不适用本协议，请您审慎阅读。',
    ],
  },
  {
    title: '三、我们收集的信息',
    paragraphs: ['为实现活动发布、报名及管理，我们可能收集以下与您相关的信息（具体以您在界面中自愿填写或授权的范围为准）：'],
    bullets: [
      '身份信息：由微信开放平台返回的openid、在您授权情况下的昵称、头像等公开资料（用于向您本人及同一活动场景的参与者展示身份）。',
      '报名与会务信息：姓名、手机号、邮箱、身份证号等在活动发起人设置的报名表单中填报的字段，用于报名信息校验、统计分析、会务通知。',
      '设备与日志信息：包括但不限于设备型号、操作系统、微信小程序版本、访问时间与页面路径等，用于保障服务安全稳定运行、统计分析（在合法必要范围内最小化采集）。',
      '位置信息（可选）：在您单独授权并使用「活动地点导航」「附近」等相关功能时，我们可能获取或使用您的大致／精确地理位置，以实现导航或就近检索；我们不会将前述位置单独用于与用户画像无关的营销目的。',
    ],
  },
  {
    title: '四、我们如何使用 Cookie 及同类技术',
    paragraphs: [
      '在您使用本小程序时，我们可能通过本地缓存、小程序存储等机制存储必要的会话或偏好设置（例如您是否已同意本协议）。这些技术帮助我们识别登录状态并保持基本功能正常运行。',
    ],
  },
  {
    title: '五、我们如何使用和保护信息',
    paragraphs: [],
    bullets: [
      '使用目的限定：在您同意的范围内用于身份展示、活动组织、会务通知与沟通、统计分析、风险防范与违法违规处置。',
      '加密与存储：服务端对敏感身份信息（如身份证号码、手机号码等）在存储上进行加密处理；在非必要展示场景下进行脱敏呈现（例如 138****5678）。',
      '访问控制：仅活动发起人（或在其授权范围内的管理人员）在满足业务规则与安全策略的前提下方可查看报名者完整明细；我们可能要求二次核验以降低信息泄露风险。',
      '我们不会将您的个人信息用于非法买卖，亦不会主动向无关第三方出售个人信息。',
    ],
  },
  {
    title: '六、共享、转让与公开披露',
    paragraphs: [],
    bullets: [
      '共享：在法律法规允许或征得您同意的范围内，我们可能向微信公众平台、云服务商、实名／短信核验等履约所必需的合作方披露有限信息（仅用于实现本条所述之目的）。我们会通过合同与安全措施要求受托方妥善处理信息。',
      '转让：如因合并、分立、资产出售等原因涉及个人信息转让，我们将要求受让方继续受与本协议实质上同等义务的约束。',
      '公开披露：我们不会公开披露可识别您个人身份的敏感内容，法律法规或政府机关依法要求的情形除外。',
    ],
  },
  {
    title: '七、保存期限',
    paragraphs: [],
    bullets: [
      '在实现本协议所述目的所必需的期限内留存您的相关信息；法律、行政法规有更长期限要求的，从其规定。',
      '活动结束后，为维护统计与争议的合理需要，我们可能对历史报名记录按内部规则在一定期限内保留并采取匿名化或缩减标识的手段；活动结束满 180 天后，对相关报名数据进行匿名化处理，降低与个人的关联度（除非法律要求我们延长保存）。',
    ],
  },
  {
    title: '八、您的权利',
    paragraphs: [],
    bullets: [
      '访问与更正：您可在「我的」或相关表单内查看／修改您主动提交的报名信息（以活动发起人允许的范围为准）。',
      '撤回同意：在微信客户端内您可通过「设置－小程序」撤回对本小程序的系统授权（可能影响部分依赖授权的功能）；您也可联系活动发起人或管理方停止使用您的信息。',
      '删除与注销：在符合适用法律的前提下，您可以申请删除或注销与个人身份强绑定的数据处理；我们可能需保留法律义务所必需的记录。',
      '如您对个人信息处理有疑问，可通过本小程序内向活动组织方披露的联系方式或通过平台客服渠道与我们联系。',
    ],
  },
  {
    title: '九、未成年人保护',
    paragraphs: [
      '若您是未满十八周岁的未成年人，请在监护人陪同下阅读并使用本小程序，并征得监护人同意后再提供个人信息。若监护人发现未经授权收集了未成年人信息的，请联系我们以便采取更正或删除等措施。',
    ],
  },
  {
    title: '十、本协议的修订',
    paragraphs: [
      '我们可能根据国家法律法规或服务变化适时修订本协议。更新后，我们会在本小程序内公示修订内容；若修订涉及您重大权利的变更，我们可能通过弹窗、公告等显著方式另行征求您的授权同意。',
      '如您不同意修订内容，您可以停止使用我们的服务或按页面提示行使相应权利。',
    ],
  },
  {
    title: '十一、与我们联系',
    paragraphs: [
      '如您对本协议或个人信息保护有任何疑问、意见或投诉，请通过您在具体活动主办方处获得的联系方式与该主办方沟通；若本平台另有公示的投诉渠道，您亦可按其指引与我们取得联系。我们会在合理期限内答复您的请求。',
    ],
  },
]

const EN = [
  {
    title: '1. Introduction',
    paragraphs: [
      'Welcome to the “Activity Registration” WeChat Mini Program (“the Mini Program”). This Privacy Policy explains how we collect, use, store, share and protect your personal information, and what rights you have.',
      'Please read this Policy carefully before you use the Mini Program. By tapping “Agree” or by continuing to use our services, you acknowledge that you have read and understood this Policy.',
    ],
  },
  {
    title: '2. Scope',
    paragraphs: [
      'This Policy applies when you browse activities, register, check in, generate posters or use other features offered in this Mini Program.',
      'Third-party links (e.g. maps or external webpages) follow their own policies; please review those separately.',
    ],
  },
  {
    title: '3. Information We Collect',
    paragraphs: ['We may collect information you provide or authorize, including:'],
    bullets: [
      'Account / identity: identifiers returned by WeChat such as OpenID and, subject to authorization, nickname and avatar.',
      'Registration data: name, phone number, email, ID number and custom fields configured by organisers for event management and notices.',
      'Device & diagnostics: minimal technical data necessary for security and stable operation.',
      'Location (optional): only where you authorize navigation or proximity features; not used beyond those purposes.',
    ],
  },
  {
    title: '4. Cookies & Similar Technologies',
    paragraphs: [
      'We may use local/mobile storage mechanisms to persist session preferences (e.g. privacy consent). They help authenticate your session and keep core features operational.',
    ],
  },
  {
    title: '5. Use & Protection',
    paragraphs: [],
    bullets: [
      'Purposes limited to organising events, identity display, reminders, analytics and risk control.',
      'Sensitive fields encrypted at rest; masked presentation where full values are unnecessary.',
      'Access controls restrict full participant lists mainly to organisers and authorised staff.',
      'We do not sell your personal information.',
    ],
  },
  {
    title: '6. Sharing, Transfer & Disclosure',
    paragraphs: [],
    bullets: [
      'We may share strictly necessary information with processors (e.g. cloud infrastructure) bound by contractual safeguards.',
      'Corporate transactions: successor entities remain subject to materially equivalent obligations.',
      'Public disclosure only when required by law or competent authorities.',
    ],
  },
  {
    title: '7. Retention',
    paragraphs: [],
    bullets: [
      'Data is retained as long as reasonably needed for stated purposes unless law requires otherwise.',
      'After an event concludes, archival data may be anonymised approximately 180 days later to reduce linkage to identifiable individuals, except where prolongation is legally required.',
    ],
  },
  {
    title: '8. Your Rights',
    paragraphs: [],
    bullets: [
      'Access/correct registration details within the scopes allowed by organisers.',
      'Withdraw WeChat-authorised scopes via client settings.',
      'Request deletion/account handling where legally applicable.',
      'Contact the event organiser or platform channel through in-app disclosures for privacy requests.',
    ],
  },
  {
    title: '9. Children',
    paragraphs: [
      'Guardians must accompany minors using the Mini Program. If we learn that we processed a child’s data without proper consent, we will take corrective steps.',
    ],
  },
  {
    title: '10. Changes',
    paragraphs: [
      'We may update this Policy when laws or our services evolve. Important changes may be surfaced via dialogs or announcements. Continued use may constitute acknowledgement where permitted by law.',
    ],
  },
  {
    title: '11. Contact',
    paragraphs: [
      'For questions about this Policy, please reach out using the organisers’ contact routes published for each activity, or official support routes when available.',
    ],
  },
]

module.exports = { ZH, EN }
