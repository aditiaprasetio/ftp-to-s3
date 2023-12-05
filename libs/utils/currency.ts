export function convertNumToCurrency(num: number, shortAfter?: number) {
  if (!num) {
    return 'Rp0';
  }

  if (shortAfter && shortAfter > 0) {
    if (num > shortAfter && num > 999999999999) {
      return 'Rp' + Math.floor(num / 1000000000000) + 'T';
    } else if (num > shortAfter && num > 999999999) {
      return 'Rp' + Math.floor(num / 1000000000) + 'M';
    } else if (num > shortAfter && num > 999999) {
      return 'Rp' + Math.floor(num / 1000000) + 'jutaan';
    } else if (num > shortAfter && num > 99999) {
      return 'Rp' + Math.floor(num / 1000) + 'ribuan';
    }
  }

  return 'Rp' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
