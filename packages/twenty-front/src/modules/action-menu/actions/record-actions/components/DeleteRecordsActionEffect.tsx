import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import { contextStoreNumberOfSelectedRecordsState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsState';
import { contextStoreTargetedRecordsRuleState } from '@/context-store/states/contextStoreTargetedRecordsRuleState';
import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { DELETE_MAX_COUNT } from '@/object-record/constants/DeleteMaxCount';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';
import { useFetchAllRecordIds } from '@/object-record/hooks/useFetchAllRecordIds';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { IconTrash, isDefined } from 'twenty-ui';

export const DeleteRecordsActionEffect = ({
  position,
  objectMetadataItem,
}: {
  position: number;
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const { addActionMenuEntry, removeActionMenuEntry } = useActionMenuEntries();

  const [isDeleteRecordsModalOpen, setIsDeleteRecordsModalOpen] =
    useState(false);

  const { resetTableRowSelection } = useRecordTable({
    recordTableId: objectMetadataItem.namePlural,
  });

  const { deleteManyRecords } = useDeleteManyRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const { favorites, deleteFavorite } = useFavorites();

  const contextStoreNumberOfSelectedRecords = useRecoilValue(
    contextStoreNumberOfSelectedRecordsState,
  );

  const contextStoreTargetedRecordsRule = useRecoilValue(
    contextStoreTargetedRecordsRuleState,
  );

  const graphqlFilter = computeContextStoreFilters(
    contextStoreTargetedRecordsRule,
    objectMetadataItem,
  );

  const { fetchAllRecordIds } = useFetchAllRecordIds({
    objectNameSingular: objectMetadataItem.nameSingular,
    filter: graphqlFilter,
  });

  const handleDeleteClick = useCallback(async () => {
    const recordIdsToDelete = await fetchAllRecordIds();

    resetTableRowSelection();

    for (const recordIdToDelete of recordIdsToDelete) {
      const foundFavorite = favorites?.find(
        (favorite) => favorite.recordId === recordIdToDelete,
      );

      if (foundFavorite !== undefined) {
        deleteFavorite(foundFavorite.id);
      }
    }

    await deleteManyRecords(recordIdsToDelete, {
      delayInMsBetweenRequests: 50,
    });
  }, [
    deleteFavorite,
    deleteManyRecords,
    favorites,
    fetchAllRecordIds,
    resetTableRowSelection,
  ]);

  const isRemoteObject = objectMetadataItem.isRemote;

  const canDelete =
    !isRemoteObject &&
    isDefined(contextStoreNumberOfSelectedRecords) &&
    contextStoreNumberOfSelectedRecords < DELETE_MAX_COUNT &&
    contextStoreNumberOfSelectedRecords > 0;

  useEffect(() => {
    if (canDelete) {
      addActionMenuEntry({
        key: 'delete',
        label: 'Excluir',
        position,
        Icon: IconTrash,
        accent: 'danger',
        onClick: () => {
          setIsDeleteRecordsModalOpen(true);
        },
        ConfirmationModal: (
          <ConfirmationModal
            isOpen={isDeleteRecordsModalOpen}
            setIsOpen={setIsDeleteRecordsModalOpen}
            title={`Excluir ${contextStoreNumberOfSelectedRecords} ${
              contextStoreNumberOfSelectedRecords === 1 ? `registro` : 'registros'
            }`}
            subtitle={`Você tem certeza de que deseja excluir ${
              contextStoreNumberOfSelectedRecords === 1
                ? 'este registro'
                : 'estes registros'
            }? ${
              contextStoreNumberOfSelectedRecords === 1 ? 'Ele' : 'Eles'
            } podem ser recuperados pelo menu Opções.`}
            onConfirmClick={() => handleDeleteClick()}
            deleteButtonText={`Excluir ${
              contextStoreNumberOfSelectedRecords > 1 ? 'Registros' : 'Registro'
            }`}
          />
        ),
      });
    } else {
      removeActionMenuEntry('delete');
    }

    return () => {
      removeActionMenuEntry('delete');
    };
  }, [
    addActionMenuEntry,
    canDelete,
    contextStoreNumberOfSelectedRecords,
    handleDeleteClick,
    isDeleteRecordsModalOpen,
    position,
    removeActionMenuEntry,
  ]);

  return null;
};
