import { useEffect } from 'react';
import { useCustomerChatStore } from '../(actions)/useCustomerChatStore';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { BsChevronDown, BsThreeDotsVertical } from 'react-icons/bs';

export const PrechatSurvey = () => {
  const { widgetState } = useCustomerChatStore();
  
    const { conversation, customer, operator, messages, configuration } =
      useCustomerChatStore();
    const t = useTranslations('chat-widget');
    export type Inputs {
      msg: strin
    }
    const {
      register,
      handleSubmit,
      watch,
      formState: { errors },
    } = useForm<Inputs>();
    const onSubmit: SubmitHandler<Inputs> = async ({ msg }) => {
      const sentMessage = await sendMessage(
        conversation?.orgId ?? '',
        conversation?.conversationId ?? '',
        customer?.customerId ?? '',
        operator?.operatorId ?? '',
        'customer',
        msg
      );
      useCustomerChatStore.setState({
        ...useCustomerChatStore.getState(),
        messages: [...(messages ?? []), sentMessage],
      });
    };
  
    console.log(configuration?.channels?.liveChat?.appearance?.widgetAppearance);
    const { backgroundColor, darkBackgroundColor } = {
      ...configuration?.channels?.liveChat?.appearance?.widgetAppearance,
    };
    console.log(darkBackgroundColor);
    const background = `
      .background {
        background: ${backgroundColor}
      }
      .dark-mode x.background {
        background: ${darkBackgroundColor}
      }
        
    `;
    return (
      <div className="flex flex-col font-sans animate-fade-up rounded-lg max-w-xl dark:bg-gray-800 place-items-center">
          <div className="avatar online ">
            <div className="w-16 rounded-full ring-2 shadow-2xl">
              <Image
                src={
                  operator?.profilePicture ??
                  'https://www.nicepng.com/ourpic/u2y3a9e6t4o0a9w7_profile-picture-default-png/'
                }
                data-testid="operator-img"
                width={45}
                height={45}
                alt="operator picture"
              />
            </div>
          </div>
          <div>{t('please-introduce-yourself')}</div>
        {/* <div
          className={` w-full ${backgroundColor} -skew-y-5 text-xl px-6 p-2 backdrop-invert font-sans`}
        >
          {t('we-reply')}
        </div> */}
  
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-control ">
            <div className="input-group gap-x-1">
              <div className="flex flex-col w-full">
                <input
                  type="text"
                  placeholder="Enter your message..."
                  className="input w-full rounded-xs "
                  onFocus={() => {
                    if (!conversation) {
                      useCustomerChatStore.setState({
                        ...useCustomerChatStore.getState(),
                        widgetState: 'prechat_survey',
                      });
                    }
                  }}
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
                className={`background btn btn-square  text-xl ${backgroundColor} dark:${darkBackgroundColor} border-0`}
                data-testid="msg-send"
                type="submit"
              >
                <style>{background}</style>
                <IoMdSend className="text-neutral dark:text-white" />
              </button>
            </div>
          </div>
        </form>
      </div>
    );
    };
    

  );
};
