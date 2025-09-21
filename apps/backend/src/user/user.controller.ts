import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { OwnerOrAdmin } from '../common/decorators/owneradmin.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OwnerOrAdminGuard } from '../common/guards/owneradmin.guard';
import { Public } from '../common/decorators/public.decorator';

@UseGuards(JwtAuthGuard, RolesGuard, OwnerOrAdminGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async register(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @OwnerOrAdmin()
  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ) {
    return this.userService.findOne(id);
  }

  @OwnerOrAdmin()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.update(id, dto);
  }

  @OwnerOrAdmin()
  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ) {
    return this.userService.remove(id);
  }
}
