import styled from '@emotion/styled';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { SettingsDataModelCardTitle } from '@/settings/data-model/components/SettingsDataModelCardTitle';
import { SettingsDataModelFieldPreviewCard } from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewCard';
import {
  SettingsDataModelObjectIdentifiersForm,
  SettingsDataModelObjectIdentifiersFormValues,
} from '@/settings/data-model/objects/forms/components/SettingsDataModelObjectIdentifiersForm';
import { SettingsDataModelObjectSummary } from '@/settings/data-model/objects/SettingsDataModelObjectSummary';
import { Card } from '@/ui/layout/card/components/Card';
import { CardContent } from '@/ui/layout/card/components/CardContent';

type SettingsDataModelObjectSettingsFormCardProps = {
  objectMetadataItem: ObjectMetadataItem;
};

const StyledFieldPreviewCard = styled(SettingsDataModelFieldPreviewCard)`
  width: 100%;
`;

const StyledTopCardContent = styled(CardContent)`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
`;

const StyledObjectSummaryCard = styled(Card)`
  border-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme }) => theme.font.color.primary};
  max-width: 480px;
`;

const StyledObjectSummaryCardContent = styled(CardContent)`
  padding: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsDataModelObjectSettingsFormCard = ({
  objectMetadataItem,
}: SettingsDataModelObjectSettingsFormCardProps) => {
  const { watch: watchFormValue } =
    useFormContext<SettingsDataModelObjectIdentifiersFormValues>();

  const labelIdentifierFieldMetadataIdFormValue = watchFormValue(
    'labelIdentifierFieldMetadataId',
  );

  const labelIdentifierFieldMetadataItem = useMemo(
    () =>
      getLabelIdentifierFieldMetadataItem({
        fields: objectMetadataItem.fields,
        labelIdentifierFieldMetadataId: labelIdentifierFieldMetadataIdFormValue,
      }),
    [labelIdentifierFieldMetadataIdFormValue, objectMetadataItem],
  );

  return (
    <Card fullWidth>
      <StyledTopCardContent divider>
        <SettingsDataModelCardTitle>Prévia</SettingsDataModelCardTitle>
        {labelIdentifierFieldMetadataItem ? (
          <StyledFieldPreviewCard
            objectMetadataItem={objectMetadataItem}
            fieldMetadataItem={labelIdentifierFieldMetadataItem}
            withFieldLabel={false}
          />
        ) : (
          <StyledObjectSummaryCard>
            <StyledObjectSummaryCardContent>
              <SettingsDataModelObjectSummary
                objectMetadataItem={objectMetadataItem}
              />
            </StyledObjectSummaryCardContent>
          </StyledObjectSummaryCard>
        )}
      </StyledTopCardContent>
      <CardContent>
        <SettingsDataModelObjectIdentifiersForm
          objectMetadataItem={objectMetadataItem}
          defaultLabelIdentifierFieldMetadataId={
            labelIdentifierFieldMetadataItem?.id
          }
        />
      </CardContent>
    </Card>
  );
};
