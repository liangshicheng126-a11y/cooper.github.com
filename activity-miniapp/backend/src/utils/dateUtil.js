// src/utils/dateUtil.js
function formatDate(date, fmt = 'YYYY-MM-DD HH:mm') {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  const map = {
    'YYYY': d.getFullYear(), 'MM': String(d.getMonth() + 1).padStart(2, '0'),
    'DD': String(d.getDate()).padStart(2, '0'), 'HH': String(d.getHours()).padStart(2, '0'),
    'mm': String(d.getMinutes()).padStart(2, '0'), 'ss': String(d.getSeconds()).padStart(2, '0'),
  }
  return fmt.replace(/YYYY|MM|DD|HH|mm|ss/g, m => map[m])
}

module.exports = { formatDate }
