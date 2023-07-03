import { EntityItem } from 'electrodb';

import { Configuration } from '@/entities/configuration';

interface Props {
  configuration: EntityItem<typeof Configuration>
}

export /**
 * Place inside a element that contains the 'background' class to apply.
 * @date 21/06/2023 - 21:05:38
 *
 * @param {{ configuration: EntityItem<typeof Configuration>; }} {configuration}
 * @returns {*}
 */
  const DynamicBackground: React.FC<Props> = ({ configuration }) => {
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
