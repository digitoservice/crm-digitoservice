import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import { contextStoreCurrentObjectMetadataIdState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdState';
import { contextStoreTargetedRecordIdsState } from '@/context-store/states/contextStoreTargetedRecordIdsState';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { DELETE_MAX_COUNT } from '@/object-record/constants/DeleteMaxCount';
import { useDeleteTableData } from '@/object-record/record-index/options/hooks/useDeleteTableData';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { IconTrash } from 'twenty-ui';

export const DeleteRecordsActionEffect = ({
  position,
}: {
  position: number;
}) => {
  const { addActionMenuEntry, removeActionMenuEntry } = useActionMenuEntries();

  const contextStoreTargetedRecordIds = useRecoilValue(
    contextStoreTargetedRecordIdsState,
  );

  const contextStoreCurrentObjectMetadataId = useRecoilValue(
    contextStoreCurrentObjectMetadataIdState,
  );

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: contextStoreCurrentObjectMetadataId,
  });

  const [isDeleteRecordsModalOpen, setIsDeleteRecordsModalOpen] =
    useState(false);

  const { deleteTableData } = useDeleteTableData({
    objectNameSingular: objectMetadataItem?.nameSingular ?? '',
    recordIndexId: objectMetadataItem?.namePlural ?? '',
  });

  const handleDeleteClick = useCallback(() => {
    deleteTableData(contextStoreTargetedRecordIds);
  }, [deleteTableData, contextStoreTargetedRecordIds]);

  const isRemoteObject = objectMetadataItem?.isRemote ?? false;

  const numberOfSelectedRecords = contextStoreTargetedRecordIds.length;

  const canDelete =
    !isRemoteObject && numberOfSelectedRecords < DELETE_MAX_COUNT;

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
            title={`Excluir ${numberOfSelectedRecords} ${
              numberOfSelectedRecords === 1 ? `registro` : 'registros'
            }`}
            subtitle={`Você tem certeza de que deseja excluir ${
              numberOfSelectedRecords === 1 ? 'este registro' : 'estes registros'
            }? ${
              numberOfSelectedRecords === 1 ? 'Ele' : 'Eles'
            } podem ser recuperados pelo menu Opções.`}
            onConfirmClick={() => handleDeleteClick()}
            deleteButtonText={`Excluir ${
              numberOfSelectedRecords > 1 ? 'Registros' : 'Registro'
            }`}
          />
        ),
      });
    } else {
      removeActionMenuEntry('delete');
    }
  }, [
    canDelete,
    addActionMenuEntry,
    removeActionMenuEntry,
    isDeleteRecordsModalOpen,
    numberOfSelectedRecords,
    handleDeleteClick,
    position,
  ]);

  return null;
};
