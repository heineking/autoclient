export type Fetch = (url: string, init: RequestInit) => Promise<Response>;
export type Handler = (send: Fetch) => Fetch; 

let send!: <TResult>(fn: (fetch: Fetch) => Promise<TResult>, ...handlers: Handler[]) => Promise<TResult>;

const addContext: Handler = (send) => (url, init) => {
  Object.defineProperty(init, '$context', {
    enumerable: false,
    writable: false,
    value: {},
  });
  return send(url, init);
};

export const addHeader = (name: string, getValue: () => any): Handler => (send) => (url, init) => {
  const value = getValue();
  if (value) {
    Object.assign(init.headers, {
      [name]: value,
    });
  }
  return send(url, init);
};

const createPipeline = (...fns: Handler[]) => {
  return (fetch: Fetch) => [...fns].reduce((f, g) => (send: Fetch) => f(g(send)))(fetch);
};

const initialize = (...globalHandlers: Handler[]) => {
  if (!!send) {
    throw new Error();
  }
  send = <TResult>(fn: (fetch: Fetch) => Promise<TResult>, ...requestHandlers: Handler[]) => {
    const pipeline = createPipeline(
      addContext,
      ...globalHandlers,
      ...requestHandlers
    );
    return fn(pipeline(fetch));
  };
};

const prop = <T, K extends keyof T>(x: T, key: K | string): T[K] | undefined => {
  if (key === '__undef__') {
    return;
  }
  return (x as any)[key] as T[K];
};

export default {
  initialize,
  get send() {
    return send;
  }
}

const withBody = ($body?: any): Partial<RequestInit> => {
  if ($body === undefined) {
    return {};
  }
  if (typeof $body === 'string') {
    return {
      headers: { 'content-type': 'application/json' },
      body: $body,
    };
  }
  if ($body instanceof FormData) {
    return { body: $body };
  }
  if (typeof $body === 'object') {
    return {
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify($body)
    };
  }
  throw new Error(`unknown body type passed.`);
};

const createRequest = (init: Partial<RequestInit>): RequestInit => {
  return {
    headers: {
      ...(init.headers || {})
    },
    credentials: 'include',
    mode: 'cors',
    ...init,
  };
};

const is = {
  okay: async (res: Response) => {
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }
    return res;
  },
};

const produces = {
  json<TResult>(res: Response): Promise<TResult> {
    const contentType = res.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return res.json();
    }
    throw new Error('Unable to deserialize response. Expected header to contain "content-type: application/json".');
  },
  text(res: Response): Promise<string> {
    return res.text();
  },
  async empty(res: Response): Promise<void> {
    const contentLength = res.headers.get('content-length') || 0;
    if (contentLength > 0) {
      const text = await res.text();
      throw new Error(`The response is not empty. Found content: "${text}".`);
    }
    return Promise.resolve();
  }
}
