import { H2Title, IconColorSwatch } from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { ColorSchemePicker } from '@/ui/input/color-scheme/components/ColorSchemePicker';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { DateTimeSettings } from '~/pages/settings/profile/appearance/components/DateTimeSettings';

export const SettingsAppearance = () => {
  const { colorScheme, setColorScheme } = useColorScheme();

  return (
    <SubMenuTopBarContainer
      Icon={IconColorSwatch}
      title="Experiência"
      links={[
        {
          children: 'Usuário',
          href: getSettingsPagePath(SettingsPath.ProfilePage),
        },
        { children: 'Experiência' },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title title="Aparência" />
          <ColorSchemePicker value={colorScheme} onChange={setColorScheme} />
        </Section>
        <Section>
          <H2Title
            title="Data e hora"
            description="Configure como as datas são exibidas no aplicativo"
          />
          <DateTimeSettings />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
