export function generateQueryString(params?: any) {
  if (!params) return '';

  const query = Object.keys(params)
    .filter(key => {
      if (Array.isArray(params[key])) {
        return params[key].length > 0;
      } else {
        return !!params[key];
      }
    })
    .map(key => {
      if (params[key]) {
        return key + '=' + params[key];
      }
      return null;
    })
    .join('&');
  // .slice(0, -1)

  return query ? '?' + query : '';
}
