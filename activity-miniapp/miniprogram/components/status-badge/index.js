// components/status-badge/index.js
const STATUS_MAP = {
  upcoming:  '即将开始',
  active:    '进行中',
  ended:     '已结束',
  cancelled: '已取消',
  full:      '已满员',
  draft:     '草稿',
}

Component({
  properties: {
    status: { type: String, value: 'upcoming' },
  },
  computed: {},
  data: {
    type: 'upcoming',
    label: '即将开始',
  },
  observers: {
    status(val) {
      this.setData({
        type:  val,
        label: STATUS_MAP[val] || val,
      })
    },
  },
})
