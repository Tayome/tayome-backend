import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
@Injectable()
export class CampaignsendService {
    //  @Cron("*/10 * * * * *")
    runEvery10Seconds() {
        console.log("Every 10 seconds");
    }
}
