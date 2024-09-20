import styled from '@emotion/styled';
import { Key } from 'ts-key-enum';
import { IconLayoutKanban, IconTable, IconX } from 'twenty-ui';

import { IconPicker } from '@/ui/input/components/IconPicker';
import { Select } from '@/ui/input/components/Select';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuInput } from '@/ui/layout/dropdown/components/DropdownMenuInput';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { ViewsHotkeyScope } from '@/views/types/ViewsHotkeyScope';
import { ViewType } from '@/views/types/ViewType';
import { ViewPickerCreateButton } from '@/views/view-picker/components/ViewPickerCreateButton';
import { ViewPickerIconAndNameContainer } from '@/views/view-picker/components/ViewPickerIconAndNameContainer';
import { ViewPickerSaveButtonContainer } from '@/views/view-picker/components/ViewPickerSaveButtonContainer';
import { ViewPickerSelectContainer } from '@/views/view-picker/components/ViewPickerSelectContainer';
import { VIEW_PICKER_KANBAN_FIELD_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerKanbanFieldDropdownId';
import { VIEW_PICKER_VIEW_TYPE_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerViewTypeDropdownId';
import { useCreateViewFromCurrentState } from '@/views/view-picker/hooks/useCreateViewFromCurrentState';
import { useGetAvailableFieldsForKanban } from '@/views/view-picker/hooks/useGetAvailableFieldsForKanban';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { viewPickerInputNameComponentState } from '@/views/view-picker/states/viewPickerInputNameComponentState';
import { viewPickerIsDirtyComponentState } from '@/views/view-picker/states/viewPickerIsDirtyComponentState';
import { viewPickerIsPersistingComponentState } from '@/views/view-picker/states/viewPickerIsPersistingComponentState';
import { viewPickerKanbanFieldMetadataIdComponentState } from '@/views/view-picker/states/viewPickerKanbanFieldMetadataIdComponentState';
import { viewPickerSelectedIconComponentState } from '@/views/view-picker/states/viewPickerSelectedIconComponentState';
import { viewPickerTypeComponentState } from '@/views/view-picker/states/viewPickerTypeComponentState';

const StyledNoKanbanFieldAvailableContainer = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  margin: ${({ theme }) => theme.spacing(1, 2)};
  user-select: none;
  width: calc(100% - ${({ theme }) => theme.spacing(4)});
`;

export const ViewPickerContentCreateMode = () => {
  const { setViewPickerMode } = useViewPickerMode();

  const [viewPickerInputName, setViewPickerInputName] =
    useRecoilComponentStateV2(viewPickerInputNameComponentState);

  const [viewPickerSelectedIcon, setViewPickerSelectedIcon] =
    useRecoilComponentStateV2(viewPickerSelectedIconComponentState);

  const viewPickerIsPersisting = useRecoilComponentValueV2(
    viewPickerIsPersistingComponentState,
  );
  const setViewPickerIsDirty = useSetRecoilComponentStateV2(
    viewPickerIsDirtyComponentState,
  );

  const [viewPickerKanbanFieldMetadataId, setViewPickerKanbanFieldMetadataId] =
    useRecoilComponentStateV2(viewPickerKanbanFieldMetadataIdComponentState);

  const [viewPickerType, setViewPickerType] = useRecoilComponentStateV2(
    viewPickerTypeComponentState,
  );

  const setHotkeyScope = useSetHotkeyScope();

  const { createViewFromCurrentState } = useCreateViewFromCurrentState();

  const { availableFieldsForKanban } = useGetAvailableFieldsForKanban();

  useScopedHotkeys(
    Key.Enter,
    async () => {
      if (viewPickerIsPersisting) {
        return;
      }

      if (
        viewPickerType === ViewType.Kanban &&
        availableFieldsForKanban.length === 0
      ) {
        return;
      }

      await createViewFromCurrentState();
    },
    ViewsHotkeyScope.ListDropdown,
  );

  const onIconChange = ({ iconKey }: { iconKey: string }) => {
    setViewPickerIsDirty(true);
    setViewPickerSelectedIcon(iconKey);
  };

  const handleClose = async () => {
    setViewPickerMode('list');
  };

  return (
    <>
      <DropdownMenuHeader StartIcon={IconX} onClick={handleClose}>
        Criar visualização
      </DropdownMenuHeader>
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer>
        <ViewPickerIconAndNameContainer>
          <IconPicker
            onChange={onIconChange}
            selectedIconKey={viewPickerSelectedIcon}
            disableBlur
            onClose={() => setHotkeyScope(ViewsHotkeyScope.ListDropdown)}
          />
          <DropdownMenuInput
            value={viewPickerInputName}
            onChange={(event) => {
              setViewPickerIsDirty(true);
              setViewPickerInputName(event.target.value);
            }}
            autoFocus
          />
        </ViewPickerIconAndNameContainer>
        <ViewPickerSelectContainer>
          <Select
            disableBlur
            label="Tipo de visualização"
            fullWidth
            value={viewPickerType}
            onChange={(value) => {
              setViewPickerIsDirty(true);
              setViewPickerType(value);
            }}
            options={[
              { value: ViewType.Table, label: 'Tabela', Icon: IconTable },
              {
                value: ViewType.Kanban,
                label: 'Kanban',
                Icon: IconLayoutKanban,
              },
            ]}
            dropdownId={VIEW_PICKER_VIEW_TYPE_DROPDOWN_ID}
          />
        </ViewPickerSelectContainer>
        {viewPickerType === ViewType.Kanban && (
          <>
            <ViewPickerSelectContainer>
              <Select
                disableBlur
                label="Etapas"
                fullWidth
                value={viewPickerKanbanFieldMetadataId}
                onChange={(value) => {
                  setViewPickerIsDirty(true);
                  setViewPickerKanbanFieldMetadataId(value);
                }}
                options={
                  availableFieldsForKanban.length > 0
                    ? availableFieldsForKanban.map((field) => ({
                        value: field.id,
                        label: field.label,
                      }))
                    : [{ value: '', label: 'Nenhum campo de seleção' }]
                }
                dropdownId={VIEW_PICKER_KANBAN_FIELD_DROPDOWN_ID}
              />
            </ViewPickerSelectContainer>
            {availableFieldsForKanban.length === 0 && (
              <StyledNoKanbanFieldAvailableContainer>
                Configure um campo de Seleção em Empresas para criar um Kanban
              </StyledNoKanbanFieldAvailableContainer>
            )}
          </>
        )}
      </DropdownMenuItemsContainer>
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer>
        <ViewPickerSaveButtonContainer>
          <ViewPickerCreateButton />
        </ViewPickerSaveButtonContainer>
      </DropdownMenuItemsContainer>
    </>
  );
};