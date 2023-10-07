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
    <div className="bg-white shadow-2xl menu rounded-box " >
      <ul>
        <li>
          <BiEdit />
          {tDash('Edit')}
        </li>
        <li>
          <FaClone />
          {tDash('Clone')}
        </li>
        <li>
          <BiExport />
          {tDash('Export')}
        </li>
        <li>
          <BiTrash />
          {tDash('Delete')}
        </li>
        <li>
          <BsFileBarGraph />
          {tBots('View statistics')}
        </li>
        <li>
          <GrTest />
          {tBots('Test & validate bot')}
        </li>
        <li>
          <BsPersonSlash />
          {tBots('Start while operators are offline')}
        </li>
        <li>
          <BsChatLeftDotsFill />
          {tBots('Start while an operator is handling another conversation')}
        </li>
        <li>
          <TbRobotOff />
          {tBots('Start when another bot is running')}
        </li>
      </ul>
    </div >
  )
}