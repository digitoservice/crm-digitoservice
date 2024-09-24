import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAccountsRowDropdownMenu } from '@/settings/accounts/components/SettingsAccountsRowDropdownMenu';
import { SyncStatus } from '@/settings/accounts/constants/SyncStatus';
import { computeSyncStatus } from '@/settings/accounts/utils/computeSyncStatus';
import { Status } from '@/ui/display/status/components/Status';
import styled from '@emotion/styled';

const StyledRowRightContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsAccountsConnectedAccountsRowRightContainer = ({
  account,
}: {
  account: ConnectedAccount;
}) => {
  const messageChannelSyncStatus = account.messageChannels[0]?.syncStatus;
  const calendarChannelSyncStatus = account.calendarChannels[0]?.syncStatus;

  const status = computeSyncStatus(
    messageChannelSyncStatus,
    calendarChannelSyncStatus,
  );

  return (
    <StyledRowRightContainer>
      {status === SyncStatus.FAILED && (
        <Status color="red" text="Sincronização falhou" weight="medium" />
      )}
      {status === SyncStatus.SYNCED && (
        <Status color="green" text="Sincronizado" weight="medium" />
      )}
      {status === SyncStatus.NOT_SYNCED && (
        <Status color="orange" text="Não sincronizado" weight="medium" />
      )}
      {status === SyncStatus.IMPORTING && (
        <Status
          color="turquoise"
          text="Importando"
          weight="medium"
          isLoaderVisible
        />
      )}
      <SettingsAccountsRowDropdownMenu account={account} />
    </StyledRowRightContainer>
  );
};
