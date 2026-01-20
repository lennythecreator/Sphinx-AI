import { streamUI } from 'ai/rsc';
import { openai } from '@ai-sdk/openai';
import { streamText, convertToCoreMessages } from 'ai';
import { tool } from 'ai';
import { z } from 'zod';

const { getJson } = require("serpapi");

//grab job data from the api
const getJobData = async (job) => {
  const apiKey = process.env.NEXT_PUBLIC_SERP_API_KEY;
  if (!apiKey) {
    throw new Error('API key is not available');
  }
  return new Promise((resolve, reject) => {
    getJson({
      engine: "google_jobs",
      q: job,
      hl: "en",
      api_key: apiKey,
    }, (json) => {
      if (json.error) {
        reject(json.error);
      } else {
        const jobResults = json["jobs_results"];
        if (jobResults && jobResults.length > 0) {
          resolve(jobResults[0]); // Return only the first result
        } else {
          resolve(null); // No jobs found
        }
      }
    });
  });
};

const getJobId = async (job) => {
  const apiKey = process.env.NEXT_PUBLIC_SERP_API_KEY;
  if (!apiKey) {
    throw new Error('API key is not available');
  } return new Promise((resolve, reject) => {
    getJson({
      engine: "google_jobs",
      q: job,
      hl: "en",
      api_key: apiKey,
    }, (json) => {
      if (json.error) {
        reject(json.error);
      } else {
        const jobResults = json["jobs_results"];
        if (jobResults && jobResults.length > 0) {
          resolve(jobResults[0].job_id); // Return only the first result
        } else {
          resolve(null); // No jobs found
        }
      }
    })
  });
}
const getYearlySalary = async (jobId) => {
  const apiKey = process.env.NEXT_PUBLIC_SERP_API_KEY;

  return new Promise((resolve, reject) => {
    getJson({
      engine: "google_jobs_listing",
      q: jobId,
      api_key: apiKey,
    }, (json) => {
      if (json.error) {
        console.error(`Error fetching salary data: ${json.error}`);
        reject(json.error);
      } else {
        const salaries = json["salaries"];
        //console.log(`Salaries: ${JSON.stringify(salaries)}`);
        if (salaries && salaries.length > 0) {
          //console.log(`Salary data: ${JSON.stringify(salaries[0])}`);
          resolve(salaries[0]); // Return the first salary information
        } else {
          console.log('No sufficient salary info found');
          resolve(null); // No sufficient salary info found
        }
      }
    });
  });
};

