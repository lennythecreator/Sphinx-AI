"use client";

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useChat } from 'ai/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faPaperPlane, faRobot, faUser, faPlus } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';

// Set the workerSrc for pdf.js
GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

export default function Page() {
  const { messages, input, handleSubmit, handleInputChange, isLoading } = useChat();
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);

      fileReader.onload = async () => {
        const typedArray = new Uint8Array(fileReader.result);
        try {
          const pdf = await getDocument(typedArray).promise;

          const newImages = [];
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport }).promise;

            const imageUrl = canvas.toDataURL(); // Convert the page to an image
            newImages.push(imageUrl); // Store the image URL
          }

          setImages(newImages); // Update state with the new image URLs
        } catch (error) {
          console.error('Error processing PDF:', error);
        }
      };

      fileReader.onerror = () => {
        console.error('Error reading file:', fileReader.error);
      };
    } else {
      console.error('Please upload a valid PDF file.');
    }
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();

    if (images.length === 0) {
      console.error('No images to send to the model.');
      return;
    }

    const experimental_attachments = images.map((imageUrl, index) => ({
      url: imageUrl,
      contentType: 'image/png',
      name: `page-${index + 1}.png`,
    }));

    handleSubmit(event, {
      experimental_attachments,
    });

    // Clear images and input after submission
    setImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className='flex flex-col h-full'>
      <header className='flex flex-row items-center p-4 border-b'>
        <Link className="flex items-center justify-center" href="#">
          <span className="flex gap-2 items-center ml-2 text-2xl font-bold text-primary sm:flex-row">
            <Image src='/lion_head_silhouette_ByzJz.svg' height={30} width={30} alt="lion head silhouette" />
            Spinx-AI
          </span>
        </Link>
        <nav className='ml-auto'>
          <ul className='flex flex-row gap-4'>
            <li><a href="/">Home</a></li>
            <li><a href="/Chat">Chat</a></li>
            <li><a href="/about">Leave a review!</a></li>
          </ul>
        </nav>
      </header>

      <div className='flex flex-col h-full w-[70vw] overflow-y-auto mx-auto'>
        {messages.map(m => (
          <div key={m.id} className={`whitespace-pre-wrap my-2 shadow-sm border ${m.role === 'user' ? 'bg-white-100' : 'bg-slate-200'} rounded-xl p-4`}>
            {m.role === 'user' ? (
              <>
                <FontAwesomeIcon icon={faUser} className='mr-2' />
                {m.content}
              </>
            ) : (
              <div className='flex items-start'>
                <FontAwesomeIcon icon={faRobot} className='mr-2' />
                <span>{m.content}</span>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <Button variant="destructive" onClick={() => stop()} className='bg-red-600 w-24 text-white mx-auto'>
            Stop
          </Button>
        )}
      </div>

      <form onSubmit={handleFormSubmit} className='flex p-3 w-[80vw] mx-auto h-24 bg-muted items-center border rounded-t-xl sm:w-[60vw] gap-4'>
        <input
          type="file"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="cursor-pointer rounded-full border-2 border-dashed p-4"
          accept="application/pdf"
        />
        <div className="relative flex items-center">
          <FontAwesomeIcon icon={faPlus} className="absolute left-2 text-gray-500" />
          <input
            className="mt-2 h-11 mx-auto w-[60vw] p-1 border border-gray-300 rounded shadow-xl outline-none pl-10"
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
          />
        </div>
        <Button onClick={handleFormSubmit} className='hover:bg-slate-500 my-auto'>
          <FontAwesomeIcon icon={faPaperPlane} className='hover:text-gray-900' />
        </Button>
      </form>
    </div>
  );
}
