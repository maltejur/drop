import humanFileSize from "lib/humanFileSize";
import { UploadRequestParameters } from "lib/types";
import { v4 as uuidv4 } from "uuid";
import incrementalMD5 from "lib/incrementalMD5";
import axios from "axios";

export default class Uploader {
  files: UploaderFile[] = [];
  chunks: UploaderFileChunk[] = [];
  chunkPool: UploaderFileChunk[] = [];
  chunkSize = 100000;
  concurrentChunks = 10;
  onUpdate: () => void = () => {};
  onDone: () => void = () => {};
  uploadingChunks = 0;

  get uploadedSize() {
    return (
      this.chunks.filter((chunk) => chunk.uploaded === true).length *
      this.chunkSize
    );
  }

  get totalSize() {
    let size = 0;
    this.files.forEach((file) => (size += file.file.size));
    return size;
  }

  get prettyUploadedSize() {
    return humanFileSize(this.uploadedSize);
  }

  get prettyTotalSize() {
    return humanFileSize(this.totalSize);
  }

  get done() {
    return this.chunkPool.length === 0 && this.uploadingChunks === 0;
  }

  addFiles(files: File[], ids: string[]) {
    files.forEach((file, index) => {
      new UploaderFile(file, ids[index] || uuidv4(), this);
    });
  }

  async startUpload() {
    if (this.uploadingChunks > 0) return;
    const tryUploadChunk = async () => {
      if (
        this.uploadingChunks >= this.concurrentChunks ||
        this.chunkPool.length === 0
      )
        return;
      this.uploadingChunks++;
      const chunk = this.chunkPool.pop();
      tryUploadChunk();

      // if MD5 is still calculating
      if (typeof chunk.file.md5 === "object") await chunk.file.md5;
      let success = false;
      while (!success) {
        const response = await axios.post("/api/upload", await chunk.read(), {
          params: {
            fileId: chunk.file.id,
            fileMd5: chunk.file.md5 as string,
            currentChunk: chunk.index,
            chunkSize: this.chunkSize,
            totalSize: chunk.file.totalSize,
          } as UploadRequestParameters,
          headers: {
            // "Content-Type": "application/octet-stream",
            "Content-Type": "text/plain",
          },
        });
        success = response.status >= 200 && response.status < 400;
      }
      chunk.uploaded = true;
      this.uploadingChunks--;
      this.onUpdate();
      if (this.done) this.onDone();
      tryUploadChunk();
    };
    tryUploadChunk();
  }
}

export class UploaderFile {
  id: string;
  file: File;
  md5: string | Promise<string>;
  totalSize: number;
  totalChunks: number;
  chunks: UploaderFileChunk[];
  uploader: Uploader;

  constructor(file: File, id: string, uploader: Uploader) {
    this.uploader = uploader;
    this.id = id;
    this.file = file;
    this.md5 = incrementalMD5(file).then((md5) => (this.md5 = md5));
    this.totalSize = file.size;
    this.totalChunks = Math.ceil(this.totalSize / this.uploader.chunkSize);
    this.chunks = [];
    for (let index = 0; index < this.totalChunks; index++) {
      const chunk = new UploaderFileChunk(this, index);
      this.chunks.push(chunk);
      this.uploader.chunks.push(chunk);
      this.uploader.chunkPool.unshift(chunk);
    }
    this.uploader.files.push(this);
  }

  get uploadedChunks() {
    return this.chunks.filter((chunk) => chunk.uploaded).length;
  }

  get uploadedSize() {
    let size = 0;
    this.chunks.forEach((chunk) => {
      if (chunk.uploaded) {
        size += chunk.size;
      }
    });
    return size;
  }

  get prettyUploadedSize() {
    return humanFileSize(this.uploadedSize);
  }

  get prettyTotalSize() {
    return humanFileSize(this.totalSize);
  }
}

export class UploaderFileChunk {
  file: UploaderFile;
  index: number;
  uploaded: boolean;

  constructor(file: UploaderFile, index: number) {
    this.file = file;
    this.index = index;
    this.uploaded = false;
  }

  get size() {
    return this.index < this.file.chunks.length - 1
      ? this.file.uploader.chunkSize
      : this.file.file.size % this.file.uploader.chunkSize;
  }

  async read() {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(
        this.file.file.slice(
          this.index * this.file.uploader.chunkSize,
          (this.index + 1) * this.file.uploader.chunkSize
        )
      );
      reader.onload = (event) => {
        resolve(event.target.result.toString());
      };
      reader.onerror = reject;
    });
  }
}
