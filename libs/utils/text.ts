export function removeSpecialCharacter(text: string) {
  if (!text) {
    text = ''
  }
  return text.replace(/[^a-zA-Z0-9 ]/g, '');
}

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}