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

  public static readonly MIN_OFFSET = 0;

  public static readonly DEFAULT_LIMIT = 20;

  public static readonly MIN_LIMIT = 1;

  public static readonly MAX_LIMIT = 40;

  private constructor(
    // offset is an integer greater than or equal to 0
    public readonly offset: number,
    // limit is an integer greater than or equal to 1
    public readonly limit: number
  ) {}

  public static build(offset?: number, limit?: number): SearchOptions {
    let off;
    if (offset === undefined) {
      off = SearchOptions.DEFAULT_OFFSET;
    } else if (!Number.isInteger(offset) || offset < SearchOptions.MIN_OFFSET) {
      throw new InvalidRequestError(
        `Offset should be an integer and greater than or equal to 0`
      );
    } else {
      off = offset;
    }

    let lim;
    if (limit === undefined) {
      lim = SearchOptions.DEFAULT_LIMIT;
    } else if (
      !Number.isInteger(limit) ||
      limit < SearchOptions.MIN_LIMIT ||
      limit > SearchOptions.MAX_LIMIT
    ) {
      throw new InvalidRequestError(
        `Limit should be an integer greater than or equal to 1 and less than or equal to ${SearchOptions.MAX_LIMIT}`
      );
    } else {
      lim = limit;
    }
    return new SearchOptions(off, lim);
  }
}
