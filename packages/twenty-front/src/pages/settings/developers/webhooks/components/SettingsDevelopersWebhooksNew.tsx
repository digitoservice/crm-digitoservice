import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { H2Title, isDefined } from 'twenty-ui';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { Webhook } from '@/settings/developers/types/webhook/Webhook';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { TextInput } from '@/ui/input/components/TextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { isValidUrl } from '~/utils/url/isValidUrl';

export const SettingsDevelopersWebhooksNew = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState<{
    targetUrl: string;
    operation: string;
  }>({
    targetUrl: '',
    operation: '*.*',
  });
  const [isTargetUrlValid, setIsTargetUrlValid] = useState(true);

  const { createOneRecord: createOneWebhook } = useCreateOneRecord<Webhook>({
    objectNameSingular: CoreObjectNameSingular.Webhook,
  });

  const handleValidate = async (value: string) => {
    const trimmedUrl = value.trim();

    setIsTargetUrlValid(isValidUrl(trimmedUrl));
  };

  const handleSave = async () => {
    const newWebhook = await createOneWebhook?.(formValues);

    if (!newWebhook) {
      return;
    }
    navigate(`/settings/developers/webhooks/${newWebhook.id}`);
  };

  const canSave =
    !!formValues.targetUrl && isTargetUrlValid && isDefined(createOneWebhook);

  // TODO: refactor use useScopedHotkeys
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && canSave) {
      handleSave();
    }
  };

  const handleChange = (value: string) => {
    setFormValues((prevState) => ({
      ...prevState,
      targetUrl: value,
    }));
    handleValidate(value);
  };

  return (
    <SubMenuTopBarContainer
      title="Novo Webhook"
      links={[
        {
          children: 'Workspace',
          href: getSettingsPagePath(SettingsPath.Workspace),
        },
        {
          children: 'Desenvolvedores',
          href: getSettingsPagePath(SettingsPath.Developers),
        },
        { children: 'Novo Webhook' },
      ]}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!canSave}
          onCancel={() => {
            navigate(getSettingsPagePath(SettingsPath.Developers));
          }}
          onSave={handleSave}
        />
      }
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title="URL do Endpoint"
            description="Enviaremos requisições POST para este endpoint para cada novo evento"
          />
          <TextInput
            placeholder="URL"
            value={formValues.targetUrl}
            error={!isTargetUrlValid ? 'Por favor, insira uma URL válida' : undefined}
            onKeyDown={handleKeyDown}
            onChange={handleChange}
            fullWidth
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
