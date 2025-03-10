"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Building, Menu, FileText, BellRing } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function NavBar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const routes = [
    {
      href: "/",
      label: "홈",
      icon: Building,
      active: pathname === "/",
    },
    {
      href: "/invoices",
      label: "영수증",
      icon: FileText,
      active: pathname === "/invoices" || pathname?.startsWith("/invoices"),
    },
    {
      href: "/notices",
      label: "공지사항",
      icon: BellRing,
      active: pathname === "/notices" || pathname?.startsWith("/notices"),
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">메뉴 열기</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <Link href="/" className="flex items-center gap-2 mb-8" onClick={() => setOpen(false)}>
                <Building className="h-6 w-6" />
                <span className="font-semibold">빌딩 관리 시스템</span>
              </Link>
              <nav className="flex flex-col gap-4">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2 text-lg font-medium",
                      route.active ? "text-primary" : "text-muted-foreground hover:text-primary",
                    )}
                  >
                    <route.icon className="h-5 w-5" />
                    {route.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2">
            <Building className="h-6 w-6" />
            <span className="font-semibold hidden md:inline-block">빌딩 관리 시스템</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-6">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium",
                  route.active ? "text-primary" : "text-muted-foreground hover:text-primary",
                )}
              >
                <route.icon className="h-4 w-4" />
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center">
          <Avatar>
            <AvatarImage src="/placeholder.svg?height=32&width=32" />
            <AvatarFallback>관리자</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}

