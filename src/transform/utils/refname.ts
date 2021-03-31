export function refname($ref: string) {
  let name = $ref.split('/').pop() as string;
  name = name.replace(/\[/g, '<').replace(/\]/g, '>')
  return name;
}
