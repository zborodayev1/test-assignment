export interface ICreateUserDTO {
  password: string;
  fullName: string;
  dateOfBirth: Date;
  email: string;
}

export interface ICreateUserInternalDTO {
  passwordHash: string;
  provider: 'local' | 'github' | 'google';
  fullName: string;
  dateOfBirth: Date;
  email: string;
  role: 'user' | 'admin';
  isActive: boolean;
}

export interface ISignInDTO {
  email: string;
  password: string;
}
