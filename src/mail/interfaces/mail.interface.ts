export interface MailConfig {
    to: string;
    from?: string;
    subject: string;
    template: string;
    context: object;
  }
  