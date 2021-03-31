const typeMap: Record<string, string> = {
  boolean: 'boolean',
  integer: 'number',
  number: 'number',
  string: 'string',
  array: '',
  file: '',
  object: 'any',
};

export const tsType = (type?: string) => type ? typeMap[type] : '';
