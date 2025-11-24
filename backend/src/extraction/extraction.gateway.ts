import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
})
export class ExtractionGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ExtractionGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Emit extraction progress update to all connected clients
   * @param extractionId The ID of the extraction
   * @param progress Progress data
   */
  emitProgress(
    extractionId: string,
    progress: {
      status: string;
      totalResults?: number;
      currentIndex?: number;
      percentage?: number;
      message?: string;
    },
  ) {
    this.server.emit(`extraction:${extractionId}:progress`, progress);
    this.logger.debug(
      `Emitted progress for extraction ${extractionId}: ${JSON.stringify(progress)}`,
    );
  }

  /**
   * Emit extraction completion to all connected clients
   * @param extractionId The ID of the extraction
   * @param data Completion data
   */
  emitComplete(extractionId: string, data: { status: string; totalResults: number }) {
    this.server.emit(`extraction:${extractionId}:complete`, data);
    this.logger.log(`Extraction ${extractionId} completed with ${data.totalResults} results`);
  }

  /**
   * Emit extraction error to all connected clients
   * @param extractionId The ID of the extraction
   * @param error Error data
   */
  emitError(extractionId: string, error: { message: string }) {
    this.server.emit(`extraction:${extractionId}:error`, error);
    this.logger.error(`Extraction ${extractionId} failed: ${error.message}`);
  }
}
