import { ICreateUserInternalDTO } from '../interfaces/user/user.dto.js';
import { User } from '../models/user.model.js';

export class UserRepository {
  async create(userData: ICreateUserInternalDTO, options = {}) {
    const user = new User(userData);
    return await user.save(options);
  }

  async findByEmail(email: string) {
    return User.findOne({ email }).select('+passwordHash');
  }

  async updateById(
    id: string,
    updates: Partial<ICreateUserInternalDTO>,
    options = {}
  ) {
    if (!updates || Object.keys(updates).length === 0) {
      throw new Error('Updates object must not be empty');
    }
    return User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
      ...options,
    });
  }

  async findById(id: string) {
    return User.findById(id);
  }

  async findAll(filter = {}, projection = null, options = {}) {
    return User.find(filter, projection, options);
  }

  async countDocuments(filter = {}) {
    return User.countDocuments(filter);
  }

  async deleteById(id: string) {
    return User.findByIdAndDelete(id);
  }

  async findByIdWithPassword(id: string) {
    return User.findById(id).select('+passwordHash');
  }
}
