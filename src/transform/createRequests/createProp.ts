import { OpenAPI2, Context } from '../types';
import { visit } from '../visit';
import { tsType, schemaType } from '../utils';

export function createProp(param: OpenAPI2.Parameter): Context.Property {
  const property = propertyFactory();
  visit(param, {
    '/name'({ value: name }) {
      property.name = name.split('.').pop();
    },
    '/in'({ value: kind }) {
      property.kind = kind;
    },
    '/required'({ value: required }) {
      property.questionMark = required ? '' : '?';
    },
    '/type'({ value: type }) {
      property.type = tsType(type);
    },
    '/schema'({ value: schema }) {
      property.type = schemaType(schema);
    },
  });
  return property;
}

function propertyFactory(): Context.Property {
  return {
    questionMark: '',
    kind: '',
    name: '',
    type: '',
  };
}
