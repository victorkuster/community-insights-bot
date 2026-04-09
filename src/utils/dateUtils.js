const normalizeDate = (input) => {
  const date = input instanceof Date ? new Date(input.getTime()) : new Date(input);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }
  return date;
};

const formatDateRange = (start, end) => {
  const pad = num => String(num).padStart(2, '0');
  return `${pad(start.getDate())}/${pad(start.getMonth() + 1)}/${start.getFullYear()}–${pad(end.getDate())}/${pad(end.getMonth() + 1)}/${end.getFullYear()}`;
};

const getWeeklyRanges = (startDate, endDate) => {
  const ranges = [];
  let currentStart = normalizeDate(startDate);
  const end = normalizeDate(endDate);

  while (currentStart <= end) {
    const weekEnd = new Date(currentStart.getTime());
    weekEnd.setDate(weekEnd.getDate() + 6);

    if (weekEnd > end) {
      weekEnd.setTime(end.getTime());
    }

    ranges.push({
      start: new Date(currentStart.getTime()),
      end: new Date(weekEnd.getTime()),
      label: formatDateRange(currentStart, weekEnd)
    });

    currentStart.setDate(currentStart.getDate() + 7);
  }

  return ranges;
};

const groupMessagesByWeek = (messages, startDate, endDate) => {
  const weeklyRanges = getWeeklyRanges(startDate, endDate);
  messages.sort((a, b) => normalizeDate(a.createdAt) - normalizeDate(b.createdAt));

  return weeklyRanges.map(range => {
    const weekMessages = messages.filter(message => {
      const createdAt = normalizeDate(message.createdAt);
      return createdAt >= range.start && createdAt <= range.end;
    });
    return { ...range, messages: weekMessages };
  });
};

module.exports = {
  normalizeDate,
  formatDateRange,
  getWeeklyRanges,
  groupMessagesByWeek
};