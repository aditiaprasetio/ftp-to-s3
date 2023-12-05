export function getAllRoles(enumRoles: any): string[] {
  return Object.values(enumRoles);
}

export function getAllAdminRoles(enumRoles: any): string[] {
  return Object.values(enumRoles).filter(role => (role as any[]).includes('admin')) as string[];
}

export function getAllCustomerRoles(enumRoles: any): string[] {
  return Object.values(enumRoles).filter(role =>
    (role as any[]).includes('customer'),
  ) as string[];
}

export function isAdmin(role: string, enumRoles: any): boolean {
  return getAllAdminRoles(enumRoles).includes(role);
}

export function isCustomer(role: string, enumRoles: any): boolean {
  return getAllCustomerRoles(enumRoles).includes(role);
}
