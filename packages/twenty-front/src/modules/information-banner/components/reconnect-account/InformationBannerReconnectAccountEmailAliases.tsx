import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { useAccountToReconnect } from '@/information-banner/hooks/useAccountToReconnect';
import { InformationBannerKeys } from '@/information-banner/types/InformationBannerKeys';
import { useTriggerGoogleApisOAuth } from '@/settings/accounts/hooks/useTriggerGoogleApisOAuth';
import { IconRefresh } from 'twenty-ui';

export const InformationBannerReconnectAccountEmailAliases = () => {
  const { accountToReconnect } = useAccountToReconnect(
    InformationBannerKeys.ACCOUNTS_TO_RECONNECT_EMAIL_ALIASES,
  );

  const { triggerGoogleApisOAuth } = useTriggerGoogleApisOAuth();

  if (!accountToReconnect) {
    return null;
  }

  return (
    <InformationBanner
      message={`Por favor, reconecte sua mailbox ${accountToReconnect?.handle} para atualizar seus aliases de email:`}
      buttonTitle="Reconectar"
      buttonIcon={IconRefresh}
      buttonOnClick={() => triggerGoogleApisOAuth()}
    />
  );
};
