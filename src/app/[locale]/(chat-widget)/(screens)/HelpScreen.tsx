import { FC, PropsWithChildren, useState } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { EntityItem } from 'electrodb';
import { Message, SenderType } from '@/entities/message';
import { Operator } from '@/entities/operator';
import Image from 'next/image';
import { Customer } from '@/entities/customer';
import { FaWindowMinimize } from 'react-icons/fa';
import { BsChevronDown, BsThreeDotsVertical } from 'react-icons/bs';
import { IoMdSend } from 'react-icons/io';
import { Conversation } from '@/entities/conversation';
import { Api } from 'sst/node/api';
import { useForm, SubmitHandler } from 'react-hook-form';
import { BiSearch } from 'react-icons/bi';
import { DynamicBackground } from '../DynamicBackground';

type Inputs = {
  msg: string;
};

export const HelpScreen: FC = () => {
  const t = useTranslations('chat-widget');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();

  return (
    <>
      <div className="flex flex-col font-sans rounded-lg max-w-xl dark:bg-gray-800">
        <div
          className={`background h-20 flex place-items-center justify-between p-2 px-6 gap-x-2 border-b-2 border-gray-300 dark:border-gray-700 shadow-2xl`}
        >
          <DynamicBackground/>
          <h2>{t('help')}</h2>
          <div className="join">
            <div>
              <div>
                <input
                  className="input input-bordered join-item"
                  placeholder={t('search for help')}
                />
              </div>
            </div>
            <BiSearch className="join-item" />
          </div>
        </div>
        <div className="flex align-end text-2xl gap-x-2">
          <BsThreeDotsVertical />
          <BsChevronDown />
        </div>
      </div>
      <div
        className="flex flex-col w-full bg-white dark:bg-gray-800 border-b-2 border-gray-300 dark:border-gray-700 mb-4 "
        data-testid="chat-log"
      ></div>
      <div className="input-group gap-x-1">
        <div className="flex flex-col w-full">
          <input
            type="text"
            placeholder="Enter your message..."
            className="input w-full rounded-xs "
            data-testid="msg-input"
            {...register('msg', { required: true })}
          />
          {errors.msg && (
            <span
              className="text-red-600 bg-transparent"
              data-testid="msg-error"
            >
              Write a message first.
            </span>
          )}
        </div>
        <button
          className={`background btn btn-square  text-xl border-0`}
          data-testid="msg-send"
          type="submit"
        >
          <DynamicBackground/>
          <IoMdSend className="text-neutral dark:text-white" />
        </button>
      </div>
    </>
  );
};
