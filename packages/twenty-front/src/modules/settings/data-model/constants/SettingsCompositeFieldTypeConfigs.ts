import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
import {
  FieldActorValue,
  FieldAddressValue,
  FieldCurrencyValue,
  FieldEmailsValue,
  FieldFullNameValue,
  FieldLinksValue,
  FieldLinkValue,
  FieldPhonesValue,
} from '@/object-record/record-field/types/FieldMetadata';
import { SettingsFieldTypeConfig } from '@/settings/data-model/constants/SettingsNonCompositeFieldTypeConfigs';
import { CompositeFieldType } from '@/settings/data-model/types/CompositeFieldType';
import {
  IllustrationIconCurrency,
  IllustrationIconLink,
  IllustrationIconMail,
  IllustrationIconMap,
  IllustrationIconPhone,
  IllustrationIconSetting,
  IllustrationIconUser,
} from 'twenty-ui';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export type SettingsCompositeFieldTypeConfig<T> = SettingsFieldTypeConfig<T> & {
  subFields: (keyof T)[];
  filterableSubFields: (keyof T)[];
  labelBySubField: Record<keyof T, string>;
  exampleValue: T;
};

type SettingsCompositeFieldTypeConfigArray = Record<
  CompositeFieldType,
  SettingsCompositeFieldTypeConfig<any>
>;

export const SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS = {
  [FieldMetadataType.Currency]: {
    label: 'Moeda',
    Icon: IllustrationIconCurrency,
    subFields: ['amountMicros', 'currencyCode'],
    filterableSubFields: ['amountMicros', 'currencyCode'],
    labelBySubField: {
      amountMicros: 'Valor',
      currencyCode: 'Moeda',
    },
    exampleValue: {
      amountMicros: 2000000000,
      currencyCode: CurrencyCode.BRL,
    },
    category: 'Basic',
  } as const satisfies SettingsCompositeFieldTypeConfig<FieldCurrencyValue>,
  [FieldMetadataType.Emails]: {
    label: 'Emails',
    Icon: IllustrationIconMail,
    subFields: ['primaryEmail', 'additionalEmails'],
    filterableSubFields: ['primaryEmail'],
    labelBySubField: {
      primaryEmail: 'Email Principal',
      additionalEmails: 'Emails Adicionais',
    },
    exampleValue: {
      primaryEmail: 'joao@acme.com',
      additionalEmails: [
        'carlos@acme.com',
        'maria@acme.com',
        'ana@acme.com',
      ],
    },
    category: 'Basic',
  } as const satisfies SettingsCompositeFieldTypeConfig<FieldEmailsValue>,
  [FieldMetadataType.Link]: {
    label: 'Link',
    Icon: IllustrationIconLink,
    exampleValue: { url: 'www.example.com', label: '' },
    category: 'Basic',
    subFields: ['url', 'label'],
    filterableSubFields: ['url', 'label'],
    labelBySubField: {
      url: 'URL',
      label: 'Rótulo',
    },
  } as const satisfies SettingsCompositeFieldTypeConfig<FieldLinkValue>,
  [FieldMetadataType.Links]: {
    label: 'Links',
    Icon: IllustrationIconLink,
    exampleValue: {
      primaryLinkUrl: 'example.com',
      primaryLinkLabel: '',
      secondaryLinks: [{ url: 'example.com', label: 'Exemplo' }],
    },
    category: 'Basic',
    subFields: ['primaryLinkUrl', 'primaryLinkLabel', 'secondaryLinks'],
    filterableSubFields: ['primaryLinkUrl', 'primaryLinkLabel'],
    labelBySubField: {
      primaryLinkUrl: 'URL do Link',
      primaryLinkLabel: 'Rótulo do Link',
      secondaryLinks: 'Links Secundários',
    },
  } as const satisfies SettingsCompositeFieldTypeConfig<FieldLinksValue>,
  [FieldMetadataType.Phones]: {
    label: 'Telefones',
    Icon: IllustrationIconPhone,
    exampleValue: {
      primaryPhoneNumber: '11 1234-5678',
      primaryPhoneCountryCode: '+55',
      additionalPhones: [{ number: '11 2345-6789', countryCode: '+55' }],
    },
    subFields: [
      'primaryPhoneNumber',
      'primaryPhoneCountryCode',
      'additionalPhones',
    ],
    filterableSubFields: ['primaryPhoneNumber', 'primaryPhoneCountryCode'],
    labelBySubField: {
      primaryPhoneNumber: 'Número de Telefone Principal',
      primaryPhoneCountryCode: 'Código de País do Telefone Principal',
      additionalPhones: 'Telefones Adicionais',
    },
    category: 'Basic',
  } as const satisfies SettingsCompositeFieldTypeConfig<FieldPhonesValue>,
  [FieldMetadataType.FullName]: {
    label: 'Nome Completo',
    Icon: IllustrationIconUser,
    exampleValue: { firstName: 'João', lastName: 'Silva' },
    category: 'Advanced',
    subFields: ['firstName', 'lastName'],
    filterableSubFields: ['firstName', 'lastName'],
    labelBySubField: {
      firstName: 'Nome',
      lastName: 'Sobrenome',
    },
  } as const satisfies SettingsCompositeFieldTypeConfig<FieldFullNameValue>,
  [FieldMetadataType.Address]: {
    label: 'Endereço',
    Icon: IllustrationIconMap,
    subFields: [
      'addressStreet1',
      'addressStreet2',
      'addressCity',
      'addressState',
      'addressCountry',
      'addressPostcode',
      'addressLat',
      'addressLng',
    ],
    filterableSubFields: [
      'addressStreet1',
      'addressStreet2',
      'addressCity',
      'addressState',
      'addressCountry',
      'addressPostcode',
    ],
    labelBySubField: {
      addressStreet1: 'Endereço',
      addressStreet2: 'Complemento do Endereço',
      addressCity: 'Cidade',
      addressState: 'Estado',
      addressCountry: 'País',
      addressPostcode: 'Código Postal',
      addressLat: 'Latitude',
      addressLng: 'Longitude',
    },
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
  } as const satisfies SettingsCompositeFieldTypeConfig<FieldAddressValue>,
  [FieldMetadataType.Actor]: {
    label: 'Ator',
    Icon: IllustrationIconSetting,
    category: 'Basic',
    subFields: ['source', 'name', 'workspaceMemberId'],
    filterableSubFields: ['source', 'name', 'workspaceMemberId'],
    labelBySubField: {
      source: 'Fonte',
      name: 'Nome',
      workspaceMemberId: 'ID do Membro do Workspace',
    },
    exampleValue: { source: 'source', name: 'name', workspaceMemberId: 'id' },
  } as const satisfies SettingsCompositeFieldTypeConfig<FieldActorValue>,
} as const satisfies SettingsCompositeFieldTypeConfigArray;
