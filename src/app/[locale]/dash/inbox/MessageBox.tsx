import { BsArrowRight } from 'react-icons/bs';

export default function MessageBox() {
  return (
    <div className='form-control input-group w-full'>
      <label htmlFor='message-box' className='input-group input-group-lg'>
        <input
          id='message-box'
          type='text'
          placeholder='Type here'
          className='input input-bordered input-lg'
        />
        <span>
          <BsArrowRight />
        </span>
      </label>
    </div>
  );
}
