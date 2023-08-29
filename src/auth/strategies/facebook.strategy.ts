import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-facebook";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, "facebook") {
  constructor(readonly configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>("FACEBOOK_CLIENT_ID"),
      clientSecret: configService.getOrThrow<string>("FACEBOOK_SECRET"),
      callbackURL: configService.getOrThrow<string>("HOST_URL") + "/auth/facebook/callback",
      scope: "email",
      profileFields: ["emails", "name"],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: (err: any, user: any, info?: any) => void): Promise<any> {
    const { name, emails, id } = profile;
    const user = {
      id,
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      accessToken,
    };
    done(null, user);
  }
}
