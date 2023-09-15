import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { UtilsModule } from 'src/utils/utils.module';
import { ClinicsController } from './controllers/clinics.controller';
import { ClinicsService } from './services/clinics.service';

@Module({
    imports: [
        AuthModule,
        UtilsModule,
        UsersModule,
    ],
    controllers: [ClinicsController],
    providers: [ClinicsService],
    exports: []
})
export class ClinicModule {}
