const API_BASE_URL = 'https://luyennoiapi.onrender.com/api/conversation';

export interface Topic {
  topic_id: number;
  title: string;
  description: string;
  level: string;
  created_at: string;
  conversation_sentences: any[];
}

export interface Sentence {
  sentence_id: number;
  topic_id: number;
  sentence_text: string;
  sentence_vi: string;
  order_index: number;
}

export const getTopics = async (): Promise<Topic[]> => {
  const response = await fetch(`${API_BASE_URL}/topics`);
  if (!response.ok) {
    throw new Error('Failed to fetch topics');
  }
  return response.json();
};

export const getTopicSentences = async (topicId: number): Promise<Sentence[]> => {
  const response = await fetch(`${API_BASE_URL}/topic/${topicId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch topic sentences');
  }
  const data = await response.json();
  return data.sort((a: Sentence, b: Sentence) => a.order_index - b.order_index);
};
