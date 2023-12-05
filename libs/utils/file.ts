export function getOneFileUrl(files: any | any[]) {
  if (files && files.length > 0) {
    return files[0].fileLinkCache;
  }

  return undefined;
}
