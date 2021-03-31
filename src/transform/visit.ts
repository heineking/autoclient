import { match, MatchFunction, regexpToFunction } from 'path-to-regexp';

type Context = { value: any, params: { [param: string]: string }, path: string };
type Visitor = (context: Context) => void; 
type Visitors = Record<string, Visitor>;

export function visit<T extends object = object>(o: T, visitors: Visitors): void {
  const cb = createCallback(visitors);
  createWalk(cb)(o);
}

function createCallback(visitors: Visitors) {
  const handlers = Object
    .entries(visitors)
    .map<[MatchFunction<{ [s: string]: any }>, Visitor]>(([path, visitor]) => [match(path), visitor]);

  const findHandler = (path: string) =>
    handlers
      .map(([fn, visitor]) => ({ match: fn(path), visitor }))
      .find(({ match }) => !!match);

  return (value: string, path: string) => {
    const { match, visitor } = findHandler(path) || {};
    if (typeof match === 'object' && visitor) {
      match.params = decode(match.params);
      visitor({ value, ...match });
    }
  };
}

function decode<T extends object = object>(o: T): T {
  return Object
    .entries(o)
    .reduce((acc, [key, value]) => ({
      ...acc,
      [key]: decodeURIComponent(value),
    }), Object.create(null));
} 

function createWalk<TResult>(cb: (value: string, path: string) => void) {

  return (x: TResult) => {
    walk(x);
  };

  function walk(x: any, path: string = '') {
    cb(x, path);

    if (!existy(x) || !isObject(x)) {
      return;
    }

    for (const key in x) {
      const value = x[key];
      walk(value, `${path}/${encodeURIComponent(key)}`);
    }
  }
}

function existy(x: any) {
  return x != null;
}

function isObject(x: any) {
  return typeof x === 'object' && x !== null;
}
