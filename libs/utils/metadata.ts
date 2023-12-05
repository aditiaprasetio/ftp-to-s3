export function getUserIdFromMeta(meta: any) {
  if (meta.userId) {
    return meta.userId;
  } else if (meta.uid) {
    return meta.uid;
  } else if (meta.user) {
    return this.getUserIdFromMeta(meta.user);
  } else {
    return null;
  }
}