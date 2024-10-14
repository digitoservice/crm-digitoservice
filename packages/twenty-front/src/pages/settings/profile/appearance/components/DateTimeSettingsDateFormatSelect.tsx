import { formatInTimeZone } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';

import { DateFormat } from '@/localization/constants/DateFormat';
import { detectDateFormat } from '@/localization/utils/detectDateFormat';
import { detectTimeZone } from '@/localization/utils/detectTimeZone';
import { Select } from '@/ui/input/components/Select';

type DateTimeSettingsDateFormatSelectProps = {
  value: DateFormat;
  onChange: (nextValue: DateFormat) => void;
  timeZone: string;
};

export const DateTimeSettingsDateFormatSelect = ({
  onChange,
  timeZone,
  value,
}: DateTimeSettingsDateFormatSelectProps) => {
  const systemTimeZone = detectTimeZone();

  const usedTimeZone = timeZone === 'system' ? systemTimeZone : timeZone;

  const systemDateFormat = detectDateFormat();

  return (
    <Select
      dropdownId="datetime-settings-date-format"
      dropdownWidth={218}
      label="Formato de data"
      fullWidth
      value={value}
      options={[
        {
          label: `Configurações do sistema - ${formatInTimeZone(
            Date.now(),
            usedTimeZone,
            systemDateFormat,
            { locale: ptBR },
          )}`,
          value: DateFormat.SYSTEM,
        },
        {
          label: `${formatInTimeZone(
            Date.now(),
            usedTimeZone,
            DateFormat.MONTH_FIRST,
            { locale: ptBR },
          )}`,
          value: DateFormat.MONTH_FIRST,
        },
        {
          label: `${formatInTimeZone(
            Date.now(),
            usedTimeZone,
            DateFormat.DAY_FIRST,
            { locale: ptBR },
          )}`,
          value: DateFormat.DAY_FIRST,
        },
        {
          label: `${formatInTimeZone(
            Date.now(),
            usedTimeZone,
            DateFormat.YEAR_FIRST,
            { locale: ptBR },
          )}`,
          value: DateFormat.YEAR_FIRST,
        },
      ]}
      onChange={onChange}
    />
  );
};
