import { dbField } from '../db/decorators';
import { jsonProperty } from '../json/decorations';

export class LocalizedField {
  @jsonProperty()
  @dbField()
  english: string;

  @jsonProperty()
  @dbField()
  slovenian: string;

  @jsonProperty()
  @dbField()
  serbian: string;

  @jsonProperty()
  @dbField()
  spanish: string;
}
