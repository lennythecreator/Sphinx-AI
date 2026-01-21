import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
    return(
        <header className='flex flex-row items-center p-4 border-b'>
        <Link className="flex items-center justify-center" href="#"> 
          <span className="flex gap-2 items-center ml-2 text-2xl font-bold text-primary sm:flex-row">
            <Image 
              src='/lion_head_silhouette_ByzJz.svg'
              height={30} 
              width={30} 
              alt="lion head silhouette"
            /> 
            Sphinx-AI
          </span>
        </Link>
        <nav className='ml-auto'>
          <ul className='flex flex-row gap-4'>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/pages/new">Chat</Link></li>
            <li><Link href="/pages/projects">Projects</Link></li>
            <li><Link href="/about">Leave a review!</Link></li>
          </ul>
        </nav>
    </header>
    )
}
