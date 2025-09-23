import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    this.logger.log(`Attempting to validate user: ${email}`);
    const user = await this.userService.findByEmail(email);
    
    if (!user) {
      this.logger.warn(`User not found with email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log(`Found user: ${user.email}, validating password`);
    
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      this.logger.warn(`Invalid password for user: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log(`User validation successful: ${user.email}`);
    // Strip passwordHash before returning
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = user;
    return result;
  }

  async login(user: User) {
    this.logger.log(`Generating JWT token for user: ${user.email}`);
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);
    this.logger.log(`JWT token generated successfully for user: ${user.email}`);
    
    // Return format expected by frontend
    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      }
    };
  }

  async register(createUserDto: CreateUserDto) {
    this.logger.log(`Registering new user: ${createUserDto.email}`);
    
    // Create the user using UserService
    const newUser = await this.userService.create(createUserDto);
    
    // Generate JWT token
    const payload = { sub: newUser.id, email: newUser.email };
    const token = this.jwtService.sign(payload);
    
    this.logger.log(`User registered successfully: ${newUser.email}`);
    
    // Return format expected by frontend
    return {
      access_token: token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        createdAt: newUser.createdAt.toISOString(),
        updatedAt: newUser.updatedAt.toISOString(),
      }
    };
  }

  async getProfile(userId: string) {
    this.logger.log(`Fetching profile for user ID: ${userId}`);
    const user = await this.userService.findOne(userId);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Return user without password hash
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userProfile } = user;
    return userProfile;
  }
}
