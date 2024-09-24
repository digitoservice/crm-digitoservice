import {
  IconComponent,
  IllustrationIconManyToMany,
  IllustrationIconOneToMany,
  IllustrationIconOneToOne,
} from 'twenty-ui';

import { RelationDefinitionType } from '~/generated-metadata/graphql';
import OneToManySvg from '../assets/OneToMany.svg';
import OneToOneSvg from '../assets/OneToOne.svg';
import { RelationType } from '../types/RelationType';

export const RELATION_TYPES: Record<
  RelationType,
  {
    label: string;
    Icon: IconComponent;
    imageSrc: string;
    isImageFlipped?: boolean;
  }
> = {
  [RelationDefinitionType.OneToMany]: {
    label: 'Tem muitos(as)',
    Icon: IllustrationIconOneToMany,
    imageSrc: OneToManySvg,
  },
  [RelationDefinitionType.OneToOne]: {
    label: 'Tem um(a)',
    Icon: IllustrationIconOneToOne,
    imageSrc: OneToOneSvg,
  },
  [RelationDefinitionType.ManyToOne]: {
    label: 'Pertence a um(a)',
    Icon: IllustrationIconOneToMany,
    imageSrc: OneToManySvg,
    isImageFlipped: true,
  },
  // Not supported yet
  [RelationDefinitionType.ManyToMany]: {
    label: 'Pertence a muitos(as)',
    Icon: IllustrationIconManyToMany,
    imageSrc: OneToManySvg,
    isImageFlipped: true,
  },
};
