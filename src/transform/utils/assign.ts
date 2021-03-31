
export const assign = <T extends object = object>(o: T, props: { [key in keyof T]?: T[key] }): void => {
  Object.assign(o, props);
};
