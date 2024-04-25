import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "src/auth/roles.guard";
import { RoleType } from "src/auth/enums/role.enum";
import { Roles } from "src/auth/decorators/roles.decorator";
import { UserService } from "../services/user.service";
import { OnboardingUserDto } from "../dto/onboarding-user.dto";
import { PatientsListDto } from "../dto/patients-list.dto";
import { PatienDetailDto } from "../dto/patient-detail.dto";
import { GetUser } from "src/auth/decorators/get-user.decorator";
import { RegisterSubAdminDto } from "src/auth/dto/register-user.dto";
import { APIResponse } from "src/utils/types/api-response.type";

@Controller("user")
export class UserController {
    constructor(private userService: UserService) {}

    @Post("/onboardingUser")
    async onboardingUser(@Body() onboardingUserDto: OnboardingUserDto): Promise<{ message: String; data: any }> {
        const userDetails = await this.userService.onboardingUser(onboardingUserDto);
        return {
            message: "User Onboarded",
            data: userDetails,
        };
    }

    @Post("/createSubAdmin")
    async createSubAdmin(@Body() registerUserDto: RegisterSubAdminDto): Promise<APIResponse> {
        return {
            message: "SubAdmin created successfully",
            data: await this.userService.createSubAdmin(registerUserDto),
        };
    }

    @Post("/patients/list")
    @UseGuards(AuthGuard())
    async patientsList(@GetUser() user, @Body() patientsListDto: PatientsListDto): Promise<{ message: String; data: any }> {
        const list = await this.userService.patientsList(patientsListDto, user);
        return {
            message: "Patients List",
            data: list,
        };
    }

    @Post("/patients/detail")
    async patientDetail(@Body() patienDetailDto: PatienDetailDto): Promise<{ message: String; data: any }> {
        const list = await this.userService.patienDetails(patienDetailDto);
        return {
            message: "Patients detail",
            data: list,
        };
    }
}
