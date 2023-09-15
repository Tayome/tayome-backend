import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "src/auth/roles.guard";
import { RoleType } from "src/auth/enums/role.enum";
import { Roles } from "src/auth/decorators/roles.decorator";
import { UserService } from "../services/user.service";
import { OnboardingUserDto } from "../dto/onboarding-user.dto";

@Controller("user")
export class UserController {
    constructor(private userService: UserService) {}

	@Post("/onboardingUser")
    async onboardingUser(
        @Body() onboardingUserDto: OnboardingUserDto,
    ): Promise<{ message: String; data: any }> {
        const userDetails = await this.userService.onboardingUser(onboardingUserDto);
        return {
            message: "User Onboarded",
            data: userDetails,
        };
    }
}
