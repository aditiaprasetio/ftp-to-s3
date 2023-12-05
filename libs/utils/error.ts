export function getErrorStatusCode(error: any) {
  if (error.statusCode && typeof error.statusCode === 'number') {
    return error.statusCode;
  } else if (error.status_code && typeof error.status_code === 'number') {
    return error.status_code;
  } else if (error.code && typeof error.code === 'number') {
    return error.code;
  } else {
    return 500;
  }
}