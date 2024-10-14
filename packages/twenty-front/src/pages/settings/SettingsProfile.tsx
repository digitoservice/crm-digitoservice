import { H2Title } from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { ChangePassword } from '@/settings/profile/components/ChangePassword';
import { DeleteAccount } from '@/settings/profile/components/DeleteAccount';
import { EmailField } from '@/settings/profile/components/EmailField';
import { NameFields } from '@/settings/profile/components/NameFields';
import { ProfilePictureUploader } from '@/settings/profile/components/ProfilePictureUploader';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';

export const SettingsProfile = () => (
  <SubMenuTopBarContainer
    title="Perfil"
    links={[
      {
        children: 'Usuário',
        href: getSettingsPagePath(SettingsPath.ProfilePage),
      },
      { children: 'Perfil' },
    ]}
  >
    <SettingsPageContainer>
      <Section>
        <H2Title title="Imagem" />
        <ProfilePictureUploader />
      </Section>
      <Section>
        <H2Title title="Nome" description="Seu nome como será exibido" />
        <NameFields />
      </Section>
      <Section>
        <H2Title
          title="Email"
          description="O email associado à sua conta"
        />
        <EmailField />
      </Section>
      <Section>
        <ChangePassword />
      </Section>
      <Section>
        <DeleteAccount />
      </Section>
    </SettingsPageContainer>
  </SubMenuTopBarContainer>
);
