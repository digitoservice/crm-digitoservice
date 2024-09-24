import { IconBook2 } from 'twenty-ui';

import { Button } from '@/ui/input/button/components/Button';

export const SettingsReadDocumentationButton = () => {
  return (
    <Button
      title="Ler documentação"
      variant="secondary"
      accent="default"
      size="small"
      Icon={IconBook2}
      to={'https://digitoservice.com/docs/developers'}
      target="_blank"
    ></Button>
  );
};
