import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { Module } from "@nestjs/common";
import { join } from "path";
import { ConfigService } from "@nestjs/config";
import { MailService } from "./services/mail.service";

@Module({
    imports: [
        MailerModule.forRootAsync({
            useFactory: async (configService: ConfigService) => ({
                transport: {
                    host: configService.getOrThrow<string>("MAIL_HOST"),
                    auth: {
                        user: configService.getOrThrow<string>("MAIL_USERNAME"),
                        pass: configService.getOrThrow<string>("MAIL_PASSWORD"),
                    },
                    port: parseInt(configService.getOrThrow("MAIL_PORT")),
                    tls: {
                        rejectUnauthorized: false, // Allow self-signed certificates
                    },
                },
                defaults: {
                    from: configService.getOrThrow<string>("MAIL_FROM_ADDRESS"),
                },
                template: {
                    dir: join(process.cwd(), "templates"),
                    adapter: new HandlebarsAdapter(),
                    options: { strict: true },
                },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule {}
