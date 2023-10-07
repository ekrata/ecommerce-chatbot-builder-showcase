import { AttachmentType } from '@/entities/message';

export const getMockMessengerMessage = (
  senderPsid: string,
  recipientPageId: string,
  messageId: string = 'mid.$cAAJdkrCd2ORnva8ErFhjGm0X_Q_c',
  attachmentUrl: '',
  attachmentType?: AttachmentType,
) => ({
  messaging: [
    {
      sender: {
        id: senderPsid,
      },
      recipient: {
        id: recipientPageId,
      },
      timestamp: 1518479195308,
      message: {
        mid: messageId,
        attachments: attachmentType
          ? [
              {
                type: attachmentType,
                payload: {
                  url: attachmentUrl,
                },
              },
            ]
          : [],
      },
    },
  ],
});
