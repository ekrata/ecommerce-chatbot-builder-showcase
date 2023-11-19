import { FC, ReactNode, useState } from 'react';
import { BsChevronUp } from 'react-icons/bs';

interface Props {
  title: ReactNode,
  content?: ReactNode
}


export const Collapse: FC<Props> = ({ title, content }) => {
  const [open, setOpen] = useState<boolean>(false);
  console.log(title, content)
  return (
    <div tabIndex={0} className="bg-white collapse border-b-[1px] " onClick={() => setOpen(!open)}>
      <input type="checkbox" />
      <div className={`flex justify-between text-xl font-medium collapse-title `}>
        {title}
        <BsChevronUp className={`${open ? 'rotate-180' : ''}`} />
      </div>
      {content &&
        <div className="collapse-content">
          {content}
        </div>
      }
    </div>
  )
}