import { EntityItem } from 'electrodb';

import { faker } from '@faker-js/faker';

import { Configuration } from '../../../../stacks/entities/configuration';

interface Props {
  configuration: EntityItem<typeof Configuration>
}

/**
 * Place inside a element that contains the 'background' class to apply.
 * @date 21/06/2023 - 21:05:38
 *
 * @param {{ configuration: EntityItem<typeof Configuration>; }} {configuration}
 * @returns {*}
 */
export const DynamicBackground: React.FC<Props> = ({ configuration }) => {
  const { backgroundColor, darkBackgroundColor } = {
    ...configuration?.channels?.liveChat?.appearance?.widgetAppearance,
  };
  const background = `
    .background {
      background: ${backgroundColor}
    }
    .dark-mode .background {
      background: ${darkBackgroundColor}
    }
  `;
  return <style>{background}</style>;
};

const colors = ["#f8002e", '#f92', '#f62', '#f99', '#f09']

export const getRandomColor = (customerId: string) => {
  faker.seed(parseInt(customerId.split('-')[0]))
  return faker.helpers.arrayElement(colors)
}

/**
 * Place inside a element that contains the 'background' class to apply.
 * @date 21/06/2023 - 21:05:38
 *
 * @param {{ configuration: EntityItem<typeof Configuration>; }} {configuration}
 * @returns {*}
 */
export const RandomBackground: React.FC<{ customerId: string }> = ({ customerId }) => {
  const background = `
    .background {
      background: ${getRandomColor(customerId)}
    }
    .dark-mode .background {
      background: ${getRandomColor(customerId)}
    }
  `;
  return <style>{background}</style>;
};
