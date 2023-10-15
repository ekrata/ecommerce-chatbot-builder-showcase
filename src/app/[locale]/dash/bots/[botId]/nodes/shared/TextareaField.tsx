import EmojiPicker, { EmojiClickData, EmojiStyle } from 'emoji-picker-react';
import { snakeCase } from 'lodash';
import { useTranslations } from 'next-intl';
import { FormEventHandler, useId, useReducer, useRef, useState } from 'react';
import {
  Control, Controller, FieldArray, FieldValues, Path, UseFieldArrayReturn, UseFormRegister,
  useWatch
} from 'react-hook-form';
import { BiCodeCurly } from 'react-icons/bi';
import { BsX } from 'react-icons/bs';
import { HiOutlineEmojiHappy } from 'react-icons/hi';
import { useOnClickOutside } from 'usehooks-ts';

interface Props<T extends FieldValues> {
  fieldArray: UseFieldArrayReturn<T, never, "id">,
  fieldName: string,
  index: number,
  handleSubmit: FormEventHandler<HTMLFormElement> | undefined,
  control: Control<T, any>,
  register: UseFormRegister<T>,
}

export function TextareaField<T extends FieldValues>({ fieldArray, fieldName, index, register, handleSubmit, control }: Props<T>) {
  const data = useWatch({
    control,
    name: `${fieldName}.${index}` as Path<T>
  });

  const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
  const tOperator = useTranslations('dash.operator');
  const ref = useRef(null)
  const [showEmoji, setShowEmoji] = useState<boolean>(false);
  const [fieldValue, setFieldValue] = useState<string>();
  const { fields, append, update, prepend, remove, swap, move, insert, } = fieldArray

  const handleClickOutside = () => {
    // Your custom logic here
    setShowEmoji(false)
  }


  useOnClickOutside(ref, handleClickOutside)

  const addContactField = (field: string) => {
    update(index, `${data}{${snakeCase(field)}}` as FieldArray<T, never>)
  }

  return (
    <div className='bg-gray-200 h-22 group form-control textarea textarea-sm'>
      <textarea key={useId()} className="flex h-10 text-lg bg-gray-200 resize-none min-h-10 textarea focus:outline-0" {...register(`${fieldName}.${index.toString()}` as Path<T>)} value={data} onBlur={(event) => handleSubmit?.(event)} />
      <label className="justify-end text-gray-100 label place-items-center" >
        <span className="flex flex-row justify-end label-text-alt">
          <div className="invisible text-xl cursor-pointer dropdown dropdown-bottom dropdown-end group-hover:visible">
            <label tabIndex={0} className=""><BiCodeCurly className='text-xl' /></label>
            <ul tabIndex={0} className="dropdown-content -[1] menu p-2 shadow bg-base-100 rounded-box w-52 text-sm">
              {/* <li onClick={() => update(index, `${fieldValue}{name}`)}><a>{tOperator('name')}</a></li> */}
              <li><a onClick={() => addContactField(tOperator('firstName'))}>{tOperator('firstName')}</a></li>
              <li><a onClick={() => addContactField(tOperator('phone'))}>{tOperator('phone')}</a></li>
              <li><a onClick={() => addContactField(tOperator('email'))}>{tOperator('email')}</a></li>
              <li><a onClick={() => addContactField(tOperator('countryCode'))}>{tOperator('countryCode')}</a></li>
              <li><a onClick={() => addContactField(tOperator('city'))}>{tOperator('city')}</a></li>
              <li><a onClick={() => addContactField(tOperator('projectDomain'))}>{tOperator('projectDomain')}</a></li>
              <li><a onClick={() => addContactField(tOperator('projectName'))}>{tOperator('projectName')}</a></li>
            </ul>
          </div>
          <HiOutlineEmojiHappy onClick={() => setShowEmoji(true)} className='invisible text-xl cursor-pointer group-hover:visible' />
          <div className='absolute' ref={ref}>
            {showEmoji &&
              <EmojiPicker
                onEmojiClick={(emojiData: EmojiClickData, event: MouseEvent) => {
                  update(index, `${data}${emojiData.emoji}` as FieldArray<T, never>)
                  setShowEmoji(false)
                }}
                autoFocusSearch={false}
                emojiStyle={EmojiStyle.NATIVE}
              />}
          </div>
          <BsX onClick={() => remove(index)} className='invisible text-xl cursor-pointer group-hover:visible' />
        </span >
      </label >
    </div >
  )
}