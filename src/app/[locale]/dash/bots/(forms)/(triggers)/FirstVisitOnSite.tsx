
export const t('dash.bots.triggers')

export const FirstVisitOnSiteTrigger: React.FC = () => {

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='flex flex-row justify-between'>
        <h3 className="justify-start text-2xl font-semibold justify-self-center place-items-center label-text">{t('Article')}</h3>
        <div className='flex justify-end gap-x-2'>
          <button type="submit" className='max-w-xs normal-case gap-x-2 btn btn-outline btn-ghost btn-sm '><BiSave className='text-xl' />{t('Save')}</button>
          {articleId && articleId !== 'new' && <button type='button' className='max-w-sm normal-case gap-x-2 btn btn-outline btn-error btn-sm' onClick={onDelete}>{t('Delete article')}<BiTrash className="text-xl" /></button>}
        </div>
      </div>
      <div className="flex flex-col justify-start w-full p-2">
        <div className="w-full max-w-lg form-cotrol">
          <label className="label">
            <span className="font-semibold label-text">{t('Title')}</span>
          </label>
          <input {...register("title", { required: true })} className="justify-between w-full max-w-xl ml-2 font-normal normal-case bg-gray-200 border-0 rounded-lg input-bordered input-sm text-normal" placeholder={t('Title')} />
          {errors?.title && <p>{errors?.title.message?.toString()}</p>}
        </div>
        <div className="w-full max-w-xl form-control">
          <label className="label">
            <span className="font-semibold label-text">{t('Subtitle')}</span>
          </label>
          <input {...register("subtitle")} className="justify-between w-full ml-2 font-normal normal-case bg-gray-200 border-0 rounded-lg input-bordered input-sm text-normal" placeholder={t('Subtitle')} />
        </div>
        <div className="w-full max-w-xs form-control">
          <label className="label">
            <span className="font-semibold label-text">{t('Category')}</span>
          </label>
          <select className="max-w-xs ml-2 select select-bordered select-sm" {...register("category", { required: true })}>
            <option disabled selected>{t('Category')}</option>
            {articleCategory.map((category) => (
              <option>{t(`articleCategory.${category}`)}</option>
            ))}
          </select>
        </div>
        <div className="w-full max-w-xs form-control">
          <label className="label">
            <span className="font-semibold label-text">{t('Status')}</span>
          </label>
          <select className="w-full max-w-xs ml-2 select select-bordered select-sm" {...register("status", { required: true })}>
            <option disabled selected>{t('Status')}</option>
            {articleStatus.map((status) => (
              <option>{t(`articleStatus.${status}`)}</option>
            ))}
            <div className="tooltip" data-tip={t('Status Info')}>
              <button className="btn"><BsInfo /></button>
            </div>
          </select>
        </div>

        )
      }