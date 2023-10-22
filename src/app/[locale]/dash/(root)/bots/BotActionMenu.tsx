import { EntityItem } from 'electrodb';
import { useTranslations } from 'next-intl';
import { FC } from 'react';
import { BiEdit, BiExport, BiTrash } from 'react-icons/bi';
import { BsChatLeftDotsFill, BsFileBarGraph, BsPersonSlash } from 'react-icons/bs';
import { FaClone } from 'react-icons/fa';
import { GrTest } from 'react-icons/gr';
import { TbRobotOff } from 'react-icons/tb';

import { Bot } from '@/entities/bot';

interface Props {
  bot: EntityItem<typeof Bot>
}

export const BotActionMenu: FC<Props> = ({ bot }) => {
  const tDash = useTranslations('dash')
  const tBots = useTranslations('dash.bots')

  return (

  )
}