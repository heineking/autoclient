import fetch from 'node-fetch';
import { visit } from './visit';
import { createRequests } from './createRequests';
import { createModel } from './createModel';
import { OpenAPI2, Context } from './types';
import { unwrap } from './utils';

const readJson = async <TResult>(url: string) => {
  const res = await fetch(url);
  return await res.json() as TResult;
};

export async function transform(url: string): Promise<Context.Transform> {
  const schema = await readJson<OpenAPI2.Document>(url);
  const paths: string[] = [];
  const requests: Context.Request[] = [];
  const modelsByName: Record<string, Context.Model> = {};

  visit(schema, {
    '/paths/:path'({ value, params: { path } }) {
      paths.push(path);
      requests.push(...createRequests(path, value));
    },
    '/definitions/:name'({ value, params: { name }}) {
      name = unwrap(name);
      if (!name) return;

      const model = createModel(name, value);
      modelsByName[model.name] = model;
    },
  });

  const models = Object.values(modelsByName);

  return {
    paths,
    requests,
    models,
  };
}
