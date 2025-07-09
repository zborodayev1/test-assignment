export interface IUserCreateData {
  passwordHash: string;
  fullName: string;
  dateOfBirth: Date;
  email: string;
  provider: string;
}

export interface UserFilters {
  $or?: Array<{
    fullName?: { $regex: string; $options: string };
    email?: { $regex: string; $options: string };
  }>;
  isActive?: boolean;
}
