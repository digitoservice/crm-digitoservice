import {
  IconComponent,
  IllustrationIconArray,
  IllustrationIconCalendarEvent,
  IllustrationIconCalendarTime,
  IllustrationIconCurrency,
  IllustrationIconJson,
  IllustrationIconLink,
  IllustrationIconMail,
  IllustrationIconMap,
  IllustrationIconNumbers,
  IllustrationIconOneToMany,
  IllustrationIconPhone,
  IllustrationIconSetting,
  IllustrationIconStar,
  IllustrationIconTag,
  IllustrationIconTags,
  IllustrationIconText,
  IllustrationIconToggle,
  IllustrationIconUid,
  IllustrationIconUser,
} from 'twenty-ui';

import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
import { DEFAULT_DATE_VALUE } from '@/settings/data-model/constants/DefaultDateValue';
import { SettingsFieldTypeCategoryType } from '@/settings/data-model/types/SettingsFieldTypeCategoryType';
import { SettingsSupportedFieldType } from '@/settings/data-model/types/SettingsSupportedFieldType';
import { FieldMetadataType } from '~/generated-metadata/graphql';

DEFAULT_DATE_VALUE.setFullYear(DEFAULT_DATE_VALUE.getFullYear() + 2);

export type SettingsFieldTypeConfig = {
  label: string;
  Icon: IconComponent;
  exampleValue?: unknown;
  category: SettingsFieldTypeCategoryType;
};

export const SETTINGS_FIELD_TYPE_CONFIGS = {
  [FieldMetadataType.Uuid]: {
    label: 'Unique ID',
    Icon: IllustrationIconUid,
    exampleValue: '00000000-0000-0000-0000-000000000000',
    category: 'Advanced',
  },
  [FieldMetadataType.Text]: {
    label: 'Texto',
    Icon: IllustrationIconText,
    exampleValue:
      'Exemplo de texto para o campo de tipo Texto. Pode conter uma descrição ou um parágrafo qualquer.',
    category: 'Basic',
  },
  [FieldMetadataType.Numeric]: {
    label: 'Numérico',
    Icon: IllustrationIconNumbers,
    exampleValue: 2000,
    category: 'Basic',
  },
  [FieldMetadataType.Number]: {
    label: 'Número',
    Icon: IllustrationIconNumbers,
    exampleValue: 2000,
    category: 'Basic',
  },
  [FieldMetadataType.Link]: {
    label: 'Link',
    Icon: IllustrationIconLink,
    exampleValue: { url: 'www.example.com', label: '' },
    category: 'Basic',
  },
  [FieldMetadataType.Links]: {
    label: 'Links',
    Icon: IllustrationIconLink,
    exampleValue: { primaryLinkUrl: 'example.com', primaryLinkLabel: '' },
    category: 'Basic',
  },
  [FieldMetadataType.Boolean]: {
    label: 'Verdadeiro/Falso',
    Icon: IllustrationIconToggle,
    exampleValue: true,
    category: 'Basic',
  },
  [FieldMetadataType.DateTime]: {
    label: 'Data e Hora',
    Icon: IllustrationIconCalendarTime,
    exampleValue: DEFAULT_DATE_VALUE.toISOString(),
    category: 'Basic',
  },
  [FieldMetadataType.Date]: {
    label: 'Data',
    Icon: IllustrationIconCalendarEvent,
    exampleValue: DEFAULT_DATE_VALUE.toISOString(),
    category: 'Basic',
  },
  [FieldMetadataType.Select]: {
    label: 'Seleção',
    Icon: IllustrationIconTag,
    category: 'Basic',
  },
  [FieldMetadataType.MultiSelect]: {
    label: 'Seleção Múltipla',
    Icon: IllustrationIconTags,
    category: 'Basic',
  },
  [FieldMetadataType.Currency]: {
    label: 'Moeda',
    Icon: IllustrationIconCurrency,
    exampleValue: { amountMicros: 2000000000, currencyCode: CurrencyCode.BRL },
    category: 'Basic',
  },
  [FieldMetadataType.Relation]: {
    label: 'Relação',
    Icon: IllustrationIconOneToMany,
    category: 'Relation',
  },
  [FieldMetadataType.Email]: {
    label: 'Email',
    Icon: IllustrationIconMail,
    category: 'Basic',
  },
  [FieldMetadataType.Emails]: {
    label: 'Emails',
    Icon: IllustrationIconMail,
    exampleValue: { primaryEmail: 'joao@acme.com' },
    category: 'Basic',
  },
  [FieldMetadataType.Phone]: {
    label: 'Telefone',
    Icon: IllustrationIconPhone,
    exampleValue: '+55 11 1234-5678',
    category: 'Basic',
  },
  [FieldMetadataType.Phones]: {
    label: 'Telefones',
    Icon: IllustrationIconPhone,
    exampleValue: {
      primaryPhoneNumber: '11 1234-5678',
      primaryPhoneCountryCode: '+55',
    },
    category: 'Basic',
  },
  [FieldMetadataType.Rating]: {
    label: 'Avaliação',
    Icon: IllustrationIconStar,
    exampleValue: '3',
    category: 'Basic',
  },
  [FieldMetadataType.FullName]: {
    label: 'Nome Completo',
    Icon: IllustrationIconUser,
    exampleValue: { firstName: 'João', lastName: 'Silva' },
    category: 'Advanced',
  },
  [FieldMetadataType.Address]: {
    label: 'Endereço',
    Icon: IllustrationIconMap,
    exampleValue: {
      addressStreet1: 'Rua dos Pinheiros, 123',
      addressStreet2: 'Apto 12B',
      addressCity: 'São Paulo',
      addressState: 'SP',
      addressCountry: 'Brasil',
      addressPostcode: '05422012',
      addressLat: -23.561684,
      addressLng: -46.655981,
    },
    category: 'Basic',
  },
  [FieldMetadataType.RawJson]: {
    label: 'JSON',
    Icon: IllustrationIconJson,
    exampleValue: { key: 'value' },

    category: 'Basic',
  },
  [FieldMetadataType.RichText]: {
    label: 'Sistema',
    Icon: IllustrationIconSetting,
    exampleValue: { key: 'value' },
    category: 'Basic',
  },
  [FieldMetadataType.Actor]: {
    label: 'Sistema',
    Icon: IllustrationIconSetting,
    category: 'Basic',
  },
  [FieldMetadataType.Array]: {
    label: 'Array',
    Icon: IllustrationIconArray,
    category: 'Basic',
    exampleValue: ['value1', 'value2'],
  },
} as const satisfies Record<
  SettingsSupportedFieldType,
  SettingsFieldTypeConfig
>;
