import { Bars3Icon, WindowIcon } from "@heroicons/react/24/outline";
import { InboxArrowDownIcon } from "@heroicons/react/24/solid";
import { Tooltip } from "@material-tailwind/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/router";
import { PropsWithChildren } from "react";

export default function AppDrawer({ children }: PropsWithChildren) {
    const t = useTranslations("app.layout");

    return (
        <>
            <button
                data-drawer-target="separator-sidebar"
                data-drawer-toggle="separator-sidebar"
                aria-controls="separator-sidebar"
                type="button"
                className="inline-flex items-center p-2 mt-2 ml-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            >
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon />
            </button>

            <aside
                id="separator-sidebar"
                className=" left-0 z-0 flex h-screen transition-transform -translate-x-full sm:translate-x-0"
                aria-label="Sidebar"
            >
                <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
                    <ul className="space-y-2 font-medium">
                        <li>
                            <Link
                                href="/dashboard"
                                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <Tooltip content={} placement="right-end">
                                    <WindowIcon className="text-gray-500 h-6" />
                                </Tooltip>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/inbox"
                                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <Tooltip
                                    content={intl.formatMessage({
                                        id: "layout.drawer.inbox",
                                    })}
                                    placement="right-end"
                                >
                                    <InboxArrowDownIcon className="text-gray-500 h-6" />
                                </Tooltip>
                            </Link>
                        </li>
                    </ul>
                </div>
            </aside>

            {children}
        </>
    );
}
