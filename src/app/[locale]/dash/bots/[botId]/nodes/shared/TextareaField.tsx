import EmojiPicker, { EmojiClickData, EmojiStyle } from 'emoji-picker-react';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { FieldArray, FieldValues, UseFieldArrayReturn, UseFormRegister } from 'react-hook-form';
import { BiCodeCurly } from 'react-icons/bi';
import { BsX } from 'react-icons/bs';
import { HiOutlineEmojiHappy } from 'react-icons/hi';
import { useOnClickOutside } from 'usehooks-ts';

interface Props<T extends FieldValues> {
  fieldArray: UseFieldArrayReturn<T, never, "id">,
  field: Record<"id", string>,
  index: number,
  register: UseFormRegister<T>
}

export function TextareaField<T extends FieldValues>({ fieldArray, field, index, register, }: Props<T>) {
  const tOperator = useTranslations('dash.operator');
  const ref = useRef(null)
  const [showEmoji, setShowEmoji] = useState<boolean>(false);
  const [fieldValue, setFieldValue] = useState<string>();
  const { fields, append, update, prepend, remove, swap, move, insert } = fieldArray


  const handleClickOutside = () => {
    // Your custom logic here
    setShowEmoji(false)
  }

  useOnClickOutside(ref, handleClickOutside)

  return (
    <div className='bg-gray-200 h-22 group form-control textarea textarea-sm'>
      <textarea key={field.id} className="flex h-10 text-lg bg-gray-200 resize-none min-h-10 textarea focus:outline-0" {...register(`${field.id}.${index.toString()}` as const)} onChange={e => setFieldValue(e.target.value)} ></textarea>
      <label className="justify-end text-gray-100 label place-items-center" >
        <span className="flex flex-row justify-end label-text-alt">
          <div className="invisible text-xl cursor-pointer dropdown dropdown-bottom dropdown-end group-hover:visible">
            <label tabIndex={0} className=""><BiCodeCurly className='text-xl' /></label>
            <ul tabIndex={0} className="dropdown-content -[1] menu p-2 shadow bg-base-100 rounded-box w-52 text-sm">
              {/* <li onClick={() => update(index, `${fieldValue}{name}`)}><a>{tOperator('name')}</a></li> */}
              <li><a>{tOperator('firstName')}</a></li>
              <li><a>{tOperator('phone')}</a></li>
              <li><a>{tOperator('email')}</a></li>
              <li><a>{tOperator('countryCode')}</a></li>
              <li><a>{tOperator('city')}</a></li>
              <li><a>{tOperator('projectDomain')}</a></li>
              <li><a>{tOperator('projectName')}</a></li>
            </ul>
          </div>
          <HiOutlineEmojiHappy onClick={() => setShowEmoji(true)} className='invisible text-xl cursor-pointer group-hover:visible' />
          <div className='absolute' ref={ref}>
            {showEmoji &&
              <EmojiPicker
                onEmojiClick={(emojiData: EmojiClickData, event: MouseEvent) => {
                  update(index, `${fieldValue}${emojiData.emoji}` as FieldArray<T, never>)
                }}
                autoFocusSearch={false}
                emojiStyle={EmojiStyle.NATIVE}
              />}
          </div>
          <BsX onClick={() => remove(index)} className='invisible text-xl cursor-pointer group-hover:visible' />
        </span>
      </label>
    </div >)

}