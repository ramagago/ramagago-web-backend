import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  async createUser(
    @Body('username') username: string,
    @Body('password') password: string,
    @Body('role') role: string,
  ): Promise<User> {
    return this.usersService.create(username, password, role);
  }
}
