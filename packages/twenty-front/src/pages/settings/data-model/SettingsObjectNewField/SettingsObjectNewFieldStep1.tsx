import styled from '@emotion/styled';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { H2Title, IconHierarchy2, IconPlus } from 'twenty-ui';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';

import { useFieldMetadataItem } from '@/object-metadata/hooks/useFieldMetadataItem';
import { settingsObjectFieldsFamilyState } from '@/settings/data-model/object-details/states/settingsObjectFieldsFamilyState';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { Button } from '@/ui/input/button/components/Button';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { useRecoilState } from 'recoil';
import { SettingsObjectFieldTable } from '~/pages/settings/data-model/SettingsObjectFieldTable';

const StyledSection = styled(Section)`
  display: flex;
  flex-direction: column;
`;

const StyledAddCustomFieldButton = styled(Button)`
  align-self: flex-end;
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsObjectNewFieldStep1 = () => {
  const navigate = useNavigate();

  const { objectSlug = '' } = useParams();
  const { findActiveObjectMetadataItemBySlug } =
    useFilteredObjectMetadataItems();

  const activeObjectMetadataItem =
    findActiveObjectMetadataItemBySlug(objectSlug);

  const [settingsObjectFields] = useRecoilState(
    settingsObjectFieldsFamilyState({
      objectMetadataItemId: activeObjectMetadataItem?.id,
    }),
  );

  const { activateMetadataField, deactivateMetadataField } =
    useFieldMetadataItem();

  const canSave = settingsObjectFields?.some(
    (field, index) =>
      field.isActive !== activeObjectMetadataItem?.fields[index].isActive,
  );

  const handleSave = async () => {
    if (!activeObjectMetadataItem || !settingsObjectFields) {
      return;
    }

    await Promise.all(
      settingsObjectFields.map((fieldMetadataItem, index) => {
        if (
          fieldMetadataItem.isActive ===
          activeObjectMetadataItem.fields[index].isActive
        ) {
          return undefined;
        }

        return fieldMetadataItem.isActive
          ? activateMetadataField(fieldMetadataItem)
          : deactivateMetadataField(fieldMetadataItem);
      }),
    );

    navigate(`/settings/objects/${objectSlug}`);
  };

  useEffect(() => {
    if (!activeObjectMetadataItem) {
      navigate(AppPath.NotFound);
      return;
    }
  }, [activeObjectMetadataItem, navigate]);

  if (!activeObjectMetadataItem) return null;

  return (
    <SubMenuTopBarContainer
      Icon={IconHierarchy2}
      links={[
        {
          children: 'Workspace',
          href: getSettingsPagePath(SettingsPath.Workspace),
        },
        { children: 'Objetos', href: '/settings/objects' },
        {
          children: activeObjectMetadataItem.labelPlural,
          href: `/settings/objects/${objectSlug}`,
        },
        { children: 'Novo Campo' },
      ]}
      actionButton={
        !activeObjectMetadataItem.isRemote && (
          <SaveAndCancelButtons
            isSaveDisabled={!canSave}
            onCancel={() => navigate(`/settings/objects/${objectSlug}`)}
            onSave={handleSave}
          />
        )
      }
    >
      <SettingsPageContainer>
        <StyledSection>
          <H2Title
            title="Verificar campos desativados"
            description="Antes de criar um campo personalizado, verifique se ele já existe na seção desativada."
          />
          <SettingsObjectFieldTable
            objectMetadataItem={activeObjectMetadataItem}
            mode="new-field"
          />
          <StyledAddCustomFieldButton
            Icon={IconPlus}
            title="Adicionar Campo Personalizado"
            size="small"
            variant="secondary"
            to={`/settings/objects/${objectSlug}/new-field/step-2`}
          />
        </StyledSection>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
