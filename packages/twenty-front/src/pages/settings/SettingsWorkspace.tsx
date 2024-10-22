import { GithubVersionLink, H2Title } from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { DeleteWorkspace } from '@/settings/profile/components/DeleteWorkspace';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { NameField } from '@/settings/workspace/components/NameField';
import { ToggleImpersonate } from '@/settings/workspace/components/ToggleImpersonate';
import { WorkspaceLogoUploader } from '@/settings/workspace/components/WorkspaceLogoUploader';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import packageJson from '../../../package.json';
export const SettingsWorkspace = () => (
  <SubMenuTopBarContainer
    title="Geral"
    links={[
      {
        children: 'Workspace',
        href: getSettingsPagePath(SettingsPath.Workspace),
      },
      { children: 'Geral' },
    ]}
  >
    <SettingsPageContainer>
      <Section>
        <H2Title title="Imagem" />
        <WorkspaceLogoUploader />
      </Section>
      <Section>
        <H2Title title="Nome" description="Nome do seu workspace" />
        <NameField />
      </Section>
      <Section>
        <H2Title
          title="Suporte"
          addornment={<ToggleImpersonate />}
          description="Conceda à equipe de suporte do Digito Service acesso temporário ao seu workspace para que possamos solucionar problemas ou recuperar conteúdo em seu nome. Você pode revogar o acesso a qualquer momento."
        />
      </Section>
      <Section>
        <DeleteWorkspace />
      </Section>
      <Section>
        <GithubVersionLink version={packageJson.version} />
      </Section>
    </SettingsPageContainer>
  </SubMenuTopBarContainer>
);
