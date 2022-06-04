//
//
//

import { InternalServerError } from '@nextapp/common/error';
import admin, { ServiceAccount } from 'firebase-admin';
import getRawBody from 'raw-body';
import path from 'path';
import { FileStorage } from '../../domain/ports/file.storage';

export class GoogleCloudStorage implements FileStorage {
  private readonly bucket;

  public constructor(auth: ServiceAccount, bucket_name: string) {
    admin.initializeApp({
      credential: admin.credential.cert(auth),
      storageBucket: bucket_name,
    });
    this.bucket = admin.storage().bucket();
  }

  public async get_picture(
    filename: string
  ): Promise<{ buffer: Buffer; mimetype: string }> {
    const metadata = await this.bucket.file(filename).getMetadata();
    const mimetype = metadata[1].body.contentType;
    const file = this.bucket.file(filename).createReadStream();
    const buffer = await getRawBody(file);
    return { buffer, mimetype };
  }

  public async upload_picture(
    filepath: string,
    mimetype: string
  ): Promise<void> {
    try {
      await this.bucket.upload(filepath, {
        gzip: true,
        destination: path.basename(filepath),
        metadata: {
          contentType: mimetype,
          cacheControl: 'public, max-age=31536000',
        },
      });
    } catch {
      throw new InternalServerError();
    }
  }

  public async delete_picture(filename: string): Promise<void> {
    try {
      await this.bucket.file(filename).delete();
    } catch {
      throw new InternalServerError();
    }
  }
}
