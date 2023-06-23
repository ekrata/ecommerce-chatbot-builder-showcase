import { useEffect } from "react"
import { useQuery, useQueryClient } from "react-query"
import { getOrg } from "./(actions)/orgs/getOrg"
import { getCustomer } from "./(actions)/customers/getCustomer"
import { EntityItem } from "electrodb"
import { Org } from "@/entities/org"
import { Customer } from "@/entities/customer"
import { getWsUrl } from "@/app/getWsUrl"
import { Message } from "@/entities/message"
import { Conversation } from "@/entities/conversation"

const useReactQuerySubscription = (mocked: boolean) => {
  const queryClient = useQueryClient();
  const org = useQuery<EntityItem<typeof Org>>('org', async () => getOrg(process.env.NEXT_PUBLIC_APP_ORG_ID ?? ''));
  const customer = useQuery<EntityItem<typeof Customer>>([org.data?.orgId, 'customer']);
  const conversation = useQuery<EntityItem<typeof Conversation>>([org.data?.orgId,'conversations']);
  const messages = useQuery<EntityItem<typeof Conversation>>([org.data?.orgId, conversation.data?.conversationId, 'messages']);

  useEffect(() => {
    const socket: WebSocket | undefined = org?.data?.orgId && customer?.data?.customerId
        ? new WebSocket(
            mocked ? process.env.mockWsUrl ?? '' : getWsUrl(org.data.orgId, customer?.data?.customerId, 'customer')
          )
        : undefined


    const websocket = new WebSocket('wss://echo.websocket.org/')
    websocket.onopen = () => {
      console.log('connected')
    }

  // socket?.addEventListener('eventNewMessage', (event) => {
  //   const { message } = JSON.parse(event?.data) as { message: EntityItem<typeof Message> }
  //   eventNewMessage(message)
  // });

  // socket?.addEventListener('eventUpdatedConversation', (event) => {
  //   const { conversation } = JSON.parse(event?.data) as { conversation: EntityItem<typeof Conversation> }
  //   eventUpdateConversation(conversation)
  // });

  // socket?.addEventListener('eventNewConversation', (event) => {
  //   const { conversation } = JSON.parse(event?.data) as { conversation: EntityItem<typeof Conversation> }
  //   eventNewConversation(conversation)
  // });
  //   websocket.onmessage = (event) => {
  //     const data = JSON.parse(event.data)
  //     queryClient.setQueriesData(data.entity, (oldData) => {
  //       const update = (entity) =>
  //         entity.id === data.id ? { ...entity, ...data.payload } : entity
  //       return Array.isArray(oldData) ? oldData.map(update) : update(oldData)
  //     })
  //   }

    return () => {
      websocket.close()
    }
  }, [queryClient])
}