import EmojiPicker, { EmojiClickData, EmojiStyle } from 'emoji-picker-react';
import { useRef, useState } from 'react';
import { FieldArray, FieldValues, UseFieldArrayReturn, UseFormRegister } from 'react-hook-form';
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
    <div className='group form-control'>
      <textarea key={field.id} className="bg-gray-200 min-h-8 textarea-sm textarea" {...register(`${field.id}.${index.toString()}` as const)} onChange={e => setFieldValue(e.target.value)} ></textarea>
      < label className="justify-end label" >
        <span className="flex flex-row justify-end label-text-alt">
          <div className="dropdown dropdown-bottom dropdown-end">
            <label tabIndex={0} className="m-1 btn">Click</label>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              <li><a>{contact}</a></li>
              <li><a>Item 2</a></li>
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
      </label >
    </div >)

}