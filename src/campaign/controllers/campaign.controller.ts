import { Body, Controller, FileTypeValidator, MaxFileSizeValidator, ParseFilePipe, Post, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { CampaignService } from "../services/campaign.service";
import { FilesInterceptor } from "@nestjs/platform-express";
import { CreateCampaignDto } from "../dto/create-campagin.dto";

@Controller("/campaign")
export class CampaignController {
    constructor(private campaignService: CampaignService) {}

    @Post("/create")
    @UseInterceptors(FilesInterceptor("images", 12))
    async createCampaign(
        @Body() createCampaignDto: CreateCampaignDto,
        @UploadedFiles(
            new ParseFilePipe({
                validators: [new FileTypeValidator({ fileType: ".(png|jpeg|jpg|webp|png)" }), new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2 })],
            }),
        )
        images: Array<Express.Multer.File>,
    ): Promise<{ message: string; data: any }> {
        let data = await this.campaignService.createNewCampaign(createCampaignDto, images);
        return data;
    }
}
