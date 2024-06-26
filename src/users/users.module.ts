import { Module, forwardRef } from "@nestjs/common";
import { UserController } from "./controllers/user.controller";
import { UserService } from "./services/user.service";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./schemas/user.schema";
import { UtilsModule } from "src/utils/utils.module";
import { AuthModule } from "src/auth/auth.module";
import { Patients, PatientsSchema } from "./schemas/patients.schema";
import { DiseaseDetail, DiseaseDetailSchema } from "src/disease/schemas/disease-detail.schema";
import { PatientsManager, PatientsManagerSchema } from "./schemas/patients.manager.schema";

@Module({
    imports: [
        forwardRef(() => AuthModule),
        UtilsModule,
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        MongooseModule.forFeature([{ name: Patients.name, schema: PatientsSchema }]),
        MongooseModule.forFeature([{ name: DiseaseDetail.name, schema: DiseaseDetailSchema }]),
        MongooseModule.forFeature([{ name: PatientsManager.name, schema: PatientsManagerSchema}]),
        UtilsModule

    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService, MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
})
export class UsersModule {}
