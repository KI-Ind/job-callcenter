'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { FaChevronLeft } from 'react-icons/fa'

interface DetailPageHeaderProps {
  title: string
  backLink: string
  backText: string
}

export default function DetailPageHeader({ title, backLink, backText }: DetailPageHeaderProps) {
  const pathname = usePathname()
  
  return (
    <div className="bg-white shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href={backLink} className="text-gray-600 hover:text-blue-600 flex items-center text-sm mb-2">
                <FaChevronLeft className="mr-1 h-3 w-3" />
                {backText}
              </Link>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">{title}</h1>
            </div>
            <Link href="/" className="flex items-center">
              <Image
                src="/images/JBC-Logo.png"
                alt="JobCallCenter.ma"
                width={220}
                height={80}
                className="h-16 w-auto"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
