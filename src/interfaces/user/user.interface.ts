export interface IUserCreateData {
  passwordHash: string;
  fullName: string;
  dateOfBirth: Date;
  email: string;
  provider: string;
}
