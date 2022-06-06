//
//
//

export interface FileStorage {
  get_picture(filename: string): Promise<{ buffer: Buffer; mimetype: string }>;

  upload_picture(path: string, mimetype: string): Promise<void>;

  delete_picture(filename: string): Promise<void>;
}
