import Link from "next/link";
import { useRouter } from "next/router";
import { PropsWithChildren } from "react";
import { InboxArrowDownIcon } from "@heroicons/react/24/solid";
import { useIntl } from "next-intl";

export default function Layout({}) {
    const { locales } = useRouter();

    const intl = useIntl();

    return (
        <>
            <aside
                id="separator-sidebar"
                className=" z-0 w-64 h-screen transition-transform "
                aria-label="Sidebar"
            >
                <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
                    <ul className="space-y-2 font-medium">
                        <ul className="space-y-2 font-medium">
                            <li>
                                <Link href="/live-chat/unassigned">
                                    <InboxArrowDownIcon className="h-6 text-gray-500" />
                                    {intl.formatMessage({
                                        id: "page.inbox.drawer.live_conversations",
                                    })}
                                </Link>
                            </li>
                            <li>
                                <Link href="/live-chat/my-open">
                                    {intl.formatMessage({
                                        id: "page.inbox.drawer.my-open",
                                    })}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/live-chat/solved"
                                    className="flex place-items-center"
                                >
                                    {intl.formatMessage({
                                        id: "page.inbox.drawer.solved",
                                    })}
                                </Link>
                            </li>
                            <ul className="space-y-2 font-medium">
                                <li>
                                    <Link href="/tickets/unassigned">
                                        {intl.formatMessage({
                                            id: "page.inbox.drawer.live_conversations",
                                        })}
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/tickets/my-open">
                                        {intl.formatMessage({
                                            id: "page.inbox.drawer.my-open",
                                        })}
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/tickets/solved">
                                        {intl.formatMessage({
                                            id: "page.inbox.drawer.solved",
                                        })}
                                    </Link>
                                </li>
                            </ul>
                            <ul className="space-y-2 font-medium">
                                <li>
                                    <Link href="/tickets/unassigned">
                                        {intl.formatMessage({
                                            id: "page.inbox.drawer.live_conversations",
                                        })}
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/tickets/my-open">
                                        {intl.formatMessage({
                                            id: "page.inbox.drawer.my-open",
                                        })}
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/tickets/solved">
                                        {intl.formatMessage({
                                            id: "page.inbox.drawer.solved",
                                        })}
                                    </Link>
                                </li>
                            </ul>
                        </ul>
                    </ul>
                </div>
            </aside>

            <div className="p-4 ">
                <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700">
                    {children}
                </div>
            </div>
        </>
    );
}
