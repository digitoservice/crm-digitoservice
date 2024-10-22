import { FieldValidationDefinition } from '@/spreadsheet-import/types';
import { isDefined } from 'twenty-ui';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isValidUuid } from '~/utils/isValidUuid';

export const getSpreadSheetFieldValidationDefinitions = (
  type: FieldMetadataType,
  fieldName: string,
): FieldValidationDefinition[] => {
  switch (type) {
    case FieldMetadataType.FullName:
      return [
        {
          rule: 'object',
          isValid: ({
            firstName,
            lastName,
          }: {
            firstName: string;
            lastName: string;
          }) => {
            return (
              isDefined(firstName) &&
              isDefined(lastName) &&
              typeof firstName === 'string' &&
              typeof lastName === 'string'
            );
          },
          errorMessage: fieldName + ' deve ser um nome completo',
          level: 'error',
        },
      ];
    case FieldMetadataType.Number:
      return [
        {
          rule: 'regex',
          value: '^\\d+$',
          errorMessage: fieldName + ' deve ser um número',
          level: 'error',
        },
      ];
    case FieldMetadataType.Relation:
      return [
        {
          rule: 'function',
          isValid: (value: string) => isValidUuid(value),
          errorMessage: fieldName + ' não é válido',
          level: 'error',
        },
      ];
    default:
      return [];
  }
};
