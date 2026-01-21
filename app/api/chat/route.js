import { openai } from '@ai-sdk/openai';
import { streamText, convertToCoreMessages } from 'ai';
import { z } from 'zod';

const { getJson } = require("serpapi");

const SERP_API_KEY = process.env.SERP_API_KEY || process.env.NEXT_PUBLIC_SERP_API_KEY;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const BOOKS_API_KEY = process.env.BOOKS_API_KEY || process.env.NEXT_PUBLIC_BOOKS_API_KEY || YOUTUBE_API_KEY;

//grab job data from the api
const getJobData = async (job) => {
  if (!SERP_API_KEY) {
    throw new Error('SERP API key is not available');
  }
  return new Promise((resolve, reject) => {
    getJson({
      engine: "google_jobs",
      q: job,
      hl: "en",
      api_key: SERP_API_KEY,
    }, (json) => {
      if (json.error) {
        reject(json.error);
      } else {
        const jobResults = json["jobs_results"];
        resolve(Array.isArray(jobResults) ? jobResults : []);
      }
    });
  });
};

const getJobId = async (job) => {
  if (!SERP_API_KEY) {
    throw new Error('SERP API key is not available');
  } return new Promise((resolve, reject) => {
    getJson({
      engine: "google_jobs",
      q: job,
      hl: "en",
      api_key: SERP_API_KEY,
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
  if (!SERP_API_KEY) {
    throw new Error('SERP API key is not available');
  }
  return new Promise((resolve, reject) => {
    getJson({
      engine: "google_jobs_listing",
      job_id: jobId,
      api_key: SERP_API_KEY,
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
  const apiKey = BOOKS_API_KEY;
  if (!apiKey) {
    console.error('Books API key is not available');
    return null;
  }
  const query = book;
  const maxResults = 1;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${apiKey}`
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Books API error: ${response.status} ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    const books = data.items ? data.items[0] : null;
    return books; // Return the first book
  } catch (error) {
    console.error('failed', error)
    return null;
  }
}

//Allow for video search
const getVideo = async (video) => {
  const apiKey = YOUTUBE_API_KEY;
  if (!apiKey) {
    console.error('YouTube API key is not available');
    return null;
  }
  const query = video;
  const maxResults = 1;
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${apiKey}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`YouTube API error: ${response.status} ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    const videos = data.items;

    // Check if the response contains video data
    if (videos && videos.length > 0) {
      const videoData = videos[0];
      return videoData;
    } else {
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
        searchJob: {
          description: 'Search for jobs based on a query and return multiple results with title, location, and a short description.',
          parameters: z.object({
            job: z.string().describe('The job title or keywords to search for.'),
          }),
          execute: async ({ job }) => {
            console.log(`Searching for job: ${job}`);
            try {
              const jobResults = await getJobData(job);
              const jobs = Array.isArray(jobResults)
                ? jobResults.slice(0, 8).map((jobItem) => {
                  const applyLink = jobItem.apply_options?.[0]?.link
                    || jobItem.related_links?.[0]?.link
                    || jobItem.share_link
                    || '';
                  const qualifications = jobItem.job_highlights?.[0]?.items ?? [];
                  return {
                    id: jobItem.job_id || `${jobItem.company_name || 'company'}-${jobItem.title || 'role'}-${jobItem.location || 'location'}`,
                    title: jobItem.title || job,
                    description: jobItem.description || '',
                    company: jobItem.company_name || '',
                    location: jobItem.location || '',
                    qualifications: Array.isArray(qualifications) ? qualifications : [qualifications],
                    link: applyLink,
                    thumbnail: jobItem.thumbnail || ''
                  };
                })
                : [];

              if (jobs.length === 0) {
                return {
                  query: job,
                  count: 0,
                  jobs: [],
                  message: 'No jobs found',
                };
              }

              return {
                query: job,
                count: jobs.length,
                jobs,
              };
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
                  const salaryFrom = salaryData.salary_from ?? 'N/A';
                  const salaryTo = salaryData.salary_to ?? 'N/A';
                  return {
                    title: job,
                    source: salaryData.source || 'Unknown',
                    message: `The average salary for ${job} is $${salaryFrom} to $${salaryTo} based on ${salaryData.source || 'Unknown'} \n`,
                  };
                } else {
                  return { message: 'No salary data found', source: 'Unknown' };
                }
              } else {
                return { message: 'No job ID found for the given job query', source: 'Unknown' };
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
            const bookItem = await getBooks(book);
            if (!bookItem) {
              return {
                ai_res: 'I could not find a matching book.',
                bookTitle: 'No book found',
                authors: [],
                bookDescription: 'No description available.',
                bookThumbnail: '',
                bookLink: '',
              };
            }
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
