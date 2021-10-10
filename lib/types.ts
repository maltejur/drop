export interface UploadRequestParameters {
  fileId: string;
  fileMd5: string;
  currentChunk: number;
  chunkSize: number;
  totalSize: number;
}
