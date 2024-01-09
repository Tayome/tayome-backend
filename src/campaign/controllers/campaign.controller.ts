import { Body, Controller, FileTypeValidator, MaxFileSizeValidator, ParseFilePipe, Post, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { CampaignService } from "../services/campaign.service";
import { FilesInterceptor } from "@nestjs/platform-express";
import { CreateCampaignDto } from "../dto/create-campagin.dto";
import { CampaignListDto } from "../dto/campaign-list.dto";
import { RemoveCampaignDto } from "../dto/remove-campaign.dto";
import { assignCampaignDto } from "../dto/campaign-assign.dto";

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

    @Post("/list")
    // @UseGuards(AuthGuard(), RolesGuard)
    // @Roles(RoleType.ADMIN)
    async campaignList(@Body() campaignListDTO: CampaignListDto): Promise<{ message: String; data: any }> {
        let campaignList = await this.campaignService.campaignList(campaignListDTO);
        return campaignList;
    }

    @Post("/delete")
    async RemoveProduct(@Body() removeCampaignDto: RemoveCampaignDto): Promise<{ message: String }> {
        let res = await this.campaignService.remove(removeCampaignDto);
        return res;
    }

    @Post("/assign")
    async campaignAssign(@Body() assignCampaignDto: assignCampaignDto): Promise<{ message: String; data: any }> {
        let res = await this.campaignService.assignCampaign(assignCampaignDto);
        return {
            message: "Campaign successfully assigned",
            data: res,
        };
    }

    @Post("/detail")
    async campaigndetail(@Body() removeCampaignDto: RemoveCampaignDto): Promise<{ message: String; data: any }> {
        let res = await this.campaignService.campaignDetail(removeCampaignDto);
        return {
            message: "Campaign retrieved successfully",
            data: res,
        };
    }
}
