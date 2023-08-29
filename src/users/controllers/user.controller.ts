import { Body, Controller, FileTypeValidator, MaxFileSizeValidator, ParseFilePipe, Patch, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { UpdateProfileDto } from "../dto/update-profile.dto";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "src/auth/roles.guard";
import { RoleType } from "src/auth/enums/role.enum";
import { Roles } from "src/auth/decorators/roles.decorator";
import { FileInterceptor } from "@nestjs/platform-express";
import { UserService } from "../services/user.service";
import { GetUser } from "src/auth/decorators/get-user.decorator";

@Controller("user")
export class UserController {
  constructor(private userService: UserService) {}

  @Patch("/")
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(RoleType.USER)
  @UseInterceptors(FileInterceptor("picture"))
  async updateProfile(
    @GetUser() user,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: ".(png|jpeg|jpg|webp|png)" }), new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2 })],
        fileIsRequired: false,
      }),
    )
    picture?: Express.Multer.File,
  ): Promise<{ message: String; data: any }> {
    const userDetails = await this.userService.updateProfile(user._id, updateProfileDto, picture);

    return {
      message: "Profile updated",
      data: userDetails,
    };
  }
}
