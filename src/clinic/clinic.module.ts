import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { UtilsModule } from 'src/utils/utils.module';
import { ClinicsController } from './controllers/clinics.controller';
import { ClinicsService } from './services/clinics.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ClinicsDetail, ClinicsDetailSchema } from './schemas/clinics-detail.schema';

@Module({
    imports: [
        AuthModule,
        UtilsModule,
        UsersModule,
        MongooseModule.forFeature([{ name: ClinicsDetail.name, schema: ClinicsDetailSchema }]),
    ],
    controllers: [ClinicsController],
    providers: [ClinicsService],
    exports: []
})
export class ClinicModule {}
