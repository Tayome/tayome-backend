import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { ClientSession, Connection } from "mongoose";

@Injectable()
export class TransactionService {
    constructor(@InjectConnection() private readonly connection: Connection) {}

    async startTransaction(): Promise<ClientSession> {
        const session = await this.connection.startSession();
        session.startTransaction();
        return session;
    }

    async commitTransaction(session: ClientSession): Promise<void> {
        await session.commitTransaction();
    }

    async abortTransaction(session: ClientSession): Promise<void> {
        await session.abortTransaction();
    }

    async runTransaction(transactionCallback: (session: ClientSession) => Promise<void>): Promise<void> {
        const session = await this.startTransaction();
        try {
            await transactionCallback(session);
            await this.commitTransaction(session);
        } catch (error) {
            await this.abortTransaction(session);
            throw error;
        }
    }
}