//search for company data
const getBooks = async (book) => {
  const Api_key = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  const query = book;
  const maxResults = 1;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${Api_key}`
  try {
    const response = await fetch(url);
    const data = await response.json();
    const books = data.items ? data.items[0] : null;
    console.log('response : ', books)
    return books; // Return the first book
  } catch (error) {
    console.error('failed', error)
  }
}

//Allow for video search
const getVideo = async (video) => {
  const Api_key = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  const query = video;
  const maxResults = 1;
  console.log('starting');
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${Api_key}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    const videos = data.items;

    // Check if the response contains video data
    console.log('API response:', data);

    if (videos && videos.length > 0) {
      const videoData = videos[0];
      console.log(`Title: ${videoData.snippet.title}`);
      console.log(`Video ID: ${videoData.id.videoId}`);
      console.log(`Thumbnail: ${videoData.snippet.thumbnails.default.url}`);
      return videoData;
    } else {
      console.log('no video data found')
      return null
    }
  } catch (error) {
    console.error('error', error)
    return null
  }
}

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req) {
  try {
    const { messages, system } = await req.json();

    const result = await streamText({
      model: openai('gpt-4-turbo'),
      messages: convertToCoreMessages(messages),
      system: system || 'You are a conversational AI assistant Spinx, meant to help students navigate their careers and majors. You can answer questions about majors, careers, and the job market. You can also provide advice on how to succeed in college and the workforce. Another one of your features is the ability to generate a road map showing users the skills and tools they need to learn for a particualr career. Do not answer anything unrelated to these topics. Don\'t give super lenghty responses, keep it short and sweet. avoid using \'*\' in your responses. You also have the ablitiy to rate the persons resume if they upload it. Also if they searched for a job then rate their result me based on the desscription.Score the resume based on keyword matching, relevant experience, education, and certifications, while considering achievements, clarity, and ATS compatibility. Focus on how well the resume aligns with the job description, ensuring the use of quantifiable results, proper formatting, and tailored content for the role. example: Rating{example/100} with a short explanation.',
      temperature: 0.8,
      tools: {
        askForConfirmation: {
          description: 'Ask the user for confirmation.',
          parameters: z.object({
            message: z.string().describe('The message to ask for confirmation.'),
          }),
        },
        searchJob: {
          description: 'Search for jobs based on a query and give information about the title, location and summarize to 2 sentences job description.',
          parameters: z.object({
            job: z.string().describe('The job title or keywords to search for.'),
          }),
          execute: async ({ job }) => {
            console.log(`Searching for job: ${job}`);
            try {
              const jobData = await getJobData(job);
              if (jobData) {
                return {
                  title: `Job found ${jobData.title} at ${jobData.location}`,
                  link: jobData.apply_options[0].link,
                  job: `${jobData.title}`,
                  jobDescription: `${jobData.description}`,
                  company: `${jobData.company_name}`,
                  location: `${jobData.location}`,
                  qualifications: `${jobData.job_highlights[0].items}`,
                  thumbnail: `${jobData.thumbnail}`
                };
              } else {
                return { message: 'No jobs found' };
              }
            } catch (error) {
              console.error(`Error fetching job data: ${error}`);
              throw new Error('Failed to fetch job data');
            }
          },
        },
        findJobSalary: {
          description: 'Find the average salary for a job',
          parameters: z.object({
            job: z.string().describe('The job title or keywords to search for.'),
          }),
          execute: async ({ job }) => {
            try {
              const jobId = await getJobId(job);
              if (jobId) {
                const salaryData = await getYearlySalary(jobId);
                if (salaryData) {
                  return {
                    title: job,
                    source: salaryData.source,
                    message: `The average salary for ${job} is $${salaryData.salary_from} to $${salaryData.salary_to} based on ${salaryData.source} \n`,
                  };
                } else {
                  return { message: 'No salary data found' };
                }
              } else {
                return { message: 'No job ID found for the given job query' };
              }
            } catch (error) {
              console.error(`Error fetching salary data: ${error}`);
              throw new Error('Failed to fetch salary data');
            }
          },
        },
        findVideo: {
          description: 'search for a video based on a query when the users ask where they can learn more about a particular thing.',
          parameters: z.object({
            video: z.string().describe('The video title or keywords to search for.'),
          }),
          execute: async ({ video }) => {
            console.log('starting search', video);
            const videoData = await getVideo(video)
            if (videoData) {
              return {
                thumbnail: videoData.snippet.thumbnails.default.url,
                videoId: videoData.id.videoId,
                title: videoData.snippet.title,
              }
            } else {
              return { message: "Sorry no video found" }
            }
          }
        },
        findBook: {
          description: 'search for a book if the user wants to learn or read about a particular topic related to a career.',
          parameters: z.object({
            book: z.string().describe('The book name or keywords to search for.'),
          }),
          execute: async ({ book }) => {
            console.log('searching for book on', book)
            const bookItem = await getBooks(book);
            return {
              ai_res: `I think this would be a good read!`,
              bookTitle: bookItem.volumeInfo.title,
              authors: bookItem.volumeInfo.authors || ['Unknown'],
              bookDescription: bookItem.volumeInfo.description || 'No description available.',
              bookThumbnail: bookItem.volumeInfo.imageLinks?.thumbnail || '',
              bookLink: bookItem.volumeInfo.infoLink,
            }
          },
        },
      }
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error in POST /api/chat:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}