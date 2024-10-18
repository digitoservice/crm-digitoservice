import { IconFilterOff } from 'twenty-ui';

import { useObjectLabel } from '@/object-metadata/hooks/useObjectLabel';
import { useHandleToggleTrashColumnFilter } from '@/object-record/record-index/hooks/useHandleToggleTrashColumnFilter';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableEmptyStateDisplay } from '@/object-record/record-table/empty-state/components/RecordTableEmptyStateDisplay';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { useDeleteCombinedViewFilters } from '@/views/hooks/useDeleteCombinedViewFilters';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

export const RecordTableEmptyStateSoftDelete = () => {
  const { objectMetadataItem, objectNameSingular, recordTableId } =
    useContext(RecordTableContext);

  const { deleteCombinedViewFilter } =
    useDeleteCombinedViewFilters(recordTableId);
  const { tableFiltersState } = useRecordTableStates(recordTableId);

  const tableFilters = useRecoilValue(tableFiltersState);

  const { toggleSoftDeleteFilterState } = useHandleToggleTrashColumnFilter({
    objectNameSingular,
    viewBarId: recordTableId,
  });

  const handleButtonClick = async () => {
    deleteCombinedViewFilter(
      tableFilters.find(
        (filter) =>
          filter.definition.label === 'Excluídos' &&
          filter.operand === 'isNotEmpty',
      )?.id ?? '',
    );
    toggleSoftDeleteFilterState(false);
  };

  const objectLabel = useObjectLabel(objectMetadataItem);

  return (
    <RecordTableEmptyStateDisplay
      buttonTitle={'Remover filtro de excluídos'}
      subTitle={'Nenhum registro excluído correspondente aos critérios de filtro foi encontrado.'}
      title={`Nenhum(a) ${objectLabel} excluído encontrado(a)`}
      Icon={IconFilterOff}
      animatedPlaceholderType="noDeletedRecord"
      onClick={handleButtonClick}
    />
  );
};
