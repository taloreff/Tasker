import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'jwt-secret',
    });
  }

  async validate(payload: any) {
    this.logger.log(`Validating JWT for user: ${payload.sub}`);
    const user = await this.userService.findOne(payload.sub);
    
    if (!user) {
      this.logger.warn(`User not found for JWT payload: ${payload.sub}`);
      return null;
    }
    
    this.logger.log(`JWT validation successful for user: ${user.email}`);
    return user;
  }
}
