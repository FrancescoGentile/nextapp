//
//
//

/**
 * Info about Nest.
 * At the moment, we harcode this info.
 * In a future version, we will make it dynamic.
 */
export class BuildingInfo {
  public static readonly FLOORS = [0, 1, 2, 3, 4];

  public static is_valid(floor: number): boolean {
    return BuildingInfo.FLOORS.includes(floor);
  }
}
