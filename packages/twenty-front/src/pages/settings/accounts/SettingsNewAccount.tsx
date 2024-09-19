import { SettingsNewAccountSection } from '@/settings/accounts/components/SettingsNewAccountSection';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { IconAt } from 'twenty-ui';

export const SettingsNewAccount = () => {
  return (
    <SubMenuTopBarContainer
      Icon={IconAt}
      title="Nova Conta"
      links={[
        {
          children: 'Usuário',
          href: getSettingsPagePath(SettingsPath.ProfilePage),
        },
        {
          children: 'Contas',
          href: getSettingsPagePath(SettingsPath.Accounts),
        },
        { children: `Nova` },
      ]}
    >
      <SettingsPageContainer>
        <SettingsNewAccountSection />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
