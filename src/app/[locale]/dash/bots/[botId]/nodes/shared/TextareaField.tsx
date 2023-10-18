import EmojiPicker, { EmojiClickData, EmojiStyle } from 'emoji-picker-react';
import { snakeCase } from 'lodash';
import { useTranslations } from 'next-intl';
import { FormEventHandler, useEffect, useId, useReducer, useRef, useState } from 'react';
import {
    Control, Controller, FieldArray, FieldValues, Path, PathValue, UseFieldArrayReturn,
    UseFormRegister, UseFormSetValue, useWatch
} from 'react-hook-form';
import { BiCodeCurly } from 'react-icons/bi';
import { BsX } from 'react-icons/bs';
import { HiOutlineEmojiHappy } from 'react-icons/hi';
import { Node, useEdges } from 'reactflow';
import { useOnClickOutside } from 'usehooks-ts';

import { useEdgeContext } from '../../BotEditor';

interface Props<T extends FieldValues> {
  fieldArray?: UseFieldArrayReturn<T, never, "id">,
  fieldName: string,
  index?: number,
  node: Node,
  control: Control<T, any>,
  handleSubmit: FormEventHandler<HTMLFormElement> | undefined,
  setValue: UseFormSetValue<T>
  register: UseFormRegister<T>,
  textareaStyle?: string
  deletable?: boolean
}

/**
 * fieldArray and index need to be passed for fieldArray fields, leave undefined for a standard a field
 *
 * @date 16/10/2023 - 22:28:02
 *
 * @export
 * @template {FieldValues} T
 * @param {Props<T>} param0
 * @param {UseFieldArrayReturn<T, never, "id">} param0.fieldArray
 * @param {string} param0.fieldName
 * @param {number} param0.index
 * @param {UseFormRegister<T>} param0.register
 * @param {*} param0.handleSubmit
 * @param {Control<T, any>} param0.control
 * @returns {*}
 */
export function TextareaField<T extends FieldValues>({ fieldArray, fieldName, node, setValue, index, register, handleSubmit, control, textareaStyle, deletable = true }: Props<T>) {
  const [edges, setEdges] = useEdgeContext()
  const name = index != null ? `${fieldName}.${index}` as Path<T> : fieldName as Path<T>
  const data = useWatch({
    control,
    name
  });

  const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
  const tOperator = useTranslations('dash.operator');
  const ref = useRef(null)
  const [showEmoji, setShowEmoji] = useState<boolean>(false);

  const handleClickOutside = () => {
    // Your custom logic here
    setShowEmoji(false)
  }


  useOnClickOutside(ref, handleClickOutside)

  const addContactField = (field: string) => {
    const contactField = `${data}{${snakeCase(field)}}`
    if (index != null && fieldArray) {
      fieldArray.update(index, contactField as FieldArray<T, never>)
    } else {
      setValue('message' as Path<T>, contactField as PathValue<T, Path<T>>)
    }
  }

  useEffect(() => {
    handleSubmit?.(event)
  }, [])

  return (
    <div className='w-full bg-gray-200 h-22 group form-control textarea textarea-sm'>
      <textarea key={useId()} className={`${textareaStyle ?? 'flex h-10 text-lg bg-gray-200 resize-none min-h-10 textarea focus:outline-0'}`} {...register(name)} value={data} onBlur={(event) => handleSubmit?.(event)} />
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
                  if (index != null && fieldArray) {
                    fieldArray?.update(index, `${data}${emojiData.emoji}` as FieldArray<T, never>)
                  } else {
                    setValue('message' as Path<T>, `${data}${emojiData.emoji}` as PathValue<T, Path<T>>)
                  }
                  setShowEmoji(false)
                }}
                autoFocusSearch={false}
                emojiStyle={EmojiStyle.NATIVE}
              />}
          </div>
          {deletable &&
            <BsX onClick={(event) => {
              if (index != null && fieldArray) {
                fieldArray.remove(index)
                console.log(data)
                console.log(edges)
                setEdges(edges.filter((edge) => edge?.data?.label !== data || edge.target !== node.id))
                console.log(edges)
                handleSubmit?.(event)
              }
            }} className='invisible text-xl cursor-pointer group-hover:visible' />
          }
        </span >
      </label >
    </div >
  )
}