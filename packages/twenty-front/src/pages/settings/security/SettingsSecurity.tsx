import { H2Title } from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsReadDocumentationButton } from '@/settings/developers/components/SettingsReadDocumentationButton';
import { SettingsSSOIdentitiesProvidersListCard } from '@/settings/security/components/SettingsSSOIdentitiesProvidersListCard';
import { SettingsSecurityOptionsList } from '@/settings/security/components/SettingsSecurityOptionsList';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';

export const SettingsSecurity = () => {
  return (
    <SubMenuTopBarContainer
      title="Segurança"
      actionButton={<SettingsReadDocumentationButton />}
      links={[
        {
          children: 'Workspace',
          href: getSettingsPagePath(SettingsPath.Workspace),
        },
        { children: 'Segurança' },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title title="SSO" description="Configure uma conexão SSO" />
          <SettingsSSOIdentitiesProvidersListCard />
        </Section>
        <Section>
          <H2Title
            title="Outros"
            description="Personalize a segurança do seu workspace"
          />
          <SettingsSecurityOptionsList />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
