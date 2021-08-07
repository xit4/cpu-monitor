export const cn = (...args: (string | Record<string, boolean>)[]) => {
  return args
    .reduce((acc: string[], curr) => {
      if (typeof curr === "string") {
        return [...acc, curr];
      } else {
        return [
          ...acc,
          ...Object.entries(curr)
            .filter(([key, value]) => value)
            .map(([key, value]) => key),
        ];
      }
    }, [])
    .join(" ");
};
