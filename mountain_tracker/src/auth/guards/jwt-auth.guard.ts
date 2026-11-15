import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// (#22)
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}