import { IconPlus } from 'twenty-ui';

import { useObjectLabel } from '@/object-metadata/hooks/useObjectLabel';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableEmptyStateDisplay } from '@/object-record/record-table/empty-state/components/RecordTableEmptyStateDisplay';
import { useCreateNewTableRecord } from '@/object-record/record-table/hooks/useCreateNewTableRecords';
import { useContext } from 'react';

export const RecordTableEmptyStateNoRecordFoundForFilter = () => {
  const { createNewTableRecord } = useCreateNewTableRecord();

  const { objectMetadataItem } = useContext(RecordTableContext);

  const handleButtonClick = () => {
    createNewTableRecord();
  };

  const objectLabel = useObjectLabel(objectMetadataItem);

  const buttonTitle = `Adicionar um(a) ${objectLabel}`;

  const title = `Nenhum(a) ${objectLabel} encontrado(a)`;

  const subTitle = 'Nenhum registro correspondente aos critérios de filtro foi encontrado.';

  return (
    <RecordTableEmptyStateDisplay
      buttonTitle={buttonTitle}
      subTitle={subTitle}
      title={title}
      Icon={IconPlus}
      animatedPlaceholderType="noMatchRecord"
      onClick={handleButtonClick}
    />
  );
};
