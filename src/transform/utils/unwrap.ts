export function unwrap(name: string) {
  return name
    .replace(/^I?ActionResult\[(.*)\]$/, '$1')
    .replace(/^I?ActionResult\<(.*)\>$/, '$1')
    .replace(/^I?ActionResult/, '');
}
