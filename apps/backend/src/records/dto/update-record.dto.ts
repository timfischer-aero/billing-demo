import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  MaxLength,
  registerDecorator,
  ValidateIf,
  type ValidationOptions,
} from 'class-validator';

const editableFields = ['comment', 'denyCode', 'done'] as const;

function HasEditableRecordChange(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'hasEditableRecordChange',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(_value: unknown, args) {
          const request = args?.object as
            | Record<string, unknown>
            | undefined;

          return (
            request !== undefined &&
            editableFields.some((field) => request[field] !== undefined)
          );
        },
      },
    });
  };
}

export class UpdateRecordDto {
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsString()
  @MaxLength(255)
  comment?: string;

  @ValidateIf(
    (_object, value: unknown) => value !== undefined && value !== null,
  )
  @IsString()
  denyCode?: string | null;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsBoolean()
  done?: boolean;

  @IsString()
  @IsNotEmpty()
  @HasEditableRecordChange({
    message: 'At least one of comment, denyCode, or done must be provided.',
  })
  actorUserId!: string;
}
