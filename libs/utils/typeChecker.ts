export function convertStringToBoolean(val?: string | boolean) {
  if (val === undefined) {
    return undefined;
  } else if (typeof val === 'boolean') {
    return val;
  } if (val === 'TRUE' || val === 'true' || val === '1' || val === 'active') {
    return true;
  } else if (val === 'FALSE' || val === 'false' || val === '0' || val === 'inactive') {
    return false;
  } else {
    return undefined;
  }
}

export function convertDataToArray(val?: string | string[]): string[] {
  if (!val) {
    return undefined;
  } else if (Array.isArray(val)) {
    if (val.length === 0) {
      return undefined;
    } else {
      return val as string[];
    }
  } else {
    const exp = val.split(',')
    if (exp.length === 0) {
      return undefined;
    } else {
      return exp as string[];
    }
  }
}

export function convertDataToArrayNumber(val?: string | string[]): (number[] | undefined) {
  if (!val) {
    return undefined;
  } else if (Array.isArray(val)) {
    if (val.length === 0) {
      return undefined;
    } else {
      const newArrayNumber = val.map(item =>
        !isNaN(Number(item)) ? Number(item) : 0,
      );

      return newArrayNumber;
    }
  } else {
    const exp = val.split(',')

    if (exp.length === 0) {
      return undefined;
    } else {
      const newArrayNumber = exp.map(item =>
        !isNaN(Number(item)) ? Number(item) : 0,
      );
      return newArrayNumber;
    }
  }
}
