export type Paths = Record<string, PathItemObject>;
export type Definitions = Record<string, SchemaObject>;

export interface Document {
  swagger: string;
  paths?: Paths;
  definitions?: Definitions;
}

export interface HeaderObject {
  type?: string;
  description?: string;
  required?: boolean;
  schema: ReferenceObject | SchemaObject;
}

export type Method = 'get' | 'put' | 'post' | 'delete';

export interface PathItemObject {
  $ref?: string;
  summary?: string;
  description?: string;
  get?: OperationObject;
  put?: OperationObject;
  post?: OperationObject;
  delete?: OperationObject;
  options?: OperationObject;
  head?: OperationObject;
  patch?: OperationObject;
  parameters?: (ReferenceObject | ParameterObject)[];
}

export interface LinkObject {
  operationRef?: string;
  operationId?: string;
  parameters?: (ReferenceObject | ParameterObject)[];
  requestBody?: RequestBody;
  description?: string;
}

export type Parameter = (ReferenceObject | ParameterObject);

export type Parameters = Parameter[];

export interface OperationObject {
  description?: string;
  tags?: string[];
  summary?: string;
  produces: string[];
  operationId?: string;
  parameters?: Parameters;
  requestBody?: ReferenceObject | RequestBody;
  responses?: Record<string, ReferenceObject | ResponseObject>;
}

export type ParameterIn = 'query' | 'header' | 'path' | 'formData' | 'body';

export type ParameterType = 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'file';

export type Schema = ReferenceObject | SchemaObject;

export interface ParameterObject {
  name?: string;
  in?: ParameterIn;
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  schema?: Schema;
  type?: ParameterType;
  items?: ReferenceObject | SchemaObject;
  enum?: string[];
}

export type ReferenceObject = { $ref: string };

export interface ResponseObject {
  description?: string;
  headers?: Record<string, ReferenceObject | HeaderObject>;
  schema?: Schema;
}

export interface RequestBody {
  description?: string;
  content?: {
    [contentType: string]: { schema: ReferenceObject | SchemaObject };
  };
}

export interface SchemaObject {
  description?: string;
  required?: string[];
  enum?: string[];
  type?: string; // assumed "object" if missing
  items?: ReferenceObject | SchemaObject;
  allOf?: SchemaObject;
  properties?: Record<string, ReferenceObject | SchemaObject>;
  additionalProperties?: boolean | ReferenceObject | SchemaObject;
}
