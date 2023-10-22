import { IoMdSend } from 'react-icons/io';

export default function MessageBox() {
  return (
    <div className='form-control input-group w-full border-t-4 border-t-primary'>
      <label htmlFor='message-box' className='input-group input-group-lg '>
        <textarea
          id='message-box'
          placeholder='Write your message here or type "/" to pick a canned response.'
          className='input input-bordered textarea input-lg w-full lg:h-40 '
        />
        <span className='bg-primary'>
          <IoMdSend className='text-white text-xl lg:text-4xl' />
        </span>
      </label>
    </div>
  );
}
