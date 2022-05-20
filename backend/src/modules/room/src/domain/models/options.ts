//
//
//

/**
 * When a user wants to retrieve some entities,
 * they need to specify the offset and the number of entities.
 */
export class SearchOptions {
  public readonly offset: number;

  public readonly limit: number;

  public constructor(offset: number = 0, limit: number = 20) {
    this.offset = offset;
    this.limit = limit;
  }
}
