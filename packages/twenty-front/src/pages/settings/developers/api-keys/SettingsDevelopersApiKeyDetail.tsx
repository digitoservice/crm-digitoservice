import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { H2Title, IconCode, IconRepeat, IconTrash } from 'twenty-ui';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { ApiKeyInput } from '@/settings/developers/components/ApiKeyInput';
import { ApiKeyNameInput } from '@/settings/developers/components/ApiKeyNameInput';
import { apiKeyTokenState } from '@/settings/developers/states/generatedApiKeyTokenState';
import { ApiKey } from '@/settings/developers/types/api-key/ApiKey';
import { computeNewExpirationDate } from '@/settings/developers/utils/compute-new-expiration-date';
import { formatExpiration } from '@/settings/developers/utils/format-expiration';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Button } from '@/ui/input/button/components/Button';
import { TextInput } from '@/ui/input/components/TextInput';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { useGenerateApiKeyTokenMutation } from '~/generated/graphql';

const StyledInfo = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
`;

const StyledInputContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

export const SettingsDevelopersApiKeyDetail = () => {
  const { enqueueSnackBar } = useSnackBar();
  const [isRegenerateKeyModalOpen, setIsRegenerateKeyModalOpen] =
    useState(false);
  const [isDeleteApiKeyModalOpen, setIsDeleteApiKeyModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { apiKeyId = '' } = useParams();

  const [apiKeyToken, setApiKeyToken] = useRecoilState(apiKeyTokenState);
  const [generateOneApiKeyToken] = useGenerateApiKeyTokenMutation();
  const { createOneRecord: createOneApiKey } = useCreateOneRecord<ApiKey>({
    objectNameSingular: CoreObjectNameSingular.ApiKey,
  });
  const { updateOneRecord: updateApiKey } = useUpdateOneRecord<ApiKey>({
    objectNameSingular: CoreObjectNameSingular.ApiKey,
  });

  const [apiKeyName, setApiKeyName] = useState('');

  const { record: apiKeyData, loading } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.ApiKey,
    objectRecordId: apiKeyId,
    onCompleted: (record) => {
      setApiKeyName(record.name);
    },
  });
  const developerPath = getSettingsPagePath(SettingsPath.Developers);

  const deleteIntegration = async (redirect = true) => {
    setIsLoading(true);

    try {
      await updateApiKey?.({
        idToUpdate: apiKeyId,
        updateOneRecordInput: { revokedAt: DateTime.now().toString() },
      });
      if (redirect) {
        navigate(developerPath);
      }
    } catch (err) {
      enqueueSnackBar(`Erro ao excluir a api key: ${err}`, {
        variant: SnackBarVariant.Error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createIntegration = async (
    name: string,
    newExpiresAt: string | null,
  ) => {
    const newApiKey = await createOneApiKey?.({
      name: name,
      expiresAt: newExpiresAt ?? '',
    });

    if (!newApiKey) {
      return;
    }

    const tokenData = await generateOneApiKeyToken({
      variables: {
        apiKeyId: newApiKey.id,
        expiresAt: newApiKey?.expiresAt,
      },
    });
    return {
      id: newApiKey.id,
      token: tokenData.data?.generateApiKeyToken.token,
    };
  };
  const regenerateApiKey = async () => {
    setIsLoading(true);
    try {
      if (isNonEmptyString(apiKeyData?.name)) {
        const newExpiresAt = computeNewExpirationDate(
          apiKeyData?.expiresAt,
          apiKeyData?.createdAt,
        );
        const apiKey = await createIntegration(apiKeyData?.name, newExpiresAt);
        await deleteIntegration(false);

        if (isNonEmptyString(apiKey?.token)) {
          setApiKeyToken(apiKey.token);
          navigate(`/settings/developers/api-keys/${apiKey.id}`);
        }
      }
    } catch (err) {
      enqueueSnackBar(`Erro ao regenerar a api key: ${err}`, {
        variant: SnackBarVariant.Error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {apiKeyData?.name && (
        <SubMenuTopBarContainer
          Icon={IconCode}
          title={apiKeyData?.name}
          links={[
            {
              children: 'Workspace',
              href: getSettingsPagePath(SettingsPath.Workspace),
            },
            { children: 'Desenvolvedores', href: developerPath },
            { children: `${apiKeyName} API Key` },
          ]}
        >
          <SettingsPageContainer>
            <Section>
              {apiKeyToken ? (
                <>
                  <H2Title
                    title="API Key"
                    description="Copie esta key, pois será visível apenas uma vez"
                  />
                  <ApiKeyInput apiKey={apiKeyToken} />
                  <StyledInfo>
                    {formatExpiration(apiKeyData?.expiresAt || '', true, false)}
                  </StyledInfo>
                </>
              ) : (
                <>
                  <H2Title
                    title="API Key"
                    description="Regenerar uma API key"
                  />
                  <StyledInputContainer>
                    <Button
                      title="Regenerar Key"
                      Icon={IconRepeat}
                      onClick={() => setIsRegenerateKeyModalOpen(true)}
                    />
                    <StyledInfo>
                      {formatExpiration(
                        apiKeyData?.expiresAt || '',
                        true,
                        false,
                      )}
                    </StyledInfo>
                  </StyledInputContainer>
                </>
              )}
            </Section>
            <Section>
              <H2Title title="Nome" description="Nome da sua API key" />
              <ApiKeyNameInput
                apiKeyName={apiKeyName}
                apiKeyId={apiKeyData?.id}
                disabled={loading}
                onNameUpdate={setApiKeyName}
              />
            </Section>
            <Section>
              <H2Title
                title="Expiração"
                description="Quando a key será desativada"
              />
              <TextInput
                placeholder="Ex: integração com backoffice"
                value={formatExpiration(
                  apiKeyData?.expiresAt || '',
                  true,
                  false,
                )}
                disabled
                fullWidth
              />
            </Section>
            <Section>
              <H2Title
                title="Zona de perigo"
                description="Excluir esta integração"
              />
              <Button
                accent="danger"
                variant="secondary"
                title="Excluir"
                Icon={IconTrash}
                onClick={() => setIsDeleteApiKeyModalOpen(true)}
              />
            </Section>
          </SettingsPageContainer>
        </SubMenuTopBarContainer>
      )}
      <ConfirmationModal
        confirmationPlaceholder="yes"
        confirmationValue="yes"
        isOpen={isDeleteApiKeyModalOpen}
        setIsOpen={setIsDeleteApiKeyModalOpen}
        title="Excluir API key"
        subtitle={
          <>
            Por favor, digite "yes" para confirmar que deseja excluir esta API Key.
            Esteja ciente de que qualquer script usando esta key deixará de funcionar.
          </>
        }
        onConfirmClick={deleteIntegration}
        deleteButtonText="Excluir"
        loading={isLoading}
      />
      <ConfirmationModal
        confirmationPlaceholder="yes"
        confirmationValue="yes"
        isOpen={isRegenerateKeyModalOpen}
        setIsOpen={setIsRegenerateKeyModalOpen}
        title="Regenerar uma API key"
        subtitle={
          <>
            Se você perdeu esta key, pode regenerá-la, mas esteja ciente de que
            qualquer script usando esta key precisará ser atualizado. Por favor,
            digite "yes" para confirmar.
          </>
        }
        onConfirmClick={regenerateApiKey}
        deleteButtonText="Regenerar key"
        loading={isLoading}
      />
    </>
  );
};
