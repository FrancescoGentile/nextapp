//
//
//

import { InvalidRequestError } from '@nextapp/common/error';

/**
 * When a user wants to retrieve some entities,
 * they can specify the offset and the number of entities.
 */
export class SearchOptions {
  public static readonly DEFAULT_OFFSET = 0;

  public static readonly DEFAULT_LIMIT = 20;

  private constructor(
    // offset is an integer greater than or equal to 0
    public readonly offset: number,
    // limit is an integer greater than or equal to 1
    public readonly limit: number
  ) {}

  public static build(offset: number, limit: number): SearchOptions {
    if (!Number.isInteger(offset) || offset < 0) {
      throw new InvalidRequestError(
        `Offset should be an integer and greater than or equal to 0`
      );
    }
    if (!Number.isInteger(limit) || limit < 1) {
      throw new InvalidRequestError(
        `Limit should be an integer and greater than or equal to 1`
      );
    }
    return new SearchOptions(offset, limit);
  }
}
