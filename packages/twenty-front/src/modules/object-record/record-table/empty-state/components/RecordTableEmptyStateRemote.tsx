/* eslint-disable @nx/workspace-no-navigate-prefer-link */
import { IconSettings } from 'twenty-ui';

import { RecordTableEmptyStateDisplay } from '@/object-record/record-table/empty-state/components/RecordTableEmptyStateDisplay';
import { useNavigate } from 'react-router-dom';

export const RecordTableEmptyStateRemote = () => {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate('/settings/integrations');
  };

  return (
    <RecordTableEmptyStateDisplay
      buttonTitle={'Ir para Configurações'}
      subTitle={'Se isso for inesperado, por favor, verifique suas configurações.'}
      title={'Nenhum Dado Disponível para a Tabela Remota'}
      Icon={IconSettings}
      animatedPlaceholderType="noRecord"
      onClick={handleButtonClick}
    />
  );
};
