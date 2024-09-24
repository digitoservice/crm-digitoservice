import { SettingsAccountsCalendarChannelsContainer } from '@/settings/accounts/components/SettingsAccountsCalendarChannelsContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { IconCalendarEvent } from 'twenty-ui';

export const SettingsAccountsCalendars = () => {
  return (
    <SubMenuTopBarContainer
      Icon={IconCalendarEvent}
      title="Calendários"
      links={[
        {
          children: 'Usuário',
          href: getSettingsPagePath(SettingsPath.ProfilePage),
        },
        {
          children: 'Contas',
          href: getSettingsPagePath(SettingsPath.Accounts),
        },
        { children: 'Calendários' },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <SettingsAccountsCalendarChannelsContainer />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
