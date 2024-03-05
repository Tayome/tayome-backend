import { Module } from "@nestjs/common";
import { UploadService } from "./services/upload.service";
import { TransactionService } from "./services/transaction.service";

@Module({
    providers: [UploadService, TransactionService],
    exports: [UploadService, TransactionService],
})
export class UtilsModule {}
