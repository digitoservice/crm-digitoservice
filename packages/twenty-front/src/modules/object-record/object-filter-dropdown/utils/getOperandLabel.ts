import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

export const getOperandLabel = (
  operand: ViewFilterOperand | null | undefined,
) => {
  switch (operand) {
    case ViewFilterOperand.Contains:
      return 'Contém';
    case ViewFilterOperand.DoesNotContain:
      return "Não contém";
    case ViewFilterOperand.GreaterThan:
      return 'Maior que';
    case ViewFilterOperand.LessThan:
      return 'Menor que';
    case ViewFilterOperand.IsBefore:
      return 'Antes de';
    case ViewFilterOperand.IsAfter:
      return 'Depois de';
    case ViewFilterOperand.Is:
      return 'É';
    case ViewFilterOperand.IsNot:
      return 'Não é';
    case ViewFilterOperand.IsNotNull:
      return 'Não é nulo';
    case ViewFilterOperand.IsEmpty:
      return 'Está vazio';
    case ViewFilterOperand.IsNotEmpty:
      return 'Não está vazio';
    case ViewFilterOperand.IsRelative:
      return 'É relativo';
    case ViewFilterOperand.IsInPast:
      return 'Está no passado';
    case ViewFilterOperand.IsInFuture:
      return 'Está no futuro';
    case ViewFilterOperand.IsToday:
      return 'É hoje';
    default:
      return '';
  }
};

export const getOperandLabelShort = (
  operand: ViewFilterOperand | null | undefined,
) => {
  switch (operand) {
    case ViewFilterOperand.Is:
    case ViewFilterOperand.Contains:
      return ': ';
    case ViewFilterOperand.IsNot:
    case ViewFilterOperand.DoesNotContain:
      return ': Não';
    case ViewFilterOperand.IsNotNull:
      return ': NãoNulo';
    case ViewFilterOperand.IsNotEmpty:
      return ': NãoVazio';
    case ViewFilterOperand.IsEmpty:
      return ': Vazio';
    case ViewFilterOperand.GreaterThan:
      return '\u00A0> ';
    case ViewFilterOperand.LessThan:
      return '\u00A0< ';
    case ViewFilterOperand.IsBefore:
      return '\u00A0< ';
    case ViewFilterOperand.IsAfter:
      return '\u00A0> ';
    case ViewFilterOperand.IsInPast:
      return ': Passado';
    case ViewFilterOperand.IsInFuture:
      return ': Futuro';
    case ViewFilterOperand.IsToday:
      return ': Hoje';
    default:
      return ': ';
  }
};
