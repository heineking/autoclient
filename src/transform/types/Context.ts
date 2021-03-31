export interface Property {
  kind: 'query' | 'path' | 'body' | '';
  questionMark: '' | '?';
  name: string;
  type: string;
}

export interface Request {
  functionName: string;
  httpMethod: string;
  url: string;
  queryString: string;
  questionMark: '' | '?';
  bodyParam: string;
  properties: Property[];
  requestType: string;
  responseType: string;
  produces: 'json' | 'text' | 'empty' | '';
}

export interface ModelProperty {
  name: string;
  type: string;
}

export interface Model {
  name: string;
  params: string;
  properties: ModelProperty[];
}

export interface Transform {
  paths: string[];
  requests: Request[];
  models: Model[];
}
