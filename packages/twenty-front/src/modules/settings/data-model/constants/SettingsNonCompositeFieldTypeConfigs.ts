import {
  IconComponent,
  IllustrationIconArray,
  IllustrationIconCalendarEvent,
  IllustrationIconCalendarTime,
  IllustrationIconJson,
  IllustrationIconNumbers,
  IllustrationIconOneToMany,
  IllustrationIconSetting,
  IllustrationIconStar,
  IllustrationIconTag,
  IllustrationIconTags,
  IllustrationIconText,
  IllustrationIconToggle,
  IllustrationIconUid,
} from 'twenty-ui';

import {
  FieldArrayValue,
  FieldBooleanValue,
  FieldDateTimeValue,
  FieldDateValue,
  FieldJsonValue,
  FieldMultiSelectValue,
  FieldNumberValue,
  FieldRatingValue,
  FieldRelationValue,
  FieldRichTextValue,
  FieldSelectValue,
  FieldTextValue,
  FieldUUidValue,
} from '@/object-record/record-field/types/FieldMetadata';
import { DEFAULT_DATE_VALUE } from '@/settings/data-model/constants/DefaultDateValue';
import { SettingsFieldTypeCategoryType } from '@/settings/data-model/types/SettingsFieldTypeCategoryType';
import { SettingsNonCompositeFieldType } from '@/settings/data-model/types/SettingsNonCompositeFieldType';
import { FieldMetadataType } from '~/generated-metadata/graphql';

DEFAULT_DATE_VALUE.setFullYear(DEFAULT_DATE_VALUE.getFullYear() + 2);

export type SettingsFieldTypeConfig<T> = {
  label: string;
  Icon: IconComponent;
  exampleValue?: T;
  category: SettingsFieldTypeCategoryType;
};

type SettingsNonCompositeFieldTypeConfigArray = Record<
  SettingsNonCompositeFieldType,
  SettingsFieldTypeConfig<any>
>;

// TODO: can we derive this from backend definitions ?
export const SETTINGS_NON_COMPOSITE_FIELD_TYPE_CONFIGS: SettingsNonCompositeFieldTypeConfigArray =
  {
    [FieldMetadataType.Uuid]: {
      label: 'Unique ID',
      Icon: IllustrationIconUid,
      exampleValue: '00000000-0000-0000-0000-000000000000',
      category: 'Advanced',
    } as const satisfies SettingsFieldTypeConfig<FieldUUidValue>,
    [FieldMetadataType.Text]: {
      label: 'Texto',
      Icon: IllustrationIconText,
      exampleValue:
        'Exemplo de texto para o campo de tipo Texto. Pode conter uma descrição ou um parágrafo qualquer.',
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldTextValue>,
    [FieldMetadataType.Numeric]: {
      label: 'Numérico',
      Icon: IllustrationIconNumbers,
      exampleValue: 2000,
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldNumberValue>,
    [FieldMetadataType.Number]: {
      label: 'Número',
      Icon: IllustrationIconNumbers,
      exampleValue: 2000,
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldNumberValue>,
    [FieldMetadataType.Boolean]: {
      label: 'Verdadeiro/Falso',
      Icon: IllustrationIconToggle,
      exampleValue: true,
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldBooleanValue>,
    [FieldMetadataType.DateTime]: {
      label: 'Data e Hora',
      Icon: IllustrationIconCalendarTime,
      exampleValue: DEFAULT_DATE_VALUE.toISOString(),
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldDateTimeValue>,
    [FieldMetadataType.Date]: {
      label: 'Data',
      Icon: IllustrationIconCalendarEvent,
      exampleValue: DEFAULT_DATE_VALUE.toISOString(),
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldDateValue>,
    [FieldMetadataType.Select]: {
      label: 'Seleção',
      Icon: IllustrationIconTag,
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldSelectValue>,
    [FieldMetadataType.MultiSelect]: {
      label: 'Seleção Múltipla',
      Icon: IllustrationIconTags,
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldMultiSelectValue>,
    [FieldMetadataType.Relation]: {
      label: 'Relação',
      Icon: IllustrationIconOneToMany,
      category: 'Relation',
    } as const satisfies SettingsFieldTypeConfig<FieldRelationValue<any>>,
    [FieldMetadataType.Rating]: {
      label: 'Avaliação',
      Icon: IllustrationIconStar,
      exampleValue: 'RATING_3',
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldRatingValue>,
    [FieldMetadataType.RawJson]: {
      label: 'JSON',
      Icon: IllustrationIconJson,
      exampleValue: { key: 'value' },
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldJsonValue>,
    [FieldMetadataType.RichText]: {
      label: 'Rich Text',
      Icon: IllustrationIconSetting,
      exampleValue: { key: 'value' },
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldRichTextValue>,
    [FieldMetadataType.Array]: {
      label: 'Array',
      Icon: IllustrationIconArray,
      category: 'Basic',
      exampleValue: ['value1', 'value2'],
    } as const satisfies SettingsFieldTypeConfig<FieldArrayValue>,
  };
