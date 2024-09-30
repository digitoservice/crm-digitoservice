import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { StyledFormCardTitle } from '@/settings/data-model/fields/components/StyledFormCardTitle';
import { SettingsDataModelFieldToggle } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldToggle';
import { useDateSettingsFormInitialValues } from '@/settings/data-model/fields/forms/date/hooks/useDateSettingsFormInitialValues';
import { CardContent } from '@/ui/layout/card/components/CardContent';
import { IconClockShare } from 'twenty-ui';

export const settingsDataModelFieldDateFormSchema = z.object({
  settings: z
    .object({
      displayAsRelativeDate: z.boolean().optional(),
    })
    .optional(),
});

export type SettingsDataModelFieldDateFormValues = z.infer<
  typeof settingsDataModelFieldDateFormSchema
>;

type SettingsDataModelFieldDateFormProps = {
  disabled?: boolean;
  fieldMetadataItem: Pick<FieldMetadataItem, 'settings'>;
};

export const SettingsDataModelFieldDateForm = ({
  disabled,
  fieldMetadataItem,
}: SettingsDataModelFieldDateFormProps) => {
  const { control } = useFormContext<SettingsDataModelFieldDateFormValues>();

  const { initialDisplayAsRelativeDateValue } =
    useDateSettingsFormInitialValues({
      fieldMetadataItem,
    });

  return (
    <CardContent>
      <Controller
        name="settings.displayAsRelativeDate"
        control={control}
        defaultValue={initialDisplayAsRelativeDateValue}
        render={({ field: { onChange, value } }) => (
          <>
            <StyledFormCardTitle>Opções</StyledFormCardTitle>
            <SettingsDataModelFieldToggle
              label="Exibir como data relativa"
              Icon={IconClockShare}
              onChange={onChange}
              value={value}
              disabled={disabled}
              tooltip={
                'Mostrar datas em um formato mais amigável. Exemplo: "há 13 minutos" ao invés de "30 de jul, 2024 19:11"'
              }
            />
          </>
        )}
      />
    </CardContent>
  );
};
