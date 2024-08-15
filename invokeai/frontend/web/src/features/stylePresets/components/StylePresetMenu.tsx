import { Flex, Text } from '@invoke-ai/ui-library';
import { EMPTY_ARRAY } from 'app/store/constants';
import { useAppSelector } from 'app/store/storeHooks';
import { useTranslation } from 'react-i18next';
import type { StylePresetRecordWithImage } from 'services/api/endpoints/stylePresets';
import { useListStylePresetsQuery } from 'services/api/endpoints/stylePresets';

import { StylePresetList } from './StylePresetList';
import { StylePresetMenuActions } from './StylePresetMenuActions/StylePresetMenuActions';
import StylePresetSearch from './StylePresetSearch';

export const StylePresetMenu = () => {
  const searchTerm = useAppSelector((s) => s.stylePreset.searchTerm);
  const allowPrivateStylePresets = useAppSelector((s) => s.config.allowPrivateStylePresets);
  const { data } = useListStylePresetsQuery(undefined, {
    selectFromResult: ({ data }) => {
      const filteredData =
        data?.filter((preset) => preset.name.toLowerCase().includes(searchTerm.toLowerCase())) || EMPTY_ARRAY;

      const groupedData = filteredData.reduce(
        (
          acc: {
            defaultPresets: StylePresetRecordWithImage[];
            sharedPresets: StylePresetRecordWithImage[];
            presets: StylePresetRecordWithImage[];
          },
          preset
        ) => {
          if (preset.type === 'default') {
            acc.defaultPresets.push(preset);
          } else if (preset.type === 'project') {
            acc.sharedPresets.push(preset);
          } else {
            acc.presets.push(preset);
          }
          return acc;
        },
        { defaultPresets: [], sharedPresets: [], presets: [] }
      );

      return {
        data: groupedData,
      };
    },
  });

  const { t } = useTranslation();

  return (
    <Flex flexDir="column" gap={2} padding={3} layerStyle="second" borderRadius="base">
      <Flex alignItems="center" gap={2} w="full" justifyContent="space-between">
        <StylePresetSearch />
        <StylePresetMenuActions />
      </Flex>

      {data.presets.length === 0 && data.defaultPresets.length === 0 && (
        <Text p={10} textAlign="center">
          {t('stylePresets.noMatchingTemplates')}
        </Text>
      )}

      <StylePresetList title={t('stylePresets.myTemplates')} data={data.presets} />
      {allowPrivateStylePresets && (
        <StylePresetList title={t('stylePresets.sharedTemplates')} data={data.sharedPresets} />
      )}
      <StylePresetList title={t('stylePresets.defaultTemplates')} data={data.defaultPresets} />
    </Flex>
  );
};
