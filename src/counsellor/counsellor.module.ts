import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Counsellor, CounsellorSchema } from "./schemas/counsellor.schema";
import { CounsellorController as AdminCounsellorController } from "./controllers/admin/counsellor.controller";
import { CounsellorService as AdminCounsellorService } from "./services/admin/counsellor.service";
import { User, UserSchema } from "src/users/schemas/user.schema";
import { Patients, PatientsSchema } from "src/users/schemas/patients.schema";
import { MailModule } from "src/mail/mail.module";
import { CounsellorController } from "./controllers/counsellor.controller";
import { CounsellorService } from "./services/counsellor.service";
import { DiseaseDetail, DiseaseDetailSchema } from "src/disease/schemas/disease-detail.schema";

@Module({
    imports:[
            MailModule,
            MongooseModule.forFeature([{ name: Counsellor.name, schema: CounsellorSchema}]),
            MongooseModule.forFeature([{ name: User.name, schema: UserSchema}]),
            MongooseModule.forFeature([{ name: Patients.name, schema: PatientsSchema}]),
            MongooseModule.forFeature([{ name: DiseaseDetail.name, schema: DiseaseDetailSchema}]),],
            
    controllers:[AdminCounsellorController, CounsellorController],
    providers:[AdminCounsellorService, CounsellorService],
    exports:[]
})
export class CounsellorModule {}
