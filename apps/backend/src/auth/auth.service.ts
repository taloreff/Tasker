import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';

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
    const { passwordHash, ...result } = user;
    return result;
  }

  async login(user: any) {
    this.logger.log(`Generating JWT token for user: ${user.email}`);
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);
    this.logger.log(`JWT token generated successfully for user: ${user.email}`);
    return {
      accessToken: token,
    };
  }
}
