export function generateFullName(params: {
  firstName: string|null;
  middleName: string|null;
  lastName: string|null;
}) {
  let list = [params.firstName, params.middleName, params.lastName];
  list = list.filter(item => item);
  return list.join(' ');
}

export function cleanName(text: string) {
  return text?.trim();
}