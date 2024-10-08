import styled from '@emotion/styled';
import { IconArrowBackUp, IconUserCircle } from 'twenty-ui';

import { Button } from '@/ui/input/button/components/Button';

const StyledThreadBottomBar = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(6)};
  padding-right: ${({ theme }) => theme.spacing(6)};
  padding-top: ${({ theme }) => theme.spacing(4)};
`;

export const ThreadBottomBar = () => {
  return (
    <StyledThreadBottomBar>
      <Button
        Icon={IconArrowBackUp}
        title="Responder"
        variant="secondary"
        accent="default"
      />
      <Button
        Icon={IconArrowBackUp}
        title="Responder a todos"
        variant="secondary"
        accent="default"
      />
      <Button
        Icon={IconUserCircle}
        title="Compartilhar"
        variant="secondary"
        accent="default"
      />
    </StyledThreadBottomBar>
  );
};
