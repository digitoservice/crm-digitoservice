import { Loader } from '@/ui/feedback/loader/components/Loader';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
} from 'twenty-ui';

export const EmailLoader = ({ loadingText }: { loadingText?: string }) => (
  <AnimatedPlaceholderEmptyContainer>
    <AnimatedPlaceholder type="loadingMessages" />
    <AnimatedPlaceholderEmptyTextContainer>
      <AnimatedPlaceholderEmptyTitle>
        {loadingText || 'Carregando emails'}
      </AnimatedPlaceholderEmptyTitle>
      <Loader />
    </AnimatedPlaceholderEmptyTextContainer>
  </AnimatedPlaceholderEmptyContainer>
);
