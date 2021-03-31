import { OpenAPI2, Context } from '../types';
import { visit } from '../visit';
import { assign, schemaType } from '../utils';

export function createModel(name: string, schema: OpenAPI2.SchemaObject) {
  const model: Context.Model = modelFactory({ name });
  let property!: Context.ModelProperty;

  visit(schema, {
    '/properties/:propertyName'({ value, params }) {
      if (property) {
        model.properties = [...model.properties, property];
      }
      property = propFactory({
        name: params.propertyName,
        type: schemaType(value),
      });
    },
  });

  if (property) {
    model.properties = [...model.properties, property];
  }

  if (isGeneric(name)) {
    const generic = parseGeneric(name);
    const { args, params } = generic;

    assign(model, {
      name: generic.name,
      params: params ? `<${params.join(',')}>` : '',
    });

    zip(args, params).forEach(([arg, param]) => {
      const property = model.properties.find(({ type }) => type.startsWith(arg));
      if (property) {
        property.type = param;
      }
    });
  }

  return model;
}

function propFactory(props: Partial<Context.ModelProperty> = {}): Context.ModelProperty {
  return {
    name: '',
    type: '',
    ...props,
  };
}

function modelFactory(props: Partial<Context.Model> = {}): Context.Model {
  return {
    name: '',
    params: '',
    properties: [],
    ...props,
  };
}

function parseGeneric(modelName: string) {
  const [name, types] = splitName(modelName);

  const args = types.split(',');
  const params = args.map((_, i) => `T${i + 1}`);

  const generic = `<${params.join(', ')}>`;

  return {
    name,
    generic,
    params,
    args,
  };
}

function splitName(name: string) {
  name = name.replace(/\[/g, '<').replace(/\]/g, '>');
  const match = name.match(/(.*?)<(.*)>/);

  if (!match) {
    throw new Error(`unable to split ${name} into generic parts`);
  }

  const [_, base, generic] = match;
  return [base, generic]; 
}

function isGeneric(name: string): boolean {
  return /\[.*\]$/.test(name);
}

function zip<T, S>(xs: T[], ys: S[]): Array<[T, S]> {
  if (xs.length !== ys.length) {
    throw new Error();
  }
  return xs.map((x, i) => [x, ys[i]]);
}
