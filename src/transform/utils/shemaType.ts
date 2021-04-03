import { OpenAPI2 } from '../types';
import { visit } from '../visit';
import { tsType, refname, unwrap } from './index';

export const schemaType = (schema: OpenAPI2.Schema, config: Partial<Config> = {}): string => {
  config = configInit(config);
  let type = '';

  visit(schema, {
    '/enum'({ value }) {
      type = value.join(' | ');
    },
    '/type'({ value }) {
      if (!type) {
        type = tsType(value);
      }
    },
    '/x-nullable'() {
      type = `${type}${type ? ' | ' : ''}null`;
    },
    '/%24ref'({ value: $ref }) {
      type = refname($ref);
    },
    '/additionalProperties'({ value }) {
      type = `{ [key: string]: ${schemaType(value)} }`;
    },
    '/items/%24ref'({ value: $ref }) {
      type = `${refname($ref)}[]`;
    },
    '/items/type'({ value }) {
      type = `${tsType(value)}[]`;
    }
  });

  type = type || 'void';

  if (config.unwrap) {
    return unwrap(type) || 'any';
  }

  return type;
}

function configInit(props: Partial<Config> = {}): Config {
  return {
    unwrap: false,
    ...props,
  };
}

interface Config {
  unwrap: boolean;
}
