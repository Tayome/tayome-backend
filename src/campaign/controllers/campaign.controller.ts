import { Controller, Post, Req } from "@nestjs/common";
import { CampaignService } from "../services/campaign.service";

@Controller("/campaign")
export class CampaignController {
    constructor(private campaignService: CampaignService) {}
    @Post("/create")
    createCampaign() {
        return this.campaignService.create();
    }
}
