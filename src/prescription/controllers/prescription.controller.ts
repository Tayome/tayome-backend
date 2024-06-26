import { Body, Controller, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { PrescriptionService } from "../services/prescription.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { CreatePrescriptionDto } from "../dto/create-prescription.dto";
import { APIResponse } from "src/utils/types/api-response.type";

@Controller("/prescription")
export class PrescriptionController {
    constructor(private PrescriptionService: PrescriptionService) {}

    @Post("/")
    @UseInterceptors(FileInterceptor("image"))
    async createPrescription(
        @Body() CreatePrescriptionDto: CreatePrescriptionDto,
        @UploadedFile(
            new ParseFilePipe({
                validators: [new FileTypeValidator({ fileType: ".(png|jpeg|jpg|webp|png|pdf)" }), new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2 })],
                fileIsRequired: false,
            }),
        )
        image: Express.Multer.File,
    ): Promise<APIResponse> {
        return {
            message: "Prescription uploaded successfully",
            data: await this.PrescriptionService.createPrescription(CreatePrescriptionDto, image),
        };
    }

    @Get("/:id")
    async getPrescriptionList(@Param("id") id: string): Promise<APIResponse> {
        return {
            message: "Prescription list fetch successfully",
            data: await this.PrescriptionService.getPrescriptionList(id)
        }
    }
}
