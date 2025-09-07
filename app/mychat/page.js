"use client";
import React from 'react'
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useChat } from 'ai/react';
import { useState,useRef } from 'react';
import {motion} from 'motion/react'
import JobCard from '@/components/ui/JobCard';
import axios from 'axios'; // Import axios for making HTTP requests
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faPaperPlane, faRobot, faUser,faPlus } from '@fortawesome/free-solid-svg-icons';

import Link from 'next/link';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LucideBriefcaseBusiness, LucideDot } from 'lucide-react';
GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';


export default function Page() {
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);
  const { messages, input, stop, isLoading, setMessages, handleInputChange, handleSubmit } = useChat()
  const handleDelete = (id) => {
    setMessages(messages.filter(message => message.id !== id));
  };
  
  const handleFormSubmit = (event) => {
      event.preventDefault();

      // Prepare experimental attachments if images are present
      const experimental_attachments = images.map((imageUrl, index) => ({
          url: imageUrl,
          contentType: 'image/png',
          name: `page-${index + 1}.png`,
      }));

      // Check if there is text input or images to send
      if (!input.trim() && experimental_attachments.length === 0) {
          console.error('No input or images to send to the model.');
          return;
      }

      // Send the message and attachments
      handleSubmit(event, {
          experimental_attachments,
          text: input.trim(), // Send the text input
      });

      // Clear images and input after submission
      setImages([]);
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
      }
  };

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
  function capitalizeEachWord(text) {
    if (!text) return text;
    return text.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
  console.log(messages)
  return (
    <div className='flex flex-col h-full'>
        <header className='flex flex-row items-center p-4 border-b'>
        <Link className="flex items-center justify-center" href="#"> 
          
          <span className=" flex gap-2 items-center ml-2 text-2xl font-bold text-primary sm:flex-row"> <Image src='/lion_head_silhouette_ByzJz.svg'
          height={30} width={30} alt="lion head silhouette"
          /> Sphinx-AI</span>
        </Link>
          <nav className='ml-auto '>
            <ul className='flex flex-row gap-4'>
              <li><a href="/">Home</a></li>
              <li><a href="/Chat">Chat</a></li>
              <li><a href="/about">Leave a review!</a></li>
            </ul>
          </nav>
        </header>
        <div className='flex flex-col h-full w-3xl overflow-y-auto mx-auto'>
          {messages.map(m => (
              <motion.div
              initial={{ opacity: 0 , scale: 0.5}}
              animate={{ opacity: 1 , scale: 1}}
              transition={{ duration: 0.5 }}
              key={m.id} className={`whitespace-pre-wrap my-2 shadow-md border ${m.role === 'user' ? 'bg-gradient-to-r from-[#efeadb] to-[#efe8d5]' : 'bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300'} rounded-2xl p-6`}>
                {m.role === 'user' ? (
                  <>
                    <FontAwesomeIcon icon={faUser} className='mr-2' />
                    {m.content}
                  </>
                ) : (
                  <>
                    {/* <FontAwesomeIcon icon={faRobot} className='mr-2' /> */}
                    <div className='flex mb-2'>
                      <Image src='/lion_head_silhouette_ByzJz.svg'
            height={25} width={25} alt="lion head silhouette"
            className='mr-2 mb-auto'/>
                      <span className='mx-2'>{m.content}</span>
                    </div>
                    
                    {m.toolInvocations && m.toolInvocations[0] && m.toolInvocations[0].result && (
                      <>
                          {/* {m.toolInvocations[0].result.message && (
                            <span>{m.toolInvocations[0].result.message}</span> // Display job description
                          )} */}
                          {m.toolInvocations[0].result?.job && (
                            <Card className='my-4 bg-transparent'>
                              <CardHeader>
                                <div className='flex items-center gap-2'>
                                  <LucideBriefcaseBusiness size={30} className=' border rounded-full p-1'/>
                                  <div>
                                    <CardTitle>{m.toolInvocations[0].result.job}</CardTitle>
                                    <CardDescription className='text-base flex'>{m.toolInvocations[0].result.company}<LucideDot/>{m.toolInvocations[0].result.location}</CardDescription>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardDescription>
                                <Accordion type="single" collapsible>
                                  <AccordionItem value='item-1'>
                                    <AccordionTrigger className='p-5 font-medium'>Description</AccordionTrigger>
                                    <AccordionContent className='p-5'>
                                      {m.toolInvocations[0].result.jobDescription}
                                      <br></br>
                                      
                                    </AccordionContent>

                                  </AccordionItem>

                                  <AccordionItem value='item-2'>
                                      <AccordionTrigger className='p-5 font-medium'>Qualifications</AccordionTrigger>
                                      <AccordionContent className='p-5'>
                                        {m.toolInvocations[0].result.qualifications}
                                      </AccordionContent>
                                  </AccordionItem>
                                </Accordion>
                              </CardDescription>
                              <CardContent><Button className='my-2'><a href={m.toolInvocations[0].result.link} target='_blank'>Apply</a></Button></CardContent>
                            </Card>
                          )}
                          {m.toolInvocations[0].result?.message && (
                            // <div className='p-4 bg-slate-50 rounded-xl my-1'>
                            //   <h1 className='text-lg font-semibold border-b py-2'>{capitalizeEachWord(m.toolInvocations[0].result.title)}</h1>
                            //   <p className='py-2'>{m.toolInvocations[0].result.source}</p>
                            //   <span>{m.toolInvocations[0].result.message}</span>
                            // </div>
                            <Card className='my-2 bg-transparent p-0'>
                              <CardHeader>
                                <div className='flex items-center gap-2'>
                                  <LucideBriefcaseBusiness size={30} className=' border rounded-full p-1'/>
                                  <div>
                                  <CardTitle>{capitalizeEachWord(m.toolInvocations[0].result.title)}</CardTitle>
                                  <CardDescription>{m.toolInvocations[0].result.source}</CardDescription>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent>{m.toolInvocations[0].result.message}</CardContent>
                            </Card>
                          )}
                         
                         {/* {m.toolInvocations[0].result?.link && (
                            <a 
                              href={m.toolInvocations[0].result.link} 
                              target='_blank' 
                              className='w-28 p-3 bg-slate-900 rounded-md mr-2 text-white text-center mx-2 cursor-pointer font-semibold block'
                            >
                              Apply
                            </a>
                          )} */}
                          {m.toolInvocations[0].result?.bookTitle && (
                            <Card className=' bg-transparent p-0 border-transparent shadow-none'>
                              <CardHeader className='p-0 pb-4 '>
                                <div className='flex items-center gap-4'>
                                {m.toolInvocations[0].result.bookThumbnail && (
                                    <Image
                                      src={m.toolInvocations[0].result.bookThumbnail}
                                      width={70} 
                                      height={90} 
                                      alt='Book cover' 
                                    />
                                  )}
                                   <div>
                                  <CardTitle>{m.toolInvocations[0].result.bookTitle}</CardTitle>
                                  <CardDescription className='p-0'>{m.toolInvocations[0].result.authors.join(', ')}</CardDescription>
                                </div>
                                </div>
                               
                                
                              </CardHeader>
                              <CardContent className='p-0'>
                                <p>{m.toolInvocations[0].result.ai_res}</p>
                                <Accordion type="single" collapsible className='my-3'>
                                <AccordionItem value='item-1'>
                                  <AccordionTrigger className=' font-medium'>Description</AccordionTrigger>
                                    <AccordionContent className=''>
                                      {m.toolInvocations[0].result.bookDescription}
                  
                                      
                                    </AccordionContent>

                                  </AccordionItem>
                                </Accordion>
                                <Button><a href={m.toolInvocations[0].result.bookLink} target='_blank'>Read</a></Button>
                              </CardContent>
                            </Card>
                          )}
                        
                        {m.toolInvocations[0].result.videoId && (
                          <>
                            
                            <Card className='w-full sm:w-[550px] my-4 bg-transparent p-0 border-transparent shadow-none'>
                              <CardHeader className='p-0 pb-4'>
                                <CardTitle className='text-xl'>{m.toolInvocations[0].result.title}</CardTitle>
                                <CardDescription>Found a video!</CardDescription>
                              </CardHeader>
                              <CardContent className='p-0' >
                                <iframe
                                className='w-2xl rounded-lg'
                                height="315"
                                src={`https://www.youtube.com/embed/${m.toolInvocations[0].result.videoId}`}
                                title="YouTube Video"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                              </CardContent>
                            </Card>
                          </>
                          
                        )}
                        
                         
                      </>
                     
                  
                )}
                
                    <Button variant="outline" size="icon" className='ml-auto' onClick={() => handleDelete(m.id)}><FontAwesomeIcon icon={faClose} className='h-4 w-4' /></Button>
                  </>
                )}
              </motion.div>
            ))}
            {isLoading && (
              <Button variant="desturctive" onClick={() => stop()} className='bg-red-600 w-24 text-white mx-auto'>
                <svg aria-hidden="true" class="w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
                Stop
              </Button>
            )} 
        </div>
        <form  onSubmit={handleFormSubmit} className=' flex mb-3 p-5 w-3xl  mx-auto h-24 bg-muted items-center border rounded-xl  gap-4'>
        <input
          type="file"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
          accept="application/pdf"
          id='imgInput'
        />
      
        <div className="relative flex items-center w-2xl">
          <label className='flex items-center' htmlFor='imgInput'><FontAwesomeIcon icon={faPlus} className="absolute left-2 text-gray-500 w-4 h-4" /></label>
          <input
            className=" flex items-center my-auto h-11 mx-auto w-full p-1 border border-gray-300 rounded shadow-xl outline-none pl-10"
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
          />
        </div>
          <Button onClick={handleFormSubmit} className='hover:bg-slate-500 my-auto'><FontAwesomeIcon icon={faPaperPlane} className='hover:text-gray-900'/></Button>
        </form>
    </div>
  )
}
