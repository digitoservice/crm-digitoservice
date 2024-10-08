import { useMemo } from 'react';
import { hasFlag } from 'country-flag-icons';
import * as Flags from 'country-flag-icons/react/3x2';
import { getCountries, getCountryCallingCode } from 'libphonenumber-js';

import { Country } from '@/ui/input/components/internal/types/Country';

export const useCountries = () => {
  return useMemo<Country[]>(() => {
    const regionNames = new Intl.DisplayNames(['pt-BR'], {
      type: 'region',
    });

    const countryCodes = getCountries();

    return countryCodes.reduce<Country[]>((result, countryCode) => {
      const countryName = regionNames.of(countryCode);

      if (!countryName) return result;

      if (!hasFlag(countryCode)) return result;

      const Flag = Flags[countryCode];

      const callingCode = getCountryCallingCode(countryCode);

      result.push({
        countryCode,
        countryName,
        callingCode,
        Flag,
      });

      return result;
    }, []);
  }, []);
};
