export type Login = {
  username: string;
  password: string;
};

export type Register = {
  username: string;
  password: string;
};

export type AddRole = {
  username: string;
  roleName: string;
};

export type CreateRole = {
  roleName: string;
  permissions: string[];
};

export type LoginResponse = {
  access_token: string;
};
