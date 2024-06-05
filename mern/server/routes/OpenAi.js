const { OpenAI } = require('openai');
const Queue = require('./Queue');
const queue = new Queue();
const openai =  new OpenAI({ apiKey: 'sk-proj-6a1D77UVSJw7Oy8CTYG4T3BlbkFJFVbPkfzq81v51jINVOCl'});
const fetch = require('node-fetch');
const express = require('express');

const generatePlaylistName = async (mood) => {
  const messages = [
    { role: 'system', content: 'I am developing an app named discover music. What it does is that it recommends new music ot the user based on their mood and their favourite recent musics. What I want from you is that I would send you their favorite music and their mood and want you to creatively make a name for the playlist I am making for them based on their mood are you ready? you are supposed to just answer with the playlist name nothing else and keep it at most three words.' },
    { role: 'user', content: `Favorite music: ${mood.song[0]} by ${mood.song[1]} \n
                            They are ${mood.mood}, ${mood.activity} and in a ${mood.environment} environment` }
  ];
  console.log(messages);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 50,
    });
    
    console.log(response.choices[0].message.content.trim());
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating playlist name:', error);
    throw error;
  }
};

const generateCoverArt = async (mood) => {
    const prompt = `I am developing an app named discover music. What it does is that it recommends new music ot the user based on their mood and their favourite recent musics. What I want from you is that I would send you their favorite music and their mood and want you to creatively make a cover art for the playlist I am making for them based on their mood are you ready? \n Favorite music: ${mood.song[0]} by ${mood.song[1]};
                    They are ${mood.mood}, ${mood.activity} and in a ${mood.environment} environment `;
                    console.log(prompt);
  try {
    const response = await openai.images.generate({
      prompt: prompt,
      model: 'dall-e-3'
    });
    console.log(response.data);
    return response.data.url;
  } catch (error) {
    console.error('Error generating cover art:', error);
    throw error;
  }
};

module.exports = {
  generatePlaylistName,
  generateCoverArt,
};
