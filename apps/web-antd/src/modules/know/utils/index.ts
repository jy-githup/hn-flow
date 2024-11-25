import dayjs from 'dayjs';

export function formatTime(dateString?: Date): string {
  if (!dateString) {
    return '';
  }

  const now = dayjs();
  const date = dayjs(dateString);

  let secondsDiff = now.diff(date, 'second');

  if (secondsDiff < 60) {
    if (secondsDiff < 0) {
      secondsDiff = 0;
    }

    return `${secondsDiff || 1}秒前`;
  }

  const minutesDiff = now.diff(date, 'minute');
  if (minutesDiff < 60) {
    return `${minutesDiff}分钟前`;
  }

  const hoursDiff = now.diff(date, 'hour');
  if (hoursDiff < 24) {
    return `${hoursDiff}小时前`;
  }

  const isYesterday = now.isSame(date, 'day');
  if (isYesterday) {
    return `昨天 ${date.format('HH:mm')}`;
  }

  return date.format('YYYY-MM-DD HH:mm');
}
