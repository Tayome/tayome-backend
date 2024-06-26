import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { MailConfig } from "../interfaces/mail.interface";

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  public sendMail(mailConfig: MailConfig): void {
    this.mailerService.sendMail(mailConfig).catch(e => {
      console.log("Not able to send mail", e);
    });
  }
}
