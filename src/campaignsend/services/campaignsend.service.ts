import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { CampaignService } from "src/campaign/services/campaign.service";
@Injectable()
export class SchedularService {
    constructor(
		private readonly campaignService:CampaignService,
	  ) {
	  }
    SurveyScedularCron = async () => {
		await this.campaignService.sendSurveyToUser()
		  .then(r => r)
		  .catch(err => {
			console.error(err)
		  });
	  }

   
	 //@Cron("*/30 * * * * *")
     @Cron("0 10 * * *")
	 SurveyCron() {
		console.log(`SurveyCron Running`);
	  this.SurveyScedularCron();  
	}
}
