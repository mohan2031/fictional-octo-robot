"use client";

import { SidebarProvider, Sidebar, SidebarTrigger, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader } from "@/components/ui/sidebar";
import { Home, Settings, ShoppingCart, Inbox, Package } from "lucide-react";
import Link from 'next/link';
import { AuthGuard } from './auth-guard';

export default function ShopDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <SidebarProvider>
          <Sidebar>
            <SidebarHeader className="border-b">
              <div className="flex items-center gap-2 text-primary p-2">
                  <ShoppingCart className="h-6 w-6"/>
                  <span className="text-lg font-bold font-headline">ShopConnect</span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Dashboard">
                    <Link href="/shop-dashboard"><Home /> <span>Dashboard</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Products">
                    <Link href="/shop-dashboard/products"><Package /> <span>Products</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Messages">
                    <Link href="/shop-dashboard/inquiries"><Inbox /> <span>Messages</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Settings">
                    <Link href="/shop-dashboard/settings"><Settings /> <span>Settings</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <main className="flex-1 flex flex-col">
            <header className="p-4 border-b flex items-center gap-4 bg-card/50 sticky top-0 z-30">
              <SidebarTrigger className="md:hidden" />
              <h1 className="text-xl font-semibold font-headline">Shop Dashboard</h1>
            </header>
            <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/30">
              {children}
            </div>
          </main>
      </SidebarProvider>
    </AuthGuard>
  );
}
