import { useChatWidgetStore } from './(actions)/useChatWidgetStore';

/**
 * Place inside a element that contains the 'background' class to apply.
 * @date 12/06/2023 - 19:14:24
 *
 * @returns {*}
 */
export const DynamicBackground = () => {
  const { chatWidget: {configuration} } = useChatWidgetStore();
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
