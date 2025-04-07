import { SetMetadata } from '@nestjs/common';
export const RequirePermissions = (permissions: string[]) => {
  return SetMetadata('permissions', permissions);
};
