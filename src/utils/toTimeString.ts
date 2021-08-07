export const toTimeString = (date: number) => {
  return new Date(date).toLocaleTimeString().split(" ")[0];
};
