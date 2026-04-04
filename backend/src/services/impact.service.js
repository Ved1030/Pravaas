exports.calculateImpact = (timeSaved) => {
  const daily = timeSaved;
  const weekly = timeSaved * 7;
  const yearly = timeSaved * 365;

  return {
    daily,
    weekly,
    yearly,
  };
};