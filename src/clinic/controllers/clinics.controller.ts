import { Body, Controller, Post, Get, Patch, UseGuards, Delete, BadRequestException } from '@nestjs/common';
import { ClinicsService } from '../services/clinics.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { RoleType } from 'src/auth/enums/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AddNewClinicDto } from '../dto/add-new-clinic.dto';

@Controller('clinic')
export class ClinicsController {
    constructor(private clinicService: ClinicsService) {}

    @Post("/add")
    // @UseGuards(AuthGuard(), RolesGuard)
    // @Roles(RoleType.ADMIN)
    async addClinic(@Body() addNewClinicDto: AddNewClinicDto): Promise<{message: String, data: any }>{
        try{
            let addClinic = await this.clinicService.addClinic(addNewClinicDto);        
            return {
                message: "Clinic Added",
                data: addClinic
            };
        }
        catch(error){
            throw new Error("Error while adding clinic details");
        }
    }
}
