import matchAll from 'string.prototype.matchall';
import { OpenAPI2, Context } from '../types';
import { visit } from '../visit';
import { createProp } from './createProp';
import { assign, camelCase, schemaType } from '../utils';

const getMethodName = (() => {
  const methodNames: string[] = [];

  return (operationId: string): string => {
    const methodName = operationId.replace(/_/g, '');

    methodNames.push(methodName)

    const duplicates = methodNames.filter((m) => m === methodName);
    const postfix = duplicates.length > 1 ? `${duplicates.length}` : '';

    return `${methodName}${postfix}`;
  }
})();

export function createRequests(path: string, pathItemObject: OpenAPI2.PathItemObject) {
  const url = createUrl(path);

  let requests: Context.Request[] = [];
  let request!: Context.Request;

  visit(pathItemObject, {
    '/:httpMethod'({ params: { httpMethod } }) {
      if (!!request) {
        requests = [...requests, request];
      }
      request = requestFactory({ url, httpMethod });
    },
    '/:method/operationId'({ value: operationId }) {
      const methodName = getMethodName(operationId);
      assign(request, {
        functionName: camelCase(methodName),
        requestType: `${methodName}Request`,
      });
    },
    '/:method/produces'({ value }) {
      if (value.length === 0) {
        request.produces = 'empty';
      } else if (value.includes('application/json')) {
        request.produces = 'json';
      } else {
        request.produces = 'text';
        request.responseType = 'string';
      }
    },
    '/:method/parameters/:index'({ value: param }) {
      const property = createProp(param);
      request.questionMark = '';
      request.properties.push(property);

      if (property.kind === 'body') {
        property.name = '$body';
        request.bodyParam = '$body';
      } else if (property.kind === 'query') {
        const { queryString } = request;
        const query = `${property.name}=\${request.${property.name}}`;
        const tokens = queryString ? [queryString, query] : [`?${query}`];
        request.queryString = tokens.join('&');
      }
    },
    '/:method/responses/:status'({ value, params }) {
      if (request.responseType) {
        request.responseType = 'any'
      } else if (params.status === '204') {
        request.responseType = 'void';
      } else if (value.schema) {
        request.responseType = schemaType(value.schema, { unwrap: true });
      } else {
        request.responseType = 'any';
      }
    },
  });

  addOptionalBody(request);

  return [...requests, request];
}

function addOptionalBody(request: Context.Request): void {
  const hasBody = request.properties.some((p) => p.kind === 'body');
  const isValidMethod = ['post'].includes(request.httpMethod);

  if (hasBody || !isValidMethod) {
    return;
  }

  request.bodyParam = '$body';

  request.properties.push({
    kind: 'body',
    name: '$body',
    questionMark: '?',
    type: 'string | object | FormData',
  });
}

function createUrl(path: string) {
  const parameters = [...matchAll(path, /{(.*?)}/g)];
  return parameters.reduce((path, [param, name]) =>
    path.replace(param, `\$\{request.${name}\}`)
  , path); 
}

function requestFactory(props: Partial<Context.Request> = {}): Context.Request {
  return {
    bodyParam: '_',
    produces: '',
    functionName: '',
    httpMethod: '',
    properties: [],
    questionMark: '?',
    requestType: '',
    responseType: '',
    url: '',
    queryString: '',
    ...props,
  };
}
