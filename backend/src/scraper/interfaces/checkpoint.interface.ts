import { ExtractedPlace } from '../../extraction/schemas/extraction.schema';

/**
 * Checkpoint data structure for saving extraction progress
 */
export interface CheckpointData {
  extractionId: string;
  keyword: string;
  lastProcessedIndex: number;
  totalProcessed: number;
  places: ExtractedPlace[];
  failedPlaces: number;
  duplicatesSkipped: number;
  withoutPhoneSkipped: number;
  withoutWebsiteSkipped: number;
  alreadyExistsSkipped: number;
  timestamp: Date;
}

/**
 * Scraper progress information
 */
export interface ScraperProgress {
  currentIndex: number;
  totalPlaces: number;
  extractedCount: number;
  failedCount: number;
  skippedCount: number;
  percentage: number;
}

/**
 * Debug artifact paths
 */
export interface DebugArtifacts {
  extractionId: string;
  basePath: string;
  screenshots: string[];
  htmlDumps: string[];
  errorLogs: string[];
}

/**
 * Extraction options with checkpoint support
 */
export interface ExtractionOptions {
  skipDuplicates?: boolean;
  skipWithoutPhone?: boolean;
  skipWithoutWebsite?: boolean;
  skipAlreadyExtracted?: boolean;
  previousPlaces?: ExtractedPlace[];
  maxResults?: number;
  resumeFromCheckpoint?: boolean;
  saveCheckpoints?: boolean;
  checkpointInterval?: number;
  debugMode?: boolean;
  onLog?: (message: string) => void;
  onProgress?: (progress: ScraperProgress) => void;
  onCheckpoint?: (checkpointData: CheckpointData) => Promise<void>;
  existingCheckpoint?: CheckpointData | null;
  extractionId?: string;
}
