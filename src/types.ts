import { Context } from './transform/types';

export interface Client extends Context.Transform {
  requests: Context.Request[];
  models: Context.Model[];
  path: string;
  files: {
    client: string;
    types: string;
  };
}
