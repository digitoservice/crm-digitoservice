import styled from '@emotion/styled';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { H2Title, IconCode, IconTrash } from 'twenty-ui';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { Webhook } from '@/settings/developers/types/webhook/Webhook';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { Button } from '@/ui/input/button/components/Button';
import { Select } from '@/ui/input/components/Select';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';

const StyledFilterRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsDevelopersWebhooksDetail = () => {
  const { objectMetadataItems } = useObjectMetadataItems();
  const navigate = useNavigate();
  const { webhookId = '' } = useParams();

  const [isDeleteWebhookModalOpen, setIsDeleteWebhookModalOpen] =
    useState(false);

  const [description, setDescription] = useState<string>('');
  const [operationObjectSingularName, setOperationObjectSingularName] =
    useState<string>('');
  const [operationAction, setOperationAction] = useState('');
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const { record: webhookData } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.Webhook,
    objectRecordId: webhookId,
    onCompleted: (data) => {
      setDescription(data?.description ?? '');
      setOperationObjectSingularName(data?.operation.split('.')[0] ?? '');
      setOperationAction(data?.operation.split('.')[1] ?? '');
      setIsDirty(false);
    },
  });

  const { deleteOneRecord: deleteOneWebhook } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.Webhook,
  });

  const developerPath = getSettingsPagePath(SettingsPath.Developers);

  const deleteWebhook = () => {
    deleteOneWebhook(webhookId);
    navigate(developerPath);
  };

  const fieldTypeOptions = [
    { value: '*', label: 'Todos os Objetos' },
    ...objectMetadataItems.map((item) => ({
      value: item.nameSingular,
      label: item.labelSingular,
    })),
  ];

  const { updateOneRecord } = useUpdateOneRecord<Webhook>({
    objectNameSingular: CoreObjectNameSingular.Webhook,
  });

  const handleSave = async () => {
    setIsDirty(false);
    await updateOneRecord({
      idToUpdate: webhookId,
      updateOneRecordInput: {
        operation: `${operationObjectSingularName}.${operationAction}`,
        description: description,
      },
    });
    navigate(developerPath);
  };

  return (
    <>
      {webhookData?.targetUrl && (
        <SubMenuTopBarContainer
          Icon={IconCode}
          title={webhookData.targetUrl}
          links={[
            {
              children: 'Workspace',
              href: getSettingsPagePath(SettingsPath.Workspace),
            },
            {
              children: 'Desenvolvedores',
              href: developerPath,
            },
            { children: 'Webhook' },
          ]}
          actionButton={
            <SaveAndCancelButtons
              isSaveDisabled={!isDirty}
              onCancel={() => {
                navigate(developerPath);
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
                value={webhookData.targetUrl}
                disabled
                fullWidth
              />
            </Section>
            <Section>
              <H2Title
                title="Descrição"
                description="Uma descrição opcional"
              />
              <TextArea
                placeholder="Escreva uma descrição"
                minRows={4}
                value={description}
                onChange={(description) => {
                  setDescription(description);
                  setIsDirty(true);
                }}
              />
            </Section>
            <Section>
              <H2Title
                title="Filtros"
                description="Selecione o evento que deseja enviar para este endpoint"
              />
              <StyledFilterRow>
                <Select
                  fullWidth
                  dropdownId="object-webhook-type-select"
                  value={operationObjectSingularName}
                  onChange={(objectSingularName) => {
                    setIsDirty(true);
                    setOperationObjectSingularName(objectSingularName);
                  }}
                  options={fieldTypeOptions}
                />
                <Select
                  fullWidth
                  dropdownId="operation-webhook-type-select"
                  value={operationAction}
                  onChange={(operationAction) => {
                    setIsDirty(true);
                    setOperationAction(operationAction);
                  }}
                  options={[
                    { value: '*', label: 'Todas as Ações' },
                    { value: 'create', label: 'Criar' },
                    { value: 'update', label: 'Atualizar' },
                    { value: 'delete', label: 'Excluir' },
                  ]}
                />
              </StyledFilterRow>
            </Section>
            <Section>
              <H2Title
                title="Zona de Perigo"
                description="Excluir esta integração"
              />
              <Button
                accent="danger"
                variant="secondary"
                title="Excluir"
                Icon={IconTrash}
                onClick={() => setIsDeleteWebhookModalOpen(true)}
              />
              <ConfirmationModal
                confirmationPlaceholder="yes"
                confirmationValue="yes"
                isOpen={isDeleteWebhookModalOpen}
                setIsOpen={setIsDeleteWebhookModalOpen}
                title="Excluir webhook"
                subtitle={
                  <>
                    Por favor, digite "yes" para confirmar que deseja excluir este
                    webhook.
                  </>
                }
                onConfirmClick={deleteWebhook}
                deleteButtonText="Excluir webhook"
              />
            </Section>
          </SettingsPageContainer>
        </SubMenuTopBarContainer>
      )}
    </>
  );
};
