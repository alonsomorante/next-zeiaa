'use client'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavUser } from "@/components/nav-user"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { useEffect, useState } from "react"
import { accountData, accountDataEnergy } from "@/app/utils/account"
import posthog from "posthog-js"

interface EnergyItem {
  name: string
  url: string
  icon: string
}
interface EnergyElements {
  name: string,
  url?: string | null,
  icon: string,
  is_active: boolean,
  children: EnergyItem[]
}




export function AppSidebar() {

  const pathname = usePathname()
  const [userInfo, setUserInfo] = useState<object>({ email: '', name: '', avatar: '' })
  const [energyModules, setEnergyModules] = useState<EnergyElements[]>([])

  const handleModuleClick = (moduleName: string, moduleUrl: string) => {
    if (moduleUrl === '#') return

    posthog.capture('section_viewed', {
      section: moduleName,
      portal: 'energia',
      url: moduleUrl,
      timestamp: new Date().toISOString(),
    })
  }

  useEffect(() => {

    const handleRequest = async () => {
      try {
        // const res = await accountData()
        const userData = await accountDataEnergy()

        console.log(userData)
        // const { results } = res
        // const user = results[0]
        // const { email, last_name, energy_modules, enterprise_name } = user
        setUserInfo({ email: userData?.email, name: userData?.enterprise_name, avatar: '' })
        setEnergyModules(userData?.energy_modules)
      } catch {
        // Error silenciado - manejo de errores de carga de usuario
      }
    }
    handleRequest()

  }, [])

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <NavUser userinfo={userInfo} />
      </SidebarHeader>
      <SidebarContent className="relative">
        <SidebarGroup>
          {
            energyModules?.map((modules, i) => {
              return (
                <div key={i}>
                  <SidebarGroupLabel>{modules.name}</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {modules?.children.map((item) => (
                        <SidebarMenuItem key={item.name}>
                          <SidebarMenuButton
                            asChild
                            data-active={pathname.includes(item.url) && 'true'}
                            tooltip={item.name}
                            onClick={() => handleModuleClick(item.name, item.url)}
                          >
                            <Link href={item.url}>
                              {/* <item.icon /> */}
                              <Image src={item.icon} alt={item.icon} width={16} height={16} className="w-4 h-4 text-white" priority />
                              <span>{item.name}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </div>
              )
            })
          }
        </SidebarGroup>
        <div className="w-full absolute bottom-0 p-8 flex items-center justify-center">
          <Image src="/logozeia.png" width={120} height={80} className="h-12 w-auto" alt="Logo zeia" priority />
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
