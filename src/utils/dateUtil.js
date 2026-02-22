// utils/dateUtil.js
/**
 * 时间格式化工具（原生 JS 版）
 * @param {Date|String|Number} date - 要格式化的时间（Date对象/ISO字符串/时间戳）
 * @param {String} format - 格式模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {String} 格式化后的时间字符串
 * 示例：formatDate(new Date()) → 2026-02-07 18:00:00
 * 示例：formatDate('2026-02-07T10:00:00.000Z') → 2026-02-07 18:00:00（自动转换时区）
 */
function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  // 处理入参：转成 Date 对象（兼容 ISO 字符串、时间戳、Date 对象）
  const targetDate = new Date(date);
  // 处理无效时间
  if (isNaN(targetDate.getTime())) {
    console.error('无效的时间参数：', date);
    return '';
  }

  // 定义时间补零方法（如 9 → '09'）
  const padZero = (num) => num.toString().padStart(2, '0');

  // 提取时间字段
  const year = targetDate.getFullYear(); // 年
  const month = padZero(targetDate.getMonth() + 1); // 月（0-11 → 1-12）
  const day = padZero(targetDate.getDate()); // 日
  const hour = padZero(targetDate.getHours()); // 时
  const minute = padZero(targetDate.getMinutes()); // 分
  const second = padZero(targetDate.getSeconds()); // 秒

  // 替换格式模板
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second);
}

/**
 * 获取当前格式化时间
 * @param {String} format - 格式模板
 * @returns {String} 示例：2026-02-07 18:00:00
 */
function getCurrentTime(format = 'YYYY-MM-DD HH:mm:ss') {
  // Mongoose default value callback might pass arguments (like the document)
  if (typeof format !== 'string') {
    format = 'YYYY-MM-DD HH:mm:ss';
  }
  return formatDate(new Date(), format);
}

/**
 * 解析 MongoDB 的 ISO 时间为本地格式化时间（核心适配日志场景）
 * @param {String} isoTime - MongoDB 的 ISO 时间字符串（如 createTime）
 * @returns {String} 示例：2026-02-07 18:00:00
 */
function parseMongoISOTime(isoTime) {
  return formatDate(isoTime);
}

// 导出方法
export {
  formatDate,
  getCurrentTime,
  parseMongoISOTime
};