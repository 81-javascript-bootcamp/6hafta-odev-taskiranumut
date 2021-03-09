export const getNow = () => {
  return new Date();
};

export const addMinutes = (date, minutes) => {
  return new Date(date.getTime() + minutes * 60000);
};

/* istanbul ignore next */
export const getRemainingDate = (date) => {
  const total = Date.parse(date) - Date.parse(getNow());
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  return { total, minutes, seconds };
};
