import styled from '@emotion/styled';
import React from 'react';

const StyledContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  max-width: 280px;
  text-align: center;

  & > a {
    color: ${({ theme }) => theme.font.color.tertiary};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export const FooterNote = () => (
  <StyledContainer>
    Ao usar os serviços da Digito Service, você concorda com os{' '}
    <a
      href="https://c.digitoservice.com/legal/terms"
      target="_blank"
      rel="noopener noreferrer"
    >
      Termos de Serviço
    </a>{' '}
    e{' '}
    <a
      href="https://c.digitoservice.com/legal/privacy"
      target="_blank"
      rel="noopener noreferrer"
    >
      Política de Privacidade
    </a>
    .
  </StyledContainer>
);
