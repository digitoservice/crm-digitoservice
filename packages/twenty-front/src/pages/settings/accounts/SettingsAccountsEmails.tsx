import { SettingsAccountsMessageChannelsContainer } from '@/settings/accounts/components/SettingsAccountsMessageChannelsContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { IconMail } from 'twenty-ui';

export const SettingsAccountsEmails = () => (
  <SubMenuTopBarContainer
    Icon={IconMail}
    title="Emails"
    links={[
      {
        children: 'Usuário',
        href: getSettingsPagePath(SettingsPath.ProfilePage),
      },
      {
        children: 'Contas',
        href: getSettingsPagePath(SettingsPath.Accounts),
      },
      { children: 'Emails' },
    ]}
  >
    <SettingsPageContainer>
      <Section>
        <SettingsAccountsMessageChannelsContainer />
      </Section>
    </SettingsPageContainer>
  </SubMenuTopBarContainer>
);
