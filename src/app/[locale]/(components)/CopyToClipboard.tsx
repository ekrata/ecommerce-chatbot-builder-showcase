import { useTranslations } from 'next-intl';
import { FC } from 'react';
import { PiCopySimple } from 'react-icons/pi';
import { toast } from 'react-toastify';
import { useCopyToClipboard } from 'usehooks-ts';

interface Props {
  value: string
}

export const CopyToClipboard: FC<Props> = ({ value }) => {
  const [copiedValue, setCopiedValue] = useCopyToClipboard()
  const t = useTranslations('dash')
  const handleClick = () => {
    toast(t('Copied to clipboard'))
  }
  return (
    <div className='flex flex-row p-1 bg-gray-100 rounded-md place-items-center'>
      <label className='w-full'>{value}</label>
      <button data-tooltip-target='target' className='active:animate-ping' onClick={handleClick}>
        <div id="tooltip" role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg shadow-sm opacity-0 tooltip">
          {t('Copy to clipboard')}
          <div className="tooltip-arrow" data-popper-arrow></div>
        </div>
        <PiCopySimple className='-ml-6 text-2xl' />
      </button >
    </div >
  )
}