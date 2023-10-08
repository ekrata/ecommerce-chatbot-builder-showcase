import { ReactNode } from 'react';
import { BiMailSend, BiSolidContact, BiSolidCoupon, BiSolidTagX, BiTimer } from 'react-icons/bi';
import {
  BsCalendarDay, BsCalendarEvent, BsCardChecklist, BsChatLeft, BsChatSquareTextFill, BsChatText,
  BsFillBuildingFill, BsFillCartCheckFill, BsFillSendFill, BsFolderSymlink, BsPersonCheckFill,
  BsQuestion
} from 'react-icons/bs';
import { CgBrowser, CgScrollV } from 'react-icons/cg';
import {
  FaArrowRight, FaLanguage, FaProductHunt, FaRemoveFormat, FaReply, FaShippingFast, FaWpforms
} from 'react-icons/fa';
import { GiChoice, GiPerspectiveDiceSixFacesRandom, GiReturnArrow } from 'react-icons/gi';
import { GrContactInfo, GrInstagram, GrReturn, GrSystem } from 'react-icons/gr';
import { IoMdAnalytics } from 'react-icons/io';
import {
  MdMarkChatRead, MdMarkChatUnread, MdNotStarted, MdOutlineFiberNew, MdOutlineMobileFriendly,
  MdOutlinePageview
} from 'react-icons/md';
import {
  RiChatDeleteLine, RiChatForwardLine, RiChatOffLine, RiHomeOfficeFill, RiMailDownloadFill,
  RiMailStarFill, RiRobot2Fill
} from 'react-icons/ri';
import { SiAbbrobotstudio } from 'react-icons/si';
import {
  TbInputCheck, TbInputX, TbMouseOff, TbReorder, TbRobotOff, TbWindowMaximize
} from 'react-icons/tb';

import { nodeSubType } from '@/entities/bot';

type subTypes = (typeof nodeSubType)[number]
const nodeSubTypeIcons: Record<subTypes, ReactNode> = {
  'Ask a question': <BsQuestion />,
  'Based on Contact Property': <BiSolidContact />,
  'Browser': <CgBrowser />,
  'By action they made on your page': <FaArrowRight />,
  'Cart Value': <BsFillCartCheckFill />,
  'Chat status': <BsChatText />,
  'Chat with bot ended': <TbRobotOff />,
  'Check Order Status': <TbReorder />,
  'Coupon code': <BiSolidCoupon />,
  'Current URL': <BsFolderSymlink />,
  'Day': <BsCalendarDay />,
  'Decision (Buttons)': <GiChoice />,
  'Decision (Card Messages)': <BsCardChecklist />,
  'Decision (Quick Replies)': <FaReply />,
  'Delay': <BiTimer />,
  'Disable text input': <TbInputX />,
  'Enable text input': <TbInputCheck />,
  'First visit on site': <MdOutlineFiberNew />,
  'Form abandoned': <FaRemoveFormat />,
  'From another chatbot': <SiAbbrobotstudio />,
  'Instagram - Story Reply': <GrInstagram />,
  'Language': <FaLanguage />,
  'Mailing Subscriber': <RiMailStarFill />,
  'Mobile': <MdOutlineMobileFriendly />,
  'Mouse leaves window': <TbMouseOff />,
  'New event': <BsCalendarEvent />,
  'Notify operators': <BsPersonCheckFill />,
  'Open website in modal': <TbWindowMaximize />,
  'Operating system': <GrSystem />,
  "Operator doesn't respond during the conversation": <RiChatDeleteLine />,
  "Operator doesn't take the conversation": <BsChatLeft />,
  "Operator marks conversation as solved": <MdMarkChatRead />,
  "Operator starts the chatbot": <MdMarkChatUnread />,
  "Product Availability": <FaProductHunt />,
  "Randomize": <GiPerspectiveDiceSixFacesRandom />,
  "Reassign to a department": <BsFillBuildingFill />,
  'Remove a tag': <BiSolidTagX />,
  'Returning visitor': <GiReturnArrow />,
  "Send a chat message": <BsFillSendFill />,
  "Send a form": <FaWpforms />,
  "Send an email": <BiMailSend />,
  'Send an event to google analytics': <IoMdAnalytics />,
  'Set contact property': <GrContactInfo />,
  'Shipping Zones': <FaShippingFast />,
  'Subscribe for mailing': <RiMailDownloadFill />,
  "The visitor hasn't contacted you for some time": <RiChatOffLine />,
  'To another chatbot': <RiChatForwardLine />,
  'Visitor clicks the bots button': <RiRobot2Fill />,
  'Visitor opens a specific page': <MdOutlinePageview />,
  'Visitor returns to the site': <GrReturn />,
  'Visitor says': <BsChatSquareTextFill />,
  'Visitor scrolls page': <CgScrollV />,
  'Visitor selects department': <RiHomeOfficeFill />,
  'When you start it': <MdNotStarted />
}