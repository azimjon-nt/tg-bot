export function isAdmin(id: number): boolean {
  switch (id) {
    case parseInt(process.env.ADMIN_ID_1):
      return true;
  }

  return false;
}
