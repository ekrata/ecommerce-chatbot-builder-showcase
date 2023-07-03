import { EntityItem } from 'electrodb';
import { readFile, writeFile } from 'fs';
import { Translation } from '../../../../../../stacks/entities/translation';

/**
 * Because the user can modify the style of the chatWidget, we need to store in db and copy to local translation(./messages) folder on build
 * Copies mock translation api object to respective local translation json for use with next-intl(i18n)
 * @param translation
 */
export const setupTranslation = (
  translation: EntityItem<typeof Translation>
) => {
  const { lang, orgId } = translation;
  readFile(`./messages/${lang}.json`, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      throw err;
    }

    writeFile(
      `./messages/${lang}.json`,
      JSON.stringify({
        ...JSON.parse(data),
        'chat-widget': {
          ...(translation as EntityItem<typeof Translation>).translations
            .chatWidget,
        },
        dash: {
          ...(translation as EntityItem<typeof Translation>).translations.dash,
        },
      }),
      'utf8',
      (err) => {
        if (err) {
          console.log(err);
          throw err;
        }
      }
    );
  });
};
