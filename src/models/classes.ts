import { jsonProperty } from '../json/decorations';
import { dbField } from '../db/decorators';

export class ChangeLog {
  @jsonProperty()
  @dbField()
  changedAt: number;

  @jsonProperty()
  @dbField()
  changedBy: string;

  @jsonProperty()
  @dbField()
  deployLocation: string;
}
