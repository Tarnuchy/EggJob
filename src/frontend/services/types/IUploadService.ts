import type { Result } from './index';

/** A locally-picked image ready to be uploaded. `mimeType` becomes the upload `Content-Type`. */
export type UploadableImage = {
  uri: string;
  mimeType: string;
  fileSize?: number;
};

export interface IUploadService {
  /**
   * Uploads the raw image bytes to the backend and returns the stored key and (relative) URL.
   * Mirrors `POST /uploads`.
   */
  uploadImage(image: UploadableImage): Promise<Result<{ key: string; url: string }>>;
}
