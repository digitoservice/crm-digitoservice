import {
  FieldAddressValue,
  FieldCurrencyValue,
  FieldEmailsValue,
  FieldFullNameValue,
  FieldLinksValue,
  FieldPhonesValue,
} from '@/object-record/record-field/types/FieldMetadata';
import { CompositeFieldLabels } from '@/object-record/spreadsheet-import/types/CompositeFieldLabels';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const COMPOSITE_FIELD_IMPORT_LABELS = {
  [FieldMetadataType.FullName]: {
    firstNameLabel: 'Nome',
    lastNameLabel: 'Sobrenome',
  } satisfies CompositeFieldLabels<FieldFullNameValue>,
  [FieldMetadataType.Currency]: {
    currencyCodeLabel: 'Código da Moeda',
    amountMicrosLabel: 'Valor',
  } satisfies CompositeFieldLabels<FieldCurrencyValue>,
  [FieldMetadataType.Address]: {
    addressStreet1Label: 'Endereço',
    addressStreet2Label: 'Complemento do Endereço',
    addressCityLabel: 'Cidade',
    addressPostcodeLabel: 'Código Postal',
    addressStateLabel: 'Estado',
    addressCountryLabel: 'País',
    addressLatLabel: 'Latitude',
    addressLngLabel: 'Longitude',
  } satisfies CompositeFieldLabels<FieldAddressValue>,
  [FieldMetadataType.Links]: {
    primaryLinkUrlLabel: 'URL do Link',
    primaryLinkLabelLabel: 'Rótulo do Link',
  } satisfies Partial<CompositeFieldLabels<FieldLinksValue>>,
  [FieldMetadataType.Emails]: {
    primaryEmailLabel: 'Email',
  } satisfies Partial<CompositeFieldLabels<FieldEmailsValue>>,
  [FieldMetadataType.Phones]: {
    primaryPhoneCountryCodeLabel: 'Código do país do telefone',
    primaryPhoneNumberLabel: 'Número de telefone',
  } satisfies Partial<CompositeFieldLabels<FieldPhonesValue>>,
  [FieldMetadataType.Actor]: {
    sourceLabel: 'Fonte',
  },
};
